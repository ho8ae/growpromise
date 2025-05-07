// app/(tabs)/character.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

// 임시 데이터
const CHARACTER_STAGES = [
  {
    id: '1',
    name: '아기 꼬마',
    description: '이제 막 성장을 시작했어요.',
    requirements: '5개의 약속을 완료하세요.',
    image: require('../../assets/images/react-logo.png'),
    isUnlocked: true,
    isCurrent: true,
  },
  {
    id: '2',
    name: '튼튼한 어린이',
    description: '약속을 꾸준히 지키는 멋진 어린이에요.',
    requirements: '20개의 약속을 완료하세요.',
    image: require('../../assets/images/react-logo.png'),
    isUnlocked: false,
    isCurrent: false,
  },
  {
    id: '3',
    name: '책임감 있는 꼬맹이',
    description: '매우 책임감 있고 믿음직한 아이로 성장했어요!',
    requirements: '50개의 약속을 완료하세요.',
    image: require('../../assets/images/react-logo.png'),
    isUnlocked: false,
    isCurrent: false,
  },
];

export default function CharacterScreen() {
  const [selectedStage, setSelectedStage] = useState('1');
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">
            내 캐릭터
          </Text>
          
          <View className="items-center mb-8">
            <Image
              source={CHARACTER_STAGES.find(s => s.id === selectedStage)?.image}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
              className="mb-4"
            />
            <Text className="text-xl font-bold">
              {CHARACTER_STAGES.find(s => s.id === selectedStage)?.name}
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              {CHARACTER_STAGES.find(s => s.id === selectedStage)?.description}
            </Text>
          </View>
          
          <Text className="text-lg font-medium mb-4">성장 단계</Text>
          {CHARACTER_STAGES.map(stage => (
            <Pressable
              key={stage.id}
              className={`mb-4 p-4 rounded-xl border ${
                stage.isUnlocked 
                  ? stage.isCurrent
                    ? 'border-green-500 bg-green-50'
                    : 'border-blue-300 bg-white'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onPress={() => setSelectedStage(stage.id)}
              disabled={!stage.isUnlocked}
            >
              <View className="flex-row items-center">
                <Image
                  source={stage.image}
                  style={{ width: 50, height: 50 }}
                  contentFit="contain"
                  className="mr-3"
                />
                <View className="flex-1">
                  <Text className={`text-lg ${
                    stage.isUnlocked ? 'font-medium' : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </Text>
                  <Text className={stage.isUnlocked ? 'text-gray-600' : 'text-gray-400'}>
                    {stage.isUnlocked ? stage.description : stage.requirements}
                  </Text>
                </View>
                {stage.isCurrent && (
                  <View className="bg-green-500 px-3 py-1 rounded-full">
                    <Text className="text-white">현재</Text>
                  </View>
                )}
                {!stage.isUnlocked && (
                  <View className="bg-gray-300 p-2 rounded-full">
                    <Text className="text-white">🔒</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
          
          <View className="bg-yellow-50 rounded-xl p-4 my-4">
            <Text className="text-lg font-medium mb-2">성장 진행도</Text>
            <Text>
              지금까지 5개의 약속을 완료했어요!
            </Text>
            <Text className="mt-1">
              다음 단계까지 15개의 약속이 더 필요해요.
            </Text>
            <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-3">
              <View 
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: '25%' }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}