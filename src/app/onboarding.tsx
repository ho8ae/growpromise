// app/onboarding.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSlideInAnimation } from '../utils/animations';

const slides = [
  {
    title: '약속을 함께 만들어요',
    description: '부모와 아이가 함께 약속을 만들고 성장할 수 있어요.',
    image: require('../assets/images/react-logo.png'),
  },
  {
    title: '인증하고 칭찬받아요',
    description: '약속을 지키면, 사진으로 인증하고 칭찬 스티커를 받아요.',
    image: require('../assets/images/react-logo.png'),
  },
  {
    title: '캐릭터와 함께 성장해요',
    description: '약속을 지킬수록 캐릭터가 성장하고 보상도 받을 수 있어요.',
    image: require('../assets/images/react-logo.png'),
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
      // 최초 실행 완료 표시
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      
      // 메인 화면으로 이동
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  const progress = ((currentSlide + 1) / slides.length) * 100;
  
  return (
    <SafeAreaView className="flex-1 bg-white">
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
          <View className="bg-emerald-100 p-6 rounded-full mb-4">
            <Image
              source={slides[currentSlide].image}
              style={{ width: 180, height: 180 }}
              contentFit="contain"
            />
          </View>
          <Text className="text-2xl font-bold mt-6 text-center text-emerald-700">
            {slides[currentSlide].title}
          </Text>
          <Text className="text-gray-600 mt-4 text-center text-base">
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