import { Stack } from 'expo-router';
import React from 'react';
import Colors from '../../constants/Colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen 
        name="edit-profile" 
        options={{
          title: '프로필 수정',
        }} 
      />
      <Stack.Screen 
        name="change-password" 
        options={{
          title: '비밀번호 변경',
        }} 
      />
      <Stack.Screen 
        name="theme" 
        options={{
          title: '테마 설정',
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{
          title: '도움말',
        }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{
          title: '문의하기',
        }} 
      />
      <Stack.Screen 
        name="app-info" 
        options={{
          title: '앱 정보',
        }} 
      />
    </Stack>
  );
}