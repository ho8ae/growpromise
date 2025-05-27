// src/app/store-packs.tsx - 티켓 사용 수정
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api';
import ticketApi from '../api/modules/ticket'; // 🎯 티켓 API 추가
import { useAuthStore } from '../stores/authStore';
import { useTickets, useTicketCounts } from '../hooks/useTickets'; // 🎯 티켓 훅 추가
import MysticBackground from '../components/store/MysticBackground';
import MysteryCard from '../components/store/MysteryCard';
import { TicketType } from '../api/modules/ticket';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 타입 정의
enum PackType {
  BASIC = 'BASIC',
}

export default function StorePacksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  // 🎯 티켓 정보 가져오기
  const { data: ticketData, refetch: refetchTickets } = useTickets();
  const { getAvailableTicketId, hasTickets } = useTicketCounts();

  // 상태: 'waiting' | 'revealed'
  const [gameState, setGameState] = useState<'waiting' | 'revealed'>('waiting');
  const [drawResult, setDrawResult] = useState<any | null>(null);

  // 🎯 개선된 뽑기 API 호출 - 티켓 사용
  const drawPlantMutation = useMutation({
    mutationFn: async () => {
      console.log('🎯 뽑기 시작');
      
      // 기본 티켓이 있는지 확인
      const basicTicketId = getAvailableTicketId(TicketType.BASIC);
      
      if (basicTicketId) {
        console.log('🎫 기본 티켓 사용:', basicTicketId);
        // 티켓 사용 뽑기
        return await ticketApi.useTicket(basicTicketId);
      } else {
        console.log('🪙 코인 사용 뽑기');
        // 티켓이 없으면 코인 사용 뽑기
        return await ticketApi.drawWithCoin(TicketType.BASIC);
      }
    },
    onSuccess: async (result) => {
      console.log('🎯 뽑기 성공:', result);
      
      // 🎯 모든 관련 데이터 새로고침
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['childStats'] }),
        queryClient.invalidateQueries({ queryKey: ['plants', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['plants', 'collection'] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
        refetchTickets(),
      ]);
      
      setDrawResult(result);
      setGameState('revealed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.error('🎯 뽑기 실패:', error);
      Alert.alert('오류', '뽑기에 실패했습니다.\n\n' + 
        (error instanceof Error ? error.message : '알 수 없는 오류'));
    },
  });

  // 🎯 개선된 카드 터치 - 확인 절차 추가
  // const handleCardTouch = () => {
  //   if (gameState !== 'waiting') return;
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
  //   const basicTicketId = getAvailableTicketId('BASIC');
    
  //   if (basicTicketId) {
  //     // 티켓 사용 확인
  //     Alert.alert(
  //       '🎫 티켓 사용',
  //       '기본 티켓을 사용해서 뽑으시겠어요?',
  //       [
  //         { text: '취소', style: 'cancel' },
  //         {
  //           text: '티켓 사용',
  //           onPress: () => drawPlantMutation.mutate(),
  //         },
  //       ]
  //     );
  //   } else {
  //     // 코인 사용 확인
  //     Alert.alert(
  //       '🪙 코인 사용',
  //       '100 코인을 사용해서 뽑으시겠어요?\n(티켓이 없어서 코인을 사용합니다)',
  //       [
  //         { text: '취소', style: 'cancel' },
  //         {
  //           text: '100 코인 사용',
  //           onPress: () => drawPlantMutation.mutate(),
  //         },
  //       ]
  //     );
  //   }
  // };

  // 다시 뽑기
  const handleDrawAgain = () => {
    setGameState('waiting');
    setDrawResult(null);

  };

  // 뒤로가기
  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      {/* 배경 */}
      <MysticBackground />
      
      <SafeAreaView className="flex-1">
        {/* 헤더 */}
        <View className="p-4 flex-row items-center justify-between relative z-10">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          
          
          {/* 🎯 티켓 정보 표시 */}
          <View className="px-3 py-1 rounded-full">
            <Text className="text-black text-sm">
              🎫 {ticketData?.total || 0}
            </Text>
          </View>
        </View>

        {/* 메인 영역 */}
        <View className="flex-1 items-center justify-center px-8 relative z-10 mb-6">
          
          {/* 미스테리 카드 (뽑기 전/후 모두 처리) */}
          <MysteryCard
            onPress={()=>drawPlantMutation.mutate()}
            width={screenWidth * 0.7}
            height={screenHeight * 0.55}
            drawResult={drawResult}
            isRevealed={gameState === 'revealed'}
          />

          {/* 하단 버튼들 (결과 화면에서만 표시) */}
          {gameState === 'revealed' && (
            <View className="w-full mt-8 space-y-6 mb-4">
              {/* {ticketData?.total !== 0 && (
                <TouchableOpacity
                onPress={handleDrawAgain}
                className="bg-green-600/90 py-4 rounded-xl shadow-lg border border-green-500 mb-4"
              >
                <Text className="text-white font-bold text-center">
                  다시 뽑기
                </Text>
              </TouchableOpacity>
              )} */}
              
              <TouchableOpacity
                onPress={handleBack}
                className="bg-gray-700/90 py-4 rounded-xl shadow-lg border border-gray-600"
              >
                <Text className="text-white font-bold text-center">
                  돌아가기
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 🎯 개선된 대기 상태 안내 텍스트 */}
          {gameState === 'waiting' && (
            <View className="mt-8 px-6 py-4 rounded-2xl">
              <Text className="text-green-400 text-lg text-center font-bold">
                어떤 신비한 식물이 나올까요?
              </Text>
              
              {/* 사용될 방법 표시 */}
              {/* <View className="mt-3">
                {getAvailableTicketId('BASIC') ? (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-2xl mr-2">🎫</Text>
                    <Text className="text-white text-center">
                      기본 티켓으로 뽑기
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-2xl mr-2">🪙</Text>
                    <Text className="text-yellow-400 text-center">
                      100 코인으로 뽑기
                    </Text>
                  </View>
                )}
              </View> */}
              
              <Text className="text-gray-500 text-sm text-center mt-2">
                카드를 터치하여 확인해보세요
              </Text>
            </View>
          )}

          {/* 🎯 로딩 상태 표시 */}
          {drawPlantMutation.isPending && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-3xl">
              <View className="bg-white/10 rounded-2xl p-6">
                <Text className="text-white text-lg font-bold text-center">
                  🎲 뽑는 중...
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}