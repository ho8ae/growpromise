// src/components/auth/SocialLoginButtons.tsx - Apple 로그인 구현
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useAppleOAuth } from '../../hooks/useAppleOAuth';
import { useGoogleOAuth } from '../../hooks/useGoogleOAuth';

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: 'GOOGLE' | 'APPLE', data: any) => void;
  isLoading?: boolean;
}

export default function SocialLoginButtons({
  onSocialLogin,
  isLoading = false,
}: SocialLoginButtonsProps) {
  const { signIn: googleSignIn, isLoading: isGoogleLoading, isConfigured: isGoogleConfigured } = useGoogleOAuth();
  const { signIn: appleSignIn, isLoading: isAppleLoading, isAvailable: isAppleAvailable, isSupported: isAppleSupported } = useAppleOAuth();

  // Google 로그인 처리
  const handleGoogleSignIn = async () => {
    if (isLoading || isGoogleLoading || !isGoogleConfigured) return;

    try {
      Haptics.selectionAsync();
      console.log('🔵 Google 로그인 버튼 클릭');

      const userData = await googleSignIn();

      if (userData) {
        console.log('✅ Google 로그인 데이터 준비 완료:', {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          hasIdToken: !!userData.idToken,
        });

        // login.tsx의 googleLoginMutation으로 전달
        onSocialLogin('GOOGLE', userData);
      } else {
        console.log('📱 Google 로그인 취소되거나 실패함');
      }
    } catch (error: any) {
      console.error('❌ Google 로그인 버튼 오류:', error);
    }
  };

  // Apple 로그인 처리
  const handleAppleSignIn = async () => {
    if (isLoading || isAppleLoading || !isAppleAvailable) return;

    try {
      Haptics.selectionAsync();
      console.log('🍎 Apple 로그인 버튼 클릭');

      const appleUser = await appleSignIn();

      if (appleUser) {
        console.log('✅ Apple 로그인 데이터 준비 완료:', {
          id: appleUser.id,
          email: appleUser.email,
          name: appleUser.name,
          hasIdentityToken: !!appleUser.identityToken,
        });

        // login.tsx로 Apple 데이터 전달
        onSocialLogin('APPLE', appleUser);
      } else {
        console.log('📱 Apple 로그인 취소되거나 실패함');
      }
    } catch (error: any) {
      console.error('❌ Apple 로그인 버튼 오류:', error);
    }
  };

  const isAnyLoading = isLoading || isGoogleLoading || isAppleLoading;

  return (
    <View>
      {/* 구분선
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 font-medium">또는</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View> */}

      {/* Google 로그인 버튼 */}
      <Pressable
        className={`bg-white border border-gray-300 py-3.5 rounded-xl shadow-sm mb-3 flex-row items-center justify-center ${
          isAnyLoading || !isGoogleConfigured ? 'opacity-50' : 'active:opacity-90'
        }`}
        onPress={handleGoogleSignIn}
        disabled={isAnyLoading || !isGoogleConfigured}
        onPressIn={() => {
          if (!isAnyLoading && isGoogleConfigured) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        {isGoogleLoading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <FontAwesome5 name="google" size={20} color="#4285F4" />
        )}
        <Text className="text-gray-800 font-medium text-lg ml-3">
          {isGoogleLoading ? '로그인 중...' : 
           !isGoogleConfigured ? 'Google 설정 중...' : 
           'Google로 계속하기'}
        </Text>
      </Pressable>

      {/* Apple 로그인 버튼 (iOS만) */}
      {isAppleSupported && (
        <Pressable
          className={`bg-black py-3.5 rounded-xl shadow-sm flex-row items-center justify-center ${
            isAnyLoading || !isAppleAvailable ? 'opacity-50' : 'active:opacity-90'
          }`}
          onPress={handleAppleSignIn}
          disabled={isAnyLoading || !isAppleAvailable}
          onPressIn={() => {
            if (!isAnyLoading && isAppleAvailable) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          {isAppleLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome5 name="apple" size={20} color="white" />
          )}
          <Text className="text-white font-medium text-lg ml-3">
            {isAppleLoading ? '로그인 중...' : 
             !isAppleAvailable ? 'Apple 설정 중...' : 
             'Apple로 계속하기'}
          </Text>
        </Pressable>
      )}

      {/* 안내 텍스트 */}
      {/* <Text className="text-gray-400 text-center text-sm mt-4 leading-5">
        소셜 로그인으로 간편하게 회원가입하고{'\n'}
        바로 쑥쑥약속을 시작하세요!
      </Text> */}

      {/* 디버그 정보 (개발 중에만) */}
      {/* {__DEV__ && (
        <View className="mt-2">
          <Text className="text-gray-300 text-center text-xs">
            Google: {isGoogleConfigured ? '✅' : '❌'} | Apple: {isAppleSupported ? (isAppleAvailable ? '✅' : '⚠️') : '❌'} | Platform: {Platform.OS}
          </Text>
          {Platform.OS === 'ios' && !isAppleAvailable && (
            <Text className="text-gray-300 text-center text-xs">
              Apple Sign-In을 사용할 수 없습니다
            </Text>
          )}
        </View>
      )} */}
    </View>
  );
}