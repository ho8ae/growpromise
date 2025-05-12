import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Colors from '../../constants/Colors';
import api from '../../api';
import { PlantType } from '../../api/modules/plant';

export default function SelectPlantScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);
  const [plantName, setPlantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 화면 너비 계산
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 양쪽 패딩 및 간격 고려

  // 모든 식물 유형 목록 가져오기
  const { data: plantTypes, isLoading, error } = useQuery({
    queryKey: ['plantTypes'],
    queryFn: async () => {
      try {
        return await api.plant.getAllPlantTypes();
      } catch (error) {
        console.error('식물 유형 목록 로드 실패:', error);
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
      // 성공 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
      
      // 홈 화면으로 이동
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('식물 키우기 시작!', '새로운 식물 키우기를 시작했어요. 약속을 완료하고 물을 주며 식물을 키워보세요!', [
        { 
          text: '확인', 
          onPress: () => router.replace('/(tabs)') 
        },
      ]);
    },
    onError: (error) => {
      console.error('식물 생성 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '식물 생성 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  });

  // 식물 선택 처리
  const handlePlantSelect = (plantType: PlantType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlantType(plantType);
    
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
  };

  // 식물 이름 입력 처리
  const handleNameChange = (text: string) => {
    // 최대 12자로 제한
    if (text.length <= 12) {
      setPlantName(text);
    }
  };

  // 식물 생성 제출 처리
  const handleSubmit = async () => {
    if (!selectedPlantType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', '식물 종류를 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await startPlantMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 난이도 텍스트 변환
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '쉬움';
      case 'MEDIUM': return '보통';
      case 'HARD': return '어려움';
      default: return '보통';
    }
  };

  // 카테고리 텍스트 변환
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'FLOWER': return '꽃';
      case 'TREE': return '나무';
      case 'VEGETABLE': return '채소';
      case 'FRUIT': return '과일';
      case 'OTHER': return '기타';
      default: return '식물';
    }
  };

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FLOWER': return '#ec4899'; // pink-500
      case 'TREE': return '#10b981'; // emerald-500
      case 'VEGETABLE': return '#84cc16'; // lime-500
      case 'FRUIT': return '#f59e0b'; // amber-500
      case 'OTHER': return '#8b5cf6'; // violet-500
      default: return '#10b981'; // emerald-500
    }
  };

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
  }, []);

  // 난이도에 따른 별 개수
  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 1;
      case 'MEDIUM': return 2;
      case 'HARD': return 3;
      default: return 2;
    }
  };

  // 식물 이미지 가져오기 (테스트용 이미지 사용)
  const getPlantImage = (plantType: PlantType) => {
    try {
      // 실제 앱에서는 plantType.imagePrefix를 사용해 각 식물 타입에 맞는 이미지 로드
      // 여기서는 테스트용으로 단계별 이미지 사용
      return require('../../assets/images/character/level_1.png');
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      return null;
    }
  };

  // 필터링된 식물 타입 목록
  const filteredPlantTypes = plantTypes?.filter(
    plantType => !filterCategory || plantType.category === filterCategory
  ) || [];

  // 카테고리 목록 (중복 제거)
  const categories = plantTypes 
    ? Array.from(new Set(plantTypes.map(plant => plant.category)))
    : [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.leafGreen} />
        <Text className="mt-4 text-emerald-700">식물 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 p-4 justify-center items-center">
        <View className="bg-red-100 p-4 rounded-full mb-4">
          <MaterialIcons name="error" size={40} color="#ef4444" />
        </View>
        <Text className="text-red-600 text-center mb-6">식물 정보를 불러오는 중 오류가 발생했습니다.</Text>
        <Pressable
          className="bg-emerald-500 py-3 px-6 rounded-xl"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: '식물 선택하기',
        headerTitleStyle: { 
          fontWeight: 'bold',
          color: Colors.light.leafGreen
        },
        headerTintColor: Colors.light.leafGreen
      }} />
    
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScrollView className="flex-1 p-4">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="text-2xl font-bold text-emerald-700 mb-2">
              키우고 싶은 식물을 선택해주세요
            </Text>
            <Text className="text-gray-600 mb-6">
              약속을 지키면서 당신만의 식물을 키워보세요. 약속을 완료할수록 식물이 쑥쑥 자라요!
            </Text>

            {/* 카테고리 필터 */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="mb-4"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              <Pressable
                onPress={() => setFilterCategory(null)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  filterCategory === null 
                    ? 'bg-emerald-100 border-emerald-300' 
                    : 'bg-gray-100 border-gray-200'
                } border`}
              >
                <Text 
                  className={filterCategory === null 
                    ? 'text-emerald-700 font-medium' 
                    : 'text-gray-700'
                  }
                >
                  전체
                </Text>
              </Pressable>
              
              {categories.map(category => (
                <Pressable
                  key={category}
                  onPress={() => setFilterCategory(category)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    filterCategory === category 
                      ? 'bg-emerald-100 border-emerald-300' 
                      : 'bg-gray-100 border-gray-200'
                  } border`}
                >
                  <Text 
                    className={filterCategory === category 
                      ? 'text-emerald-700 font-medium' 
                      : 'text-gray-700'
                    }
                  >
                    {getCategoryText(category)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 식물 선택 영역 */}
            <View className="flex-row flex-wrap justify-between">
              {filteredPlantTypes.map((plantType) => (
                <Pressable
                  key={plantType.id}
                  className={`mb-4 rounded-xl overflow-hidden shadow-sm ${
                    selectedPlantType?.id === plantType.id
                      ? 'border-2 border-emerald-500'
                      : 'border border-gray-200'
                  }`}
                  style={{ width: cardWidth }}
                  onPress={() => handlePlantSelect(plantType)}
                >
                  <Animated.View
                    style={{
                      transform: [
                        { scale: selectedPlantType?.id === plantType.id ? scaleAnim : 1 }
                      ]
                    }}
                    className="bg-white p-3"
                  >
                    <View className="items-center justify-center mb-3 p-4">
                      <Image
                        source={getPlantImage(plantType)}
                        style={{ width: 80, height: 80 }}
                        contentFit="contain"
                      />
                    </View>
                    
                    <Text className="text-lg font-bold text-gray-800 mb-1">
                      {plantType.name}
                    </Text>
                    
                    <View className="flex-row items-center mb-1">
                      <View 
                        className="px-2 py-0.5 rounded-full mr-2"
                        style={{ backgroundColor: `${getCategoryColor(plantType.category)}20` }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: getCategoryColor(plantType.category) }}
                        >
                          {getCategoryText(plantType.category)}
                        </Text>
                      </View>
                      
                      <View className="flex-row">
                        {Array.from({ length: getDifficultyStars(plantType.difficulty) }).map((_, i) => (
                          <MaterialIcons 
                            key={i} 
                            name="star" 
                            size={14} 
                            color="#fbbf24" 
                            style={{ marginRight: 1 }} 
                          />
                        ))}
                      </View>
                    </View>
                    
                    <Text className="text-xs text-gray-500 mb-2">
                      성장 단계: {plantType.growthStages}단계
                    </Text>
                    
                    {plantType.description && (
                      <Text className="text-gray-600 text-sm" numberOfLines={2}>
                        {plantType.description}
                      </Text>
                    )}
                  </Animated.View>
                </Pressable>
              ))}
            </View>

            {/* 식물 이름 입력 */}
            {selectedPlantType && (
              <View className="mt-4 mb-6">
                <Text className="text-lg font-bold text-emerald-700 mb-2">
                  식물 이름 지정 (선택)
                </Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                  value={plantName}
                  onChangeText={handleNameChange}
                  placeholder={`나의 ${selectedPlantType.name}`}
                  maxLength={12}
                />
                <Text className="text-gray-500 text-right mt-1">
                  {plantName.length}/12
                </Text>
              </View>
            )}

            {/* 시작하기 버튼 */}
            <Pressable
              className={`mt-2 mb-6 rounded-xl ${
                selectedPlantType ? 'opacity-100' : 'opacity-50'
              }`}
              onPress={handleSubmit}
              disabled={!selectedPlantType || isSubmitting}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                className="py-4 rounded-xl"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">
                    {selectedPlantType ? '이 식물 키우기 시작!' : '식물을 선택해주세요'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* 안내 메시지 */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="info" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text className="font-bold text-blue-700">식물 키우기 방법</Text>
              </View>
              <Text className="text-blue-800 mb-1">1. 약속을 완료하면 식물이 성장합니다.</Text>
              <Text className="text-blue-800 mb-1">2. 매일 물을 주면 식물이 더 건강해집니다.</Text>
              <Text className="text-blue-800 mb-1">3. 모든 성장 단계를 완료하면 도감에 기록됩니다.</Text>
              <Text className="text-blue-800">4. 새로운 식물을 계속 모아보세요!</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}