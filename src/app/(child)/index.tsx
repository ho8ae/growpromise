import { FontAwesome } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import { useNetwork } from '../../hooks/useNetwork';
import { useAuthStore } from '../../stores/authStore';
import { useSlideInAnimation } from '../../utils/animations';
import { NotificationHelper } from '../../utils/notificationHelper';
import { OfflineStorage } from '../../utils/offlineStorage';
import { PromiseStatus } from '../../api/modules/promise';

export default function ChildDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { animation, startAnimation } = useSlideInAnimation();
  const { isConnected } = useNetwork();
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // 알림 권한 설정
  useEffect(() => {
    NotificationHelper.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    startAnimation();

    // 오프라인 상태 확인 및 처리
    if (!isConnected) {
      setIsOfflineMode(true);
      Alert.alert(
        '오프라인 모드',
        '인터넷 연결이 없어 제한된 기능으로 작동합니다. 데이터가 마지막으로 동기화된 상태로 표시됩니다.',
        [{ text: '확인' }],
      );
    } else {
      setIsOfflineMode(false);
      // 온라인 상태로 돌아왔을 때 오프라인 작업 처리
      processOfflineQueue();
    }
  }, [isConnected]);

  // 오프라인 작업 처리 함수
  const processOfflineQueue = async () => {
    await OfflineStorage.processQueue(async (action, payload) => {
      // 오프라인 작업 타입별 처리
      switch (action) {
        case 'verify_promise':
          try {
            const { assignmentId, image, message } = payload;
            await api.promise.submitVerification(assignmentId, image, message);
          } catch (error) {
            console.error('약속 인증 동기화 실패:', error);
          }
          break;
      }
    });

    // 큐 처리 후 데이터 새로고침
    refetchAll();
  };

  // 자녀의 대기 중인 약속 목록 조회
  const {
    data: pendingPromises,
    isLoading: isPromisesLoading,
    error: promisesError,
    refetch: refetchPromises,
  } = useQuery({
    queryKey: ['childPendingPromises'],
    queryFn: async () => {
      try {
        if (isConnected) {
          // 온라인 모드: API 호출
          const promises = await api.promise.getChildPromises(PromiseStatus.PENDING);
          // 오프라인 모드를 위해 캐시
          await OfflineStorage.saveData('child_pending_promises', promises);
          return promises || [];
        } else {
          // 오프라인 모드: 캐시된 데이터 사용
          const cachedPromises = await OfflineStorage.getData<any[]>(
            'child_pending_promises',
          );
          return cachedPromises || [];
        }
      } catch (error) {
        console.error('약속 데이터 로드 실패:', error);
        // 오류 발생시 오프라인 캐시 시도
        const cachedPromises = await OfflineStorage.getData<any[]>(
          'child_pending_promises',
        );
        if (cachedPromises) {
          return cachedPromises;
        }
        throw error;
      }
    },
    enabled: true, // 항상 사용 (온라인/오프라인 모두)
    retry: isConnected ? 3 : 0, // 온라인 모드일 때만 재시도
  });

  // 자녀의 스티커 목록 조회
  const {
    data: stickers,
    isLoading: isStickersLoading,
    error: stickersError,
    refetch: refetchStickers,
  } = useQuery({
    queryKey: ['childStickers'],
    queryFn: async () => {
      try {
        if (isConnected) {
          // 온라인 모드: API 호출
          const stickers = await api.sticker.getChildStickers();
          // 오프라인 모드를 위해 캐시
          await OfflineStorage.saveData('child_stickers', stickers);
          return stickers || [];
        } else {
          // 오프라인 모드: 캐시된 데이터 사용
          const cachedStickers = await OfflineStorage.getData<any[]>(
            'child_stickers',
          );
          return cachedStickers || [];
        }
      } catch (error) {
        console.error('스티커 데이터 로드 실패:', error);
        // 오류 발생시 오프라인 캐시 시도
        const cachedStickers = await OfflineStorage.getData<any[]>(
          'child_stickers',
        );
        if (cachedStickers) {
          return cachedStickers;
        }
        throw error;
      }
    },
    enabled: true,
    retry: isConnected ? 3 : 0,
  });

  // 약속 통계 조회
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['childStats'],
    queryFn: async () => {
      try {
        if (isConnected) {
          // 온라인 모드: API 호출
          const stats = await api.promise.getChildPromiseStats();
          // 오프라인 모드를 위해 캐시
          await OfflineStorage.saveData('child_stats', stats);
          return (
            stats || {
              totalPromises: 0,
              completedPromises: 0,
              pendingPromises: 0,
              characterStage: 1,
              stickerCount: 0,
            }
          );
        } else {
          // 오프라인 모드: 캐시된 데이터 사용
          const cachedStats = await OfflineStorage.getData('child_stats');
          return (
            cachedStats || {
              totalPromises: 0,
              completedPromises: 0,
              pendingPromises: 0,
              characterStage: 1,
              stickerCount: 0,
            }
          );
        }
      } catch (error) {
        console.error('통계 데이터 로드 실패:', error);
        // 오류 발생시 오프라인 캐시 시도
        const cachedStats = await OfflineStorage.getData('child_stats');
        if (cachedStats) {
          return cachedStats;
        }
        throw error;
      }
    },
    enabled: true,
    retry: isConnected ? 3 : 0,
  });

  // 모든 데이터 새로고침
  const refetchAll = useCallback(() => {
    if (isConnected) {
      refetchPromises();
      refetchStickers();
      refetchStats();
    } else {
      Alert.alert(
        '오프라인 모드',
        '인터넷 연결이 없어 데이터를 새로고침할 수 없습니다.',
        [{ text: '확인' }],
      );
    }
  }, [isConnected, refetchPromises, refetchStickers, refetchStats]);

  // 로딩 중인지 확인
  const isLoading = isPromisesLoading || isStickersLoading || isStatsLoading;

  // 약속 인증 화면으로 이동
  const navigateToVerify = (assignmentId: string) => {
    if (!isConnected) {
      Alert.alert(
        '인터넷 연결 필요',
        '약속 인증을 위해서는 인터넷 연결이 필요합니다. 네트워크 연결을 확인해주세요.',
        [{ text: '확인' }],
      );
      return;
    }

    router.push({
      pathname: '/(child)/verify',
      params: { assignmentId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetchAll} />
        }
      >
        <View className="px-4 pt-4 flex-1">
          <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
            {user?.username || '내'} 약속 관리
          </Text>

          {/* 오프라인 모드 표시 */}
          {isOfflineMode && (
            <View className="bg-amber-100 rounded-xl p-3 mb-4 border border-amber-200">
              <Text className="text-amber-800 text-center font-medium">
                오프라인 모드
              </Text>
              <Text className="text-amber-700 text-center text-sm">
                인터넷 연결이 복구되면 자동으로 동기화됩니다.
              </Text>
            </View>
          )}

          {isLoading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="mt-3 text-emerald-700">
                정보를 불러오는 중...
              </Text>
            </View>
          ) : (
            <>
              <Animated.View
                className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200 shadow-sm"
                style={{
                  opacity: animation.interpolate({
                    inputRange: [0, 300],
                    outputRange: [1, 0],
                  }),
                  transform: [
                    {
                      translateX: animation.interpolate({
                        inputRange: [0, 300],
                        outputRange: [0, 300],
                      }),
                    },
                  ],
                }}
              >
                <View className="flex-row items-center mb-2">
                  <FontAwesome
                    name="rocket"
                    size={18}
                    color="#10b981"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-lg font-medium text-emerald-700">
                    오늘의 미션
                  </Text>
                </View>

                {pendingPromises && pendingPromises.length > 0 ? (
                  <Text className="text-emerald-800">
                    {pendingPromises.length}개의 약속이 남았어요!
                  </Text>
                ) : (
                  <Text className="text-emerald-800">
                    남은 약속이 없어요. 모든 약속을 완료했어요! 👏
                  </Text>
                )}
              </Animated.View>

              <View className="flex-row items-center my-3">
                <FontAwesome
                  name="list-ul"
                  size={18}
                  color="#10b981"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-lg font-medium text-emerald-700">
                  약속 목록
                </Text>
              </View>

              {/* 약속 목록 */}
              {!pendingPromises || pendingPromises.length === 0 ? (
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
                pendingPromises.map((assignment) => (
                  <View
                    key={assignment.id}
                    className="mb-3 p-4 rounded-xl border border-emerald-300 bg-white shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg text-emerald-800">
                          {assignment.promise?.title || '제목 없음'}
                        </Text>
                        <Text className="text-gray-500">
                          기한:{' '}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </Text>
                      </View>

                      <Pressable
                        className="bg-emerald-500 px-3 py-1 rounded-full shadow-sm"
                        onPress={() => navigateToVerify(assignment.id)}
                        disabled={isOfflineMode}
                      >
                        <Text className="text-white">인증하기</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}

              {/* 스티커 정보 */}
              <Animated.View
                className="bg-emerald-50 rounded-xl p-4 mt-2 mb-4 border border-emerald-200 shadow-sm"
                style={{
                  opacity: animation.interpolate({
                    inputRange: [0, 300],
                    outputRange: [1, 0],
                  }),
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 300],
                        outputRange: [0, 300],
                      }),
                    },
                  ],
                }}
              >
                <View className="flex-row items-center mb-2">
                  <FontAwesome
                    name="star"
                    size={18}
                    color="#10b981"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-lg font-medium text-emerald-700">
                    내 스티커
                  </Text>
                </View>

                <View className="flex-row">
                  {stickers && stickers.length > 0 ? (
                    <>
                      {stickers.slice(0, 2).map((sticker) => (
                        <Image
                          key={sticker.id}
                          source={
                            sticker.imageUrl
                              ? { uri: sticker.imageUrl }
                              : require('../../assets/images/react-logo.png')
                          }
                          style={{ width: 40, height: 40 }}
                          contentFit="contain"
                          className="mr-2"
                        />
                      ))}
                      {stickers.length > 2 && (
                        <View className="w-10 h-10 border-2 border-dashed border-emerald-300 rounded-full items-center justify-center">
                          <Text className="text-emerald-600">
                            +{stickers.length - 2}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <Text className="text-gray-500">
                      아직 모은 스티커가 없어요.
                    </Text>
                  )}
                </View>

                <Text className="mt-2 text-emerald-800">
                  {stats && stats.stickerCount > 0
                    ? `${stats.stickerCount}개의 스티커를 모았어요!`
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
      </ScrollView>
    </SafeAreaView>
  );
}