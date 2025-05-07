// app/(parent)/index.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

// 임시 데이터
const PENDING_APPROVALS = [
  { id: '1', childName: '민준', promiseTitle: '숙제하기', timestamp: '방금 전' },
  { id: '2', childName: '민준', promiseTitle: '장난감 정리하기', timestamp: '10분 전' },
];

export default function ParentDashboard() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4">
          부모 대시보드
        </Text>
        
        <View className="flex-row justify-between items-center my-2">
          <Text className="text-lg font-medium">인증 요청</Text>
          <Text className="text-sm text-blue-500">{PENDING_APPROVALS.length}개 대기 중</Text>
        </View>
        
        <ScrollView className="flex-1">
          {PENDING_APPROVALS.map(approval => (
            <Pressable
              key={approval.id}
              className="mb-3 p-4 rounded-xl border border-orange-300 bg-orange-50"
              onPress={() => router.push('/(parent)/approvals')}
            >
              <View className="flex-row items-center">
                <Image
                  source={require('../../assets/images/react-logo.png')}
                  style={{ width: 40, height: 40 }}
                  contentFit="contain"
                  className="mr-3 rounded-full"
                />
                <View className="flex-1">
                  <Text className="text-lg">{approval.promiseTitle}</Text>
                  <Text className="text-gray-500">
                    {approval.childName} • {approval.timestamp}
                  </Text>
                </View>
                <View className="bg-orange-500 px-3 py-1 rounded-full">
                  <Text className="text-white">확인하기</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        
        <View className="my-4">
          <Pressable
            className="bg-blue-500 py-3 rounded-xl mb-3"
            onPress={() => router.push('/(parent)/create-promise')}
          >
            <Text className="text-white text-center font-medium">
              새 약속 만들기
            </Text>
          </Pressable>
          
          <Pressable
            className="bg-green-500 py-3 rounded-xl"
            onPress={() => router.push('/(parent)/manage-promises')}
          >
            <Text className="text-white text-center font-medium">
              약속 관리하기
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}