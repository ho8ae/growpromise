// components/plant/ParentPlantDisplay.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Colors from '../../constants/Colors';
import FooterActionSkeleton from './FooterActionSkeleton';
import PlantCardSkeleton from './PlantCardSkeleton';
import PlantDisplayFootAction from './PlantDisplayFootAction';

const { width } = Dimensions.get('window');

// 타입 정의
interface ChildUserInfo {
  username: string;
}

interface ChildInfo {
  user: ChildUserInfo;
}

interface ChildParentConnection {
  childId: string;
  child?: ChildInfo;
}

// API와 컴포넌트 간의 Plant 인터페이스 통합
interface Plant {
  id?: string;
  name?: string;
  imageUrl?: string;
  plantTypeId?: string;
  plantType?: PlantType;
  experience: number;
  experienceToGrow: number;
  currentStage: number;
  health: number;
  canGrow: boolean;
}

interface PlantType {
  name?: string;
  category?: string;
  growthStages: number;
}

// 스티커 개수 정보
interface StickerCount {
  totalStickers: number;
  availableStickers: number;
}

interface ParentPlantDisplayProps {
  plant?: any | Plant | null;
  onPress?: () => void;
  onInfoPress?: () => void;
  connectedChildren?: any[]|ChildParentConnection[];
  selectedChildId?: string | null;
  handleChildSelect?: (childId: string) => void;
  childId?: string;
}

