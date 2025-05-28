// src/app/(tabs)/store-tab.tsx - 실시간 티켓 업데이트 개선
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useTickets, useTicketCounts } from '../../hooks/useTickets';

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
  
  // 🎯 티켓 데이터 훅 - refetchOnWindowFocus 활성화
  const { 
    data: ticketData, 
    isLoading: ticketsLoading, 
    refetch: refetchTickets,
    isRefetching
  } = useTickets();
  
  const { counts, total, hasTickets } = useTicketCounts();


  // 🎯 인증 상태 변경 시 티켓 데이터 새로고침
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🎯 인증 상태 변경됨 - 티켓 데이터 새로고침');
      refetchTickets();
    }
  }, [isAuthenticated, user, refetchTickets]);

  // 🎯 수동 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    console.log('🎯 수동 새로고침 시작');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isAuthenticated) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['childStats'] }),
        queryClient.invalidateQueries({ queryKey: ['activeMissions'] }),
        refetchTickets()
      ]);
    }
  }, [isAuthenticated, queryClient, refetchTickets]);

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

    // 🎯 실시간 티켓 확인을 위해 최신 데이터 사용
    console.log('🎯 뽑기 시도 - 현재 티켓:', { total, counts, hasTickets: hasTickets() });

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
        ]
      );
    }
  }, [isAuthenticated, router, total, counts, hasTickets, handleRefresh]);

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

  // 🎯 디버깅을 위한 로그
  console.log('🎯 Store Tab 렌더링:', {
    isAuthenticated,
    ticketsLoading,
    isRefetching,
    total,
    counts,
    hasTickets: hasTickets()
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
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
                <Text className="text-gray-600 mt-1">뽑기 티켓으로 새로운 식물을 만나보세요</Text>
              </View>
            </View>
          </View>

          {/* 🎯 뽑기 티켓 현황 - 큰 카드 */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleCardPack}
              activeOpacity={0.9}
              className={`rounded-2xl overflow-hidden shadow-lg ${
                hasTickets() ? 'bg-blue-400' : 'bg-gray-400'
              }`}
            >
              <View className="p-6">
                {/* 상단 */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-white font-bold text-2xl">
                      식물 카드 선택하기
                    </Text>
                    <Text className="text-white/90 text-lg">
                      {hasTickets() ? '티켓으로 뽑기' : '티켓을 모아보세요!'}
                    </Text>
                    
                    {/* 🎯 실시간 업데이트 상태 표시 */}
                    {(ticketsLoading || isRefetching) && (
                      <Text className="text-white/70 text-sm mt-1">
                        업데이트 중...
                      </Text>
                    )}
                  </View>
                  <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center">
                    <MaterialCommunityIcons 
                      name="cards" 
                      size={32} 
                      color="white" 
                    />
                  </View>
                </View>

                {/* 티켓 개수 표시 */}
                {isAuthenticated ? (
                  (ticketsLoading && !ticketData) ? (
                    <View className="bg-white/20 rounded-xl p-4">
                      <View className="flex-row items-center justify-center">
                        <MaterialCommunityIcons 
                          name="loading" 
                          size={20} 
                          color="white" 
                        />
                        <Text className="text-white ml-2">티켓 정보 로딩 중...</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="bg-white/20 rounded-xl p-4">
                      <View className="flex-row items-center justify-center mb-3">
                        <Text className="text-white text-lg font-semibold">
                          보유 티켓: {total}개
                        </Text>
                        
                        {/* 🎯 실시간 업데이트 인디케이터 */}
                        {isRefetching && (
                          <View className="ml-2">
                            <MaterialCommunityIcons 
                              name="sync" 
                              size={16} 
                              color="white" 
                            />
                          </View>
                        )}
                      </View>
                      
                      {total > 0 ? (
                        <View className="flex-row justify-center space-x-4">
                          {Object.entries(counts).map(([type, count]) => (
                            count > 0 && (
                              <View key={type} className="items-center">
                                <View className={`w-12 h-12 rounded-full ${getTicketColor(type)} items-center justify-center mb-1`}>
                                  <MaterialCommunityIcons 
                                    name={getTicketIcon(type) as keyof typeof MaterialCommunityIcons.glyphMap} 
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
                            )
                          ))}
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
                          
                          {/* 🎯 티켓 획득 방법 바로가기 */}
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
                  )
                ) : (
                  <View className="bg-white/20 rounded-xl p-4">
                    <Text className="text-white text-center">
                      로그인하고 티켓을 확인해보세요!
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.navigate('/(auth)/login')}
                      className="bg-white/20 rounded-lg px-4 py-2 mt-3 self-center"
                    >
                      <Text className="text-white font-medium text-sm">
                        로그인하기
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* 🎯 티켓 획득 방법 안내 */}
          {/* <View className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <Text className="text-blue-800 font-bold text-lg mb-3 text-center">
              🎫 티켓 획득 방법
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="check-circle" size={16} color="#2563eb" />
                <Text className="text-blue-700 ml-2">약속 인증 5회, 10회, 25회... 달성</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="check-circle" size={16} color="#2563eb" />
                <Text className="text-blue-700 ml-2">식물 완료 1개, 3개, 5개... 달성</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="check-circle" size={16} color="#2563eb" />
                <Text className="text-blue-700 ml-2">연속 물주기 7일, 14일, 30일... 달성</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="check-circle" size={16} color="#2563eb" />
                <Text className="text-blue-700 ml-2">특별 미션 완료</Text>
              </View>
            </View>
            
            {/* 🎯 미션 확인 버튼 추가 */}
            {/* <TouchableOpacity
              onPress={() => {
                // 미션 화면이 있다면 연결, 없다면 약속 화면으로
                router.push('/(child)/promises');
              }}
              className="bg-blue-500 rounded-lg px-4 py-2 mt-3 self-center"
            >
              <Text className="text-white font-medium text-sm">
                내 미션 확인하기
              </Text>
            </TouchableOpacity>
          </View>  */}

          {/* 기타 상점 아이템들 */}
          <Text className="text-xl font-bold text-gray-800 mb-4">다른 아이템들</Text>
          <View className="flex-row flex-wrap justify-between">
            {storeItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={handleComingSoon}
                activeOpacity={0.8}
                className="w-[48%] mb-4 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
              >
                <View className="p-4 h-32">
                  {/* 아이콘 영역 */}
                  <View className="flex-1 items-center justify-center">
                    <View className="w-12 h-12 rounded-xl items-center justify-center mb-3 bg-gray-300">
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={24} 
                        color="#9CA3AF" 
                      />
                    </View>
                  </View>

                  {/* 텍스트 영역 */}
                  <View>
                    <Text className="font-semibold text-center mb-1 text-gray-400">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-center text-gray-400">
                      출시 예정
                    </Text>
                  </View>

                  {/* 출시 예정 배지 */}
                  <View className="absolute top-2 right-2">
                    <View className="bg-gray-400 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-medium">Soon</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 하단 안내 */}
          <View className="bg-green-50 rounded-xl p-4 border border-green-100 mt-4">
            <TouchableOpacity
              onPress={() => router.push('/(child)/select-plant')}
              className="flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="sprout" size={20} color="#059669" />
              <Text className="text-green-700 font-semibold ml-2">
                내 식물 컬렉션 보기
              </Text>
            </TouchableOpacity>
          </View>

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}