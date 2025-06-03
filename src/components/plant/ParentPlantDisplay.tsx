// components/plant/ParentPlantDisplay.tsx - 식물 없는 자녀 처리 개선
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Colors from '../../constants/Colors';
import PlantDisplayFootAction from './PlantDisplayFootAction';
import { Plant } from '@/src/api/modules/plant';

const { width } = Dimensions.get('window');

// API와 컴포넌트 간의 Plant 인터페이스 통합


interface PlantType {
  name?: string;
  category?: string;
  growthStages: number;
}

interface ParentPlantDisplayProps {
  plant?: Plant | null; // optional로 변경
  childId: string;
  onPress?: () => void;
  onInfoPress?: () => void;
  connectedChildren?: any[];
  handleChildSelect?: (childId: string) => void;
}

const ParentPlantDisplay: React.FC<ParentPlantDisplayProps> = ({
  plant,
  childId,
  onPress,
  onInfoPress,
  connectedChildren = [],
  handleChildSelect,
}) => {
  // 플랜트 타입 상태
  const [plantType, setPlantType] = useState<PlantType | null>(null);
  
  // 경험치 퍼센트 상태
  const [progressPercent, setProgressPercent] = useState(0);

  // 애니메이션 값
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // 슬라이더 관련 상태
  const flatListRef = useRef<FlatList>(null);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  
  // 카드 크기 설정
  const cardWidth = width - 64;
  const cardAspectRatio = 0.65;
  const plantImageSize = 150;
  const cardScale = 0.9;

  // 컴포넌트가 마운트되거나 식물 데이터가 변경될 때 경험치 퍼센트 계산
  useEffect(() => {
    if (plant) {
      const experience = plant.experience || 0;
      const experienceToGrow = plant.experienceToGrow || 100;

      if (experienceToGrow > 0) {
        const percent = Math.min((experience / experienceToGrow) * 100, 100);
        setProgressPercent(percent);
      } else {
        setProgressPercent(0);
      }

      // 식물 타입 설정
      if (plant.plantType) {
        setPlantType(plant.plantType);
      }
    } else {
      // 식물이 없는 경우 초기화
      setProgressPercent(0);
      setPlantType(null);
    }
  }, [plant]);

  // 선택된 자녀 인덱스 찾기 및 동기화
  useEffect(() => {
    if (connectedChildren.length > 0 && childId) {
      const index = connectedChildren.findIndex(child => child.childId === childId);
      if (index !== -1 && index !== currentChildIndex) {
        setCurrentChildIndex(index);
        // FlatList 스크롤 동기화
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
          });
        }, 100);
      }
    }
  }, [childId, connectedChildren]);

  // 플랜트 바운스 애니메이션
  useEffect(() => {
    const animationSequence = Animated.loop(
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
    );

    animationSequence.start();

    return () => {
      animationSequence.stop();
      bounceAnim.setValue(0);
    };
  }, []);

  // 이미지 가져오기
  const getPlantImage = () => {
    if (!plant || !plantType) return null;

    try {
      const imageStage = Math.max(
        1,
        Math.min(plant.currentStage || 1, plantType.growthStages || 5),
      );

      if (plant.imageUrl) {
        return { uri: plant.imageUrl };
      }

      const plantImages = {
        1: require('../../assets/images/character/level_1.png'),
        2: require('../../assets/images/character/level_2.png'),
        3: require('../../assets/images/character/level_3.png'),
        4: require('../../assets/images/character/level_4.png'),
        5: require('../../assets/images/character/level_5.png'),
      };

      return (
        plantImages[imageStage as keyof typeof plantImages] || plantImages[1]
      );
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      return require('../../assets/images/character/level_1.png');
    }
  };

  // 자녀 이름을 안전하게 가져오는 함수
  const getChildName = (child: any): string => {
    try {
      return child?.child?.user?.username || child?.username || '자녀';
    } catch (error) {
      console.warn('자녀 이름 조회 실패:', error);
      return '자녀';
    }
  };

  // 현재 선택된 자녀 정보
  const selectedChild = connectedChildren.find(child => child.childId === childId);
  const selectedChildName = selectedChild ? getChildName(selectedChild) : '자녀';

  // 식물이 없는 자녀를 위한 빈 카드 컴포넌트
  const renderEmptyPlantCard = (childName: string) => (
    <View className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
      {/* 헤더 */}
      <View className="bg-gray-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <Text className="font-bold text-gray-800 text-base">
            {childName}의 식물
          </Text>
          <View className="bg-gray-200 rounded-full px-2 py-0.5 ml-2">
            <Text className="text-xs font-medium text-gray-600">
              식물 없음
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <MaterialIcons
            name="eco"
            size={16}
            color="#9CA3AF"
            style={{ marginRight: 4 }}
          />
          <Text className="text-sm font-bold text-gray-500">
            대기중
          </Text>
        </View>
      </View>

      {/* 빈 식물 영역 */}
      <View className="w-full h-[68%] items-center justify-center bg-gray-50">
        <View className="bg-gray-100 p-8 rounded-full">
          <MaterialIcons
            name="eco"
            size={plantImageSize * 0.5}
            color="#9CA3AF"
          />
        </View>
        <Text className="text-sm text-gray-500 mt-2">아직 식물이 없어요</Text>
        <Text className="text-sm text-gray-500 mt-2">자녀와 계정 연결은 하셨나요?</Text>
      </View>

      {/* 정보 영역 */}
      <View className="p-3 bg-white">
        <Text className="text-base font-bold text-gray-600 mb-2 text-center">
          {childName}에게 첫 식물을 선택하게 해주세요!
        </Text>
        
        <View className="bg-blue-50 px-3 py-2 rounded-lg">
          <Text className="text-sm text-blue-600 text-center">
            자녀 계정을 연결하고 자녀가 앱에서 {'\n'}식물을 선택하면여기에 표시됩니다 🌱
          </Text>
        </View>
      </View>
    </View>
  );

  // 식물 카드 렌더링
  const renderPlantCard = ({ item: child, index }: { item: any; index: number }) => {
    const childName = getChildName(child);
    const isCurrentChild = child.childId === childId;
    const hasPlant = isCurrentChild && plant;
    const plantImage = getPlantImage();

    return (
      <View style={{ width: cardWidth }}>
        <Pressable
          className="mx-auto"
          style={{ aspectRatio: cardAspectRatio, width: cardWidth * cardScale }}
          onPress={onPress}
        >
          {/* 식물이 없는 경우 빈 카드 표시 */}
          {!hasPlant ? (
            renderEmptyPlantCard(childName)
          ) : (
            /* 기존 식물 카드 */
            <View className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
              {/* 식물 이름 헤더 */}
              <View className="bg-blue-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
                <View className="flex-row items-center">
                  <Text className="font-bold text-gray-800 text-base">
                    {childName}의 {plant?.name || plantType?.name || '식물'}
                  </Text>
                  <View className="bg-blue-200 rounded-full px-2 py-0.5 ml-2">
                    <Text className="text-xs font-medium text-blue-800">
                      Lv.{plant?.currentStage || 1}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <MaterialIcons
                    name="visibility"
                    size={16}
                    color="#2B70C9"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-sm font-bold text-blue-600">
                    관찰
                  </Text>
                </View>
              </View>

              {/* 배경 영역 */}
              <View className="w-full h-[50%] items-center justify-center bg-blue-50">
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
                      style={{ width: plantImageSize, height: plantImageSize }}
                      contentFit="contain"
                    />
                  ) : (
                    <View className="bg-primary/10 p-8 rounded-full">
                      <MaterialIcons
                        name="eco"
                        size={plantImageSize * 0.5}
                        color={Colors.light.primary}
                      />
                    </View>
                  )}
                </Animated.View>
              </View>

              {/* 식물 정보 영역 */}
              <View className="p-3 bg-white border-t border-gray-200">
                <View className="mb-2 pb-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">
                    {plantType?.category || '씨앗 타입'} • Lv.{plant?.currentStage || 1}
                  </Text>
                </View>

                <Text className="text-base font-bold text-gray-800 mb-1">
                  {childName}의 {plant?.name || plantType?.name || '식물'}
                </Text>

                {/* HP 바 */}
                <View className="mt-4 mb-2">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-bold text-red-500">HP</Text>
                    <Text className="text-xs font-medium text-red-500">
                      {plant?.health || 100}/100
                    </Text>
                  </View>

                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${plant?.health || 100}%` }}
                    />
                  </View>
                </View>

                {/* 경험치 진행 바 */}
                <View className="mt-2 mb-1">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs font-medium text-gray-600">경험치</Text>
                    <Text className="text-xs font-medium text-green-600">
                      {plant?.experience || 0}/{plant?.experienceToGrow || 100}
                    </Text>
                  </View>

                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </View>
                </View>

                {/* 식물 상태 메시지 */}
                <Text className="text-xs text-center mt-1 text-gray-500">
                  {plant?.canGrow
                    ? '성장할 준비가 되었어요!'
                    : `다음 단계까지 ${(plant?.experienceToGrow || 100) - (plant?.experience || 0)} 경험치 남음`}
                </Text>

                {/* 건강도 경고 */}
                {plant && plant.health < 50 && (
                  <View className="bg-red-50 px-2 py-1 mt-2 rounded flex-row items-center justify-center">
                    <MaterialIcons name="warning" size={12} color="#EF4444" />
                    <Text className="text-xs text-red-500 ml-1">
                      자녀에게 물주기를 권해보세요!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  // 자녀가 한 명인 경우 - 슬라이더 없이 단일 카드
  if (connectedChildren.length <= 1) {
    return (
      <View className="bg-gray-50 rounded-xl p-3">
        {renderPlantCard({ item: connectedChildren[0] || { childId }, index: 0 })}
        
        {/* 액션 버튼 영역 */}
        <PlantDisplayFootAction
          plant={plant || null}
          userType="parent"
          onInfoPress={onInfoPress}
          childId={childId}
        />
      </View>
    );
  }

  // 여러 자녀가 있는 경우 - 슬라이더 형태
  return (
    <View className="bg-gray-50 rounded-xl p-3">
      {/* 자녀 식물 슬라이더 */}
      <FlatList
        ref={flatListRef}
        data={connectedChildren}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.childId}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={cardWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
          if (index >= 0 && index < connectedChildren.length) {
            const newChildId = connectedChildren[index].childId;
            setCurrentChildIndex(index);
            if (handleChildSelect && newChildId !== childId) {
              handleChildSelect(newChildId);
            }
          }
        }}
        getItemLayout={(_, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * cardWidth,
              animated: true,
            });
          }, 100);
        }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />

      {/* 페이지 인디케이터 */}
      <View className="flex-row justify-center mt-4 mb-2">
        {connectedChildren.map((child, index) => {
          const childName = getChildName(child);
          return (
            <Pressable
              key={child.childId}
              onPress={() => {
                setCurrentChildIndex(index);
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
                if (handleChildSelect && child.childId !== childId) {
                  handleChildSelect(child.childId);
                }
              }}
              className="items-center mx-1"
            >
              <View
                className={`w-3 h-2 rounded-full mb-1 ${
                  index === currentChildIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            </Pressable>
          );
        })}
      </View>

      {/* 액션 버튼 영역 */}
      <PlantDisplayFootAction
        plant={plant || null}
        userType="parent"
        onInfoPress={onInfoPress}
        childId={childId}
      />
    </View>
  );
};

export default React.memo(ParentPlantDisplay);