import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      // 네비게이션이 준비되었음을 표시
      setIsNavigationReady(true);
    };
    
    initAuth();
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
    // 네비게이션이 준비되지 않았거나 상태 확인 중이면 리턴
    if (!isNavigationReady || isLoading || !isAuthChecked) return;
    
    const redirect = async () => {
      try {
        // 보호된 경로에 비인증 사용자가 접근하면 로그인 화면으로 리디렉션
        if (isProtectedRoute() && !isAuthenticated) {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('리디렉션 처리 중 오류:', error);
      }
    };
    
    redirect();
  }, [isAuthenticated, isLoading, isAuthChecked, segments, isProtectedRoute, isNavigationReady]);

  // 로그인 후 적절한 화면으로 리디렉션
  const redirectAfterLogin = useCallback(async () => {
    if (!user) return;
    
    try {
      if (user.userType === 'PARENT') {
        await router.replace('/(parent)');
      } else if (user.userType === 'CHILD') {
        await router.replace('/(child)');
      } else {
        await router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('로그인 후 리디렉션 중 오류:', error);
    }
  }, [user, router]);

  // 강화된 로그아웃 함수
  const handleLogout = useCallback(async () => {
    try {
      // 로그아웃 처리
      await logout();
      
      // localStorage에서 모든 인증 관련 데이터 삭제
      await AsyncStorage.multiRemove([
        'auth_token', 
        'refresh_token', 
        'user_type', 
        'user_id'
      ]);
      
      // 로그인 화면으로 리디렉션
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthChecked,
    logout: handleLogout,
    redirectAfterLogin,
  };
}