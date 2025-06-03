// components/plant/ChildPlantDisplay.tsx - 모달 사용 버전
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import stickerApi from '../../api/modules/sticker';
import Colors from '../../constants/Colors';
import { usePlant } from '../../hooks/usePlant';
import RewardAchievementModal from '../common/modal/RewardAchievementModal';
import WateringSuccessModal from '../common/modal/WateringSuccessModal';
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
  // usePlant 훅 사용 - 실시간 데이터 업데이트
  const {
    plant,
    plantType,
    isLoading,
    error,
    progressPercent,
    plantImage,
    waterPlant,
    growPlant,
    refreshPlant,
  } = usePlant({ isParent: false });

  // 스티커 개수 상태 관리
  const [stickerStats, setStickerStats] = useState<StickerStats>({
    totalStickers: 0,
    availableStickers: 0,
  });
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);

  // 액션 로딩 상태
  const [isWatering, setIsWatering] = useState(false);
  const [isGrowing, setIsGrowing] = useState(false);

  // 모달 상태
  const [wateringModalVisible, setWateringModalVisible] = useState(false);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [wateringResult, setWateringResult] = useState<any>(null);
  const [rewardData, setRewardData] = useState<{
    title: string;
    stickerCount: number;
  } | null>(null);

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

  // 식물 데이터 변경 시 스티커 개수도 새로고침
  useEffect(() => {
    if (plant) {
      loadStickerStats();
    }
  }, [plant?.currentStage, plant?.experience]);

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

  // 물주기 핸들러 - 모달 사용
  const handleWaterPress = async () => {
    if (isWatering || !plant) return;

    try {
      setIsWatering(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await waterPlant();

      // 결과 저장하고 모달 표시
      setWateringResult(result);
      setWateringModalVisible(true);

      // 스티커 개수 새로고침
      loadStickerStats();
    } catch (error) {
      console.error('물주기 실패:', error);

      if (error instanceof Error) {
        if (error.message.includes('already watered')) {
          Alert.alert(
            '알림',
            '오늘은 이미 물을 줬어요. 내일 다시 시도해보세요.',
          );
        } else {
          Alert.alert('오류', '물주기 과정에서 문제가 발생했습니다.');
        }
      }
    } finally {
      setIsWatering(false);
    }
  };

  // 식물 성장 핸들러 - 기존 Alert 유지 (성장은 간단한 메시지로)
  const handleGrowPress = async () => {
    if (isGrowing || !plant || !plant.canGrow) return;

    try {
      setIsGrowing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await growPlant();

      // 성공 메시지
      if (result?.isMaxStage) {
        Alert.alert(
          '식물 성장 완료!',
          '축하합니다! 식물이 최대 단계까지 성장했어요. 이제 식물 도감에서 확인할 수 있어요.',
        );
      } else if (result?.isCompleted) {
        Alert.alert(
          '식물 성장 완료!',
          '축하합니다! 식물이 완전히 성장했어요. 이제 식물 도감에서 확인할 수 있어요.',
        );
      } else {
        Alert.alert(
          '식물 성장!',
          `식물이 ${result?.plant?.currentStage || plant.currentStage + 1}단계로 성장했어요!`,
        );
      }

      // 스티커 개수 새로고침
      loadStickerStats();
    } catch (error) {
      console.error('성장 실패:', error);
      Alert.alert('오류', '식물 성장 과정에서 문제가 발생했습니다.');
    } finally {
      setIsGrowing(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
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

  // 이제 plant가 null인 경우는 상위에서 처리하므로 여기서는 제거
  // 오류 상태만 처리
  if (error) {
    return (
      <View className="bg-white rounded-xl p-6 shadow-sm items-center justify-center">
        <MaterialIcons
          name="error-outline"
          size={48}
          color={Colors.light.error}
        />
        <Text className="mt-4 text-gray-500">{error}</Text>
        <Pressable
          className="mt-4 bg-primary py-2 px-4 rounded-lg"
          onPress={() => refreshPlant()}
        >
          <Text className="text-white font-medium">다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  // plant가 있다고 가정하고 진행

  // 사용 가능한 스티커 개수
  const stickerCount = isLoadingStickers
    ? '...'
    : stickerStats.availableStickers;

  // plant가 반드시 있다고 가정
  const experience = plant?.experience ?? 0;
  const experienceToGrow = plant?.experienceToGrow ?? 100;
  const canGrow = plant?.canGrow ?? false;

  return (
    <>
      <View className="bg-gray-50 rounded-xl p-3">
        <Pressable
          className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200"
          style={{ aspectRatio: 0.7 }} // 포켓몬 카드 비율
          onPress={handlePress}
        >
          {/* 식물 이름 헤더 - 포켓몬 카드 스타일 */}
          <View className="bg-yellow-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="font-bold text-gray-800 text-base">
                {plant?.name || plantType?.name || '식물을 선택하세요 !'}
              </Text>
              <View className="bg-yellow-200 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs font-medium text-yellow-800">
                  Lv.{plant?.currentStage}
                </Text>
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
                <View className=" p-10 rounded-full">
                  <Text className="text-gray-500 text-center">
                    식물을 선택하세요 !
                  </Text>
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
                {plant?.currentStage || 1}
              </Text>
            </View>

            {/* 식물 이름 및 능력 */}
            <Text className="text-base font-bold text-gray-800 mb-1">
              {plant?.name || plantType?.name || '내 식물'}
            </Text>

            {/* HP 바 - 포켓몬 카드 스타일 */}
            <View className="mt-4 mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-red-500">HP</Text>
                <Text className="text-xs font-medium text-red-500">
                  {plant?.health || 100}/100
                </Text>
              </View>

              {/* HP 진행 바 */}
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden ">
                <View
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${plant?.health || 100}%` }}
                />
              </View>
            </View>

            {/* 경험치 진행 바 - 포켓몬 카드의 에너지 바 느낌 */}
            <View className="mt-2 mb-1">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-medium text-gray-600">
                  경험치
                </Text>
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

      {/* 물주기 성공 모달 */}
      <WateringSuccessModal
        visible={wateringModalVisible}
        onClose={() => setWateringModalVisible(false)}
        wateringStreak={wateringResult?.wateringStreak || 1}
        healthGain={wateringResult?.wateringLog?.healthGain || 10}
        newHealth={wateringResult?.updatedPlant?.health || plant?.health || 100}
      />

      {/* 보상 달성 모달 */}
      <RewardAchievementModal
        visible={rewardModalVisible}
        onClose={() => setRewardModalVisible(false)}
        rewardTitle={rewardData?.title || ''}
        stickerCount={rewardData?.stickerCount || 0}
      />
    </>
  );
};

export default ChildPlantDisplay;
