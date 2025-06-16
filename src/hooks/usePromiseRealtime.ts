// src/hooks/usePromiseRealtime.ts
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { AppState, AppStateStatus } from 'react-native';
import promiseApi from '../api/modules/promise';
import { useAuthStore } from '../stores/authStore';
import { useAppReviewContext } from '../providers/AppReviewProvider';

/**
 * 약속 관련 실시간 상태 업데이트를 위한 커스텀 훅
 */
export const usePromiseRealtime = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { trackEvent } = useAppReviewContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 실시간 데이터 폴링 설정
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 30초마다 중요한 데이터 업데이트 확인
    intervalRef.current = setInterval(async () => {
      try {
        if (!user) return;

        console.log('🔄 Polling promise data updates...');

        // 부모인 경우: 대기 중인 인증 확인
        if (user.userType === 'PARENT') {
          const currentPending = queryClient.getQueryData(['pendingVerifications']);
          const newPending = await promiseApi.getPendingVerifications();

          // 새로운 인증이 있는지 확인
          if (currentPending && Array.isArray(currentPending) && Array.isArray(newPending)) {
            const newCount = newPending.length;
            const oldCount = currentPending.length;

            if (newCount > oldCount) {
              // 새로운 인증 요청이 있음
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              console.log('📢 New verification request detected!');
            }
          }

          // 대기 중인 인증 데이터 업데이트
          queryClient.setQueryData(['pendingVerifications'], newPending);
        }

        // 공통: 오늘의 약속 상태 확인
        queryClient.invalidateQueries({ queryKey: ['todayPromises'] });

      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 30000); // 30초 간격

  }, [queryClient, user]);

  // 앱 상태 변경 감지 및 폴링 관리
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed:', appStateRef.current, '->', nextAppState);

      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // 앱이 다시 활성화되면 즉시 데이터 새로고침
        console.log('🔄 App became active, refreshing data...');
        refreshAllData();
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        // 앱이 백그라운드로 가면 폴링 중지
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 컴포넌트 마운트 시 폴링 시작
    if (user) {
      startPolling();
    }

    return () => {
      subscription?.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, startPolling]);

  // 약속 인증 제출 후 데이터 갱신 (확장)
  const onPromiseVerificationSubmitted = useCallback(async (assignmentId?: string, childId?: string) => {
    console.log('🔄 Promise verification submitted, refreshing data...');
    
    // 햅틱 피드백
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      // 리뷰 이벤트 추적 - 약속 인증 제출 시
      if (user?.userType === 'CHILD') {
        await trackEvent('promise_verified');
      }

      // 즉시 UI 업데이트를 위한 옵티미스틱 업데이트
      if (assignmentId) {
        // 해당 assignment의 상태를 즉시 SUBMITTED로 변경
        const todayPromises = queryClient.getQueryData(['todayPromises']);
        if (todayPromises && Array.isArray(todayPromises)) {
          const updatedPromises = todayPromises.map((promise: any) => {
            if (promise.id === assignmentId) {
              return { ...promise, status: 'SUBMITTED' };
            }
            return promise;
          });
          queryClient.setQueryData(['todayPromises'], updatedPromises);
        }
      }

      // 모든 관련 쿼리 무효화하여 최신 데이터로 갱신
      const queriesToInvalidate = [
        ['todayPromises'],
        ['promiseStats'],
        ['currentPlant'],
        ['childPromises'],
        ['parentPromises'],
        ['pendingVerifications'],
        ['galleryImages'],
        
        // 자녀별 쿼리들 (childId가 있는 경우)
        ...(childId ? [
          ['todayPromises', 'CHILD', childId],
          ['todayPromises', 'PARENT', childId],
          ['promiseStats', childId],
          ['currentPlant', 'PARENT', childId],
        ] : []),
      ];

      // 순차적으로 쿼리 무효화
      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      // 부모의 경우 대기 중인 인증 목록 즉시 새로고침
      if (user?.userType === 'PARENT') {
        setTimeout(async () => {
          try {
            const newPending = await promiseApi.getPendingVerifications();
            queryClient.setQueryData(['pendingVerifications'], newPending);
          } catch (error) {
            console.error('Failed to refresh pending verifications:', error);
          }
        }, 1000); // 1초 후 서버에서 최신 데이터 가져오기
      }

    } catch (error) {
      console.error('Error in verification submitted callback:', error);
    }
  }, [queryClient, user, trackEvent]);

  //  약속 승인/거절 후 데이터 갱신 (확장)
  const onPromiseVerificationResponded = useCallback(async (assignmentId: string, approved: boolean, childId?: string) => {
    console.log(`🔄 Promise verification ${approved ? 'approved' : 'rejected'}, refreshing data...`);
    
    // 햅틱 피드백
    Haptics.notificationAsync(
      approved 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );
    
    try {

      // 리뷰 이벤트 추적 - 약속 승인/거절 시
      if (approved && user?.userType === 'PARENT') {
        await trackEvent('promise_approved');
      }

      // 옵티미스틱 업데이트: 대기 목록에서 해당 항목 제거
      const currentPending = queryClient.getQueryData(['pendingVerifications']);
      if (currentPending && Array.isArray(currentPending)) {
        const updatedPending = currentPending.filter((item: any) => item.id !== assignmentId);
        queryClient.setQueryData(['pendingVerifications'], updatedPending);
      }

      // 약속 관련 모든 데이터 갱신
      const queriesToInvalidate = [
        ['todayPromises'],
        ['promiseStats'],
        ['pendingVerifications'],
        ['currentPlant'],
        ['childPromises'],
        ['parentPromises'],
        ['galleryImages'],
      ];

      // 자녀별 쿼리 추가
      if (childId) {
        queriesToInvalidate.push(
          ['promiseStats', childId],
          ['todayPromises', 'PARENT', childId],
          ['currentPlant', 'PARENT', childId]
        );
      }

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // 식물 경험치 관련 쿼리도 갱신 (승인된 경우)
      if (approved) {
        queryClient.invalidateQueries({ queryKey: ['plantStats'] });
        queryClient.invalidateQueries({ queryKey: ['characterLevel'] });
        queryClient.invalidateQueries({ queryKey: ['ticketStats'] }); // 티켓 통계도 갱신
      }

    } catch (error) {
      console.error('Error in verification responded callback:', error);
    }
  }, [queryClient, trackEvent, user]);

  // 약속 생성 후 데이터 갱신 (확장)
  const onPromiseCreated = useCallback((childIds?: string[]) => {
    console.log('🔄 New promise created, refreshing data...');
    
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // 기본 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['todayPromises'] });
    queryClient.invalidateQueries({ queryKey: ['promiseStats'] });
    queryClient.invalidateQueries({ queryKey: ['parentPromises'] });
    queryClient.invalidateQueries({ queryKey: ['childPromises'] });

    // 특정 자녀들의 쿼리도 무효화
    if (childIds && childIds.length > 0) {
      childIds.forEach(childId => {
        queryClient.invalidateQueries({ queryKey: ['todayPromises', 'CHILD', childId] });
        queryClient.invalidateQueries({ queryKey: ['promiseStats', childId] });
      });
    }
  }, [queryClient]);

  // 식물 관련 데이터 갱신 (확장)
  const onPlantDataChanged = useCallback((childId?: string) => {
    console.log('🔄 Plant data changed, refreshing...');
    
    queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
    queryClient.invalidateQueries({ queryKey: ['plantStats'] });
    queryClient.invalidateQueries({ queryKey: ['plantCollection'] });

    if (childId) {
      queryClient.invalidateQueries({ queryKey: ['currentPlant', 'PARENT', childId] });
      queryClient.invalidateQueries({ queryKey: ['plantStats', childId] });
    }
  }, [queryClient]);

  // 실시간 인증 대기 개수 조회
  const getPendingVerificationCount = useCallback((): number => {
    const pendingData = queryClient.getQueryData(['pendingVerifications']);
    return Array.isArray(pendingData) ? pendingData.length : 0;
  }, [queryClient]);

  // 특정 자녀의 대기 중인 인증 개수 조회
  const getChildPendingCount = useCallback((childId: string): number => {
    const pendingData = queryClient.getQueryData(['pendingVerifications']);
    if (!Array.isArray(pendingData)) return 0;
    
    return pendingData.filter((item: any) => item.childId === childId).length;
  }, [queryClient]);

  // 전체 데이터 강제 새로고침 (확장)
  const refreshAllData = useCallback(async (silent = false) => {
    if (!silent) {
      console.log('🔄 Manual refresh triggered');
    }
    
    try {
      const refreshPromises = [
        queryClient.refetchQueries({ queryKey: ['todayPromises'] }),
        queryClient.refetchQueries({ queryKey: ['promiseStats'] }),
        queryClient.refetchQueries({ queryKey: ['currentPlant'] }),
      ];

      // 부모인 경우 대기 중인 인증도 새로고침
      if (user?.userType === 'PARENT') {
        refreshPromises.push(
          queryClient.refetchQueries({ queryKey: ['pendingVerifications'] })
        );
      }

      await Promise.all(refreshPromises);
      
      if (!silent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      if (!silent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [queryClient, user]);

  // 서버와의 연결 상태 확인
  const checkServerConnection = useCallback(async (): Promise<boolean> => {
    try {
      // 간단한 ping 요청으로 서버 연결 확인
      await promiseApi.getChildPromiseStats();
      return true;
    } catch (error) {
      console.error('Server connection check failed:', error);
      return false;
    }
  }, []);

  // 네트워크 재연결 시 데이터 동기화
  const onNetworkReconnected = useCallback(async () => {
    console.log('🌐 Network reconnected, syncing data...');
    
    const isConnected = await checkServerConnection();
    if (isConnected) {
      await refreshAllData(true);
      startPolling();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [checkServerConnection, refreshAllData, startPolling]);

  return {
    // 기존 메서드들
    onPromiseVerificationSubmitted,
    onPromiseVerificationResponded,
    onPromiseCreated,
    onPlantDataChanged,
    refreshAllData,

    // 새로운 실시간 관련 메서드들
    getPendingVerificationCount,
    getChildPendingCount,
    checkServerConnection,
    onNetworkReconnected,
    startPolling,

    // 폴링 제어
    stopPolling: useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []),
  };
};