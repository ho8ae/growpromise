import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ExperienceGainAnimation from '../../components/plant/ExperienceGainAnimation';
import Colors from '../../constants/Colors';
import { usePlant } from '../../hooks/usePlant';

export default function ParentChildPlantDetailScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const [showWateringLogs, setShowWateringLogs] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [showExperienceAnimation, setShowExperienceAnimation] = useState(false);
  const [experienceGained, setExperienceGained] = useState(10);
  const insets = useSafeAreaInsets();

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // usePlant 훅을 사용하여 식물 데이터 관리
  const {
    plant,
    plantType,
    isLoading,
    error,
    progressPercent,
    plantImage,
    waterPlant,
    refreshPlant,
  } = usePlant({
    childId,
    isParent: true,
  });

  // 애니메이션 시작
  useEffect(() => {
    if (!childId) return; // childId가 없으면 애니메이션 실행하지 않음

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
  }, [childId]); // childId를 종속성으로 추가

  // API 호출 전 자녀 ID 확인
  if (!childId) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <MaterialIcons name="error" size={40} color={Colors.light.error} />
        <Text className="mt-4 text-red-500">자녀 ID가 필요합니다.</Text>
        <Pressable
          className="mt-4 bg-primary py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // 물주기 처리 기능 사용 안함(5/16)
  const handleWaterPlant = async () => {
    if (isWatering || !plant) return;

    try {
      setIsWatering(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // waterPlant 호출하여 물주기 처리
      const result = await waterPlant();

      // 경험치 획득 애니메이션 표시
      setExperienceGained(result?.experienceGained || 10);
      setShowExperienceAnimation(true);

      // 연속 물주기 메시지
      if (result?.wateringStreak > 1) {
        Alert.alert(
          '물주기 성공!',
          `연속 ${result.wateringStreak}일째 물을 주고 있어요! 식물이 건강하게 자라고 있어요.`,
        );
      } else {
        Alert.alert(
          '물주기 성공!',
          `식물이 건강하게 자라고 있어요. 건강도가 ${
            result?.updatedPlant?.health || plant.health
          }%가 되었어요.`,
        );
      }

      // 애니메이션 효과
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

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text className="mt-4 text-gray-500">정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !plant) {
    return (
      <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
        <View className="bg-red-100 p-4 rounded-full mb-4">
          <MaterialIcons name="error" size={40} color={Colors.light.error} />
        </View>
        <Text className="text-red-600 text-center text-lg mb-6">
          {error || '식물 정보를 불러오는 중 오류가 발생했습니다.'}
        </Text>
        <Pressable
          className="bg-primary py-3 px-6 rounded-xl mb-4"
          onPress={() => refreshPlant()}
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

  const experience = plant.experience ?? 0;
  const experienceToGrow = plant.experienceToGrow ?? 100;
  const canGrow = plant.canGrow ?? false;
  //   const childName = childInfo?.username || '자녀';

  return (
    <>
      {/* 안보이게 */}
      <Stack.Screen
        options={{
          title: '',
          headerShown: false,
        }}
      />

      <View className="flex-1 bg-gray-50">
        <ScrollView style={{ paddingTop: insets.top }} className="flex-1">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="p-4"
          >
            {/* 자녀 정보 */}
            {/* <View className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <View className="flex-row items-center">
                <MaterialIcons name="person" size={24} color={Colors.light.parent} />
                <Text className="ml-2 text-lg font-bold text-blue-700">
                  {childName}의 식물
                </Text>
              </View>
            </View> */}

            {/* 식물 카드 - 포켓몬 카드 스타일 */}
            <View className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
              {/* 식물 이름 헤더 */}
              <View className="bg-yellow-50 px-2 py-2.5 flex-row justify-between items-center border-b border-gray-200">
                <View className="flex-row items-center">
                  <Text className="font-bold text-gray-800 text-base">
                    {plant.name || plantType?.name || '나의 식물'}
                  </Text>
                  <View className="bg-yellow-200 rounded-full px-2 py-0.5 ml-2">
                    <Text className="text-xs font-medium text-yellow-800">
                      Lv.{plant.currentStage}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 배경 영역 */}
              <View className="w-full items-center justify-center bg-blue-50 py-16">
                {/* 식물 이미지 */}
                <Animated.View
                  style={{
                    transform: [
                      { translateY: bounceAnim },
                      { scale: scaleAnim },
                    ],
                  }}
                >
                  {plantImage ? (
                    <Image
                      source={plantImage}
                      style={{ width: 160, height: 160 }}
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
                {showExperienceAnimation && (
                  <ExperienceGainAnimation
                    amount={experienceGained}
                    onAnimationComplete={() =>
                      setShowExperienceAnimation(false)
                    }
                  />
                )}
              </View>

              {/* 식물 정보 영역 */}
              <View className="p-4 bg-white">
                {/* 식물 정보 */}
                <View className="mb-2 pb-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">
                    {plantType?.category || '씨앗 타입'} • Lv.
                    {plant.currentStage || 1}
                  </Text>
                </View>

                {/* 식물 이름 및 능력 */}
                <Text className="text-base font-bold text-gray-800 mb-2">
                  {plant.name || plantType?.name || '내 식물'}
                </Text>

                {/* HP 바 */}
                <View className="mt-2 mb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-xs font-bold"
                      style={{ color: Colors.light.error }}
                    >
                      HP
                    </Text>
                    <Text
                      className="text-xs font-medium"
                      style={{ color: Colors.light.error }}
                    >
                      {plant.health || 100}/100
                    </Text>
                  </View>

                  {/* HP 진행 바 */}
                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${plant.health || 100}%`,
                        backgroundColor: Colors.light.error,
                      }}
                    />
                  </View>
                </View>

                {/* 경험치 진행 바 */}
                <View className="mt-2 mb-1">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs font-medium text-gray-600">
                      경험치
                    </Text>
                    <Text
                      className="text-xs font-medium"
                      style={{ color: Colors.light.primary }}
                    >
                      {experience}/{experienceToGrow}
                    </Text>
                  </View>

                  {/* 진행 바 */}
                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: Colors.light.primary,
                      }}
                    />
                  </View>
                </View>

                {/* 식물 상태 메시지 */}
                <Text className="text-xs text-center mt-2 text-gray-500">
                  {canGrow
                    ? '성장할 준비가 되었어요!'
                    : `다음 단계까지 ${
                        experienceToGrow - experience
                      } 경험치 남음`}
                </Text>
              </View>
            </View>

            {/* 액션 버튼 영역 */}
            <View className="mb-6">
              {/* 물주기 버튼 5/16 자녀만 가능한 상태*/}
              {/* <Pressable
                className={`w-full rounded-xl py-4 mb-3 items-center justify-center ${
                  canWaterPlant() ? 'bg-info' : 'bg-gray-300'
                }`}
                onPress={handleWaterPlant}
                disabled={!canWaterPlant() || isWatering}
              >
                {isWatering ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="opacity"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-bold">
                      물주기
                    </Text>
                  </View>
                )}
              </Pressable> */}

              {/* 약속 관리 버튼 */}
              <Pressable
                className="w-full rounded-xl py-4 mb-3 items-center justify-center bg-primary"
                onPress={() =>
                  router.push({
                    pathname: '/(parent)/manage-promises',
                    params: { childId },
                  })
                }
              >
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="assignment"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold">약속 관리하기</Text>
                </View>
              </Pressable>

              {/* 보상 설정 버튼 */}
              <Pressable
                className="w-full rounded-xl py-4 items-center justify-center bg-secondary"
                onPress={() =>
                  router.push({
                    pathname: '/(parent)/child-rewards',
                    params: { childId },
                  })
                }
              >
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="star"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold">보상 관리하기</Text>
                </View>
              </Pressable>
            </View>

            {/* 식물 정보 카드 */}
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
              <View
                className="px-4 py-3 border-b border-gray-200"
                style={{ backgroundColor: 'rgba(88, 204, 2, 0.1)' }}
              >
                <Text className="font-bold text-gray-800 text-base">
                  식물 정보
                </Text>
              </View>

              <View className="p-4">
                <View className="flex-row mb-2">
                  <Text className="text-gray-500 font-medium w-24">
                    식물 종류:
                  </Text>
                  <Text className="text-gray-800 flex-1">
                    {plantType?.name || '알 수 없음'}
                  </Text>
                </View>

                <View className="flex-row mb-2">
                  <Text className="text-gray-500 font-medium w-24">
                    카테고리:
                  </Text>
                  <Text className="text-gray-800 flex-1">
                    {plantType?.category || '알 수 없음'}
                  </Text>
                </View>

                <View className="flex-row mb-2">
                  <Text className="text-gray-500 font-medium w-24">
                    시작일:
                  </Text>
                  <Text className="text-gray-800 flex-1">
                    {plant.startedAt
                      ? formatDate(plant.startedAt)
                      : '정보 없음'}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-gray-500 font-medium w-24">
                    마지막 물주기:
                  </Text>
                  <Text className="text-gray-800 flex-1">
                    {plant.lastWatered
                      ? formatDate(plant.lastWatered)
                      : '아직 물을 준 적 없음'}
                  </Text>
                </View>
              </View>

              {plantType?.description && (
                <View className="m-2 p-2 bg-gray-50 rounded-xl">
                  <Text className="text-gray-700 text-sm">
                    {plantType.description}
                  </Text>
                </View>
              )}
            </View>

            {/* 물주기 상태 카드 */}
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
              <View
                className="px-4 py-3 border-b border-gray-200"
                style={{ backgroundColor: 'rgba(28, 176, 246, 0.1)' }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-gray-800 text-base">
                    물주기 상태
                  </Text>
                  {/* 물주기 스트릭 표시 아직 기능 구현 안됨*/}
                  {/* {plant.wateringStreak > 0 && (
                    <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full">
                      <MaterialIcons name="local-fire-department" size={16} color="#FF9500" />
                      <Text className="text-yellow-700 font-bold ml-1">
                        {plant.wateringStreak}일째
                      </Text>
                    </View>
                  )} */}
                </View>
              </View>

              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <View
                    className="p-2 rounded-full mr-3"
                    style={{ backgroundColor: 'rgba(28, 176, 246, 0.2)' }}
                  >
                    <MaterialIcons
                      name="opacity"
                      size={20}
                      color={Colors.light.info}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      다음 물주기
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {getWateringTimeText()}
                    </Text>
                  </View>

                  {/* 물주기 기록 보기 버튼 */}
                  {plant.wateringLogs && plant.wateringLogs.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowWateringLogs(true)}
                      className="px-3 py-1.5 bg-blue-100 rounded-lg"
                    >
                      <Text className="text-blue-600 text-sm font-medium">
                        기록 보기
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* 물주기 기록 모달 */}
        <Modal
          visible={showWateringLogs}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowWateringLogs(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-5">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  물주기 기록
                </Text>
                <TouchableOpacity onPress={() => setShowWateringLogs(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {plant.wateringLogs && plant.wateringLogs.length > 0 ? (
                <ScrollView className="max-h-96">
                  {plant.wateringLogs.map((log: any) => (
                    <View
                      key={log.id}
                      className="flex-row items-center py-3 border-b border-gray-100"
                    >
                      <View
                        className="p-2 rounded-full mr-3"
                        style={{ backgroundColor: 'rgba(28, 176, 246, 0.2)' }}
                      >
                        <MaterialIcons
                          name="opacity"
                          size={16}
                          color={Colors.light.info}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-medium">
                          {formatDate(log.timestamp)}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {formatTime(log.timestamp)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text
                          style={{ color: Colors.light.info }}
                          className="font-medium"
                        >
                          +{log.healthGain || 3}%
                        </Text>
                        {log.experienceGain > 0 && (
                          <View className="ml-2 flex-row items-center bg-green-100 px-2 py-0.5 rounded-full">
                            <MaterialIcons
                              name="auto-fix-high"
                              size={12}
                              color={Colors.light.primary}
                            />
                            <Text
                              className="text-xs ml-0.5"
                              style={{ color: Colors.light.primary }}
                            >
                              +{log.experienceGain}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View className="py-6 items-center">
                  <MaterialIcons name="inbox" size={48} color="#ddd" />
                  <Text className="text-gray-500 mt-2">
                    물주기 기록이 없습니다
                  </Text>
                </View>
              )}

              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-xl mt-4"
                onPress={() => setShowWateringLogs(false)}
              >
                <Text className="text-white text-center font-medium">닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