const ParentPlantDisplay: React.FC<ParentPlantDisplayProps> = ({
  plant,
  onPress,
  onInfoPress,
  connectedChildren = [],
  selectedChildId = null,
  handleChildSelect = () => {},
  childId,
}) => {
  // 로딩 및 오류 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(true);

  // 플랜트 타입 상태
  const [plantType, setPlantType] = useState<PlantType | null>(null);

  // 스티커 정보 상태
  const [stickerCounts, setStickerCounts] = useState<
    Record<string, StickerCount>
  >({});

  // 경험치 퍼센트 상태
  const [progressPercent, setProgressPercent] = useState(0);

  // 애니메이션 값
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // 자녀 슬라이더 관련
  const flatListRef = useRef<FlatList>(null);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardSpacing = 30;
  const cardWidth = width - 32 - cardSpacing;

  // 안전한 자녀 데이터 검증 함수
  const getValidConnectedChildren = () => {
    if (!Array.isArray(connectedChildren)) {
      return [];
    }
    
    return connectedChildren.filter(child => {
      // 필수 속성 검증
      return child && 
             typeof child === 'object' && 
             child.childId && 
             typeof child.childId === 'string';
    });
  };

  // 자녀 이름을 안전하게 가져오는 함수
  const getChildName = (child: ChildParentConnection): string => {
    try {
      return child?.child?.user?.username || '자녀';
    } catch (error) {
      console.warn('자녀 이름 조회 실패:', error);
      return '자녀';
    }
  };

  // 컴포넌트가 마운트되거나 식물 데이터가 변경될 때 경험치 퍼센트 계산
  useEffect(() => {
    setInitialLoadComplete(true);
    setIsLoading(false);
    
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
    }
  }, [plant]);

  // 모의 스티커 데이터 로드
  useEffect(() => {
    const validChildren = getValidConnectedChildren();
    
    if (validChildren.length > 0) {
      const mockStickerData: Record<string, StickerCount> = {};
      
      validChildren.forEach(child => {
        mockStickerData[child.childId] = {
          totalStickers: Math.floor(Math.random() * 50),
          availableStickers: Math.floor(Math.random() * 20)
        };
      });
      
      setStickerCounts(mockStickerData);
    }
  }, [connectedChildren]);

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

  // 선택된 자녀 인덱스 찾기 및 스크롤 처리
  useEffect(() => {
    const validChildren = getValidConnectedChildren();
    
    if (validChildren.length > 0 && selectedChildId) {
      const index = validChildren.findIndex(
        (child) => child.childId === selectedChildId,
      );

      if (index !== -1) {
        setCurrentChildIndex(index);

        requestAnimationFrame(() => {
          try {
            flatListRef.current?.scrollToOffset({
              offset: index * cardWidth,
              animated: true,
            });
          } catch (err) {
            console.log('스크롤 오류:', err);
          }
        });
      }
    }
  }, [selectedChildId, connectedChildren, cardWidth]);

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

  // 자녀 식물 카드 렌더링
  const renderChildPlantCard = ({
    item,
    index,
  }: {
    item: ChildParentConnection;
    index: number;
  }) => {
    // 안전한 데이터 검증
    if (!item || !item.childId) {
      console.warn('잘못된 자녀 데이터:', item);
      return null;
    }

    const childName = getChildName(item);
    const plantImage = getPlantImage();

    // 현재 자녀의 스티커 정보 가져오기
    const childStickers = stickerCounts[item.childId] || {
      totalStickers: 0,
      availableStickers: 0,
    };
    const stickerCount = childStickers.availableStickers || 0;

    return (
      <View style={{ width: cardWidth }}>
        <Pressable
          className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200"
          style={{ width: cardWidth - 16, aspectRatio: 0.7 }}
          onPress={onPress ? () => onPress() : undefined}
        >
          {/* 자녀 이름 헤더 */}
          <View className="bg-yellow-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="font-bold text-gray-800 text-base">
                {childName}
              </Text>
              <View className="bg-yellow-200 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs font-medium text-yellow-800">
                  기본
                </Text>
              </View>
            </View>

            {/* 스티커 개수 표시 */}
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
          </View>

          {/* 식물 정보 영역 */}
          <View className="p-3 bg-white border-t border-gray-200">
            <View className="mb-2 pb-2 border-b border-gray-100">
              <Text className="text-sm text-gray-500">
                {plantType?.category || '씨앗 타입'} • Lv.
                {plant?.currentStage || 1}
              </Text>
            </View>

            <Text className="text-lg font-bold text-gray-800 mb-1">
              {plant?.name || plantType?.name || '식물'}
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
                <Text className="text-xs font-medium text-gray-600">
                  경험치
                </Text>
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

            {/* 물 필요 여부 알림 */}
            {plant && plant.health < 50 && (
              <View className="bg-red-50 px-2 py-1 mt-2 rounded flex-row items-center justify-center">
                <MaterialIcons name="warning" size={12} color="#EF4444" />
                <Text className="text-xs text-red-500 ml-1">
                  물이 필요해요!
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    );
  };

  // 성능 최적화를 위한 메모이제이션된 아이템 렌더러
  const memoizedRenderChildPlantCard = React.useCallback(renderChildPlantCard, [
    plant,
    plantType,
    progressPercent,
    stickerCounts,
    cardWidth,
  ]);

  // 검증된 자녀 데이터 가져오기
  const validConnectedChildren = getValidConnectedChildren();

  // 연결된 자녀가 없는 경우
  if (validConnectedChildren.length === 0) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm mt-4">
        <View className="items-center py-6">
          <View className="w-20 h-20 bg-tertiary/10 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="family-restroom" size={36} color={Colors.light.tertiary} />
          </View>
          <Text className="text-lg font-bold text-tertiary mb-2">
            연결된 자녀가 없어요
          </Text>
          <Text className="text-gray-500 text-center px-6 mb-4">
            자녀와 계정을 연결하여 함께 식물을 키워보세요!
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => {
              // 자녀 연결 화면으로 이동하는 로직 추가
              console.log('자녀 연결 화면으로 이동');
            }}
          >
            <Text className="text-white font-medium">자녀 연결하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading && !initialLoadComplete) {
    if (validConnectedChildren.length <= 1) {
      return (
        <View className="bg-gray-50 rounded-xl p-4">
          <PlantCardSkeleton />
          <FooterActionSkeleton />
        </View>
      );
    } else {
      return (
        <View className="bg-gray-50 rounded-xl p-4">
          <FlatList
            data={[0, 1]}
            renderItem={() => <PlantCardSkeleton width={cardWidth - 16} />}
            keyExtractor={(_, index) => `skeleton-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
            ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
          />

          <View className="flex-row justify-center mt-4 mb-2">
            {[0, 1].map((_, i) => (
              <View key={i} className="w-2 h-2 rounded-full mx-1 bg-gray-300" />
            ))}
          </View>

          <FooterActionSkeleton />
        </View>
      );
    }
  }

  // 오류 발생 시 오류 메시지 표시
  if (error) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm mt-4">
        <View className="items-center py-6">
          <MaterialIcons
            name="error-outline"
            size={36}
            color={Colors.light.error}
          />
          <Text className="text-lg font-bold text-error mt-2 mb-2">
            오류가 발생했습니다
          </Text>
          <Text className="text-gray-500 text-center px-6 mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => setError(null)}
          >
            <Text className="text-white font-medium">다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 식물이 없는 경우
  if (!plant) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm mt-4">
        <View className="items-center py-6">
          <View className="w-20 h-20 bg-tertiary/10 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="eco" size={36} color={Colors.light.tertiary} />
          </View>
          <Text className="text-lg font-bold text-tertiary mb-2">
            식물이 없어요
          </Text>
          <Text className="text-gray-500 text-center px-6 mb-4">
            자녀가 아직 식물을 선택하지 않았어요. 자녀에게 식물을 선택하라고
            알려주세요.
          </Text>
        </View>

        <PlantDisplayFootAction
          userType="parent"
          onInfoPress={onInfoPress}
          childId={childId}
        />
      </View>
    );
  }

  // 자녀가 한 명인 경우
  if (validConnectedChildren.length === 1) {
    return (
      <View className="bg-gray-50 rounded-xl p-4">
        {memoizedRenderChildPlantCard({
          item: validConnectedChildren[0],
          index: 0,
        })}

        <PlantDisplayFootAction
          userType="parent"
          onInfoPress={onInfoPress}
          childId={childId}
        />
      </View>
    );
  }

  // 리스트 아이템 레이아웃 계산을 위한 getItemLayout 함수
  const getItemLayout = (_: any, index: number) => ({
    length: cardWidth,
    offset: cardWidth * index,
    index,
  });

  // 스크롤 실패 시 처리하는 함수
  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 100));
    wait.then(() => {
      flatListRef.current?.scrollToOffset({
        offset: info.index * cardWidth,
        animated: false,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: info.index * cardWidth,
          animated: true,
        });
      }, 50);
    });
  };

  // 자녀가 여러 명일 때 스와이프 카드 표시
  return (
    <View className="bg-gray-50 rounded-xl p-4">
      {/* 스와이프 가능한 자녀 식물 카드 */}
      <FlatList
        ref={flatListRef}
        data={validConnectedChildren}
        renderItem={memoizedRenderChildPlantCard}
        keyExtractor={(item) => item.childId}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={cardWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / cardWidth,
          );
          if (index >= 0 && index < validConnectedChildren.length) {
            const newChildId = validConnectedChildren[index].childId;
            setCurrentChildIndex(index);
            if (handleChildSelect) {
              handleChildSelect(newChildId);
            }
          }
        }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        ItemSeparatorComponent={null}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        removeClippedSubviews={true}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      {/* 페이지 인디케이터 */}
      <View className="flex-row justify-center mt-4 mb-2">
        {validConnectedChildren.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: i,
                animated: true,
              });
              setCurrentChildIndex(i);
              if (handleChildSelect && validConnectedChildren[i]) {
                handleChildSelect(validConnectedChildren[i].childId);
              }
            }}
            className="px-1"
          >
            <View
              className={`w-2 h-2 rounded-full mx-1 ${
                i === currentChildIndex ? 'bg-green-500' : 'bg-green-500/30'
              }`}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* 액션 버튼 영역 */}
      <PlantDisplayFootAction
        userType="parent"
        onInfoPress={onInfoPress}
        childId={selectedChildId || undefined}
      />
    </View>
  );
};

export default React.memo(ParentPlantDisplay);