import { Stack } from 'expo-router';
import React from 'react';

export default function ChildLayout() {
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
          title: '아이 메인',
        }}
      />
      <Stack.Screen
        name="achievement"
        options={{
          title: '달성 현황',
        }}
      />
      <Stack.Screen
        name="my-rewards"
        options={{
          title: '나의 보상',
        }}
      />
      <Stack.Screen
        name="my-stickers"
        options={{
          title: '나의 스티커',
        }}
      />
      <Stack.Screen
        name="verify-promise"
        options={{
          title: '약속 인증',
        }}
      />
    </Stack>
  );
}
