// components/plant/ParentPlantDisplay.tsx - usePlant 훅 적용 및 실시간 동기화 개선
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { usePlant } from '../../hooks/usePlant';

const { width } = Dimensions.get('window');

interface Child {
  childId: string;
  child?: {
    user?: {
      username?: string;
    };
  };
  username?: string;
}

interface ParentPlantDisplayProps {
  childId: string;
  onPress?: () => void;
  onInfoPress?: () => void;
  connectedChildren?: Child[];
  handleChildSelect?: (childId: string) => void;
}

// 🔥 개별 자녀 식물 카드 컴포넌트 - usePlant 훅 사용
const ChildPlantCard: React.FC<{
  child: Child;
  isSelected: boolean;
  onPress?: () => void;
  onInfoPress?: () => void;
}> = React.memo(({ child, isSelected, onPress, onInfoPress }) => {
  const childName = child?.child?.user?.username || child?.username || '자녀';
  
  // 🚀 usePlant 훅으로 실시간 식물 데이터 관리
  const {
    plant,
    plantType,
    isLoading,
    error,
    progressPercent,
    plantImage,
  } = usePlant({
    childId: child.childId,
    isParent: true,
  });

  // 애니메이션 값
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const cardScale = 0.9;
  const cardWidth = width - 64;
  const cardAspectRatio = 0.65;
  const plantImageSize = 150;

  // 플랜트 바운스 애니메이션
  useEffect(() => {
    if (!plant) return;

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
  }, [plant]);

  // 🔥 로딩 상태 카드
  if (isLoading) {
    return (
      <View style={{ width: cardWidth }}>
        <View 
          className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200"
          style={{ aspectRatio: cardAspectRatio, width: cardWidth * cardScale }}
        >
          <View className="bg-gray-100 px-4 py-2 flex-row justify-between items-center">
            <View className="bg-gray-200 h-4 w-24 rounded" />
            <View className="bg-gray-200 h-6 w-16 rounded-full" />
          </View>
          
          <View className="w-full h-[50%] items-center justify-center bg-gray-50">
            <View className="bg-gray-200 rounded-full" style={{ width: plantImageSize, height: plantImageSize }} />
          </View>
          
          <View className="p-3">
            <View className="bg-gray-200 h-4 w-full rounded mb-2" />
            <View className="bg-gray-200 h-2 w-full rounded mb-1" />
            <View className="bg-gray-200 h-2 w-3/4 rounded" />
          </View>
        </View>
      </View>
    );
  }

  // 🔥 에러 상태 카드
  if (error) {
    return (
      <View style={{ width: cardWidth }}>
        <View 
          className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-red-200"
          style={{ aspectRatio: cardAspectRatio, width: cardWidth * cardScale }}
        >
          <View className="bg-red-50 px-4 py-2">
            <Text className="text-red-600 font-medium">{childName}의 식물</Text>
          </View>
          
          <View className="w-full h-[50%] items-center justify-center">
            <MaterialIcons name="error" size={60} color="#EF4444" />
            <Text className="text-red-500 text-sm mt-2">데이터 로드 실패</Text>
          </View>
          
          <View className="p-3">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        </View>
      </View>
    );
  }

  // 🔥 식물이 없는 경우 빈 카드
  if (!plant) {
    return (
      <View style={{ width: cardWidth }}>
        <Pressable
          className="mx-auto"
          style={{ aspectRatio: cardAspectRatio, width: cardWidth * cardScale }}
          onPress={onPress}
        >
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
            <View className="w-full h-[67%] items-center justify-center bg-gray-50">
              <View className="bg-gray-100 p-8 rounded-full">
                <MaterialIcons
                  name="eco"
                  size={plantImageSize * 0.4}
                  color="#9CA3AF"
                />
              </View>
              <Text className="text-sm text-gray-500 mt-2">아직 식물이 없어요</Text>
            </View>

            {/* 정보 영역 */}
            <View className="p-3 bg-white">
              <Text className="text-base font-bold text-gray-600 mb-2 text-center">
                {childName}에게 첫 식물을 선택하게 해주세요!
              </Text>
              
              <View className="bg-blue-50 px-3 py-2 rounded-lg">
                <Text className="text-sm text-blue-600 text-center">
                  자녀가 앱에서 식물을 선택하면{'\n'}여기에 표시됩니다 🌱
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  }

  // 🔥 식물이 있는 경우 - 실시간 데이터로 렌더링
  return (
    <View style={{ width: cardWidth }}>
      <Pressable
        className="mx-auto"
        style={{ aspectRatio: cardAspectRatio, width: cardWidth * cardScale }}
        onPress={onPress}
      >
        <View className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
          {/* 식물 이름 헤더 */}
          <View className="bg-blue-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="font-bold text-gray-800 text-base">
                {childName}의 {plant.name || plantType?.name || '식물'}
              </Text>
              <View className="bg-blue-200 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs font-medium text-blue-800">
                  Lv.{plant.currentStage}
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
                {plantType?.category || '씨앗 타입'} • Lv.{plant.currentStage}
              </Text>
            </View>

            <Text className="text-base font-bold text-gray-800 mb-1">
              {childName}의 {plant.name || plantType?.name || '식물'}
            </Text>

            {/* HP 바 */}
            <View className="mt-4 mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-red-500">HP</Text>
                <Text className="text-xs font-medium text-red-500">
                  {plant.health}/100
                </Text>
              </View>

              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${plant.health}%` }}
                />
              </View>
            </View>

            {/* 경험치 진행 바 */}
            <View className="mt-2 mb-1">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-medium text-gray-600">경험치</Text>
                <Text className="text-xs font-medium text-green-600">
                  {plant.experience}/{plant.experienceToGrow}
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
              {plant.canGrow
                ? '성장할 준비가 되었어요!'
                : `다음 단계까지 ${plant.experienceToGrow! - plant.experience!} 경험치 남음`}
            </Text>

            {/* 건강도 경고 */}
            {plant.health < 50 && (
              <View className="bg-red-50 px-2 py-1 mt-2 rounded flex-row items-center justify-center">
                <MaterialIcons name="warning" size={12} color="#EF4444" />
                <Text className="text-xs text-red-500 ml-1">
                  자녀에게 물주기를 권해보세요!
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
});

ChildPlantCard.displayName = 'ChildPlantCard';

const ParentPlantDisplay: React.FC<ParentPlantDisplayProps> = ({
  childId,
  onPress,
  onInfoPress,
  connectedChildren = [],
  handleChildSelect,
}) => {
  // 슬라이더 관련 상태
  const flatListRef = useRef<FlatList>(null);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  
  // 카드 크기 설정
  const cardWidth = width - 64;

  // 🔥 현재 선택된 자녀의 식물 데이터 - 액션 버튼용
  const {
    plant: selectedPlant,
  } = usePlant({
    childId,
    isParent: true,
  });

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
  }, [childId, connectedChildren, currentChildIndex]);

  // 🔥 스크롤 핸들러 최적화
  const handleMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    if (index >= 0 && index < connectedChildren.length) {
      const newChildId = connectedChildren[index].childId;
      setCurrentChildIndex(index);
      if (handleChildSelect && newChildId !== childId) {
        handleChildSelect(newChildId);
      }
    }
  }, [cardWidth, connectedChildren, handleChildSelect, childId]);

  // 🔥 페이지 인디케이터 클릭 핸들러
  const handleIndicatorPress = useCallback((index: number) => {
    setCurrentChildIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    const child = connectedChildren[index];
    if (handleChildSelect && child.childId !== childId) {
      handleChildSelect(child.childId);
    }
  }, [connectedChildren, handleChildSelect, childId]);

  // 🔥 렌더 아이템 최적화
  const renderItem = useCallback(({ item: child, index }: { item: Child; index: number }) => (
    <ChildPlantCard
      key={child.childId}
      child={child}
      isSelected={child.childId === childId}
      onPress={onPress}
      onInfoPress={onInfoPress}
    />
  ), [childId, onPress, onInfoPress]);

  // 🔥 getItemLayout 최적화
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: cardWidth,
    offset: cardWidth * index,
    index,
  }), [cardWidth]);

  // 🔥 keyExtractor 최적화
  const keyExtractor = useCallback((item: Child) => item.childId, []);

  // 자녀가 한 명인 경우 - 슬라이더 없이 단일 카드
  if (connectedChildren.length <= 1) {
    const child = connectedChildren[0] || { childId };
    
    return (
      <View className="bg-gray-50 rounded-xl p-3">
        <ChildPlantCard
          child={child}
          isSelected={true}
          onPress={onPress}
          onInfoPress={onInfoPress}
        />
        
        {/* 액션 버튼 영역 */}
        <PlantDisplayFootAction
          plant={selectedPlant || null}
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
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={cardWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * cardWidth,
              animated: true,
            });
          }, 100);
        }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        removeClippedSubviews={false} // 모든 카드를 미리 렌더링
        maxToRenderPerBatch={connectedChildren.length} // 모든 항목을 한번에 렌더링
        windowSize={connectedChildren.length} // 윈도우 크기를 전체 아이템 수로 설정
      />

      {/* 페이지 인디케이터 */}
      <View className="flex-row justify-center mt-4 mb-2">
        {connectedChildren.map((child, index) => {
          const childName = child?.child?.user?.username || child?.username || '자녀';
          return (
            <Pressable
              key={child.childId}
              onPress={() => handleIndicatorPress(index)}
              className="items-center mx-1"
            >
              <View
                className={`w-2 h-2 rounded-full mb-1 ${
                  index === currentChildIndex ? 'bg-green-500 w-4' : 'bg-gray-300'
                }`}
              />
            </Pressable>
          );
        })}
      </View>

      {/* 액션 버튼 영역 */}
      <PlantDisplayFootAction
        plant={selectedPlant || null}
        userType="parent"
        onInfoPress={onInfoPress}
        childId={childId}
      />
    </View>
  );
};

ParentPlantDisplay.displayName = 'ParentPlantDisplay';

export default React.memo(ParentPlantDisplay);