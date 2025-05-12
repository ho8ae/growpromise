import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import { WateringLog } from '../../api/modules/plant';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function PlantDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [isWatering, setIsWatering] = useState(false);
  const [isGrowing, setIsGrowing] = useState(false);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 현재 식물 조회
  const {
    data: plant,
    isLoading: isLoadingPlant,
    error: plantError,
    refetch: refetchPlant,
  } = useQuery({
    queryKey: ['currentPlant', 'CHILD'],
    queryFn: async () => {
      if (!isAuthenticated || user?.userType !== 'CHILD') {
        return null;
      }
      return await api.plant.getCurrentPlant();
    },
    enabled: isAuthenticated && user?.userType === 'CHILD',
  });


  // 식물 타입 조회
  const { data: plantType, isLoading: isLoadingPlantType } = useQuery({
    queryKey: ['plantType', plant?.plantTypeId],
    queryFn: async () => {
      if (!plant?.plantTypeId) return null;
      return await api.plant.getPlantTypeById(plant.plantTypeId);
    },
    enabled: !!plant?.plantTypeId,
  });

  // 애니메이션 시작
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 바운스 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
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

  // 물주기 뮤테이션
  const waterPlantMutation = useMutation({
    mutationFn: async () => {
      if (!plant) throw new Error('식물이 없습니다');
      return await api.plant.waterPlant(plant.id);
    },
    onSuccess: (result) => {
      refetchPlant();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.wateringStreak > 1) {
        Alert.alert(
          '물주기 성공!',
          `연속 ${result.wateringStreak}일째 물을 주고 있어요! 식물이 건강하게 자라고 있어요. 건강도가 ${result.updatedPlant.health}%가 되었어요.`,
        );
      } else {
        Alert.alert(
          '물주기 성공!',
          `식물이 건강하게 자라고 있어요. 건강도가 ${result.updatedPlant.health}%가 되었어요.`,
        );
      }

      // 팝 애니메이션
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    },
    onError: (error) => {
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
    },
  });

  // 식물 성장 뮤테이션
  const growPlantMutation = useMutation({
    mutationFn: async () => {
      if (!plant) throw new Error('식물이 없습니다');
      return await api.plant.growPlant(plant.id);
    },
    onSuccess: (result) => {
      refetchPlant();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.isMaxStage) {
        Alert.alert(
          '식물 성장 완료!',
          '축하합니다! 식물이 최대 단계까지 성장했어요. 이제 식물 도감에서 확인할 수 있어요.',
          [
            {
              text: '도감 보기',
              onPress: () => router.push('/(child)/plant-collection'),
            },
            { text: '확인', style: 'cancel' },
          ],
        );
      } else if (result.isCompleted) {
        Alert.alert(
          '식물 성장 완료!',
          '축하합니다! 식물이 완전히 성장했어요. 이제 식물 도감에서 확인할 수 있어요.',
          [
            {
              text: '도감 보기',
              onPress: () => router.push('/(child)/plant-collection'),
            },
            { text: '확인', style: 'cancel' },
          ],
        );
      } else {
        Alert.alert(
          '식물 성장!',
          `식물이 ${result.plant.currentStage}단계로 성장했어요!`,
        );
      }

      // 팝 애니메이션
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
    onError: (error) => {
      console.error('식물 성장 실패:', error);
      Alert.alert('오류', '식물 성장 과정에서 문제가 발생했습니다.');
    },
  });

  // 물주기 처리
  const handleWaterPlant = async () => {
    if (isWatering || !plant) return;

    try {
      setIsWatering(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await waterPlantMutation.mutateAsync();
    } finally {
      setIsWatering(false);
    }
  };

  // 식물 성장시키기
  const handleGrowPlant = async () => {
    if (isGrowing || !plant) return;

    try {
      setIsGrowing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await growPlantMutation.mutateAsync();
    } finally {
      setIsGrowing(false);
    }
  };

  // 물주기 가능 여부 확인
  const canWaterPlant = () => {
    if (!plant?.lastWatered) return true;

    const lastWatered = new Date(plant.lastWatered);
    const now = new Date();

    // 마지막 물주기로부터 24시간 지났는지 확인
    const hoursDiff = Math.floor(
      (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60),
    );
    return hoursDiff >= 24;
  };

  // 물주기 시간 텍스트
  const getWateringTimeText = () => {
    if (!plant?.lastWatered) return '지금 물주기 가능!';

    const lastWatered = new Date(plant.lastWatered);
    const now = new Date();
    const hoursDiff = Math.floor(
      (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60),
    );

    if (hoursDiff >= 24) {
      return '지금 물주기 가능!';
    } else {
      return `${24 - hoursDiff}시간 후 물주기 가능`;
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 이미지 가져오기
  const getPlantImage = () => {
    if (!plant || !plantType) return null;

    // 식물의 현재 단계에 따른 이미지 경로 생성
    const imageStage = Math.max(
      1,
      Math.min(plant.currentStage, plantType.growthStages),
    );

    try {
      // 이미지는 실제 앱 개발 시 적절한 경로로 변경 필요
      return require('../../assets/images/character/level_1.png');
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      return null;
    }
  };

  // 로딩 상태
  if (isLoadingPlant || isLoadingPlantType) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.leafGreen} />
        <Text className="mt-4 text-emerald-700">
          식물 정보를 불러오는 중...
        </Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (plantError || !plant) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 p-6 justify-center items-center">
        <View className="bg-red-100 p-4 rounded-full mb-4">
          <MaterialIcons name="error" size={40} color="#ef4444" />
        </View>
        <Text className="text-red-600 text-center text-lg mb-6">
          식물 정보를 불러오는 중 오류가 발생했습니다.
        </Text>
        <Pressable
          className="bg-emerald-500 py-3 px-6 rounded-xl mb-4"
          onPress={() => refetchPlant()}
        >
          <Text className="text-white font-bold">다시 시도</Text>
        </Pressable>
        <Pressable
          className="bg-gray-300 py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-gray-700 font-bold">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '내 식물',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: Colors.light.leafGreen,
          },
          headerTintColor: Colors.light.leafGreen,
        }}
      />

      <SafeAreaView className="flex-1 bg-slate-50">
        <ScrollView className="flex-1 p-4">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* 식물 카드 */}
            <View className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 rounded-3xl p-5 shadow-sm mb-6">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-2xl font-bold text-emerald-700">
                    {plant.name || plantType?.name || '나의 식물'}
                  </Text>
                  <Text className="text-emerald-600">
                    {plantType?.category || '식물'} • 단계 {plant.currentStage}/
                    {plantType?.growthStages || 5}
                  </Text>
                </View>

                {/* 건강 상태 */}
                <View className="bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm flex-row items-center">
                  <MaterialIcons
                    name="favorite"
                    size={16}
                    color={
                      plant.health > 70
                        ? Colors.light.leafGreen
                        : plant.health > 40
                        ? Colors.light.amber
                        : '#ef4444'
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    className="font-medium"
                    style={{
                      color:
                        plant.health > 70
                          ? Colors.light.leafGreen
                          : plant.health > 40
                          ? Colors.light.amber
                          : '#ef4444',
                    }}
                  >
                    {plant.health}%
                  </Text>
                </View>
              </View>

              {/* 식물 이미지 */}
              <View className="items-center justify-center py-6">
                <Animated.View
                  style={{
                    transform: [
                      { translateY: bounceAnim },
                      { scale: scaleAnim },
                    ],
                  }}
                >
                  {getPlantImage() ? (
                    <Image
                      source={getPlantImage()}
                      style={{ width: 160, height: 160 }}
                      contentFit="contain"
                    />
                  ) : (
                    <View className="bg-emerald-100 p-10 rounded-full">
                      <MaterialIcons
                        name="eco"
                        size={80}
                        color={Colors.light.leafGreen}
                      />
                    </View>
                  )}
                </Animated.View>
              </View>

              {/* 식물 성장률 */}
              <View className="mt-2 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 font-medium">성장률</Text>
                  <Text className="text-emerald-600 font-bold">
                    {plant.currentStage}/{plantType?.growthStages || 5}
                  </Text>
                </View>

                <View className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    style={{
                      width: `${
                        (plant.currentStage / (plantType?.growthStages || 5)) *
                        100
                      }%`,
                    }}
                  />
                </View>
              </View>

              {/* 경험치 및 성장 정보 */}
              <View className="mt-2 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 font-medium">성장 단계</Text>
                  <Text className="text-emerald-600 font-bold">
                    {plant.currentStage}/{plantType?.growthStages || 5}
                  </Text>
                </View>

                <View className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    style={{
                      width: `${
                        (plant.currentStage / (plantType?.growthStages || 5)) *
                        100
                      }%`,
                    }}
                  />
                </View>
              </View>

              {/* 경험치 정보 추가 */}
              <View className="mt-2 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 font-medium">경험치</Text>
                  <Text className="text-blue-600 font-bold">
                    {plant.experience}/{plant.experienceToGrow}
                  </Text>
                </View>

                <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                    style={{
                      width: `${
                        (plant!.experience! / plant!.experienceToGrow!) * 100
                      }%`,
                    }}
                  />
                </View>

                <Text className="text-xs text-center text-gray-500 mt-1">
                  {plant?.canGrow
                    ? '식물이 성장할 준비가 되었어요! 성장시키기 버튼을 눌러보세요.'
                    : `다음 단계까지 ${
                        plant!.experienceToGrow! - plant!.experience!
                      } 경험치가 필요해요.`}
                </Text>
              </View>

              {/* 물주기 버튼 */}
              <Pressable
                className={`rounded-xl py-3.5 px-4 flex-row items-center justify-center mb-3 ${
                  canWaterPlant() ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onPress={handleWaterPlant}
                disabled={!canWaterPlant() || isWatering}
              >
                {isWatering ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons
                      name="opacity"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-bold">
                      {getWateringTimeText()}
                    </Text>
                  </>
                )}
              </Pressable>

              {/* 식물 성장 버튼 */}
              <Pressable
                className="bg-emerald-500 rounded-xl py-3.5 px-4 flex-row items-center justify-center"
                onPress={handleGrowPlant}
                disabled={isGrowing}
              >
                {isGrowing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons
                      name="auto-fix-high"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-bold">
                      식물 성장시키기
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* 식물 정보 카드 */}
            <View className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                식물 정보
              </Text>

              <View className="flex-row mb-3">
                <Text className="text-gray-500 font-medium w-28">
                  식물 종류:
                </Text>
                <Text className="text-gray-800 flex-1">
                  {plantType?.name || '알 수 없음'}
                </Text>
              </View>

              <View className="flex-row mb-3">
                <Text className="text-gray-500 font-medium w-28">
                  카테고리:
                </Text>
                <Text className="text-gray-800 flex-1">
                  {plantType?.category || '알 수 없음'}
                </Text>
              </View>

              <View className="flex-row mb-3">
                <Text className="text-gray-500 font-medium w-28">시작일:</Text>
                <Text className="text-gray-800 flex-1">
                  {formatDate(plant.startedAt)}
                </Text>
              </View>

              <View className="flex-row mb-3">
                <Text className="text-gray-500 font-medium w-28">
                  마지막 물주기:
                </Text>
                <Text className="text-gray-800 flex-1">
                  {plant.lastWatered
                    ? formatDate(plant.lastWatered)
                    : '아직 물을 준 적 없음'}
                </Text>
              </View>

              {plantType?.description && (
                <View className="mt-2 p-4 bg-gray-50 rounded-xl">
                  <Text className="text-gray-700">{plantType.description}</Text>
                </View>
              )}
            </View>

            {/* 물주기 기록 카드 */}
            {plant.wateringLogs && plant.wateringLogs.length > 0 && (
              <View className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mb-6">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  물주기 기록
                </Text>

                {plant.wateringLogs.slice(0, 5).map((log: WateringLog) => (
                  <View
                    key={log.id}
                    className="flex-row items-center py-3 border-b border-gray-100"
                  >
                    <View className="bg-blue-100 p-2 rounded-full mr-3">
                      <MaterialIcons
                        name="opacity"
                        size={16}
                        color={Colors.light.sky}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800">
                        {formatDate(log.timestamp)}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {formatTime(log.timestamp)}
                      </Text>
                    </View>
                    <Text className="text-blue-600 font-medium">
                      +{log.healthGain}%
                    </Text>
                  </View>
                ))}

                {plant.wateringLogs.length > 5 && (
                  <Text className="text-center text-blue-500 mt-3">
                    최근 5개 기록만 표시됩니다.
                  </Text>
                )}
              </View>
            )}

            {/* 성장 팁 카드 */}
            <View className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 mb-6 border border-amber-200 shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="bg-amber-200 p-2 rounded-full mr-3 shadow-sm">
                  <MaterialIcons name="lightbulb" size={16} color="#92400e" />
                </View>
                <Text className="text-lg font-bold text-amber-800">
                  식물 성장 팁
                </Text>
              </View>

              <Text className="text-amber-800 mb-1">
                1. 매일 물을 주세요. 연속으로 물을 주면 더 많은 건강도를 얻을 수
                있어요!
              </Text>
              <Text className="text-amber-800 mb-1">
                2. 약속을 완료하면 식물이 성장할 수 있어요.
              </Text>
              <Text className="text-amber-800 mb-1">
                3. 식물의 건강도가 높을수록 성장이 잘 돼요.
              </Text>
              <Text className="text-amber-800 mb-3">
                4. 모든 단계를 완료하면 식물 도감에 기록됩니다.
              </Text>

              <Pressable
                className="bg-amber-500 py-3 rounded-xl"
                onPress={() => router.push('/(child)/plant-collection')}
              >
                <Text className="text-white text-center font-bold">
                  식물 도감 보기
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
