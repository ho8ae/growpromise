// app/index.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // 로고 애니메이션
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 텍스트 애니메이션은 로고 애니메이션 후에 시작
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // 일정 시간 후 다음 화면으로 이동
    checkAuthAndNavigate();
  }, []);
  
  const checkAuthAndNavigate = async () => {
    try {
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      const token = await AsyncStorage.getItem('auth_token');
      
      // 타이머 설정 (2.5초 후 이동)
      setTimeout(() => {
        if (isFirstLaunch === null) {
          // 최초 실행 시 온보딩 화면으로 이동
          router.replace('/onboarding');
        } else if (!token) {
          // 로그인 상태가 아니면 인증 화면으로 이동
          router.replace('/(auth)');
        } else {
          // 로그인된 상태면 메인 화면으로 이동
          router.replace('/(tabs)');
        }
      }, 2500);
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/onboarding');
    }
  };
  
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <StatusBar style="dark" />
      
      <View className="items-center">
        {/* 로고 애니메이션 */}
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }}
          className="mb-6"
        >
          <View className="bg-[#E6F4D7] p-8 rounded-full">
            <FontAwesome5 
              name="seedling" 
              size={80} 
              color={Colors.light.primary}
            />
          </View>
        </Animated.View>
        
        {/* 텍스트 애니메이션 */}
        <Animated.View
          style={{ opacity: textOpacity }}
          className="items-center"
        >
          <Text className="text-3xl font-bold text-[#58CC02] mb-2">쑥쑥약속</Text>
          <Text className="text-lg text-gray-500">함께 약속하고 함께 자라요</Text>
        </Animated.View>
      </View>
    </View>
  );
}