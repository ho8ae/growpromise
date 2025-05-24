// app/onboarding.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

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
  const [isCompleting, setIsCompleting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // 슬라이드 변경 시 애니메이션
    Animated.timing(slideAnim, {
      toValue: -currentSlide * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);
  
  const handleNext = async () => {
    if (isCompleting) return; // 중복 클릭 방지
    
    try {
      // 햅틱 피드백
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        await completeOnboarding();
      }
    } catch (error) {
      console.error('Next button error:', error);
    }
  };
  
  const completeOnboarding = async () => {
    if (isCompleting) return; // 중복 실행 방지
    
    try {
      setIsCompleting(true);
      console.log('🚀 온보딩 완료 처리 시작...');
      
      // AsyncStorage에 온보딩 완료 상태 저장
      await AsyncStorage.multiSet([
        ['isFirstLaunch', 'false'],
        ['onboardingCompleted', 'true'],
        ['onboardingCompletedAt', new Date().toISOString()],
      ]);
      
      console.log('✅ 온보딩 완료 상태 저장됨');
      
      // 햅틱 피드백
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 라우터 교체 (뒤로가기 방지)
      router.replace('/(auth)');
      
    } catch (error) {
      console.error('❌ 온보딩 완료 중 오류:', error);
      setIsCompleting(false);
      
      // 오류 발생 시에도 로그인 화면으로 이동
      router.replace('/(auth)');
    }
  };
  
  const handleLoginPress = async () => {
    if (isCompleting) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // 온보딩을 건너뛰고 로그인 화면으로
      await AsyncStorage.setItem('onboardingSkipped', 'true');
      router.push('/(auth)/login');
      
    } catch (error) {
      console.error('Login press error:', error);
      router.push('/(auth)/login');
    }
  };
  
  const progress = ((currentSlide + 1) / slides.length) * 100;
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Edge-to-Edge 대응 StatusBar */}
      <StatusBar style="dark" translucent={Platform.OS === 'android'} />
      
      {/* Android Edge-to-Edge 대응 */}
      {Platform.OS === 'android' && (
        <View 
          className="absolute top-0 left-0 right-0 bg-white z-10"
          style={{ height: 50 }}
        />
      )}
      
      <View className="flex-1 justify-between">
        {/* 상단 진행 표시바 (선택사항) */}
        <View className="px-8 pt-4">
          <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <Animated.View 
              className="h-full bg-[#58CC02] rounded-full"
              style={{ 
                width: `${progress}%`,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [-width * (slides.length - 1), 0],
                    outputRange: [0, 0],
                    extrapolate: 'clamp',
                  })
                }]
              }}
            />
          </View>
        </View>
        
        {/* 슬라이드 컨텐츠 */}
        <Animated.View 
          className="flex-row flex-1"
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
              <Text className="text-base text-center text-gray-600 px-4 leading-6">
                {slide.description}
              </Text>
            </View>
          ))}
        </Animated.View>
        
        {/* 인디케이터 및 버튼 */}
        <View className="px-8 mb-8">
          {/* 페이지 인디케이터 */}
          <View className="flex-row justify-center mb-8">
            {slides.map((_, index) => (
              <View 
                key={index}
                className={`h-2 mx-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-[#58CC02]' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>
          
          {/* 메인 버튼 */}
          <Pressable
            className={`py-4 rounded-2xl mb-4 shadow-sm ${
              isCompleting ? 'bg-gray-400' : 'bg-[#58CC02]'
            }`}
            onPress={handleNext}
            disabled={isCompleting}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isCompleting 
                ? '잠시만 기다려주세요...' 
                : currentSlide < slides.length - 1 
                  ? '다음' 
                  : '시작하기'
              }
            </Text>
          </Pressable>
          
          {/* 건너뛰기/로그인 버튼 */}
          <Pressable
            className="py-2"
            onPress={handleLoginPress}
            disabled={isCompleting}
          >
            <Text className={`text-center ${
              isCompleting ? 'text-gray-400' : 'text-[#58CC02]'
            }`}>
              이미 계정이 있으신가요? 로그인하기
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}