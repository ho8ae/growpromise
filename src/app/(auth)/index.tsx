// app/(auth)/index.tsx
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../../../src/stores/authStore';

export default function AuthIndexScreen() {
  const { isAuthenticated, isAuthChecked, user } = useAuthStore();

  // 인증 상태가 확인되지 않았으면 대기
  if (!isAuthChecked) {
    return null; // 또는 로딩 컴포넌트
  }

  // 이미 인증된 경우 메인 탭으로 리다이렉트
  if (isAuthenticated && user) {
    console.log('✅ 이미 인증됨, 메인 탭으로 이동');
    return <Redirect href="/(tabs)" />;
  }

  // 인증되지 않은 경우 로그인 화면으로 리다이렉트
  console.log('❌ 인증되지 않음, 로그인 화면으로 이동');
  return <Redirect href="/(auth)/login" />;
}