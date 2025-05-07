// app/(auth)/login.tsx (수정 버전)
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

// Import the global router this way
import * as Router from 'expo-router';

// 목 사용자 데이터
const mockUsers = [
  {
    id: '1',
    email: 'parent',
    password: 'password123',
    name: '김엄마',
    role: 'parent',
  },
  {
    id: '2',
    email: 'child',
    password: 'password123',
    name: '민준',
    role: 'child',
  },
];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 테스트용 로그인 정보 자동 입력
  const fillParentCredentials = () => {
    setEmail(mockUsers[0].email);
    setPassword(mockUsers[0].password);
  };

  const fillChildCredentials = () => {
    setEmail(mockUsers[1].email);
    setPassword(mockUsers[1].password);
  };

  const handleLogin = () => {
    // 간단한 검증
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요');
      return;
    }

    // 목 데이터에서 사용자 찾기
    const user = mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      console.log('로그인 성공:', user);
      
      // 사용자 역할에 따라 다른 경로로 이동
      try {
        if (user.role === 'parent') {
          Router.router.replace('/(parent)');
        } else {
          Router.router.replace('/(child)');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // 폴백 네비게이션
        if (user.role === 'parent') {
          Router.router.navigate('/(parent)');
        } else {
          Router.router.navigate('/(child)');
        }
      }
    } else {
      // 로그인 실패
      alert('이메일 또는 비밀번호가 올바르지 않습니다');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="dark" />

      {/* 헤더 이미지 및 로고 */}
      <Animated.View
        entering={FadeIn.delay(100).duration(1000)}
        className="items-center mt-12 mb-6"
      >
        <Image
          source={require('../../assets/images/react-logo.png')}
          className="w-[200px] h-[200px]"
          resizeMode="contain"
        />
        <Animated.Text
          entering={FadeInUp.delay(400).duration(1000)}
          className="text-3xl text-[#70CAF8] font-bold mt-4"
        >
          Kids Plan
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(600).duration(1000)}
          className="text-sm text-[#5D5E8C] mt-1"
        >
          부모와 아이가 함께 만드는 약속
        </Animated.Text>
      </Animated.View>

      {/* 로그인 폼 */}
      <Animated.View
        entering={FadeInDown.delay(800).duration(1000)}
        className="flex-1"
      >
        <View className="flex-row items-center bg-[#F5F8FF] rounded-md mb-4 px-4 py-0 ios:py-4 shadow-sm">
          <Ionicons
            name="mail-outline"
            size={20}
            color="#7E8CA3"
            className="mr-4"
          />
          <TextInput
            className="flex-1 h-[50px] text-[#3D5366]"
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#7E8CA3"
          />
        </View>

        <View className="flex-row items-center bg-[#F5F8FF] rounded-md mb-4 px-4 py-0 ios:py-4 shadow-sm">
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#7E8CA3"
            className="mr-4"
          />
          <TextInput
            className="flex-1 h-[50px] text-[#3D5366]"
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#7E8CA3"
          />
          <TouchableOpacity
            className="p-1"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#7E8CA3"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="self-end mb-6">
          <Text className="text-xs text-[#70CAF8]">비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#70CAF8] rounded-md py-4 items-center justify-center mb-6 shadow-md"
          onPress={handleLogin}
        >
          <Text className="text-base text-white font-bold">로그인</Text>
        </TouchableOpacity>

        {/* 테스트용 자동 로그인 버튼 */}
        <View className="flex-row justify-center mb-6">
          <TouchableOpacity 
            className="bg-[#F5F8FF] rounded-md py-2 px-4 mr-2"
            onPress={fillParentCredentials}
          >
            <Text className="text-sm text-[#70CAF8]">부모님 로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-[#F5F8FF] rounded-md py-2 px-4 ml-2"
            onPress={fillChildCredentials}
          >
            <Text className="text-sm text-[#70CAF8]">아이 로그인</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mb-6">
          <Text className="text-sm text-[#7E8CA3]">계정이 없으신가요? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-[#70CAF8] font-medium">
                회원가입
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* 소셜 로그인 옵션 */}
        <View className="items-center mb-8">
          <Text className="text-xs text-[#7E8CA3] mb-4">또는</Text>
          <View className="flex-row justify-center">
            <TouchableOpacity className="w-[50px] h-[50px] rounded-full bg-white items-center justify-center mx-2 shadow-sm">
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[50px] h-[50px] rounded-full bg-white items-center justify-center mx-2 shadow-sm">
              <Ionicons name="logo-apple" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[50px] h-[50px] rounded-full bg-white items-center justify-center mx-2 shadow-sm">
              <Ionicons name="logo-facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}