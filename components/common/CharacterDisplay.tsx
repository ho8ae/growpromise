// components/common/CharacterDisplay.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface CharacterDisplayProps {
  characterStage: number; // 1-3 사이의 성장 단계
  completedPromises: number;
  totalPromises: number;
  userType: 'parent' | 'child';
}

export default function CharacterDisplay({
  characterStage = 1,
  completedPromises = 0,
  totalPromises = 5,
  userType = 'child',
}: CharacterDisplayProps) {
  const router = useRouter();

  const getCharacterImage = () => {
    switch (characterStage) {
      case 1:
        return require('../../assets/images/react-logo.png');
      case 2:
        return require('../../assets/images/react-logo.png');
      case 3:
        return require('../../assets/images/react-logo.png');
      default:
        return require('../../assets/images/react-logo.png');
    }
  };

  const handleCharacterPress = () => {
    if (userType === 'child') {
      router.push('/(child)');
    } else {
      router.push('/(parent)');
    }
  };

  const progressPercentage =
    totalPromises > 0 ? (completedPromises / totalPromises) * 100 : 0;

  return (
    <View className="items-center justify-center py-4">
      <Text className="text-lg font-medium text-center mb-2">
        내 캐릭터 ({characterStage}단계)
      </Text>

      <Pressable
        onPress={handleCharacterPress}
        className="mb-4 p-2 rounded-full bg-sky-100"
      >
        <Image
          source={getCharacterImage()}
          style={{ width: 150, height: 150 }}
          contentFit="contain"
          className="rounded-full"
        />
      </Pressable>

      <View className="w-full px-4">
        <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>

        <Text className="text-center mt-2">
          {completedPromises}/{totalPromises} 약속 완료
        </Text>
      </View>
    </View>
  );
}
