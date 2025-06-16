// src/hooks/useAppReview.ts
import { useCallback, useEffect } from 'react';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';

// 리뷰 요청 트리거 이벤트 타입
export type ReviewTriggerEvent = 
  | 'promise_verified'     // 약속 인증 완료
  | 'plant_watered'       // 식물 물주기
  | 'plant_grown'         // 식물 성장
  | 'sticker_received'    // 스티커 받기
  | 'promise_approved'    // 약속 승인 (부모)
  | 'app_launch'          // 앱 실행
  | 'week_streak'         // 일주일 연속 사용
  | 'plant_completed';    // 식물 완료

// 리뷰 요청 설정
const REVIEW_CONFIG = {
  // 각 이벤트별 필요 횟수
  thresholds: {
    promise_verified: 10,   // 약속 인증 10회
    plant_watered: 15,      // 물주기 15회  
    plant_grown: 3,         // 식물 성장 3회
    sticker_received: 8,    // 스티커 8개
    promise_approved: 12,   // 약속 승인 12회
    app_launch: 20,         // 앱 실행 20회
    week_streak: 2,         // 2주 연속
    plant_completed: 1,     // 식물 완료 1회
  },
  
  // 리뷰 요청 조건
  minDaysAfterInstall: 3,   // 설치 후 최소 3일
  maxRequestsPerVersion: 2, // 버전당 최대 2회 요청
  cooldownDays: 30,         // 마지막 요청 후 30일 쿨타임
};

// AsyncStorage 키들
const STORAGE_KEYS = {
  counters: 'app_review_counters',
  lastRequest: 'app_review_last_request',
  requestCount: 'app_review_request_count',
  installDate: 'app_install_date',
  appVersion: 'app_current_version',
  reviewRequested: 'app_review_requested',
};

interface ReviewCounters {
  [key: string]: number;
}

interface ReviewState {
  counters: ReviewCounters;
  lastRequestDate?: string;
  requestCount: number;
  installDate?: string;
  currentVersion: string;
  hasRequestedForCurrentVersion: boolean;
}

