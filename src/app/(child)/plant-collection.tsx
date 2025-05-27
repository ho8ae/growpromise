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
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import api from '../../api';
import { Plant, PlantCollectionGroup, PlantType } from '../../api/modules/plant';
import { useAuthStore } from '../../stores/authStore';
import SafeStatusBar from '@/src/components/common/SafeStatusBar';

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
  const modalSlideAnim = useRef(new Animated.Value(100)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  // 화면 너비 계산
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 양쪽 패딩 및 간격 고려

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDetailPlant({ plant, plantType });
    setIsModalVisible(true);
    
    // 모달 열릴 때 애니메이션
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 모달 닫기
  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 모달 닫힐 때 애니메이션
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
      // 모달이 닫힌 후 초기값으로 설정
      modalSlideAnim.setValue(100);
      modalOpacityAnim.setValue(0);
    });
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
      case 'FLOWER': return Colors.light.promise.music; // 꽃은 빨간색 계열
      case 'TREE': return Colors.light.primary; // 나무는 초록색 계열
      case 'VEGETABLE': return Colors.light.promise.study; // 채소는 파란색 계열
      case 'FRUIT': return Colors.light.secondary; // 과일은 노란색 계열
      case 'OTHER': return Colors.light.accent; // 기타는 퍼플 계열
      default: return Colors.light.primary;
    }
  };
  
  // 카테고리별 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FLOWER': return 'flower';
      case 'TREE': return 'tree';
      case 'VEGETABLE': return 'leaf';
      case 'FRUIT': return 'apple-alt';
      case 'OTHER': return 'seedling';
      default: return 'spa';
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
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text className="mt-4 text-gray-600">도감 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 에러 화면
  if (collectionError) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5 justify-center items-center">
        <View className="rounded-full bg-red-50 p-5 mb-4">
          <Ionicons name="alert-circle" size={44} color={Colors.light.error} />
        </View>
        <Text className="text-lg font-bold text-red-500 text-center mb-2">오류가 발생했습니다</Text>
        <Text className="text-gray-600 text-center mb-8">도감 정보를 불러오는데 문제가 발생했습니다.</Text>
        <Pressable
          className="py-3.5 px-6 rounded-xl active:opacity-90"
          style={{ backgroundColor: Colors.light.primary }}
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold text-center">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // 도감 데이터 없음
  const hasPlants = plantCollection && plantCollection.length > 0 && 
                    plantCollection.some(group => group.plants && group.plants.length > 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
    
      <SafeAreaView className="flex-1 bg-white">
        {/* 커스텀 헤더 */}
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
          <Pressable 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-50"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
          </Pressable>
          
          <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
            식물 도감
          </Text>
          
          <View className="w-10 h-10" />
        </View>
        
        <ScrollView className="flex-1">
          <Animated.View
            className="px-5 pt-4 pb-10"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* 상단 제목 */}
            <View className="mb-5">
              <Text className="text-2xl font-bold" style={{ color: Colors.light.text }}>
                {user?.userType === 'PARENT' ? '자녀의 식물 도감' : '나의 식물 도감'}
              </Text>
              <Text className="text-base mt-1" style={{ color: Colors.light.textSecondary }}>
                {hasPlants 
                  ? '지금까지 키운 모든 식물을 볼 수 있어요!'
                  : '아직 완성한 식물이 없어요. 첫 번째 식물을 키워보세요!'}
              </Text>
            </View>

            {/* 자녀 선택 (부모 계정용) */}
            {user?.userType === 'PARENT' && connectedChildren && connectedChildren.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-medium mb-2.5" style={{ color: Colors.light.textSecondary }}>
                  자녀 선택
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {connectedChildren.map((connection) => (
                    <Pressable
                      key={connection.childId}
                      onPress={() => handleChildSelect(connection.childId)}
                      className={`mr-3 py-2.5 px-4 rounded-xl border active:opacity-90 ${
                        selectedChildId === connection.childId 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <Text 
                        className={`font-medium ${
                          selectedChildId === connection.childId 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                        }`}
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
              <View className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-8">
                <View className="items-center mb-5">
                  <View className="bg-orange-100 p-4 rounded-full">
                    <FontAwesome5 name="seedling" size={32} color={Colors.light.secondary} />
                  </View>
                </View>
                <Text className="text-center font-bold text-xl mb-2" style={{ color: Colors.light.text }}>
                  {user?.userType === 'PARENT' 
                    ? '자녀가 아직 식물을 완성하지 않았어요' 
                    : '아직 식물을 완성하지 않았어요'}
                </Text>
                <Text className="text-center mb-5" style={{ color: Colors.light.textSecondary }}>
                  {user?.userType === 'PARENT'
                    ? '자녀가 식물을 모두 키우면 여기에 표시됩니다. 자녀에게 약속을 만들어주세요!'
                    : '식물을 끝까지 키우면 도감에 기록됩니다. 약속을 완료하고 물을 주며 식물을 키워보세요!'}
                </Text>
                <Pressable
                  className="py-3.5 rounded-xl active:opacity-90"
                  style={{ backgroundColor: Colors.light.secondary }}
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
              
              const categoryColor = getCategoryColor(group.plantType.category);
              const categoryIcon = getCategoryIcon(group.plantType.category);
              
              return (
                <View key={group.plantType.id} className="mb-8">
                  <View className="flex-row items-center mb-4">
                    <View
                      className="w-9 h-9 rounded-lg mr-3 items-center justify-center"
                      style={{ backgroundColor: `${categoryColor}15` }}
                    >
                      <FontAwesome5 
                        name={categoryIcon} 
                        size={16} 
                        color={categoryColor} 
                        solid 
                      />
                    </View>
                    <View>
                      <Text className="text-lg font-bold mb-0.5" style={{ color: Colors.light.text }}>
                        {group.plantType.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text 
                          className="text-xs"
                          style={{ color: Colors.light.textSecondary }}
                        >
                          {getCategoryText(group.plantType.category)}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                        <Text 
                          className="text-xs"
                          style={{ color: Colors.light.textSecondary }}
                        >
                          {group.plants.length}개 수집
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row flex-wrap mx-[-6px]">
                    {group.plants.map((plant) => (
                      <Pressable
                        key={plant.id}
                        style={{ width: cardWidth, padding: 6 }}
                        onPress={() => handlePlantPress(plant, group.plantType)}
                        className="active:opacity-90"
                      >
                        <View 
                          className="rounded-xl overflow-hidden"
                          style={{ 
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: Colors.light.cardBorder,
                          }}
                        >
                          <LinearGradient
                            colors={['#FCFCFC', '#F8FBFA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-3"
                          >
                            <View className="items-center mb-2">
                              <View 
                                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                                style={{ backgroundColor: `${categoryColor}10` }}
                              >
                                <Image
                                  source={require('../../assets/images/character/level_1.png')}
                                  style={{ width: 52, height: 52 }}
                                  contentFit="contain"
                                />
                              </View>
                              
                              <Text 
                                className="text-center font-bold mb-2" 
                                numberOfLines={1}
                                style={{ color: Colors.light.text }}
                              >
                                {plant.name || group.plantType.name}
                              </Text>
                              
                              <View className="flex-row items-center">
                                <View 
                                  className="px-2 py-1 rounded-full"
                                  style={{ backgroundColor: plant.isCompleted ? '#E6F6EC' : '#F5F5F5' }}
                                >
                                  <Text 
                                    className="text-xs font-medium"
                                    style={{ color: plant.isCompleted ? Colors.light.primary : Colors.light.textSecondary }}
                                  >
                                    {plant.isCompleted ? '완성' : `${plant.currentStage}/${group.plantType.growthStages} 단계`}
                                  </Text>
                                </View>
                              </View>
                              
                              {plant.completedAt && (
                                <Text className="text-xs mt-1.5" style={{ color: Colors.light.textSecondary }}>
                                  {formatDate(plant.completedAt)}
                                </Text>
                              )}
                            </View>
                          </LinearGradient>
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
          animationType="none"
          onRequestClose={closeModal}
        >
          <BlurView 
            intensity={15} 
            tint="dark" 
            className="flex-1 justify-end"
          >
            <TouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={closeModal}
            />
            
            <Animated.View 
              style={{
                transform: [{ translateY: modalSlideAnim }],
                opacity: modalOpacityAnim,
              }}
            >
              <View className="bg-white rounded-t-3xl">
                {detailPlant && (
                  <>
                    <View className="p-5 pb-8">
                      <View className="items-center">
                        <View className="w-10 h-1 bg-gray-200 rounded-full mb-5" />
                      </View>
                      
                      <View className="flex-row justify-between items-center mb-6">
                        <View>
                          <Text 
                            className="text-2xl font-bold mb-1" 
                            style={{ color: Colors.light.text }}
                          >
                            {detailPlant.plant.name || detailPlant.plantType.name}
                          </Text>
                          <View className="flex-row items-center">
                            <View 
                              className="px-2 py-0.5 rounded-full mr-2"
                              style={{ 
                                backgroundColor: getCategoryColor(detailPlant.plantType.category) + '15' 
                              }}
                            >
                              <Text 
                                className="text-xs font-medium"
                                style={{ color: getCategoryColor(detailPlant.plantType.category) }}
                              >
                                {getCategoryText(detailPlant.plantType.category)}
                              </Text>
                            </View>
                            
                            <View 
                              className="px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: detailPlant.plant.isCompleted 
                                  ? '#E6F6EC' 
                                  : '#F5F5F5' 
                              }}
                            >
                              <Text 
                                className="text-xs font-medium"
                                style={{ 
                                  color: detailPlant.plant.isCompleted 
                                    ? Colors.light.primary 
                                    : Colors.light.textSecondary 
                                }}
                              >
                                {detailPlant.plant.isCompleted 
                                  ? '완성' 
                                  : `${detailPlant.plant.currentStage}/${detailPlant.plantType.growthStages} 단계`}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <TouchableOpacity
                          onPress={closeModal}
                          className="w-9 h-9 rounded-full items-center justify-center"
                          style={{ backgroundColor: '#F5F5F5' }}
                        >
                          <Ionicons name="close" size={18} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      
                      <View className="items-center mb-6">
                        <View 
                          className="w-24 h-24 rounded-full items-center justify-center mb-2"
                          style={{ 
                            backgroundColor: getCategoryColor(detailPlant.plantType.category) + '10' 
                          }}
                        >
                          <Image
                            source={require('../../assets/images/character/level_1.png')}
                            style={{ width: 80, height: 80 }}
                            contentFit="contain"
                          />
                        </View>
                      </View>
                      
                      <View 
                        className="p-4 rounded-xl mb-6"
                        style={{ backgroundColor: '#F9F9F9' }}
                      >
                        <View className="flex-row mb-3">
                          <View className="w-24">
                            <Text style={{ color: Colors.light.textSecondary }}>종류</Text>
                          </View>
                          <Text style={{ color: Colors.light.text }}>
                            {detailPlant.plantType.name}
                          </Text>
                        </View>
                        
                        <View className="flex-row mb-3">
                          <View className="w-24">
                            <Text style={{ color: Colors.light.textSecondary }}>카테고리</Text>
                          </View>
                          <Text style={{ color: Colors.light.text }}>
                            {getCategoryText(detailPlant.plantType.category)}
                          </Text>
                        </View>
                        
                        <View className="flex-row mb-3">
                          <View className="w-24">
                            <Text style={{ color: Colors.light.textSecondary }}>시작일</Text>
                          </View>
                          <Text style={{ color: Colors.light.text }}>
                            {formatDate(detailPlant.plant.startedAt)}
                          </Text>
                        </View>
                        
                        {detailPlant.plant.completedAt && (
                          <View className="flex-row mb-3">
                            <View className="w-24">
                              <Text style={{ color: Colors.light.textSecondary }}>완성일</Text>
                            </View>
                            <Text style={{ color: Colors.light.text }}>
                              {formatDate(detailPlant.plant.completedAt)}
                            </Text>
                          </View>
                        )}
                        
                        <View className="flex-row">
                          <View className="w-24">
                            <Text style={{ color: Colors.light.textSecondary }}>건강도</Text>
                          </View>
                          <Text 
                            className="font-medium"
                            style={{ 
                              color: detailPlant.plant.health > 70 
                                ? Colors.light.primary 
                                : detailPlant.plant.health > 40
                                  ? Colors.light.secondary
                                  : Colors.light.error
                            }}
                          >
                            {detailPlant.plant.health}%
                          </Text>
                        </View>
                      </View>
                      
                      {detailPlant.plantType.description && (
                        <View className="mb-6">
                          <Text className="font-medium mb-2" style={{ color: Colors.light.text }}>
                            설명
                          </Text>
                          <Text style={{ color: Colors.light.textSecondary, lineHeight: 20 }}>
                            {detailPlant.plantType.description}
                          </Text>
                        </View>
                      )}
                      
                      <Pressable
                        className="py-3.5 rounded-xl active:opacity-90 mb-4"
                        style={{ backgroundColor: Colors.light.primary }}
                        onPress={closeModal}
                      >
                        <Text className="text-white text-center font-bold">닫기</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </Animated.View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </>
  );
}