// src/hooks/usePendingVerifications.ts
import { useQuery } from '@tanstack/react-query';
import promiseApi, { PromiseAssignment } from '../api/modules/promise';
import { useAuthStore } from '../stores/authStore';

/**
 * 대기 중인 인증 목록을 실시간으로 관리하는 커스텀 훅
 */
export const usePendingVerifications = (childId?: string) => {
  const { user } = useAuthStore();

  // 대기 중인 인증 목록 조회
  const {
    data: pendingVerifications = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<PromiseAssignment[]>({
    queryKey: ['pendingVerifications', childId].filter(Boolean),
    queryFn: () => promiseApi.getPendingVerifications(),
    enabled: user?.userType === 'PARENT', // 부모만 조회 가능
    refetchInterval: 30000, // 30초마다 자동 새로고침
    refetchIntervalInBackground: false, // 백그라운드에서는 새로고침 안함
    refetchOnWindowFocus: true, // 창 포커스 시 새로고침
    staleTime: 10000, // 10초 동안 fresh 데이터로 간주
  });

  // 전체 대기 중인 인증 개수
  const totalPendingCount = pendingVerifications.length;

  // 특정 자녀의 대기 중인 인증 개수
  const childPendingCount = childId 
    ? pendingVerifications.filter(verification => verification.childId === childId).length
    : 0;

  // 자녀별 대기 중인 인증 그룹화
  const pendingByChild = pendingVerifications.reduce((acc, verification) => {
    const childId = verification.childId;
    if (!acc[childId]) {
      acc[childId] = [];
    }
    acc[childId].push(verification);
    return acc;
  }, {} as Record<string, PromiseAssignment[]>);

  // 최신 인증 요청 (가장 최근에 제출된 것)
  const latestVerification = pendingVerifications.sort((a, b) => 
    new Date(b.verificationTime || 0).getTime() - new Date(a.verificationTime || 0).getTime()
  )[0];

  // 긴급한 인증 (24시간 이상 대기 중인 것)
  const urgentVerifications = pendingVerifications.filter(verification => {
    if (!verification.verificationTime) return false;
    const timeDiff = Date.now() - new Date(verification.verificationTime).getTime();
    return timeDiff > 24 * 60 * 60 * 1000; // 24시간
  });

  // 오늘 제출된 인증
  const todayVerifications = pendingVerifications.filter(verification => {
    if (!verification.verificationTime) return false;
    const today = new Date();
    const verificationDate = new Date(verification.verificationTime);
    return (
      today.getFullYear() === verificationDate.getFullYear() &&
      today.getMonth() === verificationDate.getMonth() &&
      today.getDate() === verificationDate.getDate()
    );
  });

  // 자녀별 통계
  const childStats = Object.entries(pendingByChild).map(([childId, verifications]) => ({
    childId,
    count: verifications.length,
    latestTime: verifications
      .map(v => v.verificationTime)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0],
    hasUrgent: verifications.some(v => {
      if (!v.verificationTime) return false;
      const timeDiff = Date.now() - new Date(v.verificationTime).getTime();
      return timeDiff > 24 * 60 * 60 * 1000;
    }),
  }));

  // 수동 새로고침
  const refreshPendingVerifications = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh pending verifications:', error);
    }
  };

  return {
    // 데이터
    pendingVerifications,
    totalPendingCount,
    childPendingCount,
    pendingByChild,
    latestVerification,
    urgentVerifications,
    todayVerifications,
    childStats,

    // 상태
    isLoading,
    isRefetching,
    error,

    // 액션
    refetch: refreshPendingVerifications,
  };
};

/**
 * 간단한 인증 대기 개수만 필요할 때 사용하는 훅
 */
export const usePendingCount = (childId?: string) => {
  const { totalPendingCount, childPendingCount, isLoading } = usePendingVerifications(childId);
  
  return {
    count: childId ? childPendingCount : totalPendingCount,
    isLoading,
  };
};