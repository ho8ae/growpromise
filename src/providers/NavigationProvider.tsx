// src/providers/NavigationProvider.tsx 수정

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

interface NavigationContextType {
  navigateToHome: () => void;
  navigateToCollection: () => void;
  navigateWithDelay: (path: string, delay?: number) => void;
  safeNavigate: (navigationFn: () => void) => void;
  isNavigationReady: boolean; // 🎯 추가
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// 🎯 안전한 useNavigation 훅 (개선된 버전)
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  
  if (!context) {
    // 🎯 기본값 반환 (오류 없이)
    console.warn('Navigation context not available - using fallback');
    return {
      navigateToHome: () => console.log('Navigation not ready - navigateToHome ignored'),
      navigateToCollection: () => console.log('Navigation not ready - navigateToCollection ignored'),
      navigateWithDelay: () => console.log('Navigation not ready - navigateWithDelay ignored'),
      safeNavigate: (fn: () => void) => {
        console.log('Navigation not ready - executing function directly');
        try {
          fn();
        } catch (error) {
          console.warn('Direct function execution failed:', error);
        }
      },
      isNavigationReady: false,
    };
  }
  
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>('active');

  // 🎯 Provider 초기화 지연
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsReady(true);
      console.log('✅ NavigationProvider ready');
    }, 500); // 충분한 초기화 시간

    return () => clearTimeout(initTimer);
  }, []);

  // 앱 상태 추적
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 안전한 네비게이션 함수
  const safeNavigate = (navigationFn: () => void) => {
    if (!isReady) {
      console.warn('Navigation not ready yet');
      return;
    }

    if (!isMountedRef.current || appStateRef.current !== 'active') {
      console.warn('Navigation skipped - component unmounted or app inactive');
      return;
    }

    if (!segments ) {
      console.warn('Navigation context not available');
      return;
    }

    try {
      navigationFn();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Navigation error (ignored):', error);
    }
  };

  // 홈으로 이동
  const navigateToHome = () => {
    if (!isReady) {
      console.warn('Navigation not ready - navigateToHome ignored');
      return;
    }

    console.log('🏠 Navigate to home requested');
    console.log('Current pathname:', pathname);
    
    safeNavigate(() => {
      queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
      queryClient.invalidateQueries({ queryKey: ['promiseStats'] });

      const currentPath = pathname || segments.join('/');
      
      if (currentPath.includes('child/') || currentPath.includes('parent/')) {
        console.log('🔄 Cross-stack navigation - using replace');
        router.replace('/(tabs)');
      } else if (currentPath.includes('tabs')) {
        console.log('📱 Within tabs stack - using back or replace');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      } else {
        console.log('🏠 Fallback - using replace');
        router.replace('/(tabs)');
      }
    });
  };

  // 도감으로 이동
  const navigateToCollection = () => {
    if (!isReady) {
      console.warn('Navigation not ready - navigateToCollection ignored');
      return;
    }

    console.log('📚 Navigate to collection requested');
    safeNavigate(() => {
      queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
      router.push('/(child)/plant-collection');
    });
  };

  // 지연 네비게이션
  const navigateWithDelay = (path: string, delay: number = 300) => {
    if (!isReady) {
      console.warn('Navigation not ready - navigateWithDelay ignored');
      return;
    }

    setTimeout(() => {
      safeNavigate(() => {
        router.push(path as any);
      });
    }, delay);
  };

  // 🎯 준비되지 않았을 때는 기본값 제공
  const contextValue: NavigationContextType = {
    navigateToHome,
    navigateToCollection,
    navigateWithDelay,
    safeNavigate,
    isNavigationReady: isReady,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};