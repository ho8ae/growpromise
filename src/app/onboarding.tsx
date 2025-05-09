// app/onboarding.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSlideInAnimation } from '../utils/animations';
import Colors from '../constants/Colors';

const slides = [
  {
    title: '씨앗을 심어요',
    description: '부모와 아이가 함께 약속의 씨앗을 심어요.',
    icon: 'seedling',
    bgColor: 'bg-emerald-100',
    iconColor: Colors.light.leafGreen
  },
  {
    title: '약속을 지켜요',
    description: '약속을 지키면 사진으로 인증하고 물을 줄 수 있어요.',
    icon: 'tint',
    bgColor: 'bg-sky-100',
    iconColor: '#0ea5e9'
  },
  {
    title: '쑥쑥 자라요',
    description: '약속을 지킬수록 식물이 자라고 보상도 받을 수 있어요.',
    icon: 'sun',
    bgColor: 'bg-amber-100',
    iconColor: Colors.light.sunYellow
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { animation, startAnimation } = useSlideInAnimation();
  
  useEffect(() => {
    startAnimation();
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const handleSkip = () => {
    completeOnboarding();
  };
  
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  const progress = ((currentSlide + 1) / slides.length) * 100;
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 flex-1 justify-between">
        <Pressable
          className="self-end py-4"
          onPress={handleSkip}
        >
          <Text className="text-emerald-500">건너뛰기</Text>
        </Pressable>
        
        <Animated.View 
          className="items-center"
          style={{
            transform: [{ translateX: animation }],
            opacity: animation.interpolate({
              inputRange: [0, 300],
              outputRange: [1, 0],
            }),
          }}
        >
          <View className={`${slides[currentSlide].bgColor} p-8 rounded-full mb-6`}>
            <FontAwesome5 
              name={slides[currentSlide].icon} 
              size={100} 
              color={slides[currentSlide].iconColor} 
            />
          </View>
          <Text className="text-2xl font-bold mt-6 text-center text-emerald-700">
            {slides[currentSlide].title}
          </Text>
          <Text className="text-gray-600 mt-4 text-center text-base px-6">
            {slides[currentSlide].description}
          </Text>
        </Animated.View>
        
        <View className="mb-12">
          <View className="mb-8 w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <View 
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          
          <Pressable
            className="bg-emerald-500 py-4 rounded-xl shadow-md"
            onPress={handleNext}
          >
            <Text className="text-white text-center font-medium">
              {currentSlide < slides.length - 1 ? '다음' : '시작하기'}
            </Text>
          </Pressable>
          
          {currentSlide === slides.length - 1 && (
            <Pressable
              className="mt-4"
              onPress={() => router.push('/(auth)')}
            >
              <Text className="text-emerald-500 text-center">
                계정이 있으신가요? 로그인
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}