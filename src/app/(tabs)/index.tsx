import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CharacterDisplay from '../../components/common/CharacterDisplay';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { useSlideInAnimation } from '../../utils/animations';

export default function TabsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  // 기본 캐릭터 데이터
  const characterData = {
    stage: 5,
    completedPromises: 10,
    totalPromises: 3,
  };

  const { animation, startAnimation } = useSlideInAnimation(100, 800);

  useEffect(() => {
    startAnimation();
  }, []);

  // 비인증 사용자가 기능 사용 시도할 때 로그인 화면으로 안내
  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그인',
          onPress: () => router.navigate('/(auth)/login'),
        },
      ]);
      return true;
    }
    return false;
  };

  // 사용자 유형에 따른 대시보드 진입
  const navigateToDashboard = () => {
    if (handleAuthRequired()) return;
    
    if (user?.userType === 'PARENT') {
      router.push('/(parent)');
    } else if (user?.userType === 'CHILD') {
      router.push('/(child)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          {/* 헤더 영역 */}
          <View className="flex-row items-center justify-center my-4">
            <Image
              source={require('../../assets/images/react-logo.png')}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
              className="mr-2"
            />
            <Text className="text-2xl font-bold text-center text-emerald-600">
              쑥쑥약속
            </Text>
          </View>

          {/* 비인증 사용자 알림 배너 */}
          {!isAuthenticated && (
            <View className="bg-amber-100 rounded-xl p-4 mb-4 border border-amber-200">
              <Text className="text-amber-800 font-medium text-center mb-2">
                미리보기 모드입니다
              </Text>
              <Text className="text-amber-700 text-center mb-3">
                전체 기능을 이용하시려면 로그인이 필요합니다.
              </Text>
              <Pressable
                className="bg-amber-500 py-2 rounded-lg"
                onPress={() => router.navigate('/(auth)/login')}
              >
                <Text className="text-white text-center font-medium">
                  로그인하기
                </Text>
              </Pressable>
            </View>
          )}

          {/* 캐릭터 영역 */}
          <Pressable onPress={navigateToDashboard}>
            <CharacterDisplay
              characterStage={characterData.stage}
              completedPromises={characterData.completedPromises}
              totalPromises={characterData.totalPromises}
              userType={user?.userType === 'PARENT' ? 'parent' : 'child'}
            />
          </Pressable>

          {/* 약속 상태 카드 */}
          <Animated.View
            className="bg-emerald-50 rounded-2xl p-5 mt-4 border border-emerald-200 shadow-sm"
            style={{
              opacity: animation.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
              transform: [{ translateY: animation }],
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-amber-200 p-2 rounded-full mr-3">
                <FontAwesome5
                  name="seedling"
                  size={18}
                  color={Colors.light.leafGreen}
                />
              </View>
              <Text className="text-lg font-medium text-emerald-700">
                오늘의 약속
              </Text>
            </View>

            {characterData.completedPromises < characterData.totalPromises ? (
              <View>
                <Text className="text-emerald-800 mb-2 text-base">
                  {characterData.totalPromises -
                    characterData.completedPromises}
                  개의 약속이 남아있어요!
                </Text>
                <View className="flex-row items-center">
                  <FontAwesome5
                    name="hand-point-right"
                    size={14}
                    color={Colors.light.leafGreen}
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-emerald-600 italic">
                    식물을 터치해서 확인해보세요.
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center">
                <FontAwesome5
                  name="check-circle"
                  size={16}
                  color={Colors.light.leafGreen}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-emerald-800">
                  모든 약속을 완료했어요! 정말 잘했어요!
                </Text>
              </View>
            )}
          </Animated.View>

          {/* 오늘의 물주기 (신규 콘텐츠) */}
          <Animated.View
            className="bg-sky-50 rounded-2xl p-5 mt-4 border border-sky-200 shadow-sm"
            style={{
              opacity: animation.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
              transform: [{ translateY: animation }],
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-sky-200 p-2 rounded-full mr-3">
                <FontAwesome5 name="tint" size={18} color="#0ea5e9" />
              </View>
              <Text className="text-lg font-medium text-sky-700">
                오늘의 물주기
              </Text>
            </View>

            <Text className="text-sky-800 mb-3">
              식물에게 물을 주면 더 빨리 성장해요!
            </Text>

            <Pressable
              className="bg-sky-100 py-3 rounded-xl flex-row items-center justify-center border border-sky-200"
              onPress={() => {
                if (handleAuthRequired()) return;
                Alert.alert('알림', '물을 줬어요! 식물이 쑥쑥 자랄거에요!');
              }}
            >
              <FontAwesome5
                name="hand-holding-water"
                size={18}
                color="#0ea5e9"
                style={{ marginRight: 8 }}
              />
              <Text className="text-sky-700 font-medium">물주기</Text>
            </Pressable>
          </Animated.View>

          {/* 사용 팁 */}
          <Animated.View
            className="mt-4 mb-8 bg-amber-50 rounded-2xl p-5 border border-amber-200 shadow-sm"
            style={{
              opacity: animation.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
              transform: [{ translateY: animation }],
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-amber-200 p-2 rounded-full mr-3">
                <FontAwesome5 name="lightbulb" size={18} color="#92400e" />
              </View>
              <Text className="text-lg font-medium text-amber-700">사용팁</Text>
            </View>
            <Text className="text-amber-800">
              식물을 터치하면 {user?.userType === 'PARENT' ? '부모' : '아이'} 화면으로
              이동합니다. 약속을 많이 지킬수록 식물이 쑥쑥 자라요!
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}