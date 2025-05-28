// src/managers/AppStateManager.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useModalManager } from './ModalManager';
import { useNavigation } from '../providers/NavigationProvider';

interface AppStateContextType {
  isAppReady: boolean;
  appState: AppStateStatus;
  // 앱 수준의 상태들
  isInitialized: boolean;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateManager');
  }
  return context;
};

interface AppStateManagerProps {
  children: React.ReactNode;
}

export const AppStateManager: React.FC<AppStateManagerProps> = ({ children }) => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>('active');
  
  const { navigateToHome } = useNavigation();
  const { hidePlantCompletion } = useModalManager();
  
  const appStateRef = useRef<AppStateStatus>('active');

  // 앱 상태 추적
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
      setAppState(nextAppState);
      console.log(`📱 App state changed to: ${nextAppState}`);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // 앱 초기화 완료 플래그
    const initTimer = setTimeout(() => {
      setIsAppReady(true);
      setIsInitialized(true);
      console.log('✅ App state manager initialized');
    }, 500);

    return () => {
      subscription?.remove();
      clearTimeout(initTimer);
    };
  }, []);

  // 식물 완료 모달 확인 핸들러
  const handlePlantCompletionModalConfirm = () => {
    console.log('🎉 Plant completion confirmed - navigating home');
    
    // 모달 닫기
    hidePlantCompletion();
    
    // 홈으로 이동 (약간의 지연)
    setTimeout(() => {
      navigateToHome();
    }, 200);
  };

  return (
    <AppStateContext.Provider value={{
      isAppReady,
      appState,
      isInitialized,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};