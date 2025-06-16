// app/_layout.tsx - AppReview 시스템 추가
import '../../global.css';

import { FontAwesome5 } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Providers & Managers
import { QueryProvider } from '../providers/QueryProvider';
import { AppReviewProvider } from '../providers/AppReviewProvider';
import { AppStateManager } from '../../src/managers/AppStateManager';
import { ModalManagerProvider } from '../../src/managers/ModalManager';
import { NavigationProvider } from '../../src/providers/NavigationProvider';

// Components
import SafeStatusBar from '../../src/components/common/SafeStatusBar';

// Stores
import { useAuthStore } from '../../src/stores/authStore';

// Google Sign-In 설정 (기존과 동일)
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  scopes: ['email', 'profile'],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

console.log('🔧 Google Sign-In 설정 완료:');
console.log(
  '- Web Client ID:',
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? '✅' : '❌',
);
console.log(
  '- iOS Client ID:',
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ? '✅' : '❌',
);

// 로딩 스크린 (기존과 동일)
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

      <View className="bg-[#E6F4D7] p-6 rounded-full mb-6">
        <FontAwesome5 name="seedling" size={50} color="#58CC02" />
      </View>
      <Text className="text-xl font-bold text-[#58CC02] mb-2">쑥쑥약속</Text>
      <ActivityIndicator size="large" color="#58CC02" className="mt-8" />
      <Text className="mt-4 text-gray-600">잠시만 기다려주세요...</Text>
    </View>
  );
}

// 인증 매니저 (기존과 동일)
function AuthenticationManager({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthChecked, checkAuthStatus } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App authentication initialization started');
        await checkAuthStatus();

        // 충분한 초기화 시간 보장
        setTimeout(() => {
          setIsInitialized(true);
          console.log('✅ App authentication initialization completed');
        }, 300);
      } catch (error) {
        console.error('❌ App authentication initialization error:', error);
        // 에러가 있어도 앱은 시작하도록
        setTimeout(() => {
          setIsInitialized(true);
        }, 300);
      }
    };

    initializeApp();
  }, [checkAuthStatus]);

  if (isLoading || !isAuthChecked || !isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

// 메인 앱 컴포넌트 (기존과 동일)
function App() {
  return (
    <AuthenticationManager>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(child)" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthenticationManager>
  );
}

// Root Layout 
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 1. 서버 상태 관리 */}
      <QueryProvider>
        {/* 2. 앱 리뷰 시스템 (서버 상태 다음, 네비게이션 전) */}
        <AppReviewProvider>
          {/* 3. 네비게이션 로직 */}
          <NavigationProvider>
            {/* 4. 모달 관리 */}
            <ModalManagerProvider>
              {/* 5. 앱 상태 통합 관리 */}
              <AppStateManager>
                {/* 6. 실제 앱 */}
                <App />
              </AppStateManager>
            </ModalManagerProvider>
          </NavigationProvider>
        </AppReviewProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}