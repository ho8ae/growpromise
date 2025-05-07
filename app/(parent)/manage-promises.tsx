// app/(parent)/manage-promises.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 임시 데이터
const PROMISES = [
  { 
    id: '1', 
    title: '숙제하기', 
    description: '학교 숙제를 모두 마칠 것',
    repeatType: 'daily',
    isActive: true 
  },
  { 
    id: '2', 
    title: '이를 닦기', 
    description: '아침, 저녁으로 3분씩 양치질하기',
    repeatType: 'daily',
    isActive: true 
  },
  { 
    id: '3', 
    title: '장난감 정리하기', 
    description: '놀고 난 후 장난감을 제자리에 정리하기',
    repeatType: 'once',
    isActive: true 
  },
  { 
    id: '4', 
    title: '책 읽기', 
    description: '취침 전 20분간 책 읽기',
    repeatType: 'daily',
    isActive: false 
  },
];

export default function ManagePromisesScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4">
          약속 관리
        </Text>
        
        <Pressable
          className="bg-blue-500 py-3 rounded-xl mb-6"
          onPress={() => router.push('/(parent)/create-promise')}
        >
          <Text className="text-white text-center font-medium">
            새 약속 만들기
          </Text>
        </Pressable>
        
        <Text className="text-lg font-medium mb-2">활성 약속</Text>
        <ScrollView className="flex-1">
          {PROMISES.filter(p => p.isActive).map(promise => (
            <View 
              key={promise.id} 
              className="mb-3 p-4 rounded-xl border border-blue-300 bg-white"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-medium">{promise.title}</Text>
                  <Text className="text-gray-500 text-sm mb-1">{promise.description}</Text>
                  <View className="bg-blue-100 self-start px-2 py-1 rounded-full">
                    <Text className="text-blue-700 text-xs">
                      {promise.repeatType === 'once' ? '한 번만' : 
                       promise.repeatType === 'daily' ? '매일' : '매주'}
                    </Text>
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
          ))}
          
          <Text className="text-lg font-medium my-2">비활성 약속</Text>
          {PROMISES.filter(p => !p.isActive).map(promise => (
            <View 
              key={promise.id} 
              className="mb-3 p-4 rounded-xl border border-gray-300 bg-gray-50"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg">{promise.title}</Text>
                  <Text className="text-gray-500 text-sm mb-1">{promise.description}</Text>
                  <View className="bg-gray-200 self-start px-2 py-1 rounded-full">
                    <Text className="text-gray-700 text-xs">
                      {promise.repeatType === 'once' ? '한 번만' : 
                       promise.repeatType === 'daily' ? '매일' : '매주'}
                    </Text>
                  </View>
                </View>
                
                <Pressable className="p-2 bg-green-100 rounded-full">
                  <Text>✅</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}