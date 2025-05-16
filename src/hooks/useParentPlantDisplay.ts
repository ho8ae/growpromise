// hooks/useParentPlantDisplay.ts
import { useState, useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import plantApi, { Plant, PlantType } from '../api/modules/plant';

// 타입 정의
interface ChildUserInfo {
  username: string;
  profileImage?: string;
}

interface ChildInfo {
  user: ChildUserInfo;
}

export interface ChildParentConnection {
  childId: string;
  child?: ChildInfo;
}

interface UseParentPlantDisplayProps {
  connectedChildren: ChildParentConnection[];
  initialSelectedChildId?: string | null;
  onChildSelect?: (childId: string) => void;
}

interface UseParentPlantDisplayReturn {
  selectedChildId: string | null;
  currentChildIndex: number;
  plant: Plant | null;
  plantType: PlantType | null;
  isLoading: boolean;
  error: string | null;
  progressPercent: number;
  plantImage: any;
  bounceAnim: Animated.Value;
  handleChildSelect: (childId: string, index: number) => void;
  cardWidth: number;
  refreshPlantData: () => Promise<void>;
}

const { width } = Dimensions.get('window');

export const useParentPlantDisplay = ({
  connectedChildren,
  initialSelectedChildId,
  onChildSelect
}: UseParentPlantDisplayProps): UseParentPlantDisplayReturn => {
  // 상태 관리
  const [selectedChildId, setSelectedChildId] = useState<string | null>(initialSelectedChildId || null);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [plantType, setPlantType] = useState<PlantType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  
  // 애니메이션 값
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // 카드 너비 계산
  const cardSpacing = 30;
  const cardWidth = width - 32 - cardSpacing; // 좌우 16px 패딩 제외

  // 초기 자녀 선택
  useEffect(() => {
    if (connectedChildren.length > 0 && !selectedChildId) {
      const firstChild = connectedChildren[0];
      setSelectedChildId(firstChild.childId);
      onChildSelect?.(firstChild.childId);
    }
  }, [connectedChildren, selectedChildId, onChildSelect]);

  // 애니메이션 효과
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
    
    return () => {
      // 컴포넌트 언마운트 시 애니메이션 중지
      bounceAnim.stopAnimation();
    };
  }, []);

  // 선택된 자녀 인덱스 찾기
  useEffect(() => {
    if (connectedChildren?.length > 0 && selectedChildId) {
      const index = connectedChildren.findIndex(
        (child) => child.childId === selectedChildId,
      );
      if (index !== -1) {
        setCurrentChildIndex(index);
      }
    }
  }, [selectedChildId, connectedChildren]);

  // 식물 데이터 로드
  const loadPlantData = async () => {
    if (!selectedChildId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 선택된 자녀의 식물 데이터 가져오기
      const childPlant = await plantApi.getChildCurrentPlant(selectedChildId);
      setPlant(childPlant);
      
      // 식물 타입 정보가 없으면 별도로 가져오기
      if (childPlant && childPlant.plantType) {
        setPlantType(childPlant.plantType);
      } else if (childPlant && childPlant.plantTypeId) {
        const typeData = await plantApi.getPlantTypeById(childPlant.plantTypeId);
        setPlantType(typeData);
      } else {
        setPlantType(null);
      }
      
      // 경험치 퍼센트 계산
      if (childPlant) {
        const experience = childPlant.experience ?? 0;
        const experienceToGrow = childPlant.experienceToGrow ?? 100;
        
        if (experienceToGrow > 0) {
          const percent = Math.min((experience / experienceToGrow) * 100, 100);
          setProgressPercent(percent);
        } else {
          setProgressPercent(0);
        }
      }
    } catch (err) {
      console.error('자녀 식물 데이터 로드 오류:', err);
      setError('자녀의 식물 정보를 불러오는 중 오류가 발생했습니다.');
      setPlant(null);
      setPlantType(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 선택된 자녀가 변경될 때마다 식물 데이터 로드
  useEffect(() => {
    if (selectedChildId) {
      loadPlantData();
    }
  }, [selectedChildId]);
  
  // 자녀 선택 핸들러
  const handleChildSelect = (childId: string, index: number) => {
    setSelectedChildId(childId);
    setCurrentChildIndex(index);
    onChildSelect?.(childId);
  };
  
  // 이미지 가져오기
  const getPlantImage = () => {
    if (!plant || !plantType) return null;

    try {
      const imageStage = Math.max(
        1,
        Math.min(plant.currentStage, plantType.growthStages || 5),
      );
      
      // 서버에서 제공한 이미지 URL이 있으면 사용
      if (plant.imageUrl) {
        return { uri: plant.imageUrl };
      }
      
      // 로컬 이미지 리소스 사용 (폴백)
      switch (imageStage) {
        case 1:
          return require('../assets/images/character/level_1.png');
        case 2:
          return require('../assets/images/character/level_2.png');
        case 3:
          return require('../assets/images/character/level_3.png');
        case 4:
          return require('../assets/images/character/level_4.png');
        case 5:
          return require('../assets/images/character/level_5.png');
        default:
          return require('../assets/images/character/level_1.png');
      }
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      return require('../assets/images/character/level_1.png');
    }
  };
  
  // 데이터 새로고침
  const refreshPlantData = async () => {
    await loadPlantData();
  };
  
  return {
    selectedChildId,
    currentChildIndex,
    plant,
    plantType,
    isLoading,
    error,
    progressPercent,
    plantImage: getPlantImage(),
    bounceAnim,
    handleChildSelect,
    cardWidth,
    refreshPlantData
  };
};