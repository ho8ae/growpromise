// src/components/auth/SocialLoginButtons.tsx
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
import { useGoogleOAuth } from '../../hooks/useGoogleOAuth';

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: 'GOOGLE' | 'APPLE', data: any) => void;
  isLoading?: boolean;
}

export default function SocialLoginButtons({
  onSocialLogin,
  isLoading = false,
}: SocialLoginButtonsProps) {
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const { signIn: googleSignIn, isLoading: isGoogleLoading, isConfigured } = useGoogleOAuth();

  // Google 로그인 처리
  const handleGoogleSignIn = async () => {
    if (isLoading || isGoogleLoading) return;

    try {
      Haptics.selectionAsync();

      console.log('🔵 Google 로그인 시작...');
      const user = await googleSignIn();

      if (user) {
        console.log('✅ Google 로그인 성공:', {
          id: user.id,
          email: user.email,
          name: user.name,
        });

        // 서버로 전송할 데이터 준비
        const signInData = {
          idToken: user.idToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.photo,
            given_name: user.givenName,
            family_name: user.familyName,
            verified_email: user.email,
          },
        };

        console.log('📤 서버로 전송할 데이터:', {
          userEmail: signInData.user?.email,
          verified: signInData.user?.verified_email,
          hasIdToken: !!signInData.idToken,
        });

        // 부모 컴포넌트로 데이터 전달
        onSocialLogin('GOOGLE', signInData);
      }
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      // useGoogleOAuth에서 이미 에러 처리를 하므로 여기서는 추가 처리 불필요
    }
  };

  // Apple 로그인 처리 (iOS만)
  const handleAppleSignIn = async () => {
    if (isLoading || isAppleLoading) return;

    try {
      setIsAppleLoading(true);
      Haptics.selectionAsync();

      // TODO: Apple Sign-In 구현
      Alert.alert('준비 중', 'Apple 로그인은 곧 지원될 예정입니다.', [
        { text: '확인' }
      ]);

    } catch (error) {
      console.error('Apple 로그인 실패:', error);
      Alert.alert('Apple 로그인 실패', 'Apple 로그인 중 오류가 발생했습니다.', [
        { text: '확인' }
      ]);
    } finally {
      setIsAppleLoading(false);
    }
  };

  const isAnyLoading = isLoading || isGoogleLoading || isAppleLoading;

  return (
    <View>
      {/* 구분선 */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 font-medium">또는</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Google 로그인 버튼 */}
      <Pressable
        className={`bg-white border border-gray-300 py-3.5 rounded-xl shadow-sm mb-3 flex-row items-center justify-center ${
          isAnyLoading || !isConfigured ? 'opacity-50' : 'active:opacity-90'
        }`}
        onPress={handleGoogleSignIn}
        disabled={isAnyLoading || !isConfigured}
        onPressIn={() => {
          if (!isAnyLoading && isConfigured) {
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
           !isConfigured ? 'Google 설정 중...' : 
           'Google로 계속하기'}
        </Text>
      </Pressable>

      {/* Apple 로그인 버튼 (iOS만) */}
      {Platform.OS === 'ios' && (
        <Pressable
          className={`bg-black py-3.5 rounded-xl shadow-sm flex-row items-center justify-center ${
            isAnyLoading ? 'opacity-50' : 'active:opacity-90'
          }`}
          onPress={handleAppleSignIn}
          disabled={isAnyLoading}
          onPressIn={() => {
            if (!isAnyLoading) {
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
            {isAppleLoading ? '로그인 중...' : 'Apple로 계속하기'}
          </Text>
        </Pressable>
      )}

      {/* 안내 텍스트 */}
      <Text className="text-gray-400 text-center text-sm mt-4 leading-5">
        소셜 로그인으로 간편하게 회원가입하고{'\n'}
        바로 쑥쑥약속을 시작하세요!
      </Text>

      {/* 설정 상태 디버그 정보 (개발 중에만) */}
      {__DEV__ && (
        <Text className="text-gray-300 text-center text-xs mt-2">
          Google 설정: {isConfigured ? '✅' : '❌'}
        </Text>
      )}
    </View>
  );
}