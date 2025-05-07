// app/(child)/rewards.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

// 임시 데이터
const REWARDS = [
  { 
    id: '1', 
    title: '장난감 자동차', 
    stickerGoal: 10,
    currentStickers: 8,
    image: require('../../assets/images/react-logo.png'),
  },
  { 
    id: '2', 
    title: '놀이공원 가기', 
    stickerGoal: 15,
    currentStickers: 5,
    image: require('../../assets/images/react-logo.png'),
  }
];

const HISTORY = [
  { 
    id: '1', 
    title: '책 한 권', 
    date: '2024년 4월 15일',
    image: require('../../assets/images/react-logo.png'),
  }
];

export default function RewardsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4">
          내 스티커와 보상
        </Text>
        
        <View className="bg-yellow-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-medium mb-2">내 스티커</Text>
          <View className="flex-row flex-wrap">
            {Array(10).fill(0).map((_, i) => (
              <View key={i} className="p-1">
                {i < 8 ? (
                  <Image 
                    source={require('../../assets/images/react-logo.png')}
                    style={{ width: 30, height: 30 }}
                    contentFit="contain"
                  />
                ) : (
                  <View className="w-[30px] h-[30px] border-2 border-dashed border-gray-300 rounded-full" />
                )}
              </View>
            ))}
          </View>
          <Text className="mt-2">8개의 스티커를 모았어요!</Text>
        </View>
        
        <Text className="text-lg font-medium mb-2">진행 중인 보상</Text>
        <ScrollView className="flex-1">
          {REWARDS.map(reward => {
            const progress = (reward.currentStickers / reward.stickerGoal) * 100;
            
            return (
              <View 
                key={reward.id} 
                className="mb-4 p-4 rounded-xl border border-purple-300 bg-white"
              >
                <View className="flex-row">
                  <Image
                    source={reward.image}
                    style={{ width: 60, height: 60 }}
                    contentFit="contain"
                    className="mr-3 rounded-lg"
                  />
                  <View className="flex-1">
                    <Text className="text-lg font-medium">{reward.title}</Text>
                    <Text className="text-gray-500 mb-2">
                      {reward.currentStickers}/{reward.stickerGoal} 스티커
                    </Text>
                    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
          
          <Text className="text-lg font-medium my-2">받은 보상</Text>
          {HISTORY.map(reward => (
            <View 
              key={reward.id} 
              className="mb-3 p-4 rounded-xl border border-green-300 bg-green-50"
            >
              <View className="flex-row items-center">
                <Image
                  source={reward.image}
                  style={{ width: 50, height: 50 }}
                  contentFit="contain"
                  className="mr-3 rounded-lg"
                />
                <View className="flex-1">
                  <Text className="text-lg">{reward.title}</Text>
                  <Text className="text-gray-500">{reward.date}</Text>
                </View>
                <View className="bg-green-500 p-2 rounded-full">
                  <Text className="text-white">✓</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}