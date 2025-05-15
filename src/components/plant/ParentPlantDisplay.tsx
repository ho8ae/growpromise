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
import PlantDisplayFootAction from './PlantDisplayFootAction';
import PlantHeader from '../tabs/PlantHeader';


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

interface Plant {
  name?: string;
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

interface ParentPlantDisplayProps {
  plant: Plant | null;
  plantType: PlantType | null;
  onPress?: () => void;
  onInfoPress?: () => void;
  connectedChildren: ChildParentConnection[];
  selectedChildId: string | null;
  handleChildSelect: (childId: string) => void;
  childId?: string;
}

const ParentPlantDisplay: React.FC<ParentPlantDisplayProps> = ({
  plant,
  plantType,
  onPress,
  onInfoPress,
  connectedChildren,
  selectedChildId,
  handleChildSelect,
  childId
}) => {
  // 경험치 퍼센트 상태
  const [progressPercent, setProgressPercent] = useState(0);

  // 애니메이션 값
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // 자녀 슬라이더 관련
  const flatListRef = useRef<FlatList>(null);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardSpacing = 30; // 카드 간격 제거
  const cardWidth = width - 32 - cardSpacing; // 좌우 16px 패딩 제외

  // 경험치 계산 및 업데이트
  useEffect(() => {
    if (plant) {
      const experience = plant.experience ?? 0;
      const experienceToGrow = plant.experienceToGrow ?? 100;

      if (experienceToGrow > 0) {
        const percent = Math.min((experience / experienceToGrow) * 100, 100);
        setProgressPercent(percent);
      } else {
        setProgressPercent(0);
      }
    }
  }, [plant]);

  // 플랜트 바운스 애니메이션
  useEffect(() => {
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

  // 선택된 자녀 인덱스 찾기
  useEffect(() => {
    if (connectedChildren?.length > 0 && selectedChildId) {
      const index = connectedChildren.findIndex(
        (child) => child.childId === selectedChildId,
      );
      if (index !== -1) {
        setCurrentChildIndex(index);
        // 선택된 자녀로 스크롤 (일단 타이머로 지연시켜 리스트가 렌더링된 후 실행)
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToOffset({
              offset: index * cardWidth,
              animated: true,
            });
          } catch (err) {
            console.log('스크롤 오류:', err);
          }
        }, 300);
      }
    }
  }, [selectedChildId, connectedChildren, cardWidth]);

  // 이미지 가져오기
  const getPlantImage = () => {
    if (!plant || !plantType) return null;

    try {
      const imageStage = Math.max(
        1,
        Math.min(plant.currentStage, plantType.growthStages || 5),
      );
      
      switch (imageStage) {
        case 1:
          return require('../../assets/images/character/level_1.png');
        case 2:
          return require('../../assets/images/character/level_2.png');
        case 3:
          return require('../../assets/images/character/level_3.png');
        case 4:
          return require('../../assets/images/character/level_4.png');
        case 5:
          return require('../../assets/images/character/level_5.png');
        default:
          return require('../../assets/images/character/level_1.png');
      }
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      return require('../../assets/images/character/level_1.png');
    }
  };

  // 자녀 식물 카드 렌더링
  const renderChildPlantCard = ({ item, index }: { item: ChildParentConnection; index: number }) => {
    const childName = item.child?.user?.username || '자녀';
    
    // 대표 식물 이미지
    const plantImage = getPlantImage();
    
    // 스티커 개수 (예시값 - 실제로는 API에서 가져와야 함)
    const stickerCount = 15; // 예시 값
    
    return (
      <View style={{ width: cardWidth }}>

        <PlantHeader />
        <Pressable 
          className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200"
          style={{ width: cardWidth - 16, aspectRatio: 0.7 }} // 포켓몬 카드 비율
          onPress={() => onPress?.()}
        >
          {/* 자녀 이름 헤더 - 포켓몬 카드 스타일 */}
          <View className="bg-yellow-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="font-bold text-gray-800 text-base">{childName}</Text>
              <View className="bg-yellow-200 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs font-medium text-yellow-800">기본</Text>
              </View>
            </View>
            
            {/* 스티커 개수 표시 */}
            <View className="flex-row items-center">
              <MaterialIcons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
              <Text className="text-sm font-bold text-yellow-600">{stickerCount}</Text>
            </View>
          </View>
          
          {/* 배경 영역 - 포켓몬 카드 느낌의 배경 */}
          <View className="w-full h-[50%] items-center justify-center bg-blue-50">
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
          
          {/* 식물 정보 영역 - 포켓몬 카드 스타일 */}
          <View className="p-3 bg-white border-t border-gray-200">
            {/* 식물 정보 */}
            <View className="mb-2 pb-2 border-b border-gray-100">
              <Text className="text-sm text-gray-500">
                {plantType?.category || '씨앗 타입'} • Lv.{plant?.currentStage || 1}
              </Text>
            </View>
            
            {/* 식물 이름 및 능력 */}
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {plant?.name || plantType?.name || '식물'}
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
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${plant?.health || 100}%` }}
                />
              </View>
            </View>
            
            {/* 경험치 진행 바 - 포켓몬 카드의 에너지 바 느낌 */}
            <View className="mt-2 mb-1">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-medium text-gray-600">경험치</Text>
                <Text className="text-xs font-medium text-green-600">
                  {plant?.experience || 0}/{plant?.experienceToGrow || 100}
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
            자녀가 아직 식물을 선택하지 않았어요. 자녀에게 식물을 선택하라고 알려주세요.
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
  if (connectedChildren.length <= 1) {
    return (
      <View className="bg-gray-50 rounded-xl p-4 ">
        {renderChildPlantCard({ 
          item: connectedChildren[0], 
          index: 0 
        })}
        
        <PlantDisplayFootAction
          userType="parent"
          onInfoPress={onInfoPress}
          childId={childId}
        />
      </View>
    );
  }

  // 자녀가 여러 명일 때 스와이프 카드 표시
  return (
    <View className="bg-gray-50 rounded-xl p-4">
      {/* 스와이프 가능한 자녀 식물 카드 */}
      <FlatList
        ref={flatListRef}
        data={connectedChildren}
        renderItem={renderChildPlantCard}
        keyExtractor={(item) => item.childId}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={cardWidth} // 카드 너비만큼 스크롤
        snapToAlignment="center"
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToOffset({ 
              offset: info.index * cardWidth,
              animated: true
            });
          });
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / cardWidth
          );
          if (index >= 0 && index < connectedChildren.length) {
            const newChildId = connectedChildren[index].childId;
            setCurrentChildIndex(index);
            handleChildSelect(newChildId);
          }
        }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        ItemSeparatorComponent={null} // 구분자 제거
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />
      
      {/* 페이지 인디케이터 */}
      <View className="flex-row justify-center mt-4 mb-2">
        {connectedChildren.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: i,
                animated: true,
              });
              setCurrentChildIndex(i);
              handleChildSelect(connectedChildren[i].childId);
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
        childId={childId}
      />
    </View>
  );
};

export default ParentPlantDisplay;