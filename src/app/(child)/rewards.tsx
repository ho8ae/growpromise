// src/app/(child)/rewards.tsx - 모달 사용 버전
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, Text, View, Animated, ActivityIndicator, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter, Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import rewardApi, { ChildReward, RewardHistoryItem } from '../../api/modules/reward';
import stickerApi, { Sticker, StickerStats } from '../../api/modules/sticker';
import Colors from '../../constants/Colors';
import RewardAchievementModal from '../../components/common/RewardAchievementModal';

export default function RewardsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 보상 달성 모달 상태
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [achievedRewardData, setAchievedRewardData] = useState<{
    title: string;
    stickerCount: number;
  } | null>(null);
  
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // 보상 달성 요청 - 모달 사용
  const handleAchieveReward = async (rewardId: string, rewardTitle: string, requiredStickers: number) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await rewardApi.achieveReward(rewardId);
      
      // 보상 달성 모달 표시
      setAchievedRewardData({
        title: rewardTitle,
        stickerCount: requiredStickers,
      });
      setRewardModalVisible(true);
      
      // 데이터 새로고침
      await handleRefresh();
    } catch (error) {
      console.error('보상 달성 오류:', error);
      Alert.alert('오류', '보상 달성 중 문제가 발생했습니다.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // 보상 달성 가능 여부 확인 및 요청 처리
  const confirmAchieveReward = (reward: ChildReward) => {
    if (stickerStats && stickerStats.availableStickers >= reward.requiredStickers) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        '보상 달성',
        `정말로 "${reward.title}" 보상을 달성하시겠습니까? ${reward.requiredStickers}개의 스티커가 사용됩니다.`,
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '달성하기', 
            onPress: () => handleAchieveReward(reward.id, reward.title, reward.requiredStickers)
          }
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
    
    return `${year}. ${month}. ${day}`;
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
  
  // 홈으로 이동 버튼
  const navigateToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };
  
  return (
    <>
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
              내 스티커와 보상
            </Text>
            
            <Pressable 
              onPress={navigateToHistory}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-50"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="history" size={20} color={Colors.light.text} />
            </Pressable>
          </View>

          {/* 로딩 상태 */}
          {isLoading && !isRefreshing ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text className="mt-3" style={{ color: Colors.light.textSecondary }}>
                보상 정보를 불러오는 중...
              </Text>
            </View>
          ) : (
            <ScrollView 
              className="flex-1"
              contentContainerStyle={{ 
                flexGrow: 1
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.light.primary}
                  colors={[Colors.light.primary]}
                />
              }
            >
              <View className="px-5 pt-4 flex-1 flex flex-col justify-between">
                <View className="flex-1">
                  {/* 스티커 현황 카드 */}
                  <Animated.View 
                    className="mb-6"
                    style={{
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <View 
                      className="rounded-2xl p-5 border-green-100 overflow-hidden"
                      style={{ backgroundColor: 'rgba(88, 204, 2, 0.08)', borderWidth: 1 }}
                    >
                      <View className="flex-row justify-between items-start mb-4">
                        <View>
                          <View className="flex-row items-center">
                            <MaterialIcons name="star" size={20} color={Colors.light.secondary} style={{ marginRight: 6 }} />
                            <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                              내 스티커
                            </Text>
                          </View>
                          <Text style={{ color: Colors.light.textSecondary }}>
                            전체 {stickerStats?.totalStickers || 0}개 보유
                          </Text>
                        </View>
                        
                        <View 
                          className="px-3 py-1 rounded-lg"
                          style={{ backgroundColor: 'rgba(255, 200, 0, 0.15)' }}
                        >
                          <Text 
                            className="font-medium"
                            style={{ color: Colors.light.secondary }}
                          >
                            {stickerStats?.availableStickers || 0}개 사용 가능
                          </Text>
                        </View>
                      </View>
                      
                      {availableStickers.length > 0 ? (
                        <View className="flex-row flex-wrap">
                          {availableStickers.slice(0, Math.min(availableStickers.length, 9)).map((sticker, index) => (
                            <View 
                              key={sticker.id} 
                              style={{ 
                                width: '33.333%', 
                                padding: 4
                              }}
                            >
                              <View 
                                className="aspect-square rounded-lg items-center justify-center bg-white border border-gray-100"
                              >
                                <Image
                                  source={getImageSource(sticker.imageUrl)}
                                  style={{ width: '70%', height: '70%' }}
                                  contentFit="contain"
                                />
                              </View>
                            </View>
                          ))}
                          {availableStickers.length > 9 && (
                            <View 
                              style={{ width: '33.333%', padding: 4 }}
                            >
                              <View 
                                className="aspect-square rounded-lg items-center justify-center"
                                style={{ backgroundColor: 'rgba(255, 200, 0, 0.15)' }}
                              >
                                <Text 
                                  className="font-bold"
                                  style={{ color: Colors.light.secondary }}
                                >
                                  +{availableStickers.length - 9}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View className="flex-row flex-wrap">
                          {Array(6)
                            .fill(0)
                            .map((_, i) => (
                              <View key={i} style={{ width: '33.333%', padding: 4 }}>
                                <View className="aspect-square border-2 border-dashed rounded-lg items-center justify-center"
                                  style={{ borderColor: 'rgba(88, 204, 2, 0.3)' }}
                                >
                                  <MaterialIcons name="help-outline" size={20} color={Colors.light.primary} />
                                </View>
                              </View>
                            ))}
                        </View>
                      )}
                      
                      {availableStickers.length === 0 && (
                        <Text 
                          className="mt-3 text-center text-sm"
                          style={{ color: Colors.light.textSecondary }}
                        >
                          아직 모은 스티커가 없어요. 약속을 완료하고 스티커를 모아보세요!
                        </Text>
                      )}
                    </View>
                  </Animated.View>

                  {/* 진행 중인 보상 섹션 */}
                  <Animated.View 
                    className="mb-3"
                    style={{
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <View className="flex-row items-center">
                      <MaterialIcons name="card-giftcard" size={20} color={Colors.light.text} style={{ marginRight: 6 }} />
                      <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                        진행 중인 보상
                      </Text>
                    </View>
                  </Animated.View>
                  
                  {rewards.length === 0 ? (
                    <Animated.View 
                      className="mb-6"
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      }}
                    >
                      <View className="items-center justify-center py-8 px-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.05)' }}
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
                          진행 중인 보상이 없어요
                        </Text>
                        <Text 
                          className="text-center"
                          style={{ color: Colors.light.textSecondary }}
                        >
                          부모님께 스티커를 모으면 받을 수 있는 보상을 
                          {"\n"}만들어 달라고 요청해보세요!
                        </Text>
                      </View>
                    </Animated.View>
                  ) : (
                    <Animated.View 
                      className="mb-6"
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      }}
                    >
                      {rewards.map((reward, index) => {
                        // 보상 진행률 계산 (최대 100%)
                        const progress = Math.min(
                          ((stickerStats?.availableStickers || 0) / reward.requiredStickers) * 100, 
                          100
                        );
                        
                        // 달성 가능 여부
                        const canAchieve = (stickerStats?.availableStickers || 0) >= reward.requiredStickers;
                        
                        // 임의로 아이콘 선택 (실제로는 보상 타입에 따라 달라질 수 있음)
                        const icons = ['card-giftcard', 'toys', 'sports-esports', 'movie', 'fastfood', 'shopping-bag'];
                        const icon = icons[index % icons.length];

                        return (
                          <Pressable 
                            key={reward.id}
                            className={`mb-3 rounded-xl border overflow-hidden active:opacity-90 ${
                              canAchieve 
                                ? 'border-green-300' 
                                : 'border-gray-200'
                            }`}
                            onPress={() => confirmAchieveReward(reward)}
                          >
                            <View className="p-4">
                              <View className="flex-row mb-2">
                                <View 
                                  className={`mr-3 w-12 h-12 rounded-full items-center justify-center ${
                                    canAchieve 
                                      ? 'bg-green-100' 
                                      : 'bg-gray-100'
                                  }`}
                                >
                                  <MaterialIcons 
                                    name={icon as any} 
                                    size={24} 
                                    color={canAchieve ? Colors.light.primary : Colors.light.textSecondary} 
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text 
                                    className="text-base font-bold"
                                    style={{ color: Colors.light.text }}
                                  >
                                    {reward.title}
                                  </Text>
                                  
                                  <View className="flex-row items-center justify-between">
                                    <Text 
                                      className="text-sm"
                                      style={{ color: Colors.light.textSecondary }}
                                    >
                                      {stickerStats?.availableStickers || 0}/{reward.requiredStickers} 스티커
                                    </Text>
                                    {canAchieve && (
                                      <View 
                                        className="px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                                      >
                                        <Text 
                                          className="text-xs font-medium"
                                          style={{ color: Colors.light.primary }}
                                        >
                                          달성 가능 ✨
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              </View>
                              
                              {/* 진행 바 */}
                              <View className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1 mb-2">
                                <View
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${progress}%`,
                                    backgroundColor: canAchieve ? Colors.light.primary : 'rgba(88, 204, 2, 0.4)',
                                  }}
                                />
                              </View>
                              
                              {reward.description && (
                                <Text 
                                  className="text-sm"
                                  style={{ color: Colors.light.textSecondary }}
                                >
                                  {reward.description}
                                </Text>
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </Animated.View>
                  )}

                  {/* 최근 달성한 보상 섹션 */}
                  {rewardHistory.length > 0 && (
                    <Animated.View 
                      className="mb-6"
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      }}
                    >
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center">
                          <MaterialIcons name="check-circle" size={20} color={Colors.light.text} style={{ marginRight: 6 }} />
                          <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                            받은 보상
                          </Text>
                        </View>
                      </View>
                      
                      {/* 최근 3개만 표시 */}
                      {rewardHistory.slice(0, 3).map((historyItem) => (
                        <View
                          key={historyItem.id}
                          className="mb-3 p-4 rounded-xl border overflow-hidden"
                          style={{ borderColor: 'rgba(88, 204, 2, 0.3)', backgroundColor: 'rgba(88, 204, 2, 0.05)' }}
                        >
                          <View className="flex-row items-center">
                            <View 
                              className="h-12 w-12 rounded-full items-center justify-center mr-3"
                              style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                            >
                              <MaterialIcons name="emoji-events" size={24} color={Colors.light.primary} />
                            </View>
                            <View className="flex-1">
                              <Text 
                                className="text-base font-bold"
                                style={{ color: Colors.light.text }}
                              >
                                {historyItem.reward?.title || '보상'}
                              </Text>
                              {/* <Text style={{ color: Colors.light.textSecondary }}>
                                {formatDate(historyItem.achievedAt)}
                              </Text> */}
                            </View>
                            <View 
                              className="h-8 w-8 rounded-full items-center justify-center"
                              style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                            >
                              <MaterialIcons name="check" size={18} color={Colors.light.primary} />
                            </View>
                          </View>
                        </View>
                      ))}
                    </Animated.View>
                  )}
                  
                  {rewards.length === 0 && rewardHistory.length === 0 && (
                    <Animated.View 
                      className="items-center justify-center py-6"
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      }}
                    >
                      <Text 
                        className="text-center text-sm"
                        style={{ color: Colors.light.textSecondary }}
                      >
                        약속을 완료하여 스티커를 모으면 부모님께서 설정한 보상을 받을 수 있어요!
                      </Text>
                    </Animated.View>
                  )}
                </View>
                
                {/* 하단 버튼 */}
                <View className="mb-4">
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <Pressable
                      className="py-3.5 rounded-xl active:opacity-90"
                      style={{ backgroundColor: Colors.light.primary }}
                      onPress={navigateToHome}
                    >
                      <Text className="text-white text-center font-bold">
                        홈으로 가기
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      {/* 보상 달성 모달 */}
      <RewardAchievementModal
        visible={rewardModalVisible}
        onClose={() => {
          setRewardModalVisible(false);
          setAchievedRewardData(null);
        }}
        rewardTitle={achievedRewardData?.title || ''}
        stickerCount={achievedRewardData?.stickerCount || 0}
      />
    </>
  );
}