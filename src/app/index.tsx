// app/index.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import SafeStatusBar from '../../src/components/common/SafeStatusBar';
import { useAuthStore } from '../../src/stores/authStore';

export default function IndexScreen() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const { isAuthenticated, isAuthChecked, user } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 앱 초기화 시작 (테스트 모드)...');

        const [isFirstLaunch, onboardingCompleted, onboardingSkipped] =
          await AsyncStorage.multiGet([
            'isFirstLaunch',
            'onboardingCompleted',
            'onboardingSkipped',
          ]);

        const firstLaunch = isFirstLaunch[1];
        const completed = onboardingCompleted[1];
        const skipped = onboardingSkipped[1];

        console.log('📱 온보딩 상태 확인:');
        console.log('- isFirstLaunch:', firstLaunch);
        console.log('- onboardingCompleted:', completed);
        console.log('- onboardingSkipped:', skipped);

        const shouldShow =
          firstLaunch === null ||
          (firstLaunch !== 'false' &&
            completed !== 'true' &&
            skipped !== 'true');

        setShouldShowOnboarding(shouldShow);
      } catch (error) {
        console.error('❌ 앱 초기화 중 오류:', error);
        setShouldShowOnboarding(true);
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
        }, 500);
      }
    };

    initializeApp();
  }, []);

  // 초기화 중일 때 로딩 화면 표시
  if (isInitializing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

        <View className="bg-[#E6F4D7] p-6 rounded-full mb-6">
          <FontAwesome5 name="seedling" size={50} color="#58CC02" />
        </View>
        <Text className="text-xl font-bold text-[#58CC02] mb-2">쑥쑥약속</Text>
        <ActivityIndicator size="large" color="#58CC02" className="mt-8" />
        <Text className="mt-4 text-gray-600">앱을 준비하고 있어요...</Text>
      </View>
    );
  }

  // 초기화 완료 후 라우팅 결정
  console.log('🎯 라우팅 결정 단계 (테스트 모드):');
  console.log('- shouldShowOnboarding:', shouldShowOnboarding);
  console.log('- isAuthChecked:', isAuthChecked);
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- userType:', user?.userType);

  // 1. 온보딩이 필요한 경우 (테스트 모드에서는 항상 true)
  if (shouldShowOnboarding) {
    console.log('➡️  온보딩 화면으로 이동 (테스트 모드)');
    return <Redirect href="/onboarding" />;
  }

  // 2. 인증 상태가 아직 확인되지 않은 경우 대기
  if (!isAuthChecked) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#58CC02" />
        <Text className="mt-4 text-gray-600">
          로그인 상태를 확인하고 있어요...
        </Text>
      </View>
    );
  }

  // 3. 인증되지 않은 경우 로그인 화면으로
  if (!isAuthenticated) {
    console.log('➡️  로그인 화면으로 이동');
    return <Redirect href="/(auth)" />;
  }

  // 4. 인증된 경우 메인 탭으로
  console.log('➡️  메인 탭으로 이동');
  return <Redirect href="/(tabs)" />;
}
