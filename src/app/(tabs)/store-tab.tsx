// src/app/(tabs)/store-tab.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

// 상점 아이템 타입
interface StoreItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isAvailable: boolean;
  comingSoon?: boolean;
}

const storeItems: StoreItem[] = [
  {
    id: 'card-pack',
    title: '식물 카드팩',
    description: '광고 시청으로 무료 획득',
    icon: 'cards',
    isAvailable: true,
  },
  {
    id: 'decorations',
    title: '화분 꾸미기',
    description: '예쁜 화분과 장식품',
    icon: 'flower-tulip',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'stickers',
    title: '스티커 팩',
    description: '다양한 칭찬 스티커',
    icon: 'sticker-emoji',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'themes',
    title: '테마 컬렉션',
    description: '앱 테마와 배경',
    icon: 'palette',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'tools',
    title: '원예 도구',
    description: '식물 관리 도구',
    icon: 'shovel',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'music',
    title: '음악 컬렉션',
    description: '식물과 함께 듣는 음악',
    icon: 'music',
    isAvailable: false,
    comingSoon: true,
  },
];

export default function StoreTabScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [showAdPrompt, setShowAdPrompt] = useState(false);

  // 카드팩 뽑기 핸들러
  const handleCardPack = () => {
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

  // 출시 예정 아이템 핸들러
  const handleComingSoon = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('출시 예정', '곧 만나볼 수 있어요! 조금만 기다려 주세요. 🌱');
  };

  // 광고 보기
  const handleWatchAd = () => {
    setShowAdPrompt(false);
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* 헤더 */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800">상점</Text>
            <Text className="text-gray-600 mt-1">다양한 아이템을 만나보세요</Text>
          </View>

          {/* 상점 아이템 그리드 */}
          <View className="flex-row flex-wrap justify-between">
            {storeItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.isAvailable ? handleCardPack : handleComingSoon}
                activeOpacity={0.8}
                className={`w-[48%] mb-4 rounded-2xl overflow-hidden ${
                  item.isAvailable 
                    ? 'bg-white shadow-sm border border-gray-100' 
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <View className="p-4 h-32">
                  {/* 아이콘 영역 */}
                  <View className="flex-1 items-center justify-center">
                    <View 
                      className={`w-12 h-12 rounded-xl items-center justify-center mb-3 ${
                        item.isAvailable 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`}
                    >
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={24} 
                        color={item.isAvailable ? 'white' : '#9CA3AF'} 
                      />
                    </View>
                  </View>

                  {/* 텍스트 영역 */}
                  <View>
                    <Text 
                      className={`font-semibold text-center mb-1 ${
                        item.isAvailable ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text 
                      className={`text-xs text-center ${
                        item.isAvailable ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {item.comingSoon ? '출시 예정' : item.description}
                    </Text>
                  </View>

                  {/* 출시 예정 배지 */}
                  {item.comingSoon && (
                    <View className="absolute top-2 right-2">
                      <View className="bg-gray-400 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Soon</Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 메인 카드팩 배너 */}
          <View className="mt-4 mb-6">
            <TouchableOpacity
              onPress={handleCardPack}
              activeOpacity={0.9}
              className="bg-green-500 rounded-2xl overflow-hidden shadow-lg"
            >
              <View className="flex-row items-center p-6">
                <View className="flex-1">
                  <Text className="text-white font-bold text-xl mb-2">
                    🎁 식물 카드팩 뽑기
                  </Text>
                  <Text className="text-white/90 mb-4">
                    광고를 시청하고 새로운 식물을 발견해보세요!
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="video-outline" size={16} color="white" />
                    <Text className="text-white/90 ml-2 text-sm">무료 광고 시청</Text>
                  </View>
                </View>
                <View className="ml-4">
                  <Image
                    source={require('../../assets/images/character/level_5.png')}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 하단 안내 */}
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <TouchableOpacity
              onPress={() => router.push('/(child)/select-plant')}
              className="flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="sprout" size={20} color="#2563eb" />
              <Text className="text-blue-600 font-semibold ml-2">
                내 식물 컬렉션 보기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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