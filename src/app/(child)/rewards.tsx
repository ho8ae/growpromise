// app/(child)/rewards.tsx
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { ScrollView, Text, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useSlideInAnimation } from '../../utils/animations';

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
  },
];

const HISTORY = [
  {
    id: '1',
    title: '책 한 권',
    date: '2024년 4월 15일',
    image: require('../../assets/images/react-logo.png'),
  },
];

export default function RewardsScreen() {
  const { animation, startAnimation } = useSlideInAnimation();
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          내 스티커와 보상
        </Text>

        <Animated.View 
          className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200 shadow-sm"
          style={{
            opacity: animation.interpolate({
              inputRange: [0, 300],
              outputRange: [1, 0]
            }),
            transform: [{ translateY: animation }]
          }}
        >
          <View className="flex-row items-center mb-2">
            <FontAwesome name="star" size={18} color="#10b981" style={{ marginRight: 8 }} />
            <Text className="text-lg font-medium text-emerald-700">내 스티커</Text>
          </View>
          <View className="flex-row flex-wrap">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <View key={i} className="p-1">
                  {i < 8 ? (
                    <Image
                      source={require('../../assets/images/react-logo.png')}
                      style={{ width: 30, height: 30 }}
                      contentFit="contain"
                    />
                  ) : (
                    <View className="w-[30px] h-[30px] border-2 border-dashed border-emerald-300 rounded-full" />
                  )}
                </View>
              ))}
          </View>
          <Text className="mt-2 text-emerald-800">8개의 스티커를 모았어요!</Text>
        </Animated.View>

        <View className="flex-row items-center mb-2">
          <FontAwesome name="gift" size={18} color="#10b981" style={{ marginRight: 8 }} />
          <Text className="text-lg font-medium text-emerald-700">진행 중인 보상</Text>
        </View>
        
        <ScrollView className="flex-1">
          {REWARDS.map((reward) => {
            const progress = (reward.currentStickers / reward.stickerGoal) * 100;

            return (
              <Animated.View
                key={reward.id}
                style={{
                  opacity: animation.interpolate({
                    inputRange: [0, 300],
                    outputRange: [1, 0]
                  }),
                  transform: [{ translateY: animation }]
                }}
              >
                <View className="mb-4 p-4 rounded-xl border border-emerald-300 bg-white shadow-sm">
                  <View className="flex-row">
                    <Image
                      source={reward.image}
                      style={{ width: 60, height: 60 }}
                      contentFit="contain"
                      className="mr-3 rounded-lg"
                    />
                    <View className="flex-1">
                      <Text className="text-lg font-medium text-emerald-800">{reward.title}</Text>
                      <Text className="text-gray-500 mb-2">
                        {reward.currentStickers}/{reward.stickerGoal} 스티커
                      </Text>
                      <View className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}

          <View className="flex-row items-center my-2">
            <FontAwesome name="check-circle" size={18} color="#10b981" style={{ marginRight: 8 }} />
            <Text className="text-lg font-medium text-emerald-700">받은 보상</Text>
          </View>
          
          {HISTORY.map((reward) => (
            <Animated.View
              key={reward.id}
              style={{
                opacity: animation.interpolate({
                  inputRange: [0, 300],
                  outputRange: [1, 0]
                }),
                transform: [{ translateY: animation }]
              }}
            >
              <View
                className="mb-3 p-4 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm"
              >
                <View className="flex-row items-center">
                  <Image
                    source={reward.image}
                    style={{ width: 50, height: 50 }}
                    contentFit="contain"
                    className="mr-3 rounded-lg"
                  />
                  <View className="flex-1">
                    <Text className="text-lg text-emerald-800">{reward.title}</Text>
                    <Text className="text-gray-500">{reward.date}</Text>
                  </View>
                  <View className="bg-emerald-500 p-2 rounded-full">
                    <Text className="text-white">✓</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}