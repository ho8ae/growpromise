// app/(child)/index.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSlideInAnimation } from '../../utils/animations';

// 임시 데이터
const PROMISES = [
  { id: '1', title: '숙제하기', isCompleted: false, deadline: '오늘' },
  { id: '2', title: '이를 닦기', isCompleted: true, deadline: '매일' },
  { id: '3', title: '장난감 정리하기', isCompleted: false, deadline: '오늘' },
];

export default function ChildDashboard() {
  const router = useRouter();
  const { animation, startAnimation } = useSlideInAnimation();
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          내 약속 관리
        </Text>
        
        <Animated.View 
          className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200 shadow-sm"
          style={{
            opacity: animation.interpolate({
              inputRange: [0, 300],
              outputRange: [1, 0]
            }),
            transform: [{ translateX: animation }]
          }}
        >
          <View className="flex-row items-center mb-2">
            <FontAwesome name="rocket" size={18} color="#10b981" style={{ marginRight: 8 }} />
            <Text className="text-lg font-medium text-emerald-700">오늘의 미션</Text>
          </View>
          <Text className="text-emerald-800">
            {PROMISES.filter(p => !p.isCompleted).length}개의 약속이 남았어요!
          </Text>
        </Animated.View>
        
        <View className="flex-row items-center my-3">
          <FontAwesome name="list-ul" size={18} color="#10b981" style={{ marginRight: 8 }} />
          <Text className="text-lg font-medium text-emerald-700">약속 목록</Text>
        </View>
        
        <ScrollView className="flex-1">
          {PROMISES.map((promise, index) => (
            <Animated.View 
              key={promise.id} 
              style={{
                opacity: animation.interpolate({
                  inputRange: [0, 300],
                  outputRange: [1, 0]
                }),
                transform: [{ translateY: animation }]
              }}
            >
              <View 
                className={`mb-3 p-4 rounded-xl border shadow-sm ${
                  promise.isCompleted 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-emerald-300'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-lg ${promise.isCompleted ? 'text-gray-500' : 'text-emerald-800'}`}>
                      {promise.title}
                    </Text>
                    <Text className="text-gray-500">{promise.deadline}</Text>
                  </View>
                  
                  {promise.isCompleted ? (
                    <View className="bg-emerald-500 px-3 py-1 rounded-full">
                      <Text className="text-white">완료</Text>
                    </View>
                  ) : (
                    <Pressable
                      className="bg-emerald-500 px-3 py-1 rounded-full shadow-sm"
                      onPress={() => router.push('/(child)/verify')}
                    >
                      <Text className="text-white">인증하기</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
        
        <Animated.View 
          className="bg-emerald-50 rounded-xl p-4 mt-2 mb-4 border border-emerald-200 shadow-sm"
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
          <View className="flex-row">
            <Image 
              source={require('../../assets/images/react-logo.png')}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
              className="mr-2"
            />
            <Image 
              source={require('../../assets/images/react-logo.png')}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
              className="mr-2"
            />
            <View className="w-10 h-10 border-2 border-dashed border-emerald-300 rounded-full items-center justify-center">
              <Text className="text-emerald-600">+3</Text>
            </View>
          </View>
          <Text className="mt-2 text-emerald-800">5개 모으면 선물이 기다려요!</Text>
          
          <Pressable
            className="bg-emerald-500 py-2 rounded-lg mt-3 shadow-sm"
            onPress={() => router.push('/(child)/rewards')}
          >
            <Text className="text-white text-center">스티커 더 보기</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}