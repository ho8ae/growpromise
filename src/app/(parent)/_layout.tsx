// app/(parent)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

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
          headerShown: false,
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
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="reward-history"
        options={{
          title: '보상 이력',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="generate-code"
        options={{
          title: '연결 코드 생성',
          animation: 'slide_from_right',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
