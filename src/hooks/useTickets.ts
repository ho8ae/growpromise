// src/hooks/useTickets.ts - 티켓 차감 문제 해결
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api';
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

// 보유 티켓 조회 훅
export const useTickets = () => {
  return useQuery({
    queryKey: ticketKeys.myTickets(),
    queryFn: ticketApi.getMyTickets,
    staleTime: 1 * 60 * 1000, // 🎯 1분으로 단축 (더 자주 새로고침)
    gcTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true, // 🎯 포커스 시 새로고침
    refetchOnMount: true, // 🎯 마운트 시 새로고침
    enabled: true,
  });
};

// 아이 통계 조회 훅 (티켓 정보 포함)
export const useChildStats = () => {
  return useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: ticketApi.getChildStats,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    enabled: true,
  });
};

// 🎯 개선된 티켓 사용 훅
export const useTicket = () => {
  const queryClient = useQueryClient();
  const [isDrawing, setIsDrawing] = useState(false);

  // 🎯 티켓 사용 뮤테이션 - 실제 차감되는 API 호출
  const useTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      console.log('🎫 티켓 사용 API 호출:', ticketId);
      
      // 🎯 실제 티켓 차감 API 호출
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
      
      // 🎯 추가로 강제 새로고침 (확실히 하기 위해)
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ticketKeys.myTickets() });
      }, 500);
    },
    onError: (error) => {
      console.error('🎫 티켓 사용 오류:', error);
    },
  });

  // 🎯 코인 뽑기 뮤테이션 - 코인 차감
  const drawWithCoinMutation = useMutation({
    mutationFn: async (packType: TicketType) => {
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
      
      // 통계와 식물 인벤토리 갱신
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
    useTicketAsync: useTicketMutation.mutateAsync, // 🎯 async 버전 추가
    drawWithCoin: drawWithCoinMutation.mutate,
    drawWithCoinAsync: drawWithCoinMutation.mutateAsync, // 🎯 async 버전 추가
    isLoading: useTicketMutation.isPending || drawWithCoinMutation.isPending,
    isDrawing,
    error: useTicketMutation.error || drawWithCoinMutation.error,
    // 🎯 개별 로딩 상태
    isUsingTicket: useTicketMutation.isPending,
    isDrawingWithCoin: drawWithCoinMutation.isPending,
  };
};

// 관리자용 티켓 지급 훅
export const useGrantTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GrantTicketRequest) => ticketApi.grantTickets(request),
    onSuccess: () => {
      // 모든 티켓 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error) => {
      console.error('티켓 지급 오류:', error);
    },
  });
};

// 🎯 개선된 티켓 타입별 보유 개수 계산 유틸리티
export const useTicketCounts = () => {
  const { data: ticketData, isLoading, error } = useTickets();
  
  const getTicketCount = (ticketType: TicketType): number => {
    return ticketData?.counts?.[ticketType] || 0;
  };

  const hasTickets = (ticketType?: TicketType): boolean => {
    if (!ticketData) return false;
    
    if (!ticketType) {
      return (ticketData.total || 0) > 0;
    }
    return getTicketCount(ticketType) > 0;
  };

  // 🎯 사용 가능한 티켓 ID 가져오기
  const getAvailableTicketId = (ticketType: TicketType): string | null => {
    if (!ticketData?.tickets) return null;
    
    const availableTicket = ticketData.tickets.find(
      ticket => ticket.ticketType === ticketType && !ticket.isUsed
    );
    
    return availableTicket?.id || null;
  };

  // 🎯 가장 많이 보유한 티켓 타입 찾기
  const getMostAbundantTicketType = (): TicketType | null => {
    if (!ticketData?.counts) return null;
    
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
    tickets: ticketData?.tickets || [], // 🎯 실제 티켓 배열도 제공
    getTicketCount,
    hasTickets,
    getAvailableTicketId, // 🎯 사용 가능한 티켓 ID
    getMostAbundantTicketType, // 🎯 가장 많은 티켓 타입
    isLoading,
    error,
  };
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