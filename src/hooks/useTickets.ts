// src/hooks/useTickets.ts - 사용자 타입 확인으로 오류 방지
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import ticketApi, {
  TicketType,
  GrantTicketRequest
} from '../api/modules/ticket';

// 티켓 관련 쿼리 키
export const ticketKeys = {
  all: ['tickets'] as const,
  myTickets: () => [...ticketKeys.all, 'my'] as const,
  stats: () => [...ticketKeys.all, 'stats'] as const,
};

interface UseTicketsOptions {
  enabled?: boolean;
}

// 보유 티켓 조회 훅 - 자녀 계정만 가능
export const useTickets = (options: UseTicketsOptions = {}) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // 🎯 자녀 계정인지 확인 (대소문자 구분 없이)
  const isChild = user?.userType?.toUpperCase() === 'CHILD';
  
  // 🎯 자녀 계정이고 인증된 경우에만 쿼리 실행
  const queryEnabled = options.enabled !== false && isAuthenticated && isChild;

  console.log('🎫 useTickets 훅 상태:', {
    isAuthenticated,
    userType: user?.userType,
    isChild,
    queryEnabled,
    optionsEnabled: options.enabled
  });

  return useQuery({
    queryKey: ['tickets', user?.id],
    queryFn: async () => {
      console.log('🎫 티켓 API 호출 시작');
      
      // 🎯 이중 체크: 자녀 계정이 아니면 빈 데이터 반환
      if (!isChild) {
        console.log('⚠️ 자녀 계정이 아님 - 빈 데이터 반환');
        return {
          tickets: [],
          total: 0,
          counts: { BASIC: 0, PREMIUM: 0, SPECIAL: 0 },
          message: 'NOT_CHILD_ACCOUNT'
        };
      }

      try {
        const response = await ticketApi.getMyTickets();
        console.log('✅ 티켓 API 응답:', response);
        return response;
      } catch (error) {
        console.error('❌ 티켓 API 오류:', error);
        
        // 🎯 오류 발생시에도 빈 데이터 반환 (앱 크래시 방지)
        return {
          tickets: [],
          total: 0,
          counts: { BASIC: 0, PREMIUM: 0, SPECIAL: 0 },
          message: 'API_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    enabled: queryEnabled,
    staleTime: 1 * 60 * 1000, // 1분간 캐시 유지
    gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false, // 🎯 재시도 비활성화 (오류 방지)
  });
};

// 아이 통계 조회 훅 - 자녀 계정만 가능
export const useChildStats = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isChild = user?.userType?.toUpperCase() === 'CHILD';

  return useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: async () => {
      if (!isChild) {
        return {
          completedPromises: 0,
          completedPlants: 0,
          wateringStreak: 0,
          message: 'NOT_CHILD_ACCOUNT'
        };
      }

      try {
        return await ticketApi.getChildStats();
      } catch (error) {
        console.error('❌ 자녀 통계 조회 오류:', error);
        return {
          completedPromises: 0,
          completedPlants: 0,
          wateringStreak: 0,
          message: 'API_ERROR'
        };
      }
    },
    enabled: isAuthenticated && isChild,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
};

// 🎯 개선된 티켓 사용 훅
export const useTicket = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const isChild = user?.userType?.toUpperCase() === 'CHILD';

  // 🎯 티켓 사용 뮤테이션 - 자녀 계정만 가능
  const useTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      if (!isChild) {
        throw new Error('자녀 계정만 티켓을 사용할 수 있습니다.');
      }

      console.log('🎫 티켓 사용 API 호출:', ticketId);
      const result = await ticketApi.useTicket(ticketId);
      console.log('🎫 티켓 사용 결과:', result);
      return result;
    },
    onMutate: () => {
      setIsDrawing(true);
      console.log('🎫 티켓 사용 시작');
    },
    onSettled: () => {
      setIsDrawing(false);
      console.log('🎫 티켓 사용 완료');
    },
    onSuccess: (data) => {
      console.log('🎫 티켓 사용 성공, 데이터 새로고침 시작');
      
      // 🎯 즉시 모든 관련 쿼리 무효화
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.myTickets() }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: ['plants', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['plants', 'collection'] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['childStats'] }),
        queryClient.invalidateQueries({ queryKey: ['activeMissions'] }),
      ]).then(() => {
        console.log('🎫 모든 쿼리 새로고침 완료');
      });
      
      // 🎯 추가로 강제 새로고침
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ticketKeys.myTickets() });
      }, 500);
    },
    onError: (error) => {
      console.error('🎫 티켓 사용 오류:', error);
    },
  });

  // 🎯 코인 뽑기 뮤테이션 - 자녀 계정만 가능
  const drawWithCoinMutation = useMutation({
    mutationFn: async (packType: TicketType) => {
      if (!isChild) {
        throw new Error('자녀 계정만 코인 뽑기를 할 수 있습니다.');
      }

      console.log('🪙 코인 뽑기 API 호출:', packType);
      const result = await ticketApi.drawWithCoin(packType);
      console.log('🪙 코인 뽑기 결과:', result);
      return result;
    },
    onMutate: () => {
      setIsDrawing(true);
      console.log('🪙 코인 뽑기 시작');
    },
    onSettled: () => {
      setIsDrawing(false);
      console.log('🪙 코인 뽑기 완료');
    },
    onSuccess: (data) => {
      console.log('🪙 코인 뽑기 성공, 데이터 새로고침 시작');
      
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: ['plants', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['plants', 'collection'] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['childStats'] }),
      ]).then(() => {
        console.log('🪙 모든 쿼리 새로고침 완료');
      });
    },
    onError: (error) => {
      console.error('🪙 코인 뽑기 오류:', error);
    },
  });

  return {
    useTicket: useTicketMutation.mutate,
    useTicketAsync: useTicketMutation.mutateAsync,
    drawWithCoin: drawWithCoinMutation.mutate,
    drawWithCoinAsync: drawWithCoinMutation.mutateAsync,
    isLoading: useTicketMutation.isPending || drawWithCoinMutation.isPending,
    isDrawing,
    error: useTicketMutation.error || drawWithCoinMutation.error,
    isUsingTicket: useTicketMutation.isPending,
    isDrawingWithCoin: drawWithCoinMutation.isPending,
    // 🎯 자녀 계정인지 확인 플래그
    canUseTickets: isChild,
  };
};

