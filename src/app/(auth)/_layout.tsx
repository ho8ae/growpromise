// app/(auth)/_layout.tsx
import SafeStatusBar from '@/src/components/common/SafeStatusBar';
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <>
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: '로그인',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: '회원가입',
          }}
        />
        <Stack.Screen
          name="connect"
          options={{
            title: '부모님 계정 연결',
          }}
        />
        <Stack.Screen
          name="social-setup"
          options={{
            title: '소셜 로그인 설정',
            presentation: 'modal', // 모달 형태로 표시
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
