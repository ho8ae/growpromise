// app/(child)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSlideInAnimation } from '../../utils/animations';
import { useAuthStore } from '../../stores/authStore';

// Promise 타입 정의
interface Promise {
  id: string;
  title: string;
  isCompleted: boolean;
  deadline: string;
}

// Sticker 타입 정의
interface Sticker {
  id: string;
  imageUrl: string;
}

export default function ChildDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { animation, startAnimation } = useSlideInAnimation();
  
  const [promises, setPromises] = useState<Promise[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [stickerGoal, setStickerGoal] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    startAnimation();
    loadChildData();
  }, []);
  
  // 자녀 데이터 로드 (실제 API 연동 시 구현)
  const loadChildData = async () => {
    try {
      setIsLoading(true);
      
      // 실제 구현 시 API 호출 부분
      // const promisesResponse = await promiseApi.getChildActivePromises();
      // const stickersResponse = await stickerRewardApi.getChildStickers();
      // const settingsResponse = await settingsApi.getChildSettings();
      
      // setPromises(promisesResponse.promises);
      // setStickers(stickersResponse.stickers);
      // setStickerGoal(settingsResponse.stickerGoal);
      
      // 개발 중에는 빈 데이터 설정
      setPromises([]);
      setStickers([]);
      setStickerGoal(5);
      
      setIsLoading(false);
    } catch (error) {
      console.error('자녀 데이터 로드 중 오류:', error);
      setIsLoading(false);
      
      // 에러 처리를 더 구체적으로 할 수 있습니다
      // 예: 네트워크 오류, 인증 오류 등
    }
  };
  
  // 완료되지 않은 약속 수
  const pendingPromisesCount = promises.filter(p => !p.isCompleted).length;
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          {user?.username || '내'} 약속 관리
        </Text>
        
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-3 text-emerald-700">정보를 불러오는 중...</Text>
          </View>
        ) : (
          <>
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
              {promises.length > 0 ? (
                <Text className="text-emerald-800">
                  {pendingPromisesCount}개의 약속이 남았어요!
                </Text>
              ) : (
                <Text className="text-emerald-800">
                  아직 활성화된 약속이 없어요. 부모님께 약속을 만들어 달라고 해보세요!
                </Text>
              )}
            </Animated.View>
            
            <View className="flex-row items-center my-3">
              <FontAwesome name="list-ul" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text className="text-lg font-medium text-emerald-700">약속 목록</Text>
            </View>
            
            <ScrollView className="flex-1">
              {promises.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <FontAwesome name="calendar-o" size={50} color="#d1d5db" />
                  <Text className="text-gray-400 mt-4 text-center">
                    약속이 없습니다
                  </Text>
                  <Text className="text-gray-400 text-center">
                    부모님께 약속을 만들어 달라고 요청해보세요!
                  </Text>
                </View>
              ) : (
                promises.map((promise, index) => (
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
                            onPress={() => router.push({
                              pathname: '/(child)/verify',
                              params: { promiseId: promise.id }
                            })}
                          >
                            <Text className="text-white">인증하기</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))
              )}
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
                {stickers.length > 0 ? (
                  <>
                    {stickers.slice(0, 2).map((sticker, index) => (
                      <Image 
                        key={sticker.id}
                        source={require('../../assets/images/react-logo.png')}
                        style={{ width: 40, height: 40 }}
                        contentFit="contain"
                        className="mr-2"
                      />
                    ))}
                    {stickers.length > 2 && (
                      <View className="w-10 h-10 border-2 border-dashed border-emerald-300 rounded-full items-center justify-center">
                        <Text className="text-emerald-600">+{stickers.length - 2}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text className="text-gray-500">아직 모은 스티커가 없어요.</Text>
                )}
              </View>
              
              <Text className="mt-2 text-emerald-800">
                {stickers.length > 0 
                  ? `${stickerGoal}개 모으면 선물이 기다려요!` 
                  : '약속을 완료하고 스티커를 모아보세요!'}
              </Text>
              
              <Pressable
                className="bg-emerald-500 py-2 rounded-lg mt-3 shadow-sm"
                onPress={() => router.push('/(child)/rewards')}
              >
                <Text className="text-white text-center">스티커 더 보기</Text>
              </Pressable>
            </Animated.View>
            
            <Pressable
              className="bg-emerald-500 py-3 rounded-xl mb-4 shadow-sm"
              onPress={() => router.push('/(child)/promises')}
            >
              <Text className="text-white text-center">전체 약속 보기</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}