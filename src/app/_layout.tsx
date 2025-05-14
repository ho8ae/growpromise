// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { QueryProvider } from '../components/QueryProvider';
import { useAuth } from '../hooks/useAuth';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';

import '../../global.css';


// 앱 로딩 화면 (개선된 버전)
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="bg-[#E6F4D7] p-6 rounded-full mb-6">
        <FontAwesome5 
          name="seedling" 
          size={50} 
          color="#58CC02"
        />
      </View>
      <Text className="text-xl font-bold text-[#58CC02] mb-2">쑥쑥약속</Text>
      <ActivityIndicator size="large" color="#58CC02" className="mt-8" />
      <Text className="mt-4 text-gray-600">잠시만 기다려주세요...</Text>
    </View>
  );
}

// 인증 상태에 따라 화면을 제어하는 컴포넌트
function AuthenticationManager({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthChecked } = useAuth();

  if (isLoading || !isAuthChecked) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="auto" />
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
        </Stack>
      </AuthenticationManager>
    </QueryProvider>
  );
}