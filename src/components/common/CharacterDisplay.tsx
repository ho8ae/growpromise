// components/common/CharacterDisplay.tsx
import React, { useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePulseAnimation } from '../../utils/animations';
import Colors from '../../constants/Colors';

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
  const { animation, startAnimation } = usePulseAnimation();
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  const getCharacterImage = () => {
    switch(characterStage) {
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
  
  const progressPercentage = totalPromises > 0 
    ? (completedPromises / totalPromises) * 100 
    : 0;
  
  return (
    <View className="items-center justify-center py-6">
      <Text className="text-lg font-medium text-center mb-3 text-emerald-700">
        내 캐릭터 ({characterStage}단계)
      </Text>
      
      <Pressable 
        onPress={handleCharacterPress}
        className="mb-5"
      >
        <Animated.View 
          className="p-3 rounded-full bg-emerald-100 shadow-md"
          style={{
            transform: [{ scale: animation }],
          }}
        >
          <Image
            source={getCharacterImage()}
            style={{ width: 160, height: 160 }}
            contentFit="contain"
            className="rounded-full"
          />
          
          {/* 귀여운 눈과 입 효과 */}
          <View className="absolute top-[70] left-[50] w-[15] h-[15] rounded-full bg-black" />
          <View className="absolute top-[70] right-[50] w-[15] h-[15] rounded-full bg-black" />
          <View className="absolute top-[100] left-[65] w-[30] h-[10] rounded-full bg-black" />
          
          {/* 귀여운 물방울 효과 */}
          <View className="absolute top-[25] right-[35] w-[10] h-[10] rounded-full bg-white opacity-80" />
          <View className="absolute top-[40] right-[45] w-[5] h-[5] rounded-full bg-white opacity-80" />
        </Animated.View>
      </Pressable>
      
      <View className="w-full px-8">
        <View className="w-full h-5 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200 shadow-sm">
          <View 
            className="h-full bg-emerald-400 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
        
        <Text className="text-center mt-3 text-emerald-700 font-medium">
          {completedPromises}/{totalPromises} 약속 완료
        </Text>
      </View>
    </View>
  );
}