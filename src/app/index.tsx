// app/index.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    // 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
    
    // 일정 시간 후 다음 화면으로 이동
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
      }, 2500);
    } catch (error) {
      console.error('Error checking first launch:', error);
      router.replace('/onboarding');
    }
  };
  
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Animated.View 
        className="items-center"
        style={{
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ]
        }}
      >
        <View className="items-center">
          {/* 로고 (잎사귀와 화분) */}
          <View className="relative mb-4">
            <View className="bg-emerald-100 p-8 rounded-full">
              <FontAwesome5 
                name="seedling" 
                size={80} 
                color={Colors.light.leafGreen}
              />
            </View>
            <View className="bg-amber-200 w-[80] h-[30] rounded-t-full absolute bottom-[-15] left-[20]" />
            <View className="bg-amber-700 w-[100] h-[20] rounded-t-full absolute bottom-[-25] left-[10]" />
          </View>
          
          <Text className="text-3xl font-bold text-emerald-600 mb-1">쑥쑥약속</Text>
          <Text className="text-xl font-medium text-emerald-400 mb-3">GrowPromise</Text>
          <Text className="text-gray-500 text-lg">함께 약속하고 함께 자라요</Text>
        </View>
      </Animated.View>
    </View>
  );
}