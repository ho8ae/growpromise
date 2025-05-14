// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
        {/* 백그라운드 스크린으로 index 추가 (보이지 않음) */}
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