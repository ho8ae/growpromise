// app/(parent)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '부모 대시보드',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="create-promise" 
        options={{ 
          title: '약속 만들기',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="manage-promises" 
        options={{ 
          title: '약속 관리',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="approvals" 
        options={{ 
          title: '인증 확인',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="set-rewards" 
        options={{ 
          title: '보상 설정',
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}