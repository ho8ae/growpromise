import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
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
  // 리디렉션 루프를 방지하기 위한 상태
  const [redirecting, setRedirecting] = useState(false);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      console.log('인증 상태 확인 시작');
      await checkAuthStatus();
      console.log('인증 상태 확인 완료');
    };
    
    initAuth();
  }, []);

  // 현재 경로가 인증이 필요한지 확인
  const isAuthRequired = useCallback(() => {
    const firstSegment = segments.length > 0 ? segments[0] : null;
    
    // (child)와 (parent)만 인증이 필요하고, (tabs)는 미리보기 형태로 접근 가능
    return firstSegment === '(child)' || firstSegment === '(parent)';
    // tabs는 미리보기가 가능하므로 인증을 요구하지 않음
  }, [segments]);

  // 현재 경로가 auth 관련 경로인지 확인
  const isAuthRoute = useCallback(() => {
    return segments.length > 0 && segments[0] === '(auth)';
  }, [segments]);

  // 현재 경로 내의 특정 서브경로인지 확인
  const isInSubRoute = useCallback((prefix: string, subRoute: string) => {
    return segments.length > 1 && segments[0] === prefix && segments[1] === subRoute;
  }, [segments]);

  // 인증 상태에 따라 리디렉션 처리
  useEffect(() => {
    // 인증 상태 확인이 완료되지 않았거나 로딩 중이거나 이미 리디렉션 중이면 리턴
    if (!isAuthChecked || isLoading || redirecting) {
      console.log('인증 확인 중, 로딩 중, 또는 리디렉션 중...');
      return;
    }

    console.log('인증 상태:', isAuthenticated, '현재 경로:', segments);
    
    // 리디렉션 방지 로직
    
    // 1. 로그인/회원가입 특정 페이지에는 항상 접근 허용
    if (isInSubRoute('(auth)', 'login') || isInSubRoute('(auth)', 'signup')) {
      console.log('로그인/회원가입 화면은 항상 접근 가능');
      return;
    }
    
    // 2. 인증이 필요한 경로이고 인증되지 않은 경우에만 리디렉션
    if (isAuthRequired() && !isAuthenticated) {
      console.log('인증 필요 경로에 접근 시도, 인증 화면으로 리디렉션');
      setRedirecting(true);
      router.replace('/(auth)');
      // 리디렉션 후 잠시 후 플래그 초기화
      setTimeout(() => setRedirecting(false), 100);
      return;
    }
    
    // 3. 인증된 사용자가 auth 메인 화면에 접근하는 경우 (로그인/회원가입 페이지 제외)
    if (isAuthenticated && isAuthRoute() && !isInSubRoute('(auth)', 'login') && !isInSubRoute('(auth)', 'signup')) {
      console.log('인증된 사용자가 인증 메인 화면 접근, 메인으로 리디렉션');
      setRedirecting(true);
      redirectAfterLogin();
      // 리디렉션 후 잠시 후 플래그 초기화
      setTimeout(() => setRedirecting(false), 100);
      return;
    }
  }, [isAuthenticated, isAuthChecked, segments, isLoading, redirecting]);

  // 로그인 후 적절한 화면으로 리디렉션
  const redirectAfterLogin = useCallback(() => {
    if (!user) return;
    
    console.log('로그인 후 리디렉션, 사용자 타입:', user.userType);
    
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