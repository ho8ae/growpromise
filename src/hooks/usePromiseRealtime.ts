// src/hooks/usePromiseRealtime.ts
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

/**
 * 약속 관련 실시간 상태 업데이트를 위한 커스텀 훅
 */
export const usePromiseRealtime = () => {
  const queryClient = useQueryClient();

  // 약속 인증 제출 후 데이터 갱신
  const onPromiseVerificationSubmitted = useCallback((assignmentId?: string, childId?: string) => {
    console.log('🔄 Promise verification submitted, refreshing data...');
    
    // 햅틱 피드백
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 모든 관련 쿼리 무효화하여 최신 데이터로 갱신
    const queriesToInvalidate = [
      // 기본 약속 관련 쿼리들
      ['todayPromises'],
      ['promiseStats'],
      ['currentPlant'],
      ['childPromises'],
      ['parentPromises'],
      ['pendingVerifications'],
      
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

    // 즉시 새로고침이 필요한 중요한 쿼리들은 refetch
    const criticalQueries = [
      ['todayPromises'],
      ['promiseStats'],
    ];

    criticalQueries.forEach(queryKey => {
      queryClient.refetchQueries({ queryKey });
    });

  }, [queryClient]);

  // 약속 승인/거절 후 데이터 갱신
  const onPromiseVerificationResponded = useCallback((assignmentId: string, approved: boolean) => {
    console.log(`🔄 Promise verification ${approved ? 'approved' : 'rejected'}, refreshing data...`);
    
    // 햅틱 피드백
    Haptics.notificationAsync(
      approved 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );
    
    // 약속 관련 모든 데이터 갱신
    queryClient.invalidateQueries({ queryKey: ['todayPromises'] });
    queryClient.invalidateQueries({ queryKey: ['promiseStats'] });
    queryClient.invalidateQueries({ queryKey: ['pendingVerifications'] });
    queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
    queryClient.invalidateQueries({ queryKey: ['childPromises'] });
    
    // 식물 경험치 관련 쿼리도 갱신 (승인된 경우)
    if (approved) {
      queryClient.invalidateQueries({ queryKey: ['plantStats'] });
      queryClient.invalidateQueries({ queryKey: ['characterLevel'] });
    }
  }, [queryClient]);

  // 약속 생성 후 데이터 갱신
  const onPromiseCreated = useCallback(() => {
    console.log('🔄 New promise created, refreshing data...');
    
    queryClient.invalidateQueries({ queryKey: ['todayPromises'] });
    queryClient.invalidateQueries({ queryKey: ['promiseStats'] });
    queryClient.invalidateQueries({ queryKey: ['parentPromises'] });
    queryClient.invalidateQueries({ queryKey: ['childPromises'] });
  }, [queryClient]);

  // 식물 관련 데이터 갱신
  const onPlantDataChanged = useCallback(() => {
    console.log('🔄 Plant data changed, refreshing...');
    
    queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
    queryClient.invalidateQueries({ queryKey: ['plantStats'] });
    queryClient.invalidateQueries({ queryKey: ['plantCollection'] });
  }, [queryClient]);

  // 전체 데이터 강제 새로고침
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['todayPromises'] }),
        queryClient.refetchQueries({ queryKey: ['promiseStats'] }),
        queryClient.refetchQueries({ queryKey: ['currentPlant'] }),
        queryClient.refetchQueries({ queryKey: ['pendingVerifications'] }),
      ]);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [queryClient]);

  return {
    onPromiseVerificationSubmitted,
    onPromiseVerificationResponded,
    onPromiseCreated,
    onPlantDataChanged,
    refreshAllData,
  };
};