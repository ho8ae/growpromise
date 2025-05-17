// src/app/(child)/reward-history.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import rewardApi, { RewardHistoryItem } from '../../api/modules/reward';
import Colors from '../../constants/Colors';
import * as Haptics from 'expo-haptics';

export default function RewardHistoryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 보상 이력 데이터 로드
  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['rewardHistory'],
    queryFn: rewardApi.getRewardHistory,
  });

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}. ${month}. ${day}`;
  };
  
  // 아이콘 선택 (카운트로 순환)
  const getIcon = (index: number) => {
    const icons = ['emoji-events', 'card-giftcard', 'stars', 'cake', 'sports-esports', 'movie', 'shopping-bag', 'directions-bike', 'sentiment-very-satisfied'];
    return icons[index % icons.length];
  };
  
  // 홈으로 이동
  const navigateToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1">
        {/* 커스텀 헤더 */}
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
          <Pressable 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-50"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.light.text} />
          </Pressable>
          
          <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
            내가 받은 보상
          </Text>
          
          <View className="w-10 h-10" />
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text className="mt-3" style={{ color: Colors.light.textSecondary }}>
              보상 이력을 불러오는 중...
            </Text>
          </View>
        )}

        {/* 에러 상태 */}
        {error && (
          <View className="flex-1 justify-center items-center px-5">
            <View 
              className="w-16 h-16 rounded-full mb-4 items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 75, 75, 0.1)' }}
            >
              <MaterialIcons name="error-outline" size={32} color={Colors.light.error} />
            </View>
            <Text 
              className="text-lg font-bold text-center mb-2"
              style={{ color: Colors.light.text }}
            >
              불러오기 실패
            </Text>
            <Text 
              className="text-center mb-6"
              style={{ color: Colors.light.textSecondary }}
            >
              보상 이력을 불러오는 중 오류가 발생했습니다.
            </Text>
            <Pressable
              className="py-3 px-6 rounded-xl active:opacity-90"
              style={{ backgroundColor: Colors.light.primary }}
              onPress={() => refetch()}
            >
              <Text className="text-white font-bold">다시 시도</Text>
            </Pressable>
          </View>
        )}

        {/* 데이터 없음 */}
        {!isLoading && !error && (!history || history.length === 0) && (
          <View className="flex-1 px-5">
            <Animated.View 
              className="flex-1 justify-center items-center px-4"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View 
                className="w-16 h-16 rounded-full mb-4 items-center justify-center"
                style={{ backgroundColor: 'rgba(88, 204, 2, 0.1)' }}
              >
                <MaterialIcons name="card-giftcard" size={32} color={Colors.light.primary} />
              </View>
              <Text 
                className="text-lg font-bold text-center mb-2"
                style={{ color: Colors.light.text }}
              >
                아직 달성한 보상이 없어요
              </Text>
              <Text 
                className="text-center mb-8"
                style={{ color: Colors.light.textSecondary }}
              >
                스티커를 모아서 멋진 보상을 받아보세요!
              </Text>
              
              <Pressable
                className="py-3 px-6 rounded-xl active:opacity-90"
                style={{ backgroundColor: Colors.light.primary }}
                onPress={navigateToHome}
              >
                <Text className="text-white font-bold">홈으로 가기</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {/* 보상 이력 목록 */}
        {!isLoading && !error && history && history.length > 0 && (
          <View className="flex-1 px-5 pt-4">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text 
                className="text-base font-medium mb-3"
                style={{ color: Colors.light.textSecondary }}
              >
                총 {history.length}개의 보상을 달성했어요!
              </Text>
            </Animated.View>
            
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ 
                      translateY: Animated.multiply(
                        slideAnim, 
                        new Animated.Value(1 + index * 0.2)
                      ),
                    }],
                  }}
                >
                  <View 
                    className="mb-3 p-4 rounded-xl border overflow-hidden"
                    style={{ 
                      borderColor: 'rgba(88, 204, 2, 0.3)', 
                      backgroundColor: 'rgba(88, 204, 2, 0.05)' 
                    }}
                  >
                    <View className="flex-row items-center">
                      <View 
                        className="h-12 w-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                      >
                        <MaterialIcons 
                          name={getIcon(index) as any} 
                          size={24} 
                          color={Colors.light.primary} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text 
                          className="text-base font-bold"
                          style={{ color: Colors.light.text }}
                        >
                          {item.reward?.title || '보상'}
                        </Text>
                        <View className="flex-row justify-between">
                          <Text style={{ color: Colors.light.textSecondary }}>
                            {formatDate(item.achievedAt)}
                          </Text>
                          <View 
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(255, 200, 0, 0.15)' }}
                          >
                            <Text 
                              className="text-xs font-medium"
                              style={{ color: Colors.light.secondary }}
                            >
                              {item.stickerCount}개 사용
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View 
                        className="h-8 w-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                      >
                        <MaterialIcons name="check" size={18} color={Colors.light.primary} />
                      </View>
                    </View>
                    
                    {item.reward?.description && (
                      <Text 
                        className="text-sm mt-2 ml-15"
                        style={{ color: Colors.light.textSecondary, marginLeft: 60 }}
                      >
                        {item.reward.description}
                      </Text>
                    )}
                  </View>
                </Animated.View>
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.light.primary}
                  colors={[Colors.light.primary]}
                />
              }
              contentContainerStyle={{ 
                paddingBottom: 30,
                flexGrow: history.length < 5 ? 1 : undefined,
              }}
              ListFooterComponent={() => (
                <View className="mt-4 mb-4">
                  <Pressable
                    className="py-3.5 rounded-xl active:opacity-90"
                    style={{ backgroundColor: Colors.light.primary }}
                    onPress={navigateToHome}
                  >
                    <Text className="text-white text-center font-bold">
                      홈으로 가기
                    </Text>
                  </Pressable>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}