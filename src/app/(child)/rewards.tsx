import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Animated, ActivityIndicator, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import rewardApi, { ChildReward } from '../../api/modules/reward';
import stickerApi from '../../api/modules/sticker';

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

// 완료된 보상 타입 정의 (실제 API에 맞게 조정)
interface CompletedReward {
  id: string;
  title: string;
  date: string;
  image?: string;
}

export default function RewardsScreen() {
  const { animation, startAnimation } = useSlideInAnimation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rewards, setRewards] = useState<ChildReward[]>([]);
  const [history, setHistory] = useState<CompletedReward[]>([]);
  const [totalStickers, setTotalStickers] = useState(0);
  
  useEffect(() => {
    startAnimation();
    loadRewardData();
  }, []);
  
  // 보상 데이터 로드 함수
  const loadRewardData = async () => {
    try {
      setIsLoading(true);
      
      // 활성 보상과 통계 로딩
      const [rewardsResponse, stickerStatsResponse] = await Promise.all([
        rewardApi.getChildRewards(),
        stickerApi.getChildStickerStats()
      ]);
      
      setRewards(rewardsResponse);
      
      // 완료된 보상 목록 - API에 없는 경우 빈 배열로 처리
      setHistory([]);
      
      setTotalStickers(stickerStatsResponse.totalStickers);
      
      setIsLoading(false);
    } catch (error) {
      console.error('보상 데이터 로드 중 오류:', error);
      setIsLoading(false);
      Alert.alert('오류', '보상 정보를 불러오는 중 문제가 발생했습니다.');
    }
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadRewardData();
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
      loadRewardData();
    } catch (error) {
      console.error('보상 달성 오류:', error);
      Alert.alert('오류', '보상 달성 중 문제가 발생했습니다.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // 보상 달성 가능 여부 확인 및 요청 처리
  const confirmAchieveReward = (reward: ChildReward) => {
    if (reward.availableStickers >= reward.requiredStickers) {
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
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          내 스티커와 보상
        </Text>

        {isLoading ? (
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
              <View className="flex-row items-center mb-2">
                <FontAwesome name="star" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <Text className="text-lg font-medium text-emerald-700">내 스티커</Text>
              </View>
              
              {totalStickers > 0 ? (
                <View className="flex-row flex-wrap">
                  {Array(Math.min(totalStickers, 10))
                    .fill(0)
                    .map((_, i) => (
                      <View key={i} className="p-1">
                        <Image
                          source={require('../../assets/images/react-logo.png')}
                          style={{ width: 30, height: 30 }}
                          contentFit="contain"
                        />
                      </View>
                    ))}
                  {totalStickers > 10 && (
                    <View className="p-1 items-center justify-center">
                      <Text className="text-emerald-700">+{totalStickers - 10}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row flex-wrap">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <View key={i} className="p-1">
                        <View className="w-[30px] h-[30px] border-2 border-dashed border-emerald-300 rounded-full" />
                      </View>
                    ))}
                </View>
              )}
              
              <Text className="mt-2 text-emerald-800">
                {totalStickers > 0 
                  ? `${totalStickers}개의 스티커를 모았어요!` 
                  : '아직 모은 스티커가 없어요. 약속을 완료하고 스티커를 모아보세요!'}
              </Text>
            </Animated.View>

            <View className="flex-row items-center mb-2">
              <FontAwesome name="gift" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text className="text-lg font-medium text-emerald-700">진행 중인 보상</Text>
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
                const progress = (reward.availableStickers / reward.requiredStickers) * 100;

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
                      className="mb-4 p-4 rounded-xl border border-emerald-300 bg-white shadow-sm"
                      onPress={() => confirmAchieveReward(reward)}
                    >
                      <View className="flex-row">
                        <Image
                          source={getImageSource(reward?.stickers?.[0]?.imageUrl)}
                          style={{ width: 60, height: 60 }}
                          contentFit="contain"
                          className="mr-3 rounded-lg"
                        />
                        <View className="flex-1">
                          <Text className="text-lg font-medium text-emerald-800">{reward.title}</Text>
                          <Text className="text-gray-500 mb-2">
                            {reward.availableStickers}/{reward.requiredStickers} 스티커
                          </Text>
                          <View className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                            <View
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })
            )}

            {history.length > 0 && (
              <View className="mt-4">
                <View className="flex-row items-center my-2">
                  <FontAwesome name="check-circle" size={18} color="#10b981" style={{ marginRight: 8 }} />
                  <Text className="text-lg font-medium text-emerald-700">받은 보상</Text>
                </View>
                
                {history.map((reward) => (
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
                    <View
                      className="mb-3 p-4 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm"
                    >
                      <View className="flex-row items-center">
                        <Image
                          source={getImageSource(reward.image)}
                          style={{ width: 50, height: 50 }}
                          contentFit="contain"
                          className="mr-3 rounded-lg"
                        />
                        <View className="flex-1">
                          <Text className="text-lg text-emerald-800">{reward.title}</Text>
                          <Text className="text-gray-500">{formatDate(reward.date)}</Text>
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
            
            {rewards.length === 0 && history.length === 0 && (
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