export const useAppReview = () => {
  
  // 📊 현재 상태 로드
  const loadReviewState = useCallback(async (): Promise<ReviewState> => {
    try {
      const [
        countersData,
        lastRequest,
        requestCount,
        installDate,
        currentVersion,
        reviewRequested
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.counters),
        AsyncStorage.getItem(STORAGE_KEYS.lastRequest),
        AsyncStorage.getItem(STORAGE_KEYS.requestCount),
        AsyncStorage.getItem(STORAGE_KEYS.installDate),
        AsyncStorage.getItem(STORAGE_KEYS.appVersion),
        AsyncStorage.getItem(STORAGE_KEYS.reviewRequested),
      ]);

      return {
        counters: countersData ? JSON.parse(countersData) : {},
        lastRequestDate: lastRequest || undefined,
        requestCount: requestCount ? parseInt(requestCount) : 0,
        installDate: installDate || new Date().toISOString(),
        currentVersion: currentVersion || '1.0.0',
        hasRequestedForCurrentVersion: reviewRequested === 'true',
      };
    } catch (error) {
      console.error('리뷰 상태 로드 실패:', error);
      return {
        counters: {},
        requestCount: 0,
        currentVersion: '1.0.0',
        hasRequestedForCurrentVersion: false,
      };
    }
  }, []);

  // 💾 상태 저장
  const saveReviewState = useCallback(async (state: Partial<ReviewState>) => {
    try {
      const savePromises = [];

      if (state.counters) {
        savePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(state.counters))
        );
      }
      if (state.lastRequestDate) {
        savePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.lastRequest, state.lastRequestDate)
        );
      }
      if (state.requestCount !== undefined) {
        savePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.requestCount, state.requestCount.toString())
        );
      }
      if (state.installDate) {
        savePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.installDate, state.installDate)
        );
      }
      if (state.currentVersion) {
        savePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.appVersion, state.currentVersion)
        );
      }
      if (state.hasRequestedForCurrentVersion !== undefined) {
        savePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.reviewRequested, state.hasRequestedForCurrentVersion.toString())
        );
      }

      await Promise.all(savePromises);
    } catch (error) {
      console.error('리뷰 상태 저장 실패:', error);
    }
  }, []);

  // ✅ 리뷰 요청 조건 확인
  const shouldRequestReview = useCallback(async (
    event: ReviewTriggerEvent,
    state: ReviewState
  ): Promise<boolean> => {
    try {
      // 1. 스토어 리뷰 기능 지원 확인
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        console.log('🚫 StoreReview not available');
        return false;
      }

      // 2. 이미 이번 버전에서 요청했는지 확인
      if (state.hasRequestedForCurrentVersion) {
        console.log('🚫 Already requested review for current version');
        return false;
      }

      // 3. 최대 요청 횟수 확인
      if (state.requestCount >= REVIEW_CONFIG.maxRequestsPerVersion) {
        console.log('🚫 Max requests reached');
        return false;
      }

      // 4. 설치 후 최소 날짜 확인
      if (state.installDate) {
        const installDate = new Date(state.installDate);
        const daysSinceInstall = (Date.now() - installDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceInstall < REVIEW_CONFIG.minDaysAfterInstall) {
          console.log(`🚫 Only ${daysSinceInstall.toFixed(1)} days since install`);
          return false;
        }
      }

      // 5. 쿨타임 확인
      if (state.lastRequestDate) {
        const lastRequest = new Date(state.lastRequestDate);
        const daysSinceLastRequest = (Date.now() - lastRequest.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastRequest < REVIEW_CONFIG.cooldownDays) {
          console.log(`🚫 Cooldown active: ${daysSinceLastRequest.toFixed(1)} days since last request`);
          return false;
        }
      }

      // 6. 이벤트별 임계값 확인
      const threshold = REVIEW_CONFIG.thresholds[event];
      const currentCount = state.counters[event] || 0;
      
      if (currentCount < threshold) {
        console.log(`🚫 ${event}: ${currentCount}/${threshold}`);
        return false;
      }

      console.log(`✅ Review conditions met for ${event}!`);
      return true;

    } catch (error) {
      console.error('리뷰 조건 확인 실패:', error);
      return false;
    }
  }, []);

  // 🎯 리뷰 요청 실행
  const requestReview = useCallback(async (event: ReviewTriggerEvent) => {
    try {
      const state = await loadReviewState();
      const shouldRequest = await shouldRequestReview(event, state);

      if (!shouldRequest) {
        return false;
      }

      // 네이티브 리뷰 요청
      const result = await StoreReview.requestReview();
      
      if (result !== undefined) {
        console.log('✅ 리뷰 요청 성공:', event);
        
        // 햅틱 피드백
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // 상태 업데이트
        await saveReviewState({
          lastRequestDate: new Date().toISOString(),
          requestCount: state.requestCount + 1,
          hasRequestedForCurrentVersion: true,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('리뷰 요청 실패:', error);
      return false;
    }
  }, [loadReviewState, shouldRequestReview, saveReviewState]);

  // 📈 이벤트 카운터 증가 및 리뷰 체크
  const trackEvent = useCallback(async (event: ReviewTriggerEvent) => {
    try {
      console.log(`📊 Tracking event: ${event}`);
      
      const state = await loadReviewState();
      const newCount = (state.counters[event] || 0) + 1;
      
      // 카운터 업데이트
      const updatedCounters = {
        ...state.counters,
        [event]: newCount,
      };

      await saveReviewState({ counters: updatedCounters });

      console.log(`📈 ${event}: ${newCount}/${REVIEW_CONFIG.thresholds[event]}`);

      // 임계값 도달 시 리뷰 요청
      if (newCount >= REVIEW_CONFIG.thresholds[event]) {
        console.log(`🎯 Threshold reached for ${event}, checking review conditions...`);
        
        // 약간의 지연 후 리뷰 요청 (사용자 경험 향상)
        setTimeout(async () => {
          const requested = await requestReview(event);
          if (requested) {
            console.log(`🌟 Review requested successfully for ${event}`);
          }
        }, 2000); // 2초 지연
      }

    } catch (error) {
      console.error('이벤트 추적 실패:', error);
    }
  }, [loadReviewState, saveReviewState, requestReview]);

  // 🔄 수동 리뷰 요청 (설정에서 사용)
  const manualRequestReview = useCallback(async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (!isAvailable) {
        // 수동 요청인 경우 웹 링크로 대체
        Alert.alert(
          '앱 평가하기',
          '쑥쑥약속이 도움이 되셨나요?\n앱스토어에서 평가를 남겨주시면 큰 도움이 됩니다!',
          [
            { text: '나중에', style: 'cancel' },
            { 
              text: '평가하기', 
              onPress: () => {
                // 여기서 앱스토어 링크로 이동
                console.log('Manual store navigation');
              }
            },
          ]
        );
        return false;
      }

      const result = await StoreReview.requestReview();
      
      if (result !== undefined) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const state = await loadReviewState();
        await saveReviewState({
          lastRequestDate: new Date().toISOString(),
          requestCount: state.requestCount + 1,
          hasRequestedForCurrentVersion: true,
        });
      }

      return result;
    } catch (error) {
      console.error('수동 리뷰 요청 실패:', error);
      return false;
    }
  }, [loadReviewState, saveReviewState]);

  // 📊 현재 상태 조회
  const getReviewStats = useCallback(async () => {
    const state = await loadReviewState();
    
    return {
      counters: state.counters,
      progress: Object.entries(REVIEW_CONFIG.thresholds).map(([event, threshold]) => ({
        event: event as ReviewTriggerEvent,
        current: state.counters[event] || 0,
        threshold,
        percentage: Math.min(((state.counters[event] || 0) / threshold) * 100, 100),
      })),
      canRequest: !state.hasRequestedForCurrentVersion && state.requestCount < REVIEW_CONFIG.maxRequestsPerVersion,
      lastRequestDate: state.lastRequestDate,
      requestCount: state.requestCount,
    };
  }, [loadReviewState]);

  // 🚀 초기화 (앱 시작 시)
  const initialize = useCallback(async () => {
    try {
      const state = await loadReviewState();
      
      // 설치 날짜가 없으면 현재 날짜로 설정
      if (!state.installDate) {
        await saveReviewState({
          installDate: new Date().toISOString(),
          currentVersion: '1.0.2', // app.json에서 가져오기
        });
      }

      // 앱 실행 이벤트 추적
      await trackEvent('app_launch');
      
    } catch (error) {
      console.error('리뷰 시스템 초기화 실패:', error);
    }
  }, [loadReviewState, saveReviewState, trackEvent]);

  return {
    trackEvent,
    manualRequestReview,
    getReviewStats,
    initialize,
  };
};