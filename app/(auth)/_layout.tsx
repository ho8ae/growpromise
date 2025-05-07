// app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

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
          <FontAwesome name="chevron-left" size={18} color="#fff" style={{ marginLeft: 16 }} />
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '로그인/회원가입',
          headerShown: false,
        }} 
      />
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
          title: '계정 연결',
        }} 
      />
    </Stack>
  );
}