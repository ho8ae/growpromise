// app/onboarding.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: '약속을 만들어요',
    description: '부모와 아이가 함께 지킬 약속을 만들고 관리해요.',
    icon: 'handshake',
    bgColor: '#E6F4D7',
    iconColor: Colors.light.primary,
  },
  {
    title: '약속을 지켜요',
    description: '약속을 지키면 사진으로 인증하고 칭찬 스티커를 받아요.',
    icon: 'check-circle',
    bgColor: '#E6F9FF',
    iconColor: Colors.light.info,
  },
  {
    title: '식물이 자라요',
    description: '약속을 지킬수록 나만의 식물이 쑥쑥 자라요!',
    icon: 'seedling',
    bgColor: '#FFF8E6',
    iconColor: Colors.light.secondary,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // 슬라이드 변경 시 애니메이션
    Animated.timing(slideAnim, {
      toValue: -currentSlide * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  const progress = ((currentSlide + 1) / slides.length) * 100;
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <View className="flex-1 justify-between">
        {/* 슬라이드 컨텐츠 */}
        <Animated.View 
          className="flex-row"
          style={{ 
            transform: [{ translateX: slideAnim }],
            width: width * slides.length,
          }}
        >
          {slides.map((slide, index) => (
            <View 
              key={index}
              className="items-center justify-center px-6"
              style={{ width }}
            >
              <View 
                className="rounded-full p-10 mb-8"
                style={{ backgroundColor: slide.bgColor }}
              >
                <FontAwesome5 
                  name={slide.icon} 
                  size={80} 
                  color={slide.iconColor} 
                />
              </View>
              <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                {slide.title}
              </Text>
              <Text className="text-base text-center text-gray-600 px-4">
                {slide.description}
              </Text>
            </View>
          ))}
        </Animated.View>
        
        {/* 인디케이터 및 버튼 */}
        <View className="px-8 mb-8">
          <View className="flex-row justify-center mb-8">
            {slides.map((_, index) => (
              <View 
                key={index}
                className={`h-2 mx-1 rounded-full ${
                  index === currentSlide ? 'w-8 bg-[#58CC02]' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>
          
          <Pressable
            className="bg-[#58CC02] py-4 rounded-2xl mb-4 shadow-sm"
            onPress={handleNext}
          >
            <Text className="text-white text-center font-bold">
              {currentSlide < slides.length - 1 ? '다음' : '시작하기'}
            </Text>
          </Pressable>
          
          <Pressable
            className="py-2"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-[#58CC02] text-center">
              이미 계정이 있으신가요? 로그인하기
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}