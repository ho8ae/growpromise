import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useQuery } from '@tanstack/react-query';
import Colors from '../../constants/Colors';
import api from '../../api';
import { Plant, PlantCollectionGroup, PlantType } from '../../api/modules/plant';
import { useAuthStore } from '../../stores/authStore';

export default function PlantCollectionScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [detailPlant, setDetailPlant] = useState<{
    plant: Plant;
    plantType: PlantType;
  } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 화면 너비 계산
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 40) / 2; // 양쪽 패딩 및 간격 고려

  // 자녀 목록 조회 (부모 계정용)
  const { 
    data: connectedChildren,
    isLoading: isLoadingChildren,
  } = useQuery({
    queryKey: ['connectedChildren'],
    queryFn: async () => {
      if (!isAuthenticated || user?.userType !== 'PARENT') return [];
      
      try {
        return await api.user.getParentChildren();
      } catch (error) {
        console.error('자녀 목록 조회 실패:', error);
        return [];
      }
    },
    enabled: isAuthenticated && user?.userType === 'PARENT',
  });

  // 선택된 자녀 자동 설정 (부모 계정용)
  useEffect(() => {
    if (user?.userType === 'PARENT' && connectedChildren && connectedChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(connectedChildren[0].childId);
    }
  }, [connectedChildren, user]);

  // 식물 도감 조회
  const { 
    data: plantCollection, 
    isLoading: isLoadingCollection,
    error: collectionError 
  } = useQuery({
    queryKey: ['plantCollection', user?.userType, selectedChildId],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        if (user?.userType === 'PARENT' && selectedChildId) {
          // 부모가 자녀의 식물 도감 조회
          return await api.plant.getChildPlantCollection(selectedChildId);
        } else if (user?.userType === 'CHILD') {
          // 자녀 자신의 식물 도감 조회
          return await api.plant.getPlantCollection();
        }
        return [];
      } catch (error) {
        console.error('식물 도감 조회 실패:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && (user?.userType === 'CHILD' || (user?.userType === 'PARENT' && !!selectedChildId)),
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
  }, []);

  // 식물 상세 정보 보기
  const handlePlantPress = (plant: Plant, plantType: PlantType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailPlant({ plant, plantType });
    setIsModalVisible(true);
  };

  // 카테고리 텍스트
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

  // 자녀 선택 처리 (부모 계정용)
  const handleChildSelect = (childId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChildId(childId);
  };

  // 식물 완료 일자 형식화
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
  };

  // 로딩 화면
  if (isLoadingChildren || isLoadingCollection) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.leafGreen} />
        <Text className="mt-4 text-emerald-700">도감 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 에러 화면
  if (collectionError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 p-4 justify-center items-center">
        <View className="bg-red-100 p-4 rounded-full mb-4">
          <MaterialIcons name="error" size={40} color="#ef4444" />
        </View>
        <Text className="text-red-600 text-center mb-6">도감 정보를 불러오는 중 오류가 발생했습니다.</Text>
        <Pressable
          className="bg-emerald-500 py-3 px-6 rounded-xl"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // 도감 데이터 없음
  const hasPlants = plantCollection && plantCollection.length > 0 && 
                    plantCollection.some(group => group.plants && group.plants.length > 0);

  return (
    <>
      <Stack.Screen options={{ 
        title: '식물 도감',
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
              {user?.userType === 'PARENT' ? '자녀의 식물 도감' : '나의 식물 도감'}
            </Text>
            <Text className="text-gray-600 mb-6">
              {hasPlants 
                ? '지금까지 키운 모든 식물을 볼 수 있어요!'
                : '아직 완성한 식물이 없어요. 첫 번째 식물을 키워보세요!'}
            </Text>

            {/* 자녀 선택 (부모 계정용) */}
            {user?.userType === 'PARENT' && connectedChildren && connectedChildren.length > 0 && (
              <View className="mb-6">
                <Text className="text-emerald-700 font-medium mb-2">자녀 선택</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {connectedChildren.map((connection) => (
                    <Pressable
                      key={connection.childId}
                      onPress={() => handleChildSelect(connection.childId)}
                      className={`mr-2 px-4 py-2 rounded-lg ${
                        selectedChildId === connection.childId 
                          ? 'bg-emerald-100 border-emerald-300' 
                          : 'bg-gray-100 border-gray-200'
                      } border`}
                    >
                      <Text 
                        className={selectedChildId === connection.childId 
                          ? 'text-emerald-700 font-medium' 
                          : 'text-gray-700'
                        }
                      >
                        {connection.child?.user?.username || '자녀'}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 도감이 비어있을 때 */}
            {!hasPlants && (
              <View className="bg-amber-50 p-6 rounded-xl border border-amber-200 mb-6">
                <View className="items-center mb-4">
                  <View className="bg-amber-100 p-4 rounded-full">
                    <MaterialIcons name="eco" size={40} color={Colors.light.amber} />
                  </View>
                </View>
                <Text className="text-center text-amber-800 font-bold text-lg mb-2">
                  {user?.userType === 'PARENT' 
                    ? '자녀가 아직 식물을 완성하지 않았어요' 
                    : '아직 식물을 완성하지 않았어요'}
                </Text>
                <Text className="text-center text-amber-700 mb-4">
                  {user?.userType === 'PARENT'
                    ? '자녀가 식물을 모두 키우면 여기에 표시됩니다. 자녀에게 약속을 만들어주세요!'
                    : '식물을 끝까지 키우면 도감에 기록됩니다. 약속을 완료하고 물을 주며 식물을 키워보세요!'}
                </Text>
                <Pressable
                  className="bg-amber-500 py-3 rounded-xl"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (user?.userType === 'PARENT') {
                      router.push('/(parent)/create-promise');
                    } else {
                      router.push('/(tabs)');
                    }
                  }}
                >
                  <Text className="text-white font-bold text-center">
                    {user?.userType === 'PARENT' ? '약속 만들기' : '홈으로 돌아가기'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* 식물 도감 그룹 */}
            {plantCollection?.map((group) => {
              if (!group.plants || group.plants.length === 0) return null;
              
              return (
                <View key={group.plantType.id} className="mb-8">
                  <View className="flex-row items-center mb-3">
                    <View
                      className="p-2 rounded-full mr-2"
                      style={{ backgroundColor: `${getCategoryColor(group.plantType.category)}20` }}
                    >
                      <MaterialIcons 
                        name="eco" 
                        size={18} 
                        color={getCategoryColor(group.plantType.category)} 
                      />
                    </View>
                    <Text className="text-xl font-bold" style={{ color: getCategoryColor(group.plantType.category) }}>
                      {group.plantType.name}
                    </Text>
                    <View
                      className="ml-2 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${getCategoryColor(group.plantType.category)}15` }}
                    >
                      <Text 
                        className="text-xs font-medium"
                        style={{ color: getCategoryColor(group.plantType.category) }}
                      >
                        {getCategoryText(group.plantType.category)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row flex-wrap justify-between">
                    {group.plants.map((plant) => (
                      <Pressable
                        key={plant.id}
                        style={{ width: cardWidth, marginBottom: 16 }}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                        onPress={() => handlePlantPress(plant, group.plantType)}
                      >
                        <View className="p-3">
                          <View className="items-center justify-center mb-2 p-3">
                            <Image
                              source={require('../../assets/images/character/level_1.png')}
                              style={{ width: 70, height: 70 }}
                              contentFit="contain"
                            />
                          </View>
                          
                          <Text className="text-center font-bold text-gray-800 mb-1">
                            {plant.name || group.plantType.name}
                          </Text>
                          
                          <View className="items-center">
                            <View className="bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                              <Text className="text-xs font-medium text-emerald-700">
                                {plant.isCompleted ? '완성' : `${plant.currentStage}/${group.plantType.growthStages} 단계`}
                              </Text>
                            </View>
                            
                            {plant.completedAt && (
                              <Text className="text-xs text-gray-500">
                                {formatDate(plant.completedAt)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </ScrollView>
        
        {/* 식물 상세 정보 모달 */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <BlurView 
            intensity={30} 
            tint="dark" 
            className="flex-1 justify-end"
          >
            <TouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setIsModalVisible(false)}
            />
            
            <View className="bg-white rounded-t-3xl p-5">
              {detailPlant && (
                <>
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-bold text-emerald-700">
                      {detailPlant.plant.name || detailPlant.plantType.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsModalVisible(false)}
                      className="bg-gray-100 p-2 rounded-full"
                    >
                      <MaterialIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  
                  <View className="items-center mb-4">
                    <Image
                      source={require('../../assets/images/character/level_1.png')}
                      style={{ width: 120, height: 120 }}
                      contentFit="contain"
                    />
                  </View>
                  
                  <View className="mb-4">
                    <View className="flex-row mb-2">
                      <Text className="text-gray-500 font-medium w-24">종류:</Text>
                      <Text className="text-gray-700">
                        {detailPlant.plantType.name} ({getCategoryText(detailPlant.plantType.category)})
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-500 font-medium w-24">상태:</Text>
                      <Text className="text-emerald-700 font-medium">
                        {detailPlant.plant.isCompleted 
                          ? '완성' 
                          : `성장 중 (${detailPlant.plant.currentStage}/${detailPlant.plantType.growthStages} 단계)`}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-500 font-medium w-24">시작일:</Text>
                      <Text className="text-gray-700">{formatDate(detailPlant.plant.startedAt)}</Text>
                    </View>
                    
                    {detailPlant.plant.completedAt && (
                      <View className="flex-row mb-2">
                        <Text className="text-gray-500 font-medium w-24">완성일:</Text>
                        <Text className="text-gray-700">{formatDate(detailPlant.plant.completedAt)}</Text>
                      </View>
                    )}
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-500 font-medium w-24">건강도:</Text>
                      <Text 
                        className="font-medium"
                        style={{ 
                          color: detailPlant.plant.health > 70 
                            ? Colors.light.leafGreen 
                            : detailPlant.plant.health > 40
                              ? Colors.light.amber
                              : '#ef4444'
                        }}
                      >
                        {detailPlant.plant.health}%
                      </Text>
                    </View>
                  </View>
                  
                  {detailPlant.plantType.description && (
                    <View className="bg-gray-50 p-4 rounded-xl mb-4">
                      <Text className="text-gray-700">{detailPlant.plantType.description}</Text>
                    </View>
                  )}
                  
                  <Pressable
                    className="bg-emerald-500 py-3 rounded-xl"
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text className="text-white text-center font-bold">닫기</Text>
                  </Pressable>
                </>
              )}
            </View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </>
  );
}