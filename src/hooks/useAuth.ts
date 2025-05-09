import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRouter, useSegments } from 'expo-router';

export function useAuth() {
  const router = useRouter();
  const segments = useSegments();
  const {
    isAuthenticated,
    isLoading,
    isAuthChecked,
    user,
    checkAuthStatus,
    logout,
  } = useAuthStore();

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 인증이 필요한 경로인지 확인
  const isProtectedRoute = useCallback(() => {
    // 첫 번째 세그먼트 확인
    const firstSegment = segments.length > 0 ? segments[0] : null;
    
    // child와 parent는 보호된 경로, 나머지는 접근 가능
    return firstSegment === '(child)' || firstSegment === '(parent)';
  }, [segments]);

  // 인증 상태에 따라 리디렉션 처리
  useEffect(() => {
    // 상태 확인 중이면 리턴
    if (isLoading || !isAuthChecked) return;
    
    // 보호된 경로에 비인증 사용자가 접근하면 로그인 화면으로 리디렉션
    if (isProtectedRoute() && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, isAuthChecked, segments, isProtectedRoute]);

  // 로그인 후 적절한 화면으로 리디렉션
  const redirectAfterLogin = useCallback(() => {
    if (!user) return;
    
    if (user.userType === 'PARENT') {
      router.replace('/(parent)');
    } else if (user.userType === 'CHILD') {
      router.replace('/(child)');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthChecked,
    logout,
    redirectAfterLogin,
  };
}