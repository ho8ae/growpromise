// src/app/(child)/rewards.tsx
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Animated, ActivityIndicator, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import rewardApi, { ChildReward, RewardHistoryItem } from '../../api/modules/reward';
import stickerApi, { Sticker, StickerStats } from '../../api/modules/sticker';

// 슬라이드인 애니메이션 훅
const useSlideInAnimation = (initialValue = 100, duration = 500) => {
  const animation = React.useRef(new Animated.Value(initialValue)).current;

  const startAnimation = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startAnimation();
    return () => {
      animation.stopAnimation();
    };
  }, []);

  return { animation, startAnimation };
};

export default function RewardsScreen() {
  const { animation, startAnimation } = useSlideInAnimation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 데이터 쿼리
  const { data: rewards = [], isLoading: isRewardsLoading } = useQuery({
    queryKey: ['childRewards'],
    queryFn: rewardApi.getChildRewards,
  });
  
  const { data: stickers = [], isLoading: isStickersLoading } = useQuery({
    queryKey: ['childStickers'],
    queryFn: stickerApi.getChildStickers,
  });
  
  const { data: stickerStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['childStickerStats'],
    queryFn: stickerApi.getChildStickerStats,
    placeholderData: { totalStickers: 0, availableStickers: 0 },
  });
  
  const { data: rewardHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['rewardHistory'],
    queryFn: rewardApi.getRewardHistory,
  });
  
  // 전체 로딩 상태
  const isLoading = isRewardsLoading || isStickersLoading || isStatsLoading || isHistoryLoading;
  
  // 보상 이력 화면으로 이동
  const navigateToHistory = () => {
    router.push('/(child)/reward-history');
  };
  
  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['childRewards'] }),
        queryClient.invalidateQueries({ queryKey: ['childStickers'] }),
        queryClient.invalidateQueries({ queryKey: ['childStickerStats'] }),
        queryClient.invalidateQueries({ queryKey: ['rewardHistory'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 보상 달성 요청
  const handleAchieveReward = async (rewardId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await rewardApi.achieveReward(rewardId);
      
      // 성공 알림 및 데이터 새로고침
      Alert.alert('성공', '보상이 달성되었습니다! 축하합니다!');
      await handleRefresh();  // 데이터 다시 불러오기
    } catch (error) {
      console.error('보상 달성 오류:', error);
      Alert.alert('오류', '보상 달성 중 문제가 발생했습니다.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // 보상 달성 가능 여부 확인 및 요청 처리
  const confirmAchieveReward = (reward: ChildReward) => {
    if (stickerStats && stickerStats.availableStickers >= reward.requiredStickers) {
      Alert.alert(
        '보상 달성',
        `정말로 "${reward.title}" 보상을 달성하시겠습니까? ${reward.requiredStickers}개의 스티커가 사용됩니다.`,
        [
          { text: '취소', style: 'cancel' },
          { text: '달성하기', onPress: () => handleAchieveReward(reward.id) }
        ]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', `이 보상을 달성하기 위해서는 ${reward.requiredStickers}개의 스티커가 필요합니다.`);
    }
  };
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
  };

  // 이미지 소스 처리
  const getImageSource = (imageUrl?: string) => {
    if (imageUrl) {
      return { uri: imageUrl };
    }
    return require('../../assets/images/react-logo.png');
  };
  
  // 사용 가능한 스티커 (보상에 사용되지 않은 스티커)
  const availableStickers = stickers.filter(sticker => !sticker.rewardId);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          내 스티커와 보상
        </Text>

        {isLoading && !isRefreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-3 text-emerald-700">보상 정보를 불러오는 중...</Text>
          </View>
        ) : (
          <ScrollView 
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#10b981"
                colors={["#10b981"]}
              />
            }
          >
            {/* 스티커 현황 카드 */}
            <Animated.View 
              className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200 shadow-sm"
              style={{
                opacity: animation.interpolate({
                  inputRange: [0, 100],
                  outputRange: [1, 0]
                }),
                transform: [{ translateY: animation }]
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <FontAwesome name="star" size={18} color="#10b981" style={{ marginRight: 8 }} />
                  <Text className="text-lg font-medium text-emerald-700">내 스티커</Text>
                </View>
                <Text className="text-emerald-700 font-semibold">
                  총 {stickerStats?.totalStickers || 0}개 (사용가능: {stickerStats?.availableStickers || 0}개)
                </Text>
              </View>
              
              {availableStickers.length > 0 ? (
                <View className="flex-row flex-wrap">
                  {availableStickers.slice(0, Math.min(availableStickers.length, 10)).map((sticker) => (
                    <View key={sticker.id} className="p-1">
                      <Image
                        source={sticker.imageUrl ? 
                          { uri: sticker.imageUrl } : 
                          require('../../assets/images/react-logo.png')
                        }
                        style={{ width: 40, height: 40 }}
                        contentFit="contain"
                      />
                    </View>
                  ))}
                  {availableStickers.length > 10 && (
                    <View className="p-1 items-center justify-center">
                      <Text className="text-emerald-700">+{availableStickers.length - 10}개 더</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row flex-wrap">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <View key={i} className="p-1">
                        <View className="w-[40px] h-[40px] border-2 border-dashed border-emerald-300 rounded-full items-center justify-center">
                          <FontAwesome5 name="question" size={14} color="#10b981" />
                        </View>
                      </View>
                    ))}
                </View>
              )}
              
              <Text className="mt-2 text-emerald-800">
                {availableStickers.length > 0 
                  ? `${availableStickers.length}개의 스티커를 모았어요!` 
                  : '아직 모은 스티커가 없어요. 약속을 완료하고 스티커를 모아보세요!'}
              </Text>
            </Animated.View>

            {/* 진행 중인 보상 섹션 */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <FontAwesome name="gift" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <Text className="text-lg font-medium text-emerald-700">진행 중인 보상</Text>
              </View>
              
              {/* 보상 이력 버튼 */}
              {rewardHistory.length > 0 && (
                <Pressable 
                  className="flex-row items-center bg-emerald-100 rounded-full px-3 py-1"
                  onPress={navigateToHistory}
                >
                  <FontAwesome5 name="history" size={12} color="#059669" style={{ marginRight: 4 }} />
                  <Text className="text-emerald-700 text-xs font-medium">받은 보상</Text>
                </Pressable>
              )}
            </View>
            
            {rewards.length === 0 ? (
              <View className="items-center justify-center p-8 bg-gray-50 rounded-xl mb-4">
                <FontAwesome name="gift" size={40} color="#d1d5db" />
                <Text className="text-gray-400 mt-4 text-center">
                  진행 중인 보상이 없습니다
                </Text>
                <Text className="text-gray-400 text-center">
                  부모님께 스티커를 모으면 받을 수 있는 보상을 만들어 달라고 요청해보세요!
                </Text>
              </View>
            ) : (
              rewards.map((reward) => {
                // 보상 진행률 계산 (최대 100%)
                const progress = Math.min(
                  ((stickerStats?.availableStickers || 0) / reward.requiredStickers) * 100, 
                  100
                );
                
                // 달성 가능 여부
                const canAchieve = (stickerStats?.availableStickers || 0) >= reward.requiredStickers;

                return (
                  <Animated.View
                    key={reward.id}
                    style={{
                      opacity: animation.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0]
                      }),
                      transform: [{ translateY: animation }]
                    }}
                  >
                    <Pressable 
                        className={`mb-4 p-4 rounded-xl border ${
                          canAchieve 
                            ? 'border-emerald-400 bg-emerald-50' 
                            : 'border-gray-300 bg-white'
                        } shadow-sm`}
                        onPress={() => confirmAchieveReward(reward)}
                      >
                        <View className="flex-row">
                          <View className="mr-3 bg-white rounded-lg p-2 border border-emerald-100">
                            <FontAwesome name="gift" size={34} color="#10b981" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-medium text-emerald-800">{reward.title}</Text>
                            <Text className="text-gray-500 mb-1">
                              {stickerStats?.availableStickers || 0}/{reward.requiredStickers} 스티커
                            </Text>
                            <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <View
                                className={`h-full ${
                                  canAchieve ? 'bg-emerald-500' : 'bg-emerald-300'
                                } rounded-full`}
                                style={{ width: `${progress}%` }}
                              />
                            </View>
                            
                            {canAchieve && (
                              <Text className="text-emerald-600 text-xs mt-1 font-medium">
                                달성 가능! 터치하여 보상 받기
                              </Text>
                            )}
                          </View>
                        </View>
                        
                        {reward.description && (
                          <Text className="text-gray-600 mt-2 text-sm">
                            {reward.description}
                          </Text>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })
              )}

              {/* 최근 달성한 보상 섹션 (미리보기) */}
              {rewardHistory.length > 0 && (
                <View className="mt-4 mb-6">
                  <View className="flex-row items-center justify-between my-2">
                    <View className="flex-row items-center">
                      <FontAwesome name="check-circle" size={18} color="#10b981" style={{ marginRight: 8 }} />
                      <Text className="text-lg font-medium text-emerald-700">최근 받은 보상</Text>
                    </View>
                    <Pressable 
                      className="flex-row items-center"
                      onPress={navigateToHistory}
                    >
                      <Text className="text-emerald-600 text-sm mr-1">더보기</Text>
                      <FontAwesome5 name="chevron-right" size={12} color="#059669" />
                    </Pressable>
                  </View>
                  
                  {/* 최근 3개만 표시 */}
                  {rewardHistory.slice(0, 3).map((historyItem) => (
                    <Animated.View
                      key={historyItem.id}
                      style={{
                        opacity: animation.interpolate({
                          inputRange: [0, 100],
                          outputRange: [1, 0]
                        }),
                        transform: [{ translateY: animation }]
                      }}
                    >
                      <View
                        className="mb-3 p-4 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm"
                      >
                        <View className="flex-row items-center">
                          <View className="h-12 w-12 bg-emerald-100 rounded-full items-center justify-center mr-3">
                            <FontAwesome5 name="gift" size={24} color="#10b981" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg text-emerald-800">{historyItem.reward?.title || '보상'}</Text>
                            <Text className="text-gray-500">{formatDate(historyItem.achievedAt)}</Text>
                          </View>
                          <View className="bg-emerald-500 p-2 rounded-full">
                            <FontAwesome name="check" size={14} color="#ffffff" />
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              )}
              
              {rewards.length === 0 && rewardHistory.length === 0 && (
                <View className="items-center justify-center mt-4 p-8">
                  <Text className="text-gray-400 text-center">
                    약속을 완료하여 스티커를 모으면 부모님께서 설정한 보상을 받을 수 있어요!
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
}