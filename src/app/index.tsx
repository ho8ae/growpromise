// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';

export default function IndexScreen() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const { isAuthenticated, isAuthChecked, user } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 앱 초기화 시작...');
        
        // AsyncStorage에서 온보딩 상태 확인
        const [
          isFirstLaunch,
          onboardingCompleted,
          onboardingSkipped
        ] = await AsyncStorage.multiGet([
          'isFirstLaunch',
          'onboardingCompleted', 
          'onboardingSkipped'
        ]);

        const firstLaunch = isFirstLaunch[1];
        const completed = onboardingCompleted[1];
        const skipped = onboardingSkipped[1];

        console.log('📱 온보딩 상태 확인:');
        console.log('- isFirstLaunch:', firstLaunch);
        console.log('- onboardingCompleted:', completed);
        console.log('- onboardingSkipped:', skipped);

        // 온보딩을 보여줄 조건:
        // 1. 처음 실행이거나 (isFirstLaunch가 null)
        // 2. isFirstLaunch가 'true'이고, 완료되지 않았고, 건너뛰지 않았을 때
        const shouldShow = (
          firstLaunch === null || 
          (firstLaunch !== 'false' && completed !== 'true' && skipped !== 'true')
        );

        setShouldShowOnboarding(shouldShow);
        
        console.log('🎯 온보딩 표시 여부:', shouldShow);
        
      } catch (error) {
        console.error('❌ 앱 초기화 중 오류:', error);
        // 오류 발생 시 온보딩 건너뛰기
        setShouldShowOnboarding(false);
      } finally {
        // 약간의 지연 후 초기화 완료
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
        {/* StatusBar 배경 (Edge-to-Edge 대응) */}
        {Platform.OS === 'android' && (
          <View 
            className="absolute top-0 left-0 right-0 bg-white"
            style={{ height: 50 }}
          />
        )}
        
        <StatusBar style="dark" translucent={Platform.OS === 'android'} />
        
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
  console.log('🎯 라우팅 결정 단계:');
  console.log('- shouldShowOnboarding:', shouldShowOnboarding);
  console.log('- isAuthChecked:', isAuthChecked);
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- userType:', user?.userType);

  // 1. 온보딩이 필요한 경우
  if (shouldShowOnboarding) {
    console.log('➡️  온보딩 화면으로 이동');
    return <Redirect href="/onboarding" />;
  }

  // 2. 인증 상태가 아직 확인되지 않은 경우 대기
  if (!isAuthChecked) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#58CC02" />
        <Text className="mt-4 text-gray-600">로그인 상태를 확인하고 있어요...</Text>
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