// app/(parent)/index.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSlideInAnimation } from '../../utils/animations';

// 임시 데이터
const PENDING_APPROVALS = [
  { id: '1', childName: '민준', promiseTitle: '숙제하기', timestamp: '방금 전' },
  { id: '2', childName: '민준', promiseTitle: '장난감 정리하기', timestamp: '10분 전' },
];

export default function ParentDashboard() {
  const router = useRouter();
  const { animation, startAnimation } = useSlideInAnimation();
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          부모 대시보드
        </Text>
        
        <View className="flex-row justify-between items-center my-3">
          <View className="flex-row items-center">
            <FontAwesome name="check-circle" size={18} color="#10b981" style={{ marginRight: 8 }} />
            <Text className="text-lg font-medium text-emerald-700">인증 요청</Text>
          </View>
          <View className="bg-emerald-500 px-2 py-1 rounded-full">
            <Text className="text-white text-sm">{PENDING_APPROVALS.length}개 대기 중</Text>
          </View>
        </View>
        
        <ScrollView className="flex-1">
          {PENDING_APPROVALS.map((approval, index) => (
            <Animated.View 
              key={approval.id}
              style={{
                opacity: animation.interpolate({
                  inputRange: [0, 300],
                  outputRange: [1, 0]
                }),
                transform: [{ translateX: animation }]
              }}
            >
              <Pressable
                className="mb-3 p-4 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm"
                onPress={() => router.push('/(parent)/approvals')}
              >
                <View className="flex-row items-center">
                  <Image
                    source={require('../../assets/images/react-logo.png')}
                    style={{ width: 50, height: 50 }}
                    contentFit="contain"
                    className="mr-3 rounded-full"
                  />
                  <View className="flex-1">
                    <Text className="text-lg text-emerald-800">{approval.promiseTitle}</Text>
                    <Text className="text-gray-500">
                      {approval.childName} • {approval.timestamp}
                    </Text>
                  </View>
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white">확인하기</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
        
        <Animated.View 
          className="my-4"
          style={{
            opacity: animation.interpolate({
              inputRange: [0, 300],
              outputRange: [1, 0]
            }),
            transform: [{ translateY: animation }]
          }}
        >
          <Pressable
            className="bg-emerald-500 py-3 rounded-xl mb-3 shadow-md"
            onPress={() => router.push('/(parent)/create-promise')}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome name="plus" size={16} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-medium">
                새 약속 만들기
              </Text>
            </View>
          </Pressable>
          
          <Pressable
            className="bg-emerald-600 py-3 rounded-xl shadow-md"
            onPress={() => router.push('/(parent)/manage-promises')}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome name="list" size={16} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-medium">
                약속 관리하기
              </Text>
            </View>
          </Pressable>
          
          <Pressable
            className="bg-emerald-400 py-3 rounded-xl mt-3 shadow-md"
            onPress={() => router.push('/(parent)/set-rewards')}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome name="gift" size={16} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-medium">
                보상 설정하기
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}