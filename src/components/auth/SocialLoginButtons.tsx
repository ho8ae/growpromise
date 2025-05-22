// components/auth/SocialLoginButtons.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: 'GOOGLE' | 'APPLE', data: any) => void;
  isLoading?: boolean;
}

export default function SocialLoginButtons({
  onSocialLogin,
  isLoading,
}: SocialLoginButtonsProps) {
  // Apple 로그인 처리 (로그인/회원가입 통합)
  const handleAppleLogin = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Apple 개발자 계정 등록 후 활성화
      /*
      // Apple 로그인 라이브러리 import 필요
      // import { appleAuth } from '@invertase/react-native-apple-authentication';
      
      if (Platform.OS === 'ios') {
        // Apple 로그인 요청
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        if (!appleAuthRequestResponse.identityToken) {
          Alert.alert('알림', 'Apple 로그인이 취소되었습니다.');
          return;
        }

        // 백엔드로 전송할 데이터 준비
        const loginData = {
          idToken: appleAuthRequestResponse.identityToken,
          userInfo: {
            email: appleAuthRequestResponse.email,
            fullName: appleAuthRequestResponse.fullName,
            user: appleAuthRequestResponse.user,
          }
        };

        // 백엔드에서 자동으로 로그인/회원가입 처리
        onSocialLogin('APPLE', loginData);
      } else {
        // Android는 웹뷰 방식
        Alert.alert('알림', 'Android에서는 아직 Apple 로그인을 지원하지 않습니다.');
      }
      */

      Alert.alert(
        'Apple 로그인 준비중',
        'Apple 개발자 계정 등록 완료 후 사용 가능합니다.',
        [{ text: '확인' }],
      );
    } catch (error: any) {
      console.error('Apple 로그인 오류:', error);

      if (error.code === '1001') {
        Alert.alert('알림', 'Apple 로그인이 취소되었습니다.');
      } else {
        Alert.alert('오류', 'Apple 로그인 중 오류가 발생했습니다.');
      }
    }
  };

  // Google 로그인 처리 (로그인/회원가입 통합)
  const handleGoogleLogin = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Google 로그인 구현 예정
      Alert.alert(
        'Google 로그인 준비중',
        'Google 로그인 기능을 구현 중입니다.',
        [{ text: '확인' }],
      );
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      Alert.alert('오류', 'Google 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <View className="w-full">
      {/* 구분선 */}
      <View className="flex-row items-center mb-8">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="px-4 text-gray-400 text-sm">또는</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* Apple 로그인 버튼 */}
      {Platform.OS === 'ios' && (   
        <Pressable
          className="bg-black py-4 rounded-xl mb-3 flex-row items-center justify-center active:opacity-90"
          onPress={handleAppleLogin}
          disabled={isLoading}
        >
          <FontAwesome5
            name="apple"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-semibold text-base">
            Apple로 계속하기
          </Text>
        </Pressable>
      )}

      {/* Google 로그인 버튼 */}
      <Pressable
        className="bg-white border-2 border-gray-200 py-4 rounded-xl mb-6 flex-row items-center justify-center active:opacity-90"
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        <FontAwesome5
          name="google"
          size={20}
          color="#DB4437"
          style={{ marginRight: 8 }}
        />
        <Text className="text-gray-800 font-semibold text-base">
          Google로 계속하기
        </Text>
      </Pressable>
    </View>
  );
}
