// app/(child)/my-rewards.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// 임시 데이터
const childData = {
  name: '민준',
  stickers: 12,
};

const rewards = [
  {
    id: '1',
    title: '아이스크림 사주기',
    requiredStickers: 5,
    image: require('../../assets/images/react-logo.png'),
    status: 'available', // available, inprogress, claimed
    icon: 'ice-cream-outline',
  },
  {
    id: '2',
    title: '게임 30분 추가',
    requiredStickers: 10,
    image: require('../../assets/images/react-logo.png'),
    status: 'inprogress',
    icon: 'game-controller-outline',
  },
  {
    id: '3',
    title: '장난감 사주기',
    requiredStickers: 20,
    image: require('../../assets/images/react-logo.png'),
    status: 'inprogress',
    icon: 'gift-outline',
  },
  {
    id: '4',
    title: '놀이공원 가기',
    requiredStickers: 50,
    image: require('../../assets/images/react-logo.png'),
    status: 'inprogress',
    icon: 'airplane-outline',
  },
];

export default function MyRewardsScreen() {
  const router = useRouter();

  const getProgress = (requiredStickers) => {
    return Math.min(childData.stickers / requiredStickers, 1) * 100;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#3D5366" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#3D5366]">보상 확인하기</Text>
      </View>

      {/* 스티커 현황 */}
      <View className="px-6 py-4 mb-2">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-bold text-[#3D5366]">내 스티커</Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={20} color="#FFEDA3" />
            <Text className="text-lg font-bold text-[#3D5366] ml-1">{childData.stickers}개</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="flex-row items-center justify-center py-3 bg-[#F5F8FF] rounded-xl"
          onPress={() => router.push('/(child)/my-stickers')}
        >
          <Ionicons name="albums-outline" size={18} color="#70CAF8" />
          <Text className="text-sm font-medium text-[#70CAF8] ml-2">스티커 모음 보기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        <Text className="text-base font-bold text-[#3D5366] mb-4">보상 목록</Text>
        
        {rewards.map((reward, index) => (
          <Animated.View 
            key={reward.id}
            entering={FadeInDown.delay(200 + index * 100).duration(500)}
            className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
          >
            <View className="h-32 bg-[#F5F8FF]">
              <View className="absolute inset-0 items-center justify-center">
                <Ionicons name={reward.icon} size={64} color="#A6E1FA" />
              </View>
            </View>
            
            <View className="p-4">
              <Text className="text-lg font-bold text-[#3D5366] mb-1">{reward.title}</Text>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-[#7E8CA3]">필요 스티커</Text>
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-[#3D5366] mr-1">
                    {childData.stickers}/{reward.requiredStickers}
                  </Text>
                  <Ionicons name="star" size={14} color="#FFEDA3" />
                </View>
              </View>
              
              <View className="h-2 bg-[#F5F8FF] rounded-full overflow-hidden mb-3">
                <View 
                  className="h-full bg-[#FFEDA3] rounded-full"
                  style={{ width: `${getProgress(reward.requiredStickers)}%` }}
                />
              </View>
              
              {reward.status === 'available' ? (
                <TouchableOpacity className="py-3 bg-[#A8E6CF] rounded-xl items-center">
                  <Text className="text-sm font-bold text-white">보상 받기</Text>
                </TouchableOpacity>
              ) : (
                <View className="py-3 bg-[#F5F8FF] rounded-xl items-center">
                  <Text className="text-sm text-[#7E8CA3]">
                    {reward.requiredStickers - childData.stickers}개 더 모아야해요
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}