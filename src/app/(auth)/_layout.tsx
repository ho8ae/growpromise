// app/(auth)/_layout.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6', // blue-500
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <FontAwesome
            name="chevron-left"
            size={18}
            color="#fff"
            style={{ marginLeft: 16 }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="connect"
        options={{
          headerShown: false,
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
  );
}
