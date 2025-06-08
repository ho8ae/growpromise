// src/app/(tabs)/store-tab.tsx - 부모/자녀 계정 구분 처리
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTicketCounts, useTickets } from '../../hooks/useTickets';
import { useAuthStore } from '../../stores/authStore';

// 상점 아이템 타입
interface StoreItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isAvailable: boolean;
  comingSoon?: boolean;
}

const storeItems: StoreItem[] = [
  {
    id: 'stickers',
    title: '스티커 팩',
    description: '다양한 칭찬 스티커',
    icon: 'sticker-emoji',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'themes',
    title: '테마 컬렉션',
    description: '앱 테마와 배경',
    icon: 'palette',
    isAvailable: false,
    comingSoon: true,
  },
];

export default function StoreTabScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  // 사용자 타입 확인 (대소문자 구분 없이)
  const isParent = user?.userType?.toUpperCase() === 'PARENT';
  const isChild = user?.userType?.toUpperCase() === 'CHILD';

  // 🎯 자녀 계정일 때만 티켓 데이터 훅 사용
  const {
    data: ticketData,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
    isRefetching,
  } = useTickets();

  const { counts, total, hasTickets } = useTicketCounts();

  // 🎯 자녀 계정이고 인증 상태 변경 시 티켓 데이터 새로고침
  useEffect(() => {
    if (isAuthenticated && isChild) {
      console.log('🎯 자녀 계정 인증 상태 변경됨 - 티켓 데이터 새로고침');
      refetchTickets();
    }
  }, [isAuthenticated, isChild, refetchTickets]);

  // 🎯 수동 새로고침 핸들러 (자녀만)
  const handleRefresh = useCallback(async () => {
    console.log('🎯 수동 새로고침 시작');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isAuthenticated && isChild) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['childStats'] }),
        queryClient.invalidateQueries({ queryKey: ['activeMissions'] }),
        refetchTickets(),
      ]);
    }
  }, [isAuthenticated, isChild, queryClient, refetchTickets]);

  // 카드팩 뽑기 핸들러
  const handleCardPack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isAuthenticated) {
      Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그인',
          onPress: () => router.navigate('/(auth)/login'),
        },
      ]);
      return;
    }

    // 부모 계정인 경우
    if (isParent) {
      Alert.alert(
        '자녀 전용 기능',
        '식물 카드 선택은 자녀 계정에서만 가능해요.\n자녀와 함께 이용해주세요! 🌱',
        [{ text: '확인', style: 'default' }],
      );
      return;
    }

    // 자녀 계정인 경우 기존 로직
    if (isChild) {
      console.log('🎯 뽑기 시도 - 현재 티켓:', {
        total,
        counts,
        hasTickets: hasTickets(),
      });

      if (hasTickets()) {
        router.push('/store-packs');
      } else {
        Alert.alert(
          '뽑기 티켓이 없어요',
          '약속을 지키고 식물을 키워서 뽑기 티켓을 모아보세요!',
          [
            { text: '확인', style: 'default' },
            {
              text: '약속 보기',
              onPress: () => router.push('/(child)/promises'),
            },
            {
              text: '새로고침',
              onPress: handleRefresh,
            },
          ],
        );
      }
    }
  }, [
    isAuthenticated,
    isParent,
    isChild,
    router,
    total,
    counts,
    hasTickets,
    handleRefresh,
  ]);

  // 출시 예정 아이템 핸들러
  const handleComingSoon = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('출시 예정', '곧 만나볼 수 있어요! 조금만 기다려 주세요. 🌱');
  }, []);

  // 티켓 타입별 색상
  const getTicketColor = useCallback((type: string) => {
    switch (type) {
      case 'BASIC':
        return 'bg-green-500';
      case 'PREMIUM':
        return 'bg-purple-500';
      case 'SPECIAL':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }, []);

  // 티켓 타입별 아이콘
  const getTicketIcon = useCallback((type: string) => {
    switch (type) {
      case 'BASIC':
        return 'ticket';
      case 'PREMIUM':
        return 'ticket-outline';
      case 'SPECIAL':
        return 'star';
      default:
        return 'ticket';
    }
  }, []);

  // 티켓 타입 한국어
  const getTicketName = useCallback((type: string) => {
    switch (type) {
      case 'BASIC':
        return '기본';
      case 'PREMIUM':
        return '프리미엄';
      case 'SPECIAL':
        return '스페셜';
      default:
        return type;
    }
  }, []);

  // 부모용 컨텐츠 렌더링
  const renderParentContent = () => (
    <TouchableOpacity
      onPress={handleCardPack}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden shadow-lg bg-emerald-400"
    >
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-white font-bold text-2xl">
              자녀 화면에서 함께 해요!
            </Text>
            <Text className="text-white/90 text-lg">
              식물 카드 선택은 자녀 전용 기능이에요
            </Text>
          </View>
          <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center">
            <MaterialCommunityIcons
              name="account-child"
              size={32}
              color="white"
            />
          </View>
        </View>

        <View className="bg-white/20 rounded-xl p-4">
          <View className="items-center">
            <MaterialCommunityIcons name="heart" size={32} color="white" />
            <Text className="text-white text-center mt-2 text-lg font-medium">
              자녀와 함께 식물 카드를{'\n'}선택해보세요!
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 자녀용 컨텐츠 렌더링 (기존 로직)
  const renderChildContent = () => (
    <TouchableOpacity
      onPress={handleCardPack}
      activeOpacity={0.9}
      className={`rounded-2xl overflow-hidden shadow-lg ${
        hasTickets() ? 'bg-blue-400' : 'bg-gray-400'
      }`}
    >
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-white font-bold text-2xl">
              식물 카드 선택하기
            </Text>
            <Text className="text-white/90 text-lg">
              {hasTickets() ? '티켓으로 뽑기' : '티켓을 모아보세요!'}
            </Text>

            {(ticketsLoading || isRefetching) && (
              <Text className="text-white/70 text-sm mt-1">업데이트 중...</Text>
            )}
          </View>
          <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center">
            <MaterialCommunityIcons name="cards" size={32} color="white" />
          </View>
        </View>

        {/* 티켓 개수 표시 */}
        {ticketsLoading && !ticketData ? (
          <View className="bg-white/20 rounded-xl p-4">
            <View className="flex-row items-center justify-center">
              <MaterialCommunityIcons name="loading" size={20} color="white" />
              <Text className="text-white ml-2">티켓 정보 로딩 중...</Text>
            </View>
          </View>
        ) : (
          <View className="bg-white/20 rounded-xl p-4">
            <View className="flex-row items-center justify-center mb-3">
              <Text className="text-white text-lg font-semibold">
                보유 티켓: {total}개
              </Text>

              {isRefetching && (
                <View className="ml-2">
                  <MaterialCommunityIcons name="sync" size={16} color="white" />
                </View>
              )}
            </View>

            {total > 0 ? (
              <View className="flex-row justify-center space-x-4 gap-4">
                {Object.entries(counts).map(
                  ([type, count]) =>
                    count > 0 && (
                      <View key={type} className="items-center">
                        <View
                          className={`w-12 h-12 rounded-full ${getTicketColor(type)} items-center justify-center mb-1`}
                        >
                          <MaterialCommunityIcons
                            name={
                              getTicketIcon(
                                type,
                              ) as keyof typeof MaterialCommunityIcons.glyphMap
                            }
                            size={20}
                            color="white"
                          />
                        </View>
                        <Text className="text-white text-sm font-medium">
                          {getTicketName(type)}
                        </Text>
                        <Text className="text-white text-lg font-bold">
                          {count}개
                        </Text>
                      </View>
                    ),
                )}
              </View>
            ) : (
              <View className="items-center">
                <MaterialCommunityIcons
                  name="heart-outline"
                  size={32}
                  color="white"
                />
                <Text className="text-white text-center mt-2">
                  약속을 지키고 식물을 키워서{'\n'}티켓을 모아보세요!
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/(child)/promises')}
                  className="bg-white/20 rounded-lg px-4 py-2 mt-3"
                >
                  <Text className="text-white font-medium text-sm">
                    약속 보러가기 →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 미인증 사용자용 컨텐츠
  const renderGuestContent = () => (
    <TouchableOpacity
      onPress={handleCardPack}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden shadow-lg bg-blue-400"
    >
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-white font-bold text-2xl">
              식물 카드 선택하기
            </Text>
            <Text className="text-white/90 text-lg">
              로그인하고 티켓을 확인해보세요!
            </Text>
          </View>
          <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center">
            <MaterialCommunityIcons name="cards" size={32} color="white" />
          </View>
        </View>

        <View className="bg-white/20 rounded-xl p-4">
          <Text className="text-white text-center">
            로그인하고 티켓을 확인해보세요!
          </Text>
          <TouchableOpacity
            onPress={() => router.navigate('/(auth)/login')}
            className="bg-white/20 rounded-lg px-4 py-2 mt-3 self-center"
          >
            <Text className="text-white font-medium text-sm">로그인하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  console.log('🎯 Store Tab 렌더링:', {
    isAuthenticated,
    isParent,
    isChild,
    userType: user?.userType,
    ticketsLoading,
    isRefetching,
    total,
    counts,
    hasTickets: isChild ? hasTickets() : false,
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isChild ? isRefetching : false}
            onRefresh={isChild ? handleRefresh : () => {}}
            tintColor="#059669"
            colors={['#059669']}
          />
        }
      >
        <View className="p-4">
          {/* 헤더 */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">상점</Text>
                <Text className="text-gray-600 mt-1">
                  {isParent
                    ? '자녀와 함께 새로운 식물을 만나보세요'
                    : '약속을 통해 식물을 키우면 티켓 획득 !'}
                </Text>
              </View>
            </View>
          </View>

          {/* 🎯 계정 타입별 카드팩 섹션 */}
          <View className="mb-2">
            {!isAuthenticated
              ? renderGuestContent()
              : isParent
                ? renderParentContent()
                : isChild
                  ? renderChildContent()
                  : renderGuestContent()}
          </View>


          {/* 기타 상점 아이템들 */}
          <Text className="text-xl font-bold text-gray-800 mb-4">
            다른 아이템들
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {storeItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={handleComingSoon}
                activeOpacity={0.8}
                className="w-[48%] mb-4 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
              >
                <View className="p-4 h-32">
                  <View className="flex-1 items-center justify-center">
                    <View className="w-12 h-12 rounded-xl items-center justify-center mb-3 bg-gray-300">
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color="#9CA3AF"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="font-semibold text-center mb-1 text-gray-400">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-center text-gray-400">
                      출시 예정
                    </Text>
                  </View>

                  <View className="absolute top-2 right-2">
                    <View className="bg-gray-400 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-medium">
                        Soon
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 하단 안내 */}
          <View className="bg-green-50 rounded-xl p-4 border border-green-200 mt-4">
            <TouchableOpacity
              onPress={() => {
                if (isParent) {
                  Alert.alert(
                    '안내',
                    '식물 컬렉션은 자녀 계정에서 확인할 수 있어요.',
                  );
                } else {
                  router.push('/(child)/select-plant');
                }
              }}
              className="flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="sprout" size={20} color="#059669" />
              <Text className="text-green-700 font-semibold ml-2">
                {isParent ? '자녀 식물 컬렉션 확인하기' : '내 식물 컬렉션 보기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
