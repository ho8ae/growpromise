import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppReview, ReviewTriggerEvent } from '../hooks/useAppReview';

interface AppReviewContextType {
  trackEvent: (event: ReviewTriggerEvent) => Promise<void>;
  manualRequestReview: () => Promise<boolean | void>;
  getReviewStats: () => Promise<any>;
}

const AppReviewContext = createContext<AppReviewContextType | undefined>(undefined);

interface AppReviewProviderProps {
  children: ReactNode;
}

export const AppReviewProvider: React.FC<AppReviewProviderProps> = ({ children }) => {
  const { trackEvent, manualRequestReview, getReviewStats, initialize } = useAppReview();

  useEffect(() => {
    // 앱 시작 시 리뷰 시스템 초기화
    initialize();
  }, [initialize]);

  return (
    <AppReviewContext.Provider value={{
      trackEvent,
      manualRequestReview,
      getReviewStats,
    }}>
      {children}
    </AppReviewContext.Provider>
  );
};

export const useAppReviewContext = (): AppReviewContextType => {
  const context = useContext(AppReviewContext);
  if (context === undefined) {
    throw new Error('useAppReviewContext must be used within an AppReviewProvider');
  }
  return context;
};