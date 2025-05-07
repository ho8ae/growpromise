// app/(child)/index.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

// 임시 데이터 - 실제 앱에서는 context나 상태 관리를 사용
const PROMISES = [
  { id: '1', title: '숙제하기', isCompleted: false, deadline: '오늘' },
  { id: '2', title: '이를 닦기', isCompleted: true, deadline: '매일' },
  { id: '3', title: '장난감 정리하기', isCompleted: false, deadline: '오늘' },
];

export default function ChildDashboard() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4">
          내 약속 관리
        </Text>
        
        <View className="bg-yellow-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-medium mb-2">오늘의 미션</Text>
          <Text>
            {PROMISES.filter(p => !p.isCompleted).length}개의 약속이 남았어요!
          </Text>
        </View>
        
        <Text className="text-lg font-medium my-2">약속 목록</Text>
        <ScrollView className="flex-1">
          {PROMISES.map(promise => (
            <View 
              key={promise.id} 
              className={`mb-3 p-4 rounded-xl border ${
                promise.isCompleted ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-300'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg">{promise.title}</Text>
                  <Text className="text-gray-500">{promise.deadline}</Text>
                </View>
                
                {promise.isCompleted ? (
                  <View className="bg-green-500 px-3 py-1 rounded-full">
                    <Text className="text-white">완료</Text>
                  </View>
                ) : (
                  <Pressable
                    className="bg-blue-500 px-3 py-1 rounded-full"
                    onPress={() => router.push('/(child)/verify')}
                  >
                    <Text className="text-white">인증하기</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
        
        <View className="bg-green-50 rounded-xl p-4 mt-2 mb-4">
          <Text className="text-lg font-medium mb-2">내 스티커</Text>
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
            <View className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full items-center justify-center">
              <Text className="text-gray-400">+3</Text>
            </View>
          </View>
          <Text className="mt-2">5개 모으면 선물이 기다려요!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}