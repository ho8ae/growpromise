import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { QueryProvider } from '../components/QueryProvider';
import { useAuth } from '../hooks/useAuth';

// 앱 로딩 화면
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#10b981" />
      <Text className="mt-4 text-gray-700">쑥쑥약속 로딩 중...</Text>
    </View>
  );
}

// 인증 상태에 따라 화면을 제어하는 컴포넌트
function AuthenticationManager({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="auto" />
      <AuthenticationManager>
        <Stack screenOptions={{ headerShown: false }}>
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
