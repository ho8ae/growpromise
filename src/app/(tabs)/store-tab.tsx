// src/app/(tabs)/store-tab.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

export default function StoreTabScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [showAdPrompt, setShowAdPrompt] = useState(false);

  // 뽑기 화면으로 이동
  const handleDrawPlant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isAuthenticated) {
      Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그인',
          onPress: () => router.navigate('/(auth)/login'),
        },
      ]);
      return;
    }

    setShowAdPrompt(true);
  };

  // 광고 보기
  const handleWatchAd = () => {
    setShowAdPrompt(false);

    // 실제로는 에드몹 광고 출력 로직 구현
    // 여기서는 광고 시청 성공을 가정하고 카드팩 화면으로 이동
    Alert.alert(
      '광고 시청',
      '광고 시청을 완료했습니다! 식물 카드팩을 뽑아보세요.',
      [
        {
          text: '뽑으러 가기',
          onPress: () => router.push('/store-packs'),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">상점</Text>
        </View>

        {/* 식물 뽑기 메인 배너 */}
        <TouchableOpacity
          className="overflow-hidden shadow-sm rounded-2xl"
          onPress={handleDrawPlant}
          activeOpacity={0.9}
        >
          <View className="flex-col p-4 bg-green-500 min-h-[55%] justify-center mb-4 rounded-2xl">
            <View className="flex-1 items-center justify-center mt-8 border border-white rounded-2xl bg-white">
              <View className="p-2">
                <Image
                  source={require('../../assets/images/character/level_5.png')}
                  style={{ width: 150, height: 150 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="flex-1 items-start justify-center">
              <View className="">
                <Text className="text-white font-bold text-2xl mb-2">
                  새로운 식물 뽑기
                </Text>
                <Text className="text-white opacity-90 mb-6">
                  광고를 시청하고 특별한 식물을 뽑아보세요!
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 식물 뽑기 안내 */}
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          {/* select-plant 바로가기 버튼 */}
          <TouchableOpacity
            className="flex-row items-center justify-center"
            onPress={() => router.push('/(child)/select-plant')}
          >
            <Text className="text-blue-600 font-semibold">
              내 식물 확인하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 광고 시청 모달 */}
      {showAdPrompt && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center px-5">
          <View className="bg-white rounded-xl p-5 w-full max-w-sm">
            <View className="items-center mb-4">
              <MaterialCommunityIcons
                name="video-outline"
                size={40}
                color="#10b981"
              />
            </View>

            <Text className="text-xl font-bold text-center text-gray-800 mb-2">
              식물 뽑기 안내
            </Text>

            <Text className="text-gray-600 text-center mb-4">
              짧은 광고를 시청하고 무료로 식물 카드팩을 뽑아보세요!
            </Text>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-lg mr-2"
                onPress={() => setShowAdPrompt(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-emerald-500 py-3 rounded-lg"
                onPress={handleWatchAd}
              >
                <Text className="text-white font-bold text-center">
                  광고 보기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
