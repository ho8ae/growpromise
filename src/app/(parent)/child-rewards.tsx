// src/app/(parent)/child-rewards.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API
import rewardApi from '../../api/modules/reward';
import stickerApi from '../../api/modules/sticker';
import userApi from '../../api/modules/user';

// 자녀 정보 인터페이스 추가
interface ChildInfo {
  id: string;
  username: string;
  profileImage: string | null;
  stickerCount: {
    total: number;
    available: number;
  };
}

export default function ChildRewardsScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // 자녀 데이터 및 부모-자녀 연결 정보 조회
  const {
    data: connectionData,
    isLoading: isConnectionLoading,
    error: connectionError,
  } = useQuery({
    queryKey: ['childConnection', childId],
    queryFn: async () => {
      try {
        // 부모의 연결된 자녀 목록 조회
        const connections = await userApi.getParentChildren();
        // childId와 일치하는 연결 정보 찾기
        const connection = connections.find((conn) => conn.childId === childId);

        if (!connection) {
          throw new Error('연결된 자녀 정보를 찾을 수 없습니다.');
        }

        return connection;
      } catch (error) {
        console.error('자녀 연결 정보 로드 실패:', error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!childId,
  });

  // 자녀 정보 및 스티커 데이터 조회
  const {
    data: childInfo,
    isLoading: isChildLoading,
    error: childError,
  } = useQuery({
    queryKey: ['childInfo', connectionData?.child?.userId],
    queryFn: async (): Promise<ChildInfo> => {
      try {
        // 여기서 child.userId를 사용하여 사용자 정보 조회
        const userId = connectionData?.child?.userId;

        if (!userId) {
          throw new Error('자녀 사용자 ID를 찾을 수 없습니다.');
        }

        const userInfo = await userApi.getUserById(userId);
        const stickerCountInfo = await stickerApi.getChildStickerCount(
          childId as string,
        );
        console.log(stickerCountInfo);

        return {
          id: userInfo.id,
          username: userInfo.username,
          profileImage: userInfo.profileImage || null,
          stickerCount: {
            total: stickerCountInfo.totalStickers,
            available: stickerCountInfo.availableStickers,
          },
        };
      } catch (error) {
        console.error('자녀 정보 로드 실패:', error);
        // 기본 정보 반환 (connection 정보에서 가져올 수 있는 데이터 활용)
        return {
          id: connectionData?.child?.userId || (childId as string),
          username: connectionData?.child?.user?.username || '자녀',
          profileImage: connectionData?.child?.user?.profileImage || null,
          stickerCount: { total: 0, available: 0 },
        };
      }
    },
    retry: 1,
    enabled: !!connectionData?.child?.userId,
  });

  const {
    data: stickers = [],
    isLoading: isStickersLoading,
    error: stickersError,
  } = useQuery({
    queryKey: ['childStickers', childId],
    queryFn: () => stickerApi.getChildStickersByParent(childId as string),
    retry: 1,
    enabled: !!childId,
  });

  const {
    data: rewards = [],
    isLoading: isRewardsLoading,
    error: rewardsError,
  } = useQuery({
    queryKey: ['parentRewards'],
    queryFn: rewardApi.getParentRewards,
    retry: 1,
  });

  // 에러 메시지 구성
  const errorMessage =
    connectionError || childError || stickersError || rewardsError
      ? '일부 정보를 불러오는데 문제가 발생했습니다.'
      : null;

  // 데이터 로딩 상태
  const isLoading =
    isConnectionLoading ||
    isChildLoading ||
    isStickersLoading ||
    isRewardsLoading;

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['childConnection', childId],
        }),
        queryClient.invalidateQueries({ queryKey: ['childInfo'] }),
        queryClient.invalidateQueries({ queryKey: ['childStickers', childId] }),
        queryClient.invalidateQueries({ queryKey: ['parentRewards'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // 보상 생성 화면으로 이동
  const navigateToCreateReward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/set-rewards');
  };

  // 보상 상세 화면으로 이동
  const navigateToRewardDetail = (rewardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(parent)/reward-detail',
      params: { id: rewardId },
    });
  };

  // 스티커 생성일 포맷
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}년 ${month}월 ${day}일`;
    } catch (e) {
      return '날짜 정보 없음';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-2">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => router.back()}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">
            자녀 스티커 및 보상
          </Text>
          <View style={{ width: 30 }} />
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-2 text-gray-600">정보를 불러오는 중...</Text>
          </View>
        )}

        {/* 데이터 표시 */}
        {!isLoading && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#10b981"
                colors={['#10b981']}
                title="새로고침 중..."
                titleColor="#10b981"
              />
            }
          >
            {/* 에러 메시지 */}
            {errorMessage && (
              <View className="bg-yellow-50 p-4 rounded-xl mb-4">
                <Text className="text-amber-700">{errorMessage}</Text>
                <Text className="text-amber-600 text-sm mt-1">
                  일부 정보만 표시됩니다. 새로고침을 시도해보세요.
                </Text>
              </View>
            )}

            {/* 자녀 기본 정보 */}
            <View className="mb-4 overflow-hidden rounded-xl">
              <LinearGradient
                colors={['#d1fae5', '#ecfdf5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-4 rounded-xl"
              >
                <View className="flex-row items-center">
                  <Image
                    source={
                      childInfo?.profileImage
                        ? { uri: childInfo.profileImage }
                        : require('../../assets/images/react-logo.png')
                    }
                    style={{ width: 60, height: 60 }}
                    contentFit="cover"
                    className="rounded-full bg-white border-2 border-emerald-200"
                    transition={200}
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-emerald-800">
                      {childInfo?.username || '자녀'}
                    </Text>

                    <View className="flex-row items-center mt-1">
                      <FontAwesome5
                        name="star"
                        size={14}
                        color="#f59e0b"
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-gray-600">
                        스티커 {childInfo?.stickerCount.total || 0}개 (사용
                        가능: {childInfo?.stickerCount.available || 0}개)
                      </Text>
                    </View>

                    <View className="mb-4 overflow-hidden rounded-xl">
                      <LinearGradient
                        colors={['#d1fae5', '#ecfdf5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-4 rounded-xl"
                      >
                        <View className="flex-row items-center justify-between">
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: '/(parent)/reward-history',
                                params: { childId },
                              })
                            }
                            className="bg-emerald-500 px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white font-medium text-sm">
                              보상 이력
                            </Text>
                          </Pressable>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* 스티커 섹션 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-emerald-800">
                  자녀의 스티커
                </Text>
              </View>

              {stickers.length === 0 ? (
                <View className="bg-gray-50 rounded-xl p-8 items-center justify-center">
                  <FontAwesome5 name="star" size={40} color="#d1d5db" />
                  <Text className="text-gray-500 mt-4 text-center">
                    아직 자녀가 받은 스티커가 없습니다
                  </Text>
                  <Text className="text-gray-500 text-center">
                    자녀의 약속 인증을 승인하여 스티커를 지급해보세요!
                  </Text>
                </View>
              ) : (
                <View className="bg-white border border-gray-200 rounded-xl p-4">
                  <View className="flex-row flex-wrap">
                    {stickers.map((sticker) => (
                      <View key={sticker.id} className="w-1/4 p-2">
                        <View className="items-center">
                          <Image
                            source={
                              sticker.imageUrl
                                ? { uri: sticker.imageUrl }
                                : require('../../assets/images/react-logo.png')
                            }
                            style={{ width: 60, height: 60 }}
                            contentFit="contain"
                            transition={200}
                          />
                          <Text
                            className="text-xs text-center text-gray-800 mt-1"
                            numberOfLines={1}
                          >
                            {sticker.title || '스티커'}
                          </Text>
                          <Text
                            className="text-xs text-gray-500 text-center"
                            numberOfLines={1}
                          >
                            {formatDate(sticker.createdAt)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* 보상 섹션 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-emerald-800">
                  부모가 설정한 보상
                </Text>
                <Pressable
                  onPress={navigateToCreateReward}
                  className="bg-emerald-500 px-3 py-1 rounded-lg"
                >
                  <Text className="text-white font-medium text-sm">
                    + 보상 추가
                  </Text>
                </Pressable>
              </View>

              {rewards.length === 0 ? (
                <View className="bg-gray-50 rounded-xl p-8 items-center justify-center">
                  <FontAwesome5 name="gift" size={40} color="#d1d5db" />
                  <Text className="text-gray-500 mt-4 text-center">
                    아직 설정된 보상이 없습니다
                  </Text>
                  <Text className="text-gray-500 text-center">
                    자녀를 위한 보상을 추가해보세요!
                  </Text>
                </View>
              ) : (
                <View>
                  {rewards.map((reward) => (
                    <Pressable
                      key={reward.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 mb-3 active:bg-gray-50"
                      onPress={() => navigateToRewardDetail(reward.id)}
                    >
                      <View className="flex-row items-center">
                        <View className="h-12 w-12 bg-emerald-100 rounded-full items-center justify-center mr-3">
                          <FontAwesome5 name="gift" size={24} color="#10b981" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-medium text-gray-800">
                            {reward.title}
                          </Text>
                          {reward.description && (
                            <Text className="text-gray-500" numberOfLines={2}>
                              {reward.description}
                            </Text>
                          )}
                          <Text className="text-emerald-700 mt-1">
                            스티커 {reward.requiredStickers}개 필요
                          </Text>
                        </View>
                        <View
                          className={`py-1 px-2 rounded-full ${
                            reward.isActive ? 'bg-emerald-100' : 'bg-gray-200'
                          }`}
                        >
                          <Text
                            className={`text-xs ${
                              reward.isActive
                                ? 'text-emerald-800'
                                : 'text-gray-600'
                            }`}
                          >
                            {reward.isActive ? '활성' : '비활성'}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
