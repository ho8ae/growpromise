// app/index.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  
  useEffect(() => {
    checkFirstLaunch();
  }, []);
  
  const checkFirstLaunch = async () => {
    try {
      // 앱 최초 실행 여부 확인
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      
      // 딜레이 추가 (스플래시 화면 표시 시간)
      setTimeout(() => {
        if (isFirstLaunch === null) {
          // 최초 실행 시 온보딩 화면으로 이동
          router.replace('/onboarding');
        } else {
          // 이미 실행한 적이 있으면 메인 화면으로 이동
          router.replace('/(tabs)');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking first launch:', error);
      router.replace('/onboarding');
    }
  };
  
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require('../assets/images/react-logo.png')}
        style={{ width: 150, height: 150 }}
        contentFit="contain"
      />
      <Text className="text-3xl font-bold mt-4 text-blue-500">KidsPlan</Text>
      <Text className="text-gray-500 mt-2">함께 약속하고 성장하는 즐거움</Text>
    </View>
  );
}