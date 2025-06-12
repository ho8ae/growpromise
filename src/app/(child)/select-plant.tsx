import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import { PlantInventoryItem, PlantType } from '../../api/modules/plant';
import PlantTutorialModal from '../../components/common/modal/PlantTutorialModal';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { getPlantFallbackImage, getPlantImageUrl } from '../../utils/imageUrl';

export default function SelectPlantScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 상태 변수들
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(
    null,
  );
  const [plantName, setPlantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 화면 너비 계산
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 양쪽 패딩 및 간격 고려

  // 모든 식물 목록 가져오기 (기본 + 인벤토리)
  const {
    data: allPlants,
    isLoading: isLoadingPlants,
    error: plantsError,
  } = useQuery({
    queryKey: ['allPlants'],
    queryFn: async () => {
      try {
        // 1. 모든 기본 식물 가져오기
        const basicPlants = await api.plant.getAllPlantTypes();

        // 2. 인벤토리 식물 가져오기
        let inventoryItems: PlantInventoryItem[] = [];
        if (user?.userType === 'CHILD') {
          inventoryItems = await api.plant.getPlantInventory();
        }

        // 3. 기본 식물에 isBasic = true 표시
        const markedBasicPlants = basicPlants
          .filter(
            (plant) =>
              plant.isBasic ||
              plant.unlockRequirement === null ||
              plant.unlockRequirement === 0,
          )
          .map((plant) => ({
            ...plant,
            isBasic: true,
          }));

        // 4. 인벤토리 식물 추출 및 정보 추가 (quantity > 0인 식물만)
        const inventoryPlants = inventoryItems
          .filter((item) => item.quantity !== undefined && item.quantity > 0)
          .map((item) => ({
            ...item.plantType,
            isBasic: false,
            inventoryItemId: item.id,
            quantity: item.quantity, // 수량 정보 추가
          }));

        // 5. 모든 식물 목록 합치기 (중복 제거 없이 표시)
        return [...markedBasicPlants, ...inventoryPlants];
      } catch (error) {
        console.error('식물 목록 로드 실패:', error);
        throw error;
      }
    },
  });

  // 새 식물 시작하기 뮤테이션
  const startPlantMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlantType) {
        throw new Error('식물 종류를 선택해주세요.');
      }

      // 이름이 없으면 기본 이름 사용
      const name = plantName.trim() || `나의 ${selectedPlantType.name}`;
      return await api.plant.startNewPlant(selectedPlantType.id, name);
    },
    onSuccess: () => {
      // 홈 화면으로 이동
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 인벤토리 데이터 무효화 (리로드)
      queryClient.invalidateQueries({ queryKey: ['plantInventory'] });
      queryClient.invalidateQueries({ queryKey: ['allPlants'] });
      queryClient.invalidateQueries({ queryKey: ['currentPlant'] }); // 추가

      // Alert 대신 튜토리얼 모달 표시
      setShowTutorialModal(true);
    },
    onError: (error) => {
      console.error('식물 생성 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        '잠깐 !',
        '이미 식물을 키우고 있지 않나요?',
      );
    },
  });

  // 식물 선택 처리
  const handlePlantSelect = useCallback(
    (plantType: PlantType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedPlantType(plantType);
      setImageLoadError(false);

      // 팝 애니메이션
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [scaleAnim],
  );

  // 식물 이름 입력 처리
  const handleNameChange = useCallback((text: string) => {
    // 최대 12자로 제한
    if (text.length <= 12) {
      setPlantName(text);
    }
  }, []);

  // 식물 생성 제출 처리
  const handleSubmit = useCallback(async () => {
    if (!selectedPlantType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', '식물 종류를 선택해주세요.');
      return;
    }

    // 인벤토리 식물인 경우 수량이 0이면 경고
    if (
      !selectedPlantType.isBasic &&
      (!selectedPlantType.quantity || selectedPlantType.quantity <= 0)
    ) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', '해당 식물의 보유 수량이 부족합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await startPlantMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlantType, startPlantMutation]);

  // 이미지 로드 오류 처리
  const handleImageError = useCallback(() => {
    console.log('이미지 로드 실패:', selectedPlantType?.imagePrefix);
    setImageLoadError(true);
  }, [selectedPlantType?.imagePrefix]);

  // 식물 상점 이동
  const handleGoToStore = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/store-tab');
  }, [router]);

  const handleTutorialComplete = () => {
    setShowTutorialModal(false);
    router.back(); // 홈으로 돌아가기
  };

  // 유틸리티 함수들
  const getDifficultyText = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      default:
        return '보통';
    }
  }, []);

  const getCategoryText = useCallback((category: string) => {
    switch (category) {
      case 'FLOWER':
        return '꽃';
      case 'TREE':
        return '나무';
      case 'VEGETABLE':
        return '채소';
      case 'FRUIT':
        return '과일';
      case 'OTHER':
        return '기타';
      default:
        return '식물';
    }
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'FLOWER':
        return '#ec4899'; // pink-500
      case 'TREE':
        return '#10b981'; // emerald-500
      case 'VEGETABLE':
        return '#84cc16'; // lime-500
      case 'FRUIT':
        return '#f59e0b'; // amber-500
      case 'OTHER':
        return '#8b5cf6'; // violet-500
      default:
        return '#10b981'; // emerald-500
    }
  }, []);

  const getRarityColor = useCallback((rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return '#9ca3af'; // 회색
      case 'UNCOMMON':
        return '#22c55e'; // 초록
      case 'RARE':
        return '#3b82f6'; // 파랑
      case 'EPIC':
        return '#a855f7'; // 보라
      case 'LEGENDARY':
        return '#f59e0b'; // 노랑/금색
      default:
        return '#9ca3af';
    }
  }, []);

  const getRarityText = useCallback((rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return '일반';
      case 'UNCOMMON':
        return '특별';
      case 'RARE':
        return '희귀';
      case 'EPIC':
        return '영웅';
      case 'LEGENDARY':
        return '전설';
      default:
        return '일반';
    }
  }, []);

  const getDifficultyStars = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 1;
      case 'MEDIUM':
        return 2;
      case 'HARD':
        return 3;
      default:
        return 2;
    }
  }, []);

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
  }, [fadeAnim, slideAnim]);

  // 모든 식물 카테고리 (중복 제거)
  const allCategories = useMemo(() => {
    return Array.from(
      new Set((allPlants || []).map((plant) => plant.category)),
    );
  }, [allPlants]);

  // 필터링된 식물 목록 계산
  const filteredPlants = useMemo(() => {
    return (allPlants || []).filter(
      (plantType) => !filterCategory || plantType.category === filterCategory,
    );
  }, [allPlants, filterCategory]);

  // 식물 카드 렌더링 함수
  const renderPlantCard = useCallback(
    (plantType: PlantType) => {
      const isSelected = selectedPlantType?.id === plantType.id;
      const isInventory = !plantType.isBasic;

      return (
        <Pressable
          key={`${plantType.id}-${isInventory ? 'inventory' : 'basic'}`}
          className={`mb-4 rounded-xl overflow-hidden ${
            isSelected
              ? 'border-2 border-emerald-500'
              : 'border border-gray-200'
          }`}
          style={[{ width: cardWidth }, styles.plantCard]}
          onPress={() => handlePlantSelect(plantType)}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: selectedPlantType?.id === plantType.id ? scaleAnim : 1,
                },
              ],
            }}
            className="bg-white p-2"
          >
            {/* 기본/뽑기 배지 */}
            <View className="absolute right-1 top-1 z-10">
              <View
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: plantType.isBasic
                    ? '#10b981' // 기본 식물
                    : getRarityColor(plantType.rarity || 'COMMON'), // 뽑은 식물
                  opacity: 0.9,
                }}
              >
                <Text className="text-white text-xs font-medium">
                  {plantType.isBasic
                    ? '기본'
                    : getRarityText(plantType.rarity || 'COMMON')}
                </Text>
              </View>
            </View>

            {/* 수량 배지 - 인벤토리 식물에만 표시 */}
            {isInventory && plantType.quantity && plantType.quantity > 0 && (
              <View className="absolute left-1 top-1 z-10">
                <View className="w-6 h-6 rounded-full bg-indigo-500 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {plantType.quantity}
                  </Text>
                </View>
              </View>
            )}

            <View className="items-center justify-center mb-3 p-2">
              {imageLoadError && selectedPlantType?.id === plantType.id ? (
                <Image
                  source={getPlantFallbackImage(plantType.imagePrefix)}
                  style={{ width: 90, height: 90 }}
                  contentFit="contain"
                />
              ) : (
                <Image
                  source={{ uri: getPlantImageUrl(plantType.imagePrefix) }}
                  style={{ width: 90, height: 90 }}
                  contentFit="contain"
                  placeholder={getPlantFallbackImage(plantType.imagePrefix)}
                  onError={
                    selectedPlantType?.id === plantType.id
                      ? handleImageError
                      : undefined
                  }
                />
              )}
            </View>

            <Text className="text-base font-bold text-gray-800 mb-1">
              {plantType.name}
            </Text>

            <View className="flex-row flex-wrap items-center mb-1">
              <View
                className="px-2 py-0.5 rounded-full mr-2 mb-1"
                style={{
                  backgroundColor: `${getCategoryColor(plantType.category)}20`,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: getCategoryColor(plantType.category),
                  }}
                >
                  {getCategoryText(plantType.category)}
                </Text>
              </View>
            </View>

            <View className="flex-row mb-1">
              {Array.from({
                length: getDifficultyStars(plantType.difficulty),
              }).map((_, i) => (
                <MaterialIcons
                  key={i}
                  name="star"
                  size={12}
                  color="#fbbf24"
                  style={{ marginRight: 1 }}
                />
              ))}
            </View>

            <Text className="text-xs text-gray-500 mb-2">
              성장 단계: {plantType.growthStages}단계
            </Text>
          </Animated.View>
        </Pressable>
      );
    },
    [
      cardWidth,
      getCategoryColor,
      getCategoryText,
      getDifficultyStars,
      getRarityColor,
      getRarityText,
      handleImageError,
      handlePlantSelect,
      imageLoadError,
      scaleAnim,
      selectedPlantType?.id,
    ],
  );

  // 로딩 상태
  if (isLoadingPlants) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text className="mt-4 text-emerald-700">
          식물 정보를 불러오는 중...
        </Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (plantsError) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4 justify-center items-center">
        <View className="bg-red-100 p-4 rounded-full mb-4">
          <MaterialIcons name="error" size={40} color="#ef4444" />
        </View>
        <Text className="text-red-600 text-center mb-6">
          식물 정보를 불러오는 중 오류가 발생했습니다.
        </Text>
        <Pressable
          className="bg-emerald-500 py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '식물 선택하기',
          headerShown: false,
        }}
      />

      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-3 bg-white">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="px-4"
            >
              <Text className="text-2xl font-bold text-emerald-700 mb-2">
                키우고 싶은 식물을 선택해주세요
              </Text>
              <Text className="text-gray-600 mb-4">
                약속을 지키면서 당신만의 식물을 키워보세요. 약속을 완료할수록
                식물이 쑥쑥 자라요!
              </Text>
            </Animated.View>
          </View>

          <View className="px-4">
            {/* 카테고리 필터 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5 mt-2"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              <Pressable
                onPress={() => setFilterCategory(null)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  filterCategory === null ? 'bg-emerald-500' : 'bg-gray-100'
                }`}
                style={
                  filterCategory === null ? styles.activeFilterShadow : null
                }
              >
                <Text
                  className={
                    filterCategory === null
                      ? 'text-white font-medium'
                      : 'text-gray-700'
                  }
                >
                  전체
                </Text>
              </Pressable>

              {allCategories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setFilterCategory(category)}
                  className={`px-4 py-2 mr-2 rounded-full flex-row items-center ${
                    filterCategory === category
                      ? 'bg-emerald-500'
                      : 'bg-gray-100'
                  }`}
                  style={
                    filterCategory === category
                      ? styles.activeFilterShadow
                      : null
                  }
                >
                  <MaterialIcons
                    name="nature"
                    size={16}
                    color={filterCategory === category ? 'white' : '#4b5563'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    className={
                      filterCategory === category
                        ? 'text-white font-medium'
                        : 'text-gray-700'
                    }
                  >
                    {getCategoryText(category)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 식물 뽑기 안내 배너 */}
            <Pressable
              className="bg-blue-50 p-4 rounded-xl mb-5 border border-blue-100"
              onPress={handleGoToStore}
            >
              <View className="flex-row items-start">
                <MaterialIcons
                  name="emoji-nature"
                  size={20}
                  color="#3b82f6"
                  className="mt-0.5"
                />
                <View className="ml-2 flex-1">
                  <Text className="text-blue-800 font-bold">
                    더 많은 특별한 식물이 필요하세요?
                  </Text>
                  <Text className="text-blue-700 mt-1">
                    미션을 완수하고 보상을 받아보세요 !
                  </Text>
                  <View className="bg-blue-500 self-start py-1 px-3 rounded-full mt-2">
                    <Text className="text-white text-sm font-medium">
                      상점으로 이동
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {/* 식물 목록 */}
            <View className="mb-2">
              <Text className="text-lg font-bold text-gray-800">
                사용 가능한 식물 ({filteredPlants.length})
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {filteredPlants.length > 0 ? (
                filteredPlants.map((plantType) => renderPlantCard(plantType))
              ) : (
                <View className="w-full bg-gray-50 py-4 rounded-xl items-center">
                  <Text className="text-gray-500">
                    {filterCategory
                      ? `선택한 카테고리의 식물이 없습니다.`
                      : '사용 가능한 식물이 없습니다.'}
                  </Text>
                </View>
              )}
            </View>

            {/* 선택된 식물 정보 */}
            {selectedPlantType && (
              <View
                className="mt-4 mb-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100"
                style={styles.selectedPlantInfo}
              >
                <Text className="text-lg font-bold text-emerald-700 mb-2">
                  선택한 식물: {selectedPlantType.name}
                </Text>

                <View className="flex-row mb-3">
                  <View className="items-center justify-center mr-4">
                    {imageLoadError ? (
                      <Image
                        source={getPlantFallbackImage(
                          selectedPlantType.imagePrefix,
                        )}
                        style={{ width: 80, height: 80 }}
                        contentFit="contain"
                      />
                    ) : (
                      <Image
                        source={{
                          uri: getPlantImageUrl(selectedPlantType.imagePrefix),
                        }}
                        style={{ width: 80, height: 80 }}
                        contentFit="contain"
                        placeholder={getPlantFallbackImage(
                          selectedPlantType.imagePrefix,
                        )}
                        onError={handleImageError}
                      />
                    )}
                  </View>

                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons
                        name="local-florist"
                        size={16}
                        color={getCategoryColor(selectedPlantType.category)}
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-gray-700">
                        {getCategoryText(selectedPlantType.category)}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-1">
                      <MaterialIcons
                        name="speed"
                        size={16}
                        color="#6b7280"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-gray-700">
                        난이도:{' '}
                        {getDifficultyText(selectedPlantType.difficulty)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="bar-chart"
                        size={16}
                        color="#6b7280"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-gray-700">
                        성장 단계: {selectedPlantType.growthStages}단계
                      </Text>
                    </View>

                    {/* 타입 표시 */}
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons
                        name={
                          selectedPlantType.isBasic ? 'emoji-nature' : 'diamond'
                        }
                        size={16}
                        color={
                          selectedPlantType.isBasic
                            ? '#10b981'
                            : getRarityColor(
                                selectedPlantType.rarity || 'COMMON',
                              )
                        }
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        className="font-medium"
                        style={{
                          color: selectedPlantType.isBasic
                            ? '#10b981'
                            : getRarityColor(
                                selectedPlantType.rarity || 'COMMON',
                              ),
                        }}
                      >
                        {selectedPlantType.isBasic
                          ? '기본 식물'
                          : `${getRarityText(
                              selectedPlantType.rarity || 'COMMON',
                            )} 식물`}
                      </Text>
                    </View>

                    {/* 수량 표시 - 인벤토리 식물에만 표시 */}
                    {!selectedPlantType.isBasic &&
                      selectedPlantType.quantity && (
                        <View className="flex-row items-center mt-1">
                          <MaterialIcons
                            name="inventory"
                            size={16}
                            color="#4f46e5"
                            style={{ marginRight: 6 }}
                          />
                          <Text className="text-indigo-700 font-medium">
                            보유 수량: {selectedPlantType.quantity}개
                          </Text>
                        </View>
                      )}

                    {/* 소비 안내 - 인벤토리 식물에만 표시 */}
                    {!selectedPlantType.isBasic && (
                      <View className="flex-row items-center mt-2 bg-indigo-50 px-2 py-1 rounded-md">
                        <MaterialIcons
                          name="info"
                          size={14}
                          color="#6366f1"
                          style={{ marginRight: 4 }}
                        />
                        <Text className="text-xs text-indigo-700 flex-wrap">
                          선택 시 인벤토리에서 1개가 소비됩니다
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {selectedPlantType.description && (
                  <Text className="text-gray-700 mb-2">
                    {selectedPlantType.description}
                  </Text>
                )}
              </View>
            )}

            {/* 식물 이름 입력 */}
            {selectedPlantType && (
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-emerald-700">
                    식물 이름 지정 (선택)
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {plantName.length}/12
                  </Text>
                </View>

                <View className="flex-row items-center border-2 border-emerald-100 rounded-xl px-4 py-2 bg-white">
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color="#059669"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={plantName}
                    onChangeText={handleNameChange}
                    placeholder={`나의 ${selectedPlantType?.name || '식물'}`}
                    className="flex-1 text-gray-700 text-sm"
                    maxLength={12}
                  />
                  {plantName.length > 0 && (
                    <Pressable
                      onPress={() => setPlantName('')}
                      className="rounded-full p-1"
                      hitSlop={10}
                    >
                      <MaterialIcons name="close" size={18} color="#9ca3af" />
                    </Pressable>
                  )}
                </View>
                <Text className="text-gray-500 text-sm mt-1 ml-1">
                  식물 이름을 입력하지 않으면 기본 이름으로 설정됩니다.
                </Text>
              </View>
            )}

            {/* 하단 버튼 */}
            {selectedPlantType && (
              <View className="px-4 mt-3">
                <Pressable
                  className={`py-4 rounded-xl ${
                    isSubmitting ? 'bg-emerald-300' : 'bg-emerald-500'
                  }`}
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  style={styles.submitButton}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-center text-lg">
                      이 식물 키우기 시작하기
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <PlantTutorialModal
        visible={showTutorialModal}
        onClose={handleTutorialComplete}
        plantName={
          plantName.trim() || `나의 ${selectedPlantType?.name || '식물'}`
        }
        plantType={selectedPlantType?.name || ''}
      />
    </>
  );
}

const styles = StyleSheet.create({
  plantCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedPlantInfo: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterShadow: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
});
