// src/app/store-packs.tsx
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image'; // Expo의 Image 컴포넌트 사용
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api';
import { useAuthStore } from '../stores/authStore';
import { getPlantFallbackImage, getPlantImageUrl } from '../utils/imageUrl';

// 희귀도별 색상 정의
const rarityColors = {
  COMMON: '#9ca3af', // 회색
  UNCOMMON: '#22c55e', // 초록
  RARE: '#3b82f6', // 파랑
  EPIC: '#a855f7', // 보라
  LEGENDARY: '#f59e0b', // 노랑/금색
};

// 희귀도별 텍스트
const rarityText = {
  COMMON: '일반',
  UNCOMMON: '특별',
  RARE: '희귀',
  EPIC: '영웅',
  LEGENDARY: '전설',
};

export default function StorePacksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  // 상태 변수들
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<any | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // 식물 뽑기 뮤테이션
  const drawPlantMutation = useMutation({
    mutationFn: async () => {
      try {
        return await api.plant.drawPlant('BASIC');
      } catch (error) {
        console.error('식물 뽑기 API 오류:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // 뽑기 결과 설정
      setDrawResult(result);
      setImageLoadError(false); // 이미지 로드 에러 초기화

      // 식물 인벤토리 데이터 무효화
      queryClient.invalidateQueries({ queryKey: ['plantInventory'] });
      queryClient.invalidateQueries({ queryKey: ['allPlants'] });

      // 진동 피드백
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.error('식물 뽑기 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '식물 뽑기에 실패했습니다. 다시 시도해주세요.');
    },
    onSettled: () => {
      setIsDrawing(false);
    },
  });

  // 뒤로가기
  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // 카드팩 오픈 시작
  const handleDrawPlant = useCallback(() => {
    if (isDrawing) return; // 이미 진행 중이면 중복 실행 방지

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setIsDrawing(true);
      drawPlantMutation.mutateAsync();
    } catch (error) {
      console.error('카드팩 오픈 오류:', error);
      setIsDrawing(false);
    }
  }, [isDrawing, drawPlantMutation]);

  // 다시 뽑기
  const handleDrawAgain = useCallback(() => {
    setDrawResult(null);
    handleDrawPlant();
  }, [handleDrawPlant]);

  // 도감 이동
  const handleGoToCollection = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (user?.userType === 'CHILD') {
      router.push('/(child)/plant-collection');
    } else {
      // 부모 계정인 경우 자녀 선택 후 도감으로 이동
      router.push('/(tabs)');
    }
  }, [router, user?.userType]);

  // 식물 선택 화면으로 이동
  const handleGoToSelectPlant = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (user?.userType === 'CHILD') {
      router.push('/(child)/select-plant');
    } else {
      // 부모 계정인 경우 알림
      Alert.alert('알림', '자녀 계정만 식물을 선택할 수 있습니다.');
    }
  }, [router, user?.userType]);

  // 식물 선물하기 (부모 기능)
  const handleGiftPlant = useCallback(() => {
    if (user?.userType !== 'PARENT') {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 실제로는 자녀 선택 후 선물하는 로직 필요
    Alert.alert('식물 선물하기', '정말 이 식물을 자녀에게 선물하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '선물하기',
        onPress: () => {
          // 여기서 선물하기 API 호출 필요
          Alert.alert('알림', '선물하기가 완료되었습니다.');
          router.replace('/(tabs)');
        },
      },
    ]);
  }, [router, user?.userType]);

  // 이미지 로드 오류 처리
  const handleImageError = useCallback(() => {
    console.log('이미지 로드 실패:', drawResult?.plantType?.imagePrefix);
    setImageLoadError(true);
  }, [drawResult?.plantType?.imagePrefix]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={handleBack}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-gray-800">
          {drawResult ? '식물 획득!' : '식물 뽑기'}
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1">
        {!drawResult ? (
          // 뽑기 시작 화면
          <View className="px-5 pt-4 pb-10">
            {/* 안내 내용 */}
            <View className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <MaterialIcons name="emoji-nature" size={22} color="#10b981" />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  식물 뽑기 안내
                </Text>
              </View>

              <Text className="text-gray-700 mb-4">
                광고를 시청하고 무료로 식물을 뽑아보세요! 다양한 희귀도의 특별한
                식물을 수집하고 자신만의 정원을 꾸밀 수 있습니다.
              </Text>

              <View className="bg-gray-50 p-3 rounded-lg">
                <Text className="text-gray-600 mb-2 font-medium">
                  식물 희귀도
                </Text>
                <View className="flex-row flex-wrap">
                  <View className="flex-row items-center mr-3 mb-2">
                    <View className="w-3 h-3 rounded-full bg-gray-400 mr-1" />
                    <Text className="text-xs text-gray-600">일반 (70%)</Text>
                  </View>
                  <View className="flex-row items-center mr-3 mb-2">
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                    <Text className="text-xs text-gray-600">특별 (20%)</Text>
                  </View>
                  <View className="flex-row items-center mr-3 mb-2">
                    <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                    <Text className="text-xs text-gray-600">희귀 (7%)</Text>
                  </View>
                  <View className="flex-row items-center mr-3 mb-2">
                    <View className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
                    <Text className="text-xs text-gray-600">영웅 (2%)</Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
                    <Text className="text-xs text-gray-600">전설 (1%)</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 식물 카드 */}
            <View className="items-center mb-6">
              <RNImage
                source={require('../assets/images/character/level_3.png')}
                style={{ width: 160, height: 160 }}
                resizeMode="contain"
              />
              <Text className="text-gray-700 text-center mt-2">
                어떤 식물이 나올까요?
              </Text>
            </View>

            {/* 뽑기 버튼 */}
            <TouchableOpacity
              className="py-4 rounded-xl overflow-hidden"
              onPress={handleDrawPlant}
              disabled={isDrawing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-4 items-center justify-center"
              >
                {isDrawing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    식물 뽑기
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text className="text-gray-500 text-center mt-2">
              광고를 시청하고 무료로 뽑을 수 있습니다 (테스트 모드)
            </Text>
          </View>
        ) : (
          // 결과 화면
          <View className="px-5 pt-4 pb-10 items-center">
            <View className="items-center bg-gray-50 p-6 rounded-xl w-full mb-6 border border-gray-100">
              <View
                className="rounded-full p-2 mb-2"
                style={{
                  backgroundColor: `${
                    rarityColors[drawResult.plantType.rarity || 'COMMON']
                  }20`,
                }}
              >
                <View
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: `${
                      rarityColors[drawResult.plantType.rarity || 'COMMON']
                    }40`,
                  }}
                >
                  {/* 유틸리티 함수 사용하여 이미지 로드 */}
                  {imageLoadError ? (
                    // 이미지 로드 실패시 기본 이미지 표시
                    <RNImage
                      source={getPlantFallbackImage(
                        drawResult.plantType.imagePrefix,
                      )}
                      style={{ width: 120, height: 120 }}
                      resizeMode="contain"
                    />
                  ) : (
                    // Expo Image를 사용하여 원격 이미지 로드
                    <Image
                      source={{
                        uri: getPlantImageUrl(drawResult.plantType.imagePrefix),
                      }}
                      style={{ width: 120, height: 120 }}
                      contentFit="contain"
                      transition={300}
                      placeholder={getPlantFallbackImage(
                        drawResult.plantType.imagePrefix,
                      )}
                      onError={handleImageError}
                    />
                  )}
                </View>
              </View>
              <View
                className="px-3 py-1 rounded-full mb-3"
                style={{
                  backgroundColor:
                    rarityColors[drawResult.plantType.rarity || 'COMMON'],
                }}
              >
                <Text className="text-white font-medium">
                  {rarityText[drawResult.plantType.rarity || 'COMMON']}
                </Text>
              </View>

              <Text className="text-2xl font-bold text-gray-800 mb-2">
                {drawResult.plantType.name}
              </Text>

              {drawResult.plantType.description && (
                <Text className="text-gray-600 text-center mb-4">
                  {drawResult.plantType.description}
                </Text>
              )}

              {/* 중복 획득 시 메시지 개선 */}
              {drawResult.isDuplicate && drawResult.experienceGained && (
                <View className="bg-blue-50 px-4 py-3 rounded-xl mb-4 w-full items-center">
                  <Text className="text-blue-800 font-bold mb-1">
                    이미 보유한 식물입니다!
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="inventory" size={18} color="#3b82f6" />
                    <Text className="text-blue-700 ml-1">
                      보유 수량이 증가했습니다 (+1)
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="star" size={18} color="#3b82f6" />
                    <Text className="text-blue-700 ml-1">
                      경험치 +{drawResult.experienceGained} 획득
                    </Text>
                  </View>
                </View>
              )}

              {/* 새 식물 획득 시 메시지 */}
              {!drawResult.isDuplicate && (
                <View className="bg-green-50 px-4 py-3 rounded-xl mb-4 w-full items-center">
                  <Text className="text-green-800 font-bold mb-1">
                    새로운 식물을 획득했습니다!
                  </Text>
                  <Text className="text-green-700">
                    인벤토리에 추가되었습니다
                  </Text>
                </View>
              )}
            </View>

            {/* 하단 버튼 */}
            {user?.userType === 'PARENT' ? (
              // 부모 계정일 경우 선물하기 버튼 표시
              <TouchableOpacity
                className="w-full bg-purple-500 py-3 rounded-xl"
                onPress={handleGiftPlant}
              >
                <Text className="text-white font-bold text-center">
                  자녀에게 선물하기
                </Text>
              </TouchableOpacity>
            ) : (
              // 자녀 계정일 경우 버튼들 표시
              <View className="flex-row w-full">
                <TouchableOpacity
                  className="flex-1 bg-emerald-500 py-3 rounded-xl mr-2"
                  onPress={handleGoToSelectPlant}
                >
                  <Text className="text-white font-bold text-center">
                    식물 선택하기
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-blue-500 py-3 rounded-xl"
                  onPress={handleDrawAgain}
                >
                  <Text className="text-white font-bold text-center">
                    다시 뽑기
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              className="bg-gray-200 py-3 px-6 rounded-xl mt-4"
              onPress={handleGoToCollection}
            >
              <Text className="text-gray-700 font-medium">도감 보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});
