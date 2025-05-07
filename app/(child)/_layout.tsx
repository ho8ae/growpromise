// app/(child)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ChildLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"  
        options={{ 
          title: '아이 대시보드',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="promises" 
        options={{ 
          title: '내 약속 목록',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="verify" 
        options={{ 
          title: '약속 인증하기',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="rewards" 
        options={{ 
          title: '내 스티커와 보상',
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}