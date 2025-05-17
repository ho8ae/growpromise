// components/plant/ChildPlantDisplay.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import stickerApi from '../../api/modules/sticker';
import Colors from '../../constants/Colors';
import { usePlant } from '../../hooks/usePlant';

import PlantDisplayFootAction from './PlantDisplayFootAction';

// 스티커 통계 타입
interface StickerStats {
  totalStickers: number;
  availableStickers: number;
}

interface ChildPlantDisplayProps {
  onPress?: () => void;
  onInfoPress?: () => void;
  showExperienceAnimation?: boolean;
  experienceGained?: number;
}

const ChildPlantDisplay: React.FC<ChildPlantDisplayProps> = ({
  onPress,
  onInfoPress,
  showExperienceAnimation = false,
  experienceGained = 0,
}) => {
  // 커스텀 훅 사용
  const {
    plant,
    plantType,
    isLoading,
    error,
    progressPercent,
    plantImage,
    waterPlant,
    growPlant,
  } = usePlant({ isParent: false });

  // 스티커 개수 상태 관리
  const [stickerStats, setStickerStats] = useState<StickerStats>({
    totalStickers: 0,
    availableStickers: 0,
  });
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);

  // 스티커 개수 로드
  const loadStickerStats = async () => {
    try {
      setIsLoadingStickers(true);
      const stats = await stickerApi.getChildStickerStats();
      setStickerStats(stats);
    } catch (err) {
      console.error('스티커 통계 로드 실패:', err);
      // 오류 발생 시 기본값 유지
    } finally {
      setIsLoadingStickers(false);
    }
  };

  // 컴포넌트 마운트 시 스티커 개수 로드
  useEffect(() => {
    loadStickerStats();
  }, []);

  // 애니메이션 값
  const experienceAnim = useRef(new Animated.Value(0)).current;
  const experienceOpacity = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // 경험치 애니메이션 실행
  React.useEffect(() => {
    if (showExperienceAnimation && experienceGained > 0) {
      Animated.sequence([
        Animated.timing(experienceOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(experienceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(experienceOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showExperienceAnimation, experienceGained]);

  // 플랜트 바운스 애니메이션
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // 물주기 핸들러
  const handleWaterPress = async () => {
    try {
      await waterPlant();
      // 물주기 성공 로직 (예: 토스트 메시지 표시)
    } catch (err) {
      // 오류 처리 로직
      console.error('물주기 실패:', err);
    }
  };

  // 식물 성장 핸들러
  const handleGrowPress = async () => {
    try {
      await growPlant();
      // 성장 성공 로직 (예: 축하 애니메이션)
    } catch (err) {
      // 오류 처리 로직
      console.error('성장 실패:', err);
    }
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <View className="bg-white rounded-xl p-6 shadow-sm items-center justify-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text className="mt-4 text-gray-500">식물 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <View className="bg-white rounded-xl p-6 shadow-sm items-center justify-center">
        <MaterialIcons
          name="error-outline"
          size={48}
          color={Colors.light.error}
        />
        <Text className="mt-4 text-gray-500">{error}</Text>
      </View>
    );
  }

  // 식물이 없는 경우
  if (!plant) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm mt-4">
        <Pressable className="items-center" onPress={onPress}>
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4 mt-4">
            <MaterialIcons name="eco" size={36} color={Colors.light.primary} />
          </View>
          <Text className="text-lg font-bold text-primary mb-2">
            식물이 없어요
          </Text>
          <Text className="text-gray-500 text-center mb-4 px-6">
            식물을 선택하고 키워보세요!
          </Text>
          <View className="bg-primary px-5 py-2.5 rounded-lg">
            <Text className="text-white font-bold">식물 선택하기</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // 사용 가능한 스티커 개수
  const stickerCount = isLoadingStickers
    ? '...'
    : stickerStats.availableStickers;

  const experience = plant.experience ?? 0;
  const experienceToGrow = plant.experienceToGrow ?? 100;
  const canGrow = plant.canGrow ?? false;

  return (
    <View className="bg-gray-50 rounded-xl p-3">
      <Pressable
        className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200"
        style={{ aspectRatio: 0.7 }} // 포켓몬 카드 비율
        onPress={onPress}
      >
        {/* 식물 이름 헤더 - 포켓몬 카드 스타일 */}
        <View className="bg-yellow-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
          <View className="flex-row items-center">
            <Text className="font-bold text-gray-800 text-base">
              {plant.name || plantType?.name || '나의 식물'}
            </Text>
            <View className="bg-yellow-200 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-xs font-medium text-yellow-800">기본</Text>
            </View>
          </View>

          {/* 스티커 개수 표시 - API에서 가져온 데이터 사용 */}
          <View className="flex-row items-center">
            <MaterialIcons
              name="star"
              size={16}
              color="#FFD700"
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm font-bold text-yellow-600">
              {stickerCount}
            </Text>
          </View>
        </View>

        {/* 배경 영역 - 포켓몬 카드 느낌의 배경 */}
        <View className="w-full h-[50%] items-center justify-center bg-blue-50 ">
          {/* 식물 이미지 */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            }}
          >
            {plantImage ? (
              <Image
                source={plantImage}
                style={{ width: 150, height: 150 }}
                contentFit="contain"
              />
            ) : (
              <View className="bg-primary/10 p-10 rounded-full">
                <MaterialIcons
                  name="eco"
                  size={60}
                  color={Colors.light.primary}
                />
              </View>
            )}
          </Animated.View>

          {/* 경험치 획득 애니메이션 */}
          {showExperienceAnimation && experienceGained > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                top: '20%',
                right: '10%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.light.primary,
                transform: [
                  {
                    translateY: experienceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30],
                    }),
                  },
                ],
                opacity: experienceOpacity,
              }}
            >
              <View className="flex-row items-center">
                <MaterialIcons
                  name="auto-fix-high"
                  size={16}
                  color={Colors.light.primary}
                />
                <Text className="text-primary font-medium ml-1">
                  +{experienceGained} 경험치!
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* 식물 정보 영역 - 포켓몬 카드 스타일 */}
        <View className="p-3 bg-white border-t border-gray-200">
          {/* 식물 정보 */}
          <View className="mb-2 pb-2 border-b border-gray-100">
            <Text className="text-sm text-gray-500">
              {plantType?.category || '씨앗 타입'} • Lv.
              {plant.currentStage || 1}
            </Text>
          </View>

          {/* 식물 이름 및 능력 */}
          <Text className="text-base font-bold text-gray-800 mb-1">
            {plant.name || plantType?.name || '내 식물'}
          </Text>

          {/* HP 바 - 포켓몬 카드 스타일 */}
          <View className="mt-4 mb-2">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs font-bold text-red-500">HP</Text>
              <Text className="text-xs font-medium text-red-500">
                {plant.health || 100}/100
              </Text>
            </View>

            {/* HP 진행 바 */}
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden ">
              <View
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${plant.health || 100}%` }}
              />
            </View>
          </View>

          {/* 경험치 진행 바 - 포켓몬 카드의 에너지 바 느낌 */}
          <View className="mt-2 mb-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs font-medium text-gray-600">경험치</Text>
              <Text className="text-xs font-medium text-green-600">
                {experience}/{experienceToGrow}
              </Text>
            </View>

            {/* 진행 바 */}
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>

          {/* 식물 상태 메시지 */}
          <Text className="text-xs text-center mt-1 text-gray-500">
            {canGrow
              ? '성장할 준비가 되었어요!'
              : `다음 단계까지 ${experienceToGrow - experience} 경험치 남음`}
          </Text>
        </View>
      </Pressable>

      {/* 액션 버튼 영역 */}
      <PlantDisplayFootAction
        userType="child"
        onWaterPress={handleWaterPress}
        onFertilizePress={handleGrowPress}
        onTalkPress={() => {}}
        onInfoPress={onInfoPress}
      />
    </View>
  );
};

export default ChildPlantDisplay;
