import { Stack } from 'expo-router';
import React from 'react';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFF' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '부모 메인',
        }}
      />
      <Stack.Screen
        name="child-progress"
        options={{
          title: '아이 진행 상황',
        }}
      />
      <Stack.Screen
        name="promise-details"
        options={{
          title: '약속 상세',
        }}
      />
      <Stack.Screen
        name="rewards-setup"
        options={{
          title: '보상 설정',
        }}
      />
      <Stack.Screen
        name="setting"
        options={{
          title: '설정',
        }}
      />
      <Stack.Screen
        name="verification"
        options={{
          title: '인증 확인',
        }}
      />
    </Stack>
  );
}