// app/_layout.tsx
import '../../global.css';

import { FontAwesome5 } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '../../src/components/QueryProvider';
import { useAuthStore } from '../../src/stores/authStore';

// Google Sign-In 설정 (앱 시작시 한 번만 실행)
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // 올바른 환경변수 이름
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // 올바른 환경변수 이름
  scopes: ['email', 'profile'],
  offlineAccess: true, // idToken을 받기 위해 true로 변경
  forceCodeForRefreshToken: true, // idToken을 받기 위해 true로 변경
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

// 앱 로딩 화면 (개선된 버전)
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="bg-[#E6F4D7] p-6 rounded-full mb-6">
        <FontAwesome5 name="seedling" size={50} color="#58CC02" />
      </View>
      <Text className="text-xl font-bold text-[#58CC02] mb-2">쑥쑥약속</Text>
      <ActivityIndicator size="large" color="#58CC02" className="mt-8" />
      <Text className="mt-4 text-gray-600">잠시만 기다려주세요...</Text>
    </View>
  );
}

// 인증 상태에 따라 화면을 제어하는 컴포넌트
function AuthenticationManager({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthChecked, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔧 앱 초기화 시작...');

        // 인증 상태 확인
        await checkAuthStatus();

        console.log('✅ 앱 초기화 완료');
      } catch (error) {
        console.error('❌ 앱 초기화 중 오류:', error);
        // 오류가 발생해도 인증 상태 확인은 진행
        await checkAuthStatus();
      }
    };

    initializeApp();
  }, [checkAuthStatus]);

  if (isLoading || !isAuthChecked) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        {/* <StatusBar style="dark" backgroundColor="transparent" translucent /> */}
        <AuthenticationManager>
          <Stack
            screenOptions={{
              headerShown: false,
              // 화면 전환 애니메이션 설정
              animation: 'slide_from_right',
              // iOS에서 제스처로 뒤로가기 활성화
              gestureEnabled: true,
              // 스택 간 전환 시 배경색
              contentStyle: {
                backgroundColor: '#FFFFFF',
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(child)" options={{ headerShown: false }} />
            <Stack.Screen name="(parent)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthenticationManager>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