// 🎯 개선된 티켓 타입별 보유 개수 계산 유틸리티
export const useTicketCounts = () => {
  const { data: ticketData, isLoading, error } = useTickets();
  const { user } = useAuthStore();
  const isChild = user?.userType?.toUpperCase() === 'CHILD';
  
  const getTicketCount = (ticketType: TicketType): number => {
    if (!isChild) return 0;
    return ticketData?.counts?.[ticketType] || 0;
  };

  const hasTickets = (ticketType?: TicketType): boolean => {
    if (!isChild || !ticketData) return false;
    
    if (!ticketType) {
      return (ticketData.total || 0) > 0;
    }
    return getTicketCount(ticketType) > 0;
  };

  // 🎯 사용 가능한 티켓 ID 가져오기
  const getAvailableTicketId = (ticketType: TicketType): string | null => {
    if (!isChild || !ticketData?.tickets) return null;
    
    const availableTicket = ticketData.tickets.find(
      ticket => ticket.ticketType === ticketType && !ticket.isUsed
    );
    
    return availableTicket?.id || null;
  };

  // 🎯 가장 많이 보유한 티켓 타입 찾기
  const getMostAbundantTicketType = (): TicketType | null => {
    if (!isChild || !ticketData?.counts) return null;
    
    const entries = Object.entries(ticketData.counts) as [TicketType, number][];
    const maxEntry = entries.reduce(
      (max, [type, count]) => count > max[1] ? [type, count] : max,
      ['BASIC' as TicketType, 0]
    );
    
    return maxEntry[1] > 0 ? maxEntry[0] : null;
  };

  return {
    counts: ticketData?.counts || { BASIC: 0, PREMIUM: 0, SPECIAL: 0 },
    total: ticketData?.total || 0,
    tickets: ticketData?.tickets || [],
    getTicketCount,
    hasTickets,
    getAvailableTicketId,
    getMostAbundantTicketType,
    isLoading,
    error,
    // 🎯 자녀 계정 여부 플래그
    canUseTickets: isChild,
  };
};

// 관리자용 티켓 지급 훅
export const useGrantTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GrantTicketRequest) => ticketApi.grantTickets(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error) => {
      console.error('티켓 지급 오류:', error);
    },
  });
};

// 🎯 전역 티켓 새로고침 훅
export const useGlobalTicketRefresh = () => {
  const queryClient = useQueryClient();

  return async () => {
    console.log('🔄 전역 티켓 새로고침 시작');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['childStats'] }),
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
    ]);
    console.log('🔄 전역 티켓 새로고침 완료');
  };
};