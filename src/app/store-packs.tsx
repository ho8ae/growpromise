// src/app/store-packs.tsx (미스테리 카드 적용)
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
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
import { useAuthStore } from '../stores/authStore';
import MysticBackground from '../components/store/MysticBackground';
import MysteryCard from '../components/store/MysteryCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 타입 정의
enum PackType {
  BASIC = 'BASIC',
}

export default function StorePacksScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // 상태: 'waiting' | 'revealed'
  const [gameState, setGameState] = useState<'waiting' | 'revealed'>('waiting');
  const [drawResult, setDrawResult] = useState<any | null>(null);

  // 뽑기 API 호출
  const drawPlantMutation = useMutation({
    mutationFn: () => api.plant.drawPlant('BASIC' as PackType),
    onSuccess: (result) => {
      setDrawResult(result);
      setGameState('revealed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Alert.alert('오류', '뽑기에 실패했습니다.');
    },
  });

  // 카드 터치
  const handleCardTouch = () => {
    if (gameState !== 'waiting') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    drawPlantMutation.mutate();
  };

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
        <View className="p-4 flex-row items-center relative z-10">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <FontAwesome5 name="arrow-left" size={20} color="#000000" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold text-white"></Text>
        </View>

        {/* 메인 영역 */}
        <View className="flex-1 items-center justify-center px-8 relative z-10 mb-6">
          
          {/* 미스테리 카드 (뽑기 전/후 모두 처리) */}
          <MysteryCard
            onPress={handleCardTouch}
            width={screenWidth * 0.7}
            height={screenHeight * 0.55}
            drawResult={drawResult}
            isRevealed={gameState === 'revealed'}
          />

          {/* 하단 버튼들 (결과 화면에서만 표시) */}
          {gameState === 'revealed' && (
            <View className="w-full mt-16">
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

          {/* 대기 상태 안내 텍스트 */}
          {gameState === 'waiting' && (
            <View className="mt-8 px-6 py-4 rounded-2xl">
              <Text className="text-green-500 text-lg text-center font-bold">
                어떤 신비한 식물이 나올까요?
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                카드를 터치하여 확인해보세요
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}