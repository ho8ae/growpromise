// src/app/(parent)/reward-history.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import rewardApi, { RewardHistoryItem } from '../../api/modules/reward';

export default function ParentRewardHistoryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  // 보상 이력 데이터 로드
  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['parentRewardHistory'],
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
    
    return `${year}년 ${month}월 ${day}일`;
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
            보상 이력
          </Text>
          <View style={{ width: 30 }} />
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-2 text-gray-600">보상 이력을 불러오는 중...</Text>
          </View>
        )}

        {/* 에러 상태 */}
        {error && (
          <View className="items-center py-6 bg-red-50 rounded-xl my-4">
            <FontAwesome5 name="exclamation-circle" size={24} color="#ef4444" />
            <Text className="text-red-500 mt-2">
              보상 이력을 불러오는 중 오류가 발생했습니다.
            </Text>
          </View>
        )}

        {/* 데이터 없음 */}
        {!isLoading && !error && (!history || history.length === 0) && (
          <View className="flex-1 justify-center items-center p-4">
            <FontAwesome5 name="gift" size={50} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center text-lg">
              아직 달성된 보상이 없습니다.
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              자녀가 보상을 달성하면 여기에 표시됩니다.
            </Text>
          </View>
        )}

        {/* 보상 이력 목록 */}
        {!isLoading && !error && history && history.length > 0 && (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-4 p-4 rounded-xl border border-purple-200 bg-white">
                <View className="flex-row items-center">
                  <View className="h-12 w-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <FontAwesome5 name="gift" size={24} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-gray-800">
                      {item.reward?.title || '보상'}
                    </Text>
                    <Text className="text-gray-500">
                      달성일: {formatDate(item.achievedAt)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-600 mr-2">
                        사용한 스티커: {item.stickerCount}개
                      </Text>
                      {item.child && (
                        <Text className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-xs">
                          {item.child.user.username}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                {item.reward?.description && (
                  <Text className="text-gray-600 mt-2">
                    {item.reward.description}
                  </Text>
                )}
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#10b981"
                colors={["#10b981"]}
              />
            }
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}