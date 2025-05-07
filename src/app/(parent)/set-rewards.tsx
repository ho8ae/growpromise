// app/(parent)/set-rewards.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

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

export default function SetRewardsScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [stickerGoal, setStickerGoal] = useState('10');
  
  const handleCreate = () => {
    // 실제 앱에서는 API 요청 등 구현
    alert('보상이 생성되었습니다!');
    router.back();
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">
            보상 설정
          </Text>
          
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-2">새 보상 만들기</Text>
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">보상 이름</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="예) 장난감 자동차, 놀이공원 가기"
                className="border border-gray-300 rounded-xl p-3"
              />
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">필요한 스티커 수</Text>
              <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
                <Pressable 
                  className={`flex-1 py-3 items-center ${stickerGoal === '5' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => setStickerGoal('5')}
                >
                  <Text className={stickerGoal === '5' ? 'text-white' : 'text-gray-700'}>5개</Text>
                </Pressable>
                <Pressable 
                  className={`flex-1 py-3 items-center ${stickerGoal === '10' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => setStickerGoal('10')}
                >
                  <Text className={stickerGoal === '10' ? 'text-white' : 'text-gray-700'}>10개</Text>
                </Pressable>
                <Pressable 
                  className={`flex-1 py-3 items-center ${stickerGoal === '15' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => setStickerGoal('15')}
                >
                  <Text className={stickerGoal === '15' ? 'text-white' : 'text-gray-700'}>15개</Text>
                </Pressable>
              </View>
            </View>
            
            <Pressable
              className={`py-3 rounded-xl ${
                title.trim() ? 'bg-green-500' : 'bg-gray-300'
              }`}
              onPress={handleCreate}
              disabled={!title.trim()}
            >
              <Text className="text-white text-center font-medium">
                보상 만들기
              </Text>
            </Pressable>
          </View>
          
          <Text className="text-lg font-medium mb-2">현재 보상 목록</Text>
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
                  
                  <View className="flex-row">
                    <Pressable className="mr-2 p-2 bg-gray-200 rounded-full">
                      <Text>🖊️</Text>
                    </Pressable>
                    <Pressable className="p-2 bg-red-100 rounded-full">
                      <Text>❌</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}