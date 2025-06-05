import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import { PromiseStatus, PromiseStats } from '../../api/modules/promise';
import Colors from '../../constants/Colors';
import { useNetwork } from '../../hooks/useNetwork';
import { useAuthStore } from '../../stores/authStore';
import { NotificationHelper } from '../../utils/notificationHelper';
import { OfflineStorage } from '../../utils/offlineStorage';


interface PromiseGroupProps {
  title: string;
  promises: any[];
  onPromisePress: (promiseId: string) => void;
  isOfflineMode: boolean;
}




// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 남은 일수 계산
const getDaysLeft = (dueDateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// 약속 그룹 컴포넌트
const PromiseGroup = ({ title, promises, onPromisePress, isOfflineMode }: PromiseGroupProps) => {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // 아이콘과 색상 결정 (임의로 결정 - 실제로는 카테고리에 따라 결정)
  const getIconAndColor = () => {
    // 제목에 따라 간단히 아이콘/색상 결정
    const titleLower = title.toLowerCase();

    if (
      titleLower.includes('공부') ||
      titleLower.includes('학습') ||
      titleLower.includes('책')
    ) {
      return { icon: 'menu-book', color: Colors.light.promise.study };
    } else if (
      titleLower.includes('집안') ||
      titleLower.includes('청소') ||
      titleLower.includes('정리')
    ) {
      return { icon: 'cleaning-services', color: Colors.light.promise.chore };
    } else if (titleLower.includes('운동') || titleLower.includes('체육')) {
      return { icon: 'directions-run', color: Colors.light.primary };
    } else if (titleLower.includes('건강') || titleLower.includes('양치')) {
      return { icon: 'healing', color: Colors.light.promise.health };
    } else if (titleLower.includes('음악') || titleLower.includes('악기')) {
      return { icon: 'music-note', color: Colors.light.promise.music };
    } else if (titleLower.includes('가족') || titleLower.includes('부모님')) {
      return { icon: 'people', color: Colors.light.promise.family };
    } else {
      return { icon: 'assignment', color: Colors.light.textSecondary };
    }
  };

  const { icon, color } = getIconAndColor();

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  if (!promises || promises.length === 0) return null;

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="rounded-xl overflow-hidden active:opacity-90 border border-gray-100"
        style={{ backgroundColor: color + '08' }}
        onPress={() => setExpanded(!expanded)}
      >
        <View className="p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: color + '15' }}
            >
              <MaterialIcons name={icon as any} size={20} color={color} />
            </View>
            <View>
              <Text
                className="text-base font-bold"
                style={{ color: Colors.light.text }}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text
                className="text-sm"
                style={{ color: Colors.light.textSecondary }}
              >
                {promises.length}개의 약속
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {!expanded && promises.some((p) => getDaysLeft(p.dueDate) <= 1) && (
              <View
                className="px-2.5 py-1 rounded-full mr-2"
                style={{ backgroundColor: 'rgba(255, 75, 75, 0.15)' }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: Colors.light.error }}
                >
                  긴급
                </Text>
              </View>
            )}
            <Animated.View style={{ transform: [{ rotate }] }}>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color={Colors.light.textSecondary}
              />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={{
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500],
          }),
          opacity: animatedHeight,
          overflow: 'hidden',
        }}
      >
        <View className="mt-2 pl-5 pr-2">
          {promises.map((assignment: any) => (
            <Pressable
              key={assignment.id}
              className="mb-2 p-3 rounded-xl border border-gray-100 bg-white active:opacity-90"
              onPress={() => onPromisePress(assignment.id)}
              disabled={isOfflineMode}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text
                    className="text-base font-medium mb-1"
                    style={{ color: Colors.light.text }}
                    numberOfLines={1}
                  >
                    {assignment.promise?.title || '제목 없음'}
                  </Text>

                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="event"
                      size={12}
                      color={Colors.light.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      className="text-xs mr-2"
                      style={{ color: Colors.light.textSecondary }}
                    >
                      {formatDate(assignment.dueDate)}
                    </Text>

                    {getDaysLeft(assignment.dueDate) <= 1 ? (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255, 75, 75, 0.15)' }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: Colors.light.error }}
                        >
                          {getDaysLeft(assignment.dueDate) <= 0
                            ? '오늘 마감'
                            : '내일 마감'}
                        </Text>
                      </View>
                    ) : (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: Colors.light.primary }}
                        >
                          D-{getDaysLeft(assignment.dueDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: color + '10' }}
                >
                  <MaterialIcons name="camera-alt" size={18} color={color} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default function ChildDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isConnected } = useNetwork();
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 알림 권한 설정
  useEffect(() => {
    NotificationHelper.requestPermissionsAsync();
  }, []);

  // 애니메이션 시작
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
          const promises = await api.promise.getChildPromises(
            PromiseStatus.PENDING,
          );
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
  } = useQuery<PromiseStats>({
    queryKey: ['childStats'],
    queryFn:async () => {
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
          const cachedStats = await OfflineStorage.getData<PromiseStats>('child_stats');
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
        const cachedStats = await OfflineStorage.getData<PromiseStats>('child_stats');
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

  // 약속을 제목별로 그룹화하는 함수
  const getPromisesByTitle = () => {
    if (!pendingPromises || pendingPromises.length === 0) return {};

    const groupedPromises: { [key: string]: any[] } = {};

    pendingPromises.forEach((promise) => {
      const title = promise.promise?.title || '제목 없음';

      if (!groupedPromises[title]) {
        groupedPromises[title] = [];
      }

      groupedPromises[title].push(promise);
    });

    return groupedPromises;
  };

  // 제목별로 그룹화된 약속
  const groupedPromises = getPromisesByTitle();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: 10, // 하단 여백 추가
          flexGrow: 1 // 컨텐츠가 적어도 화면 전체를 채우도록 설정
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetchAll} />
        }
      >
        <View className="px-5 pt-4 flex flex-1 flex-col justify-between">
          {/* 상단 컨텐츠를 포함하는 View */}
          <View className="flex-1">
            <Animated.View 
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* 프로필 및 인사말 */}
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-2xl font-bold" style={{ color: Colors.light.text }}>
                    안녕하세요, {user?.username || '친구'}!
                  </Text>
                  <Text style={{ color: Colors.light.textSecondary }}>
                    오늘의 약속을 확인해보세요 💚
                  </Text>
                </View>
                
                <TouchableOpacity 
                  className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Image
                    source={require('../../assets/images/icon/basicPeople_icon.png')}
                    style={{ width: 32, height: 32 }}
                    contentFit="contain"
                    className="rounded-full"
                  />
                </TouchableOpacity>
              </View>

              {/* 오프라인 모드 표시 */}
              {isOfflineMode && (
                <View 
                  className="rounded-xl p-3 mb-6"
                  style={{ backgroundColor: 'rgba(255, 200, 0, 0.15)' }}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons 
                      name="wifi-off" 
                      size={20} 
                      color={Colors.light.secondary} 
                      style={{ marginRight: 8 }}
                    />
                    <View>
                      <Text 
                        className="font-medium"
                        style={{ color: Colors.light.text }}
                      >
                        오프라인 모드
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: Colors.light.textSecondary }}
                      >
                        인터넷 연결이 복구되면 자동으로 동기화됩니다.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>

            {isLoading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text className="mt-3" style={{ color: Colors.light.textSecondary }}>
                  정보를 불러오는 중...
                </Text>
              </View>
            ) : (
              <>
                {/* 요약 정보 카드 */}
                <Animated.View 
                  className="mb-6"
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <View 
                    className="rounded-2xl p-5 border border-green-100 overflow-hidden"
                    style={{ backgroundColor: 'rgba(88, 204, 2, 0.08)' }}
                  >
                    <View className="flex-row justify-between mb-4">
                      <View>
                        <Text className="text-lg font-bold mb-1" style={{ color: Colors.light.text }}>
                          이번 주 미션
                        </Text>
                        <Text style={{ color: Colors.light.textSecondary }}>
                          {pendingPromises ? pendingPromises.length : 0}개의 약속이 남았어요
                        </Text>
                      </View>
                      
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.15)' }}
                      >
                        <MaterialIcons name="assignment" size={24} color={Colors.light.primary} />
                      </View>
                    </View>
                    
                    {/* 진행 바 */}
                    <View>
                      <View className="flex-row justify-between mb-1.5">
                        <Text className="text-xs font-medium" style={{ color: Colors.light.textSecondary }}>
                          진행률
                        </Text>
                        <Text className="text-xs font-medium" style={{ color: Colors.light.primary }}>
                          {stats && stats.totalPromises > 0 
                            ? Math.round((stats.completedPromises / stats.totalPromises) * 100)
                            : 0}%
                        </Text>
                      </View>
                      <View className="h-2 bg-white rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-green-500" 
                          style={{ 
                            width: `${stats && stats.totalPromises > 0 
                              ? Math.round((stats.completedPromises / stats.totalPromises) * 100)
                              : 0}%`,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </Animated.View>
                
                {/* 스티커 정보 */}
                <Animated.View 
                  className="mb-6"
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <MaterialIcons name="star" size={20} color={Colors.light.secondary} style={{ marginRight: 6 }} />
                      <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                        내 스티커
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => router.push('/(child)/rewards')}
                    >
                      <Text 
                        className="text-sm mr-1"
                        style={{ color: Colors.light.primary }}
                      >
                        더 보기
                      </Text>
                      <MaterialIcons name="chevron-right" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>

                  <View 
                    className="p-4 rounded-xl border border-gray-100"
                    style={{ backgroundColor: 'white' }}
                  >
                    <View className="flex-row items-center">
                      <View className="flex-row flex-1">
                        {stickers && stickers.length > 0 ? (
                          <>
                            {stickers.slice(0, 3).map((sticker, index) => (
                              <View 
                                key={sticker.id} 
                                style={{ 
                                  marginLeft: index > 0 ? -10 : 0, 
                                  zIndex: 3 - index,
                                }}
                              >
                                <Image
                                  source={
                                    sticker.imageUrl
                                      ? { uri: sticker.imageUrl }
                                      : require('../../assets/images/icon/help_icon.png')
                                  }
                                  style={{ width: 40, height: 40 }}
                                  contentFit="contain"
                                  className="rounded-full bg-yellow-50 border border-yellow-100"
                                />
                              </View>
                            ))}
                            {stickers.length > 3 && (
                              <View 
                                className="ml-1 px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-100"
                                style={{ alignSelf: 'center' }}
                              >
                                <Text
                                  className="text-xs"
                                  style={{ color: Colors.light.secondary }}
                                >
                                  +{stickers.length - 3}
                                </Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <Text style={{ color: Colors.light.textSecondary }}>
                            아직 모은 스티커가 없어요
                          </Text>
                        )}
                      </View>
                      
                      <View 
                        className="px-3 py-1 rounded-lg"
                        style={{ backgroundColor: 'rgba(255, 200, 0, 0.15)' }}
                      >
                        <Text 
                          className="font-medium"
                          style={{ color: Colors.light.secondary }}
                        >
                          {stats ? stats.stickerCount : 0}개 보유
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
                
                {/* 약속 목록 헤더 */}
                <Animated.View 
                  className="flex-row justify-between items-center mb-3"
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="list-alt" size={20} color={Colors.light.text} style={{ marginRight: 6 }} />
                    <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                      약속 목록
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={() => router.push('/(child)/promises')}
                  >
                    <Text 
                      className="text-sm mr-1"
                      style={{ color: Colors.light.primary }}
                    >
                      전체보기
                    </Text>
                    <MaterialIcons name="chevron-right" size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </Animated.View>
                
                {/* 약속 그룹별 목록 */}
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                  
                >
                  {pendingPromises && pendingPromises.length > 0 ? (
                    Object.entries(groupedPromises).map(([title, promises]) => (
                      <PromiseGroup
                        key={title}
                        title={title}
                        promises={promises}
                        onPromisePress={navigateToVerify}
                        isOfflineMode={isOfflineMode}
                      />
                    ))
                  ) : (
                    <View className="items-center justify-center py-8 px-4 ">
                      <View 
                        className="w-16 h-16 rounded-full mb-4 items-center justify-center"
                        style={{ backgroundColor: 'rgba(88, 204, 2, 0.1)' }}
                      >
                        <MaterialIcons name="event-note" size={32} color={Colors.light.primary} />
                      </View>
                      <Text 
                        className="text-lg font-bold text-center mb-2"
                        style={{ color: Colors.light.text }}
                      >
                        아직 약속이 없어요
                      </Text>
                      <Text 
                        className="text-center"
                        style={{ color: Colors.light.textSecondary }}
                      >
                        부모님께 약속을 만들어 달라고 요청해보세요!
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </>
            )}
          </View>
          
          {/* 최하단 버튼 */}
          <View className="">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <TouchableOpacity
                className="py-3.5 rounded-xl active:opacity-90"
                style={{ backgroundColor: Colors.light.primary }}
                onPress={() => router.push('/(tabs)')}
              >
                <Text className="text-white text-center font-bold">
                  홈으로 가기
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}