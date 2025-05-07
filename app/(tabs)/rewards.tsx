import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

// 임시 데이터
const dummyRewards = [
  {
    id: '1',
    title: '장난감 사주기',
    requiredStickers: 20,
    currentStickers: 12,
    icon: 'gift-outline',
    childName: '민준',
    deadline: '2025년 6월 1일',
  },
  {
    id: '2',
    title: '놀이공원 가기',
    requiredStickers: 50,
    currentStickers: 30,
    icon: 'airplane-outline',
    childName: '민준',
    deadline: '2025년 7월 15일',
  },
  {
    id: '3',
    title: '게임 30분 추가',
    requiredStickers: 10,
    currentStickers: 8,
    icon: 'game-controller-outline',
    childName: '민준',
    deadline: '2025년 5월 20일',
  },
  {
    id: '4',
    title: '아이스크림 사주기',
    requiredStickers: 5,
    currentStickers: 5,
    icon: 'ice-cream-outline',
    childName: '민준',
    deadline: '완료',
    completed: true,
  },
];

export default function RewardsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('active'); // active, completed

  // 필터에 따라 보상 필터링
  const filteredRewards = dummyRewards.filter(reward => {
    if (filter === 'active') return !reward.completed;
    return reward.completed;
  });

  const handleRewardPress = (reward) => {
    // 보상 상세 화면으로 이동
    router.push({
      pathname: '/reward-details',
      params: { id: reward.id }
    });
  };

  const renderRewardItem = ({ item, index }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(400)}
    >
      <TouchableOpacity 
        className={`bg-white rounded-xl p-4 mb-4 shadow-sm ${item.completed ? 'border-2 border-[#A8E6CF]' : ''}`}
        onPress={() => handleRewardPress(item)}
      >
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-full bg-[#F5F8FF] items-center justify-center mr-4">
            <Ionicons name={item.icon} size={24} color="#70CAF8" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-[#3D5366]">{item.title}</Text>
            <Text className="text-xs text-[#7E8CA3]">{item.childName}의 보상</Text>
          </View>
          {item.completed && (
            <View className="bg-[#A8E6CF] px-3 py-1 rounded-full">
              <Text className="text-xs text-white font-medium">완료됨</Text>
            </View>
          )}
        </View>
        
        {!item.completed ? (
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-[#7E8CA3]">진행도</Text>
              <Text className="text-xs text-[#3D5366] font-medium">{item.currentStickers} / {item.requiredStickers} 스티커</Text>
            </View>
            <View className="h-2 bg-[#F5F8FF] rounded-full overflow-hidden">
              <View 
                className="h-full bg-[#FFEDA3] rounded-full"
                style={{ width: `${(item.currentStickers / item.requiredStickers) * 100}%` }}
              />
            </View>
            <Text className="text-xs text-[#7E8CA3] mt-2">기한: {item.deadline}</Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-end">
            <Ionicons name="checkmark-circle" size={20} color="#A8E6CF" />
            <Text className="text-xs text-[#A8E6CF] ml-1">달성 완료!</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFF] pt-12">
      <View className="px-6 mb-6">
        <Text className="text-2xl font-bold text-[#3D5366] mb-4">보상 관리</Text>
        
        {/* 필터 버튼 */}
        <View className="flex-row mb-4">
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 ${filter === 'active' ? 'bg-[#70CAF8]' : 'bg-white'}`}
            onPress={() => setFilter('active')}
          >
            <Text className={`font-medium ${filter === 'active' ? 'text-white' : 'text-[#3D5366]'}`}>진행 중</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full ${filter === 'completed' ? 'bg-[#A8E6CF]' : 'bg-white'}`}
            onPress={() => setFilter('completed')}
          >
            <Text className={`font-medium ${filter === 'completed' ? 'text-white' : 'text-[#3D5366]'}`}>완료됨</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredRewards}
        renderItem={renderRewardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 추가 버튼 */}
      <TouchableOpacity
        className="absolute right-6 bottom-6 w-14 h-14 rounded-full bg-[#70CAF8] items-center justify-center shadow-md"
        onPress={() => router.push('/modals/add-reward')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}