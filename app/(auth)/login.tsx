import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'parent' | 'child'>('child');

  const handleLogin = () => {
    // 실제 로그인 로직 구현 필요
    console.log('로그인 시도:', { email, password, userType });

    // 유저 타입에 따라 다른 경로로 이동
    if (userType === 'parent') {
      router.replace('/(parent)');
    } else {
      router.replace('/(child)');
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

      {/* 사용자 타입 선택 탭 */}
      <Animated.View
        entering={FadeInDown.delay(800).duration(1000)}
        className="flex-row bg-[#F8FAFF] rounded-md mb-6 p-1 shadow-sm"
      >
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-4 rounded-sm ${
            userType === 'parent' ? 'bg-white shadow-sm' : ''
          }`}
          onPress={() => setUserType('parent')}
        >
          <Ionicons
            name="person"
            size={20}
            color={userType === 'parent' ? '#70CAF8' : '#7E8CA3'}
          />
          <Text
            className={`ml-1 ${
              userType === 'parent'
                ? 'text-[#3D5366] font-medium'
                : 'text-[#7E8CA3]'
            }`}
          >
            부모님
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-4 rounded-sm ${
            userType === 'child' ? 'bg-white shadow-sm' : ''
          }`}
          onPress={() => setUserType('child')}
        >
          <Ionicons
            name="happy"
            size={20}
            color={userType === 'child' ? '#70CAF8' : '#7E8CA3'}
          />
          <Text
            className={`ml-1 ${
              userType === 'child'
                ? 'text-[#3D5366] font-medium'
                : 'text-[#7E8CA3]'
            }`}
          >
            아이
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 로그인 폼 */}
      <Animated.View
        entering={FadeInDown.delay(1000).duration(1000)}
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

export default LoginScreen;
