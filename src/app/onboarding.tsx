// app/onboarding.tsx
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  configureReanimatedLogger,
  ReanimatedLogLevel,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeStatusBar from '../../src/components/common/SafeStatusBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reanimated 로거 설정 (불필요한 경고 제거)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // strict 모드 비활성화
});

const { width, height } = Dimensions.get('window');

// 반응형 이미지 크기 계산
const getImageSize = () => {
  const imageWidth = Math.min(width * 0.85, 370);
  const imageHeight = Math.min(height * 0.65, 600);
  return { width: imageWidth, height: imageHeight };
};

const slides = [
  {
    id: 'slide-1',
    title: '자녀의 약속을 생성하고!',
    description: '부모와 자녀가 함께 지킬 약속을 만들고 관리해요.',
    image: require('../../src/assets/images/onbording/on_1.png'),
    bgColor: '#E6F4D7',
  },
  {
    id: 'slide-2',
    title: '약속을 지켜요',
    description: '약속을 지키면 사진으로 인증하고 칭찬 스티커를 받아요.',
    image: require('../../src/assets/images/onbording/on_2.png'),
    bgColor: '#E6F9FF',
  },
  {
    id: 'slide-3',
    title: '식물이 자라요',
    description: '약속을 지킬수록 나만의 식물이 쑥쑥 자라요!',
    image: require('../../src/assets/images/onbording/on_3.png'),
    bgColor: '#FFF8E6',
  },
  {
    id: 'slide-4',
    title: '성장하는 즐거움',
    description: '매일매일 새로운 변화를 경험해보세요!',
    image: require('../../src/assets/images/onbording/on_4.png'),
    bgColor: '#FFE6F4',
  },
  {
    id: 'slide-5',
    title: '함께하는 기쁨',
    description: '가족과 함께 만드는 소중한 추억!',
    image: require('../../src/assets/images/onbording/on_5.png'),
    bgColor: '#F0E6FF',
  },
  {
    id: 'slide-6',
    title: '새로운 시작',
    description: '지금 바로 쑥쑥약속과 함께 시작해보세요!',
    image: require('../../src/assets/images/onbording/on_6.png'),
    bgColor: '#E6FFF0',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // 반응형 이미지 크기
  const imageSize = getImageSize();

  // Reanimated shared values
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  // useEffect로 애니메이션 업데이트 (렌더링과 분리)
  useEffect(() => {
    translateX.value = withSpring(-currentSlide * width, {
      damping: 20,
      stiffness: 100,
    });
  }, [currentSlide]);

  // 다음 슬라이드로 이동
  const goToNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentSlide]);

  // 이전 슬라이드로 이동
  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentSlide]);

  // 새로운 Gesture API 사용
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      const threshold = width * 0.25; // 25% 임계값
      const velocity = event.velocityX;

      if (event.translationX > threshold || velocity > 800) {
        // 오른쪽으로 스와이프 - 이전 슬라이드
        if (currentSlide > 0) {
          runOnJS(goToPrevSlide)();
        } else {
          // 첫 번째 슬라이드에서는 원래 위치로 복귀
          translateX.value = withSpring(-currentSlide * width);
        }
      } else if (event.translationX < -threshold || velocity < -800) {
        // 왼쪽으로 스와이프 - 다음 슬라이드
        if (currentSlide < slides.length - 1) {
          runOnJS(goToNextSlide)();
        } else {
          // 마지막 슬라이드에서는 원래 위치로 복귀
          translateX.value = withSpring(-currentSlide * width);
        }
      } else {
        // 임계값에 도달하지 못하면 원래 위치로 복귀
        translateX.value = withSpring(-currentSlide * width);
      }
    })
    .runOnJS(false); // UI 스레드에서 실행

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleNext = useCallback(async () => {
    if (isCompleting) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else {
        await completeOnboarding();
      }
    } catch (error) {
      console.error('Next button error:', error);
    }
  }, [currentSlide, isCompleting]);

  const completeOnboarding = useCallback(async () => {
    if (isCompleting) return;

    try {
      setIsCompleting(true);
      console.log('🚀 온보딩 완료 처리 시작...');

      await AsyncStorage.multiSet([
        ['isFirstLaunch', 'false'],
        ['onboardingCompleted', 'true'],
        ['onboardingCompletedAt', new Date().toISOString()],
      ]);

      console.log('✅ 온보딩 완료 (테스트 모드 - 저장 안함)');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)');
    } catch (error) {
      console.error('❌ 온보딩 완료 중 오류:', error);
      setIsCompleting(false);
      router.replace('/(auth)');
    }
  }, [isCompleting, router]);

  const handleLoginPress = useCallback(async () => {
    if (isCompleting) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push('/(auth)/login');
    } catch (error) {
      console.error('Login press error:', error);
      router.push('/(auth)/login');
    }
  }, [isCompleting, router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

      <View className="flex-1 justify-between">
        {/* 슬라이드 컨텐츠 with 새로운 Gesture API */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="flex-row flex-1"
            style={[animatedStyle, { width: width * slides.length }]}
          >
            {slides.map((slide, index) => (
              <View
                key={slide.id}
                className="items-center justify-center px-6"
                style={{ width }}
              >
                {/* 반응형 이미지 */}
                <View className="mb-14 items-center justify-center">
                  <Image
                    source={slide.image}
                    style={{
                      width: imageSize.width,
                      height: imageSize.height,
                      borderRadius: 16,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ))}
          </Animated.View>
        </GestureDetector>

        {/* 하단 컨트롤 */}
        <View className="px-8 mb-8">
          {/* 페이지 인디케이터 */}
          <View className="flex-row justify-center mb-8">
            {slides.map((_, index) => (
              <View
                key={`indicator-${index}`}
                className={`h-2 mx-1 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-[#58CC02]'
                    : 'w-2 bg-gray-300'
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
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isCompleting
                ? '잠시만 기다려주세요...'
                : currentSlide < slides.length - 1
                  ? '다음'
                  : '시작하기'}
            </Text>
          </Pressable>

          {/* 로그인 버튼 */}
          <Pressable
            className="py-2"
            onPress={handleLoginPress}
            disabled={isCompleting}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              className={`text-center ${
                isCompleting ? 'text-gray-400' : 'text-[#58CC02]'
              }`}
            >
              이미 계정이 있으신가요? 로그인하기
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
