// hooks/usePlant.ts
import { useState, useEffect } from 'react';
import plantApi, { Plant, PlantType } from '../api/modules/plant';

interface UsePlantProps {
  plantId?: string;
  childId?: string;
  isParent?: boolean;
}

interface UsePlantReturn {
  plant: Plant | null;
  plantType: PlantType | null;
  isLoading: boolean;
  error: string | null;
  progressPercent: number;
  plantImage: any;
  waterPlant: () => Promise<any>;
  growPlant: () => Promise<any>;
  refreshPlant: () => Promise<void>;
}

export const usePlant = ({ plantId, childId, isParent = false }: UsePlantProps): UsePlantReturn => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [plantType, setPlantType] = useState<PlantType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  // 식물 데이터 불러오기
  const loadPlantData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let currentPlant = null;
      
      // 부모모드인지 자녀모드인지에 따라 적절한 API 호출
      if (isParent && childId) {
        currentPlant = await plantApi.getChildCurrentPlant(childId);
      } else {
        currentPlant = await plantApi.getCurrentPlant();
      }
      
      setPlant(currentPlant);
      
      // 식물 타입 정보가 없으면 별도로 가져오기
      if (currentPlant && currentPlant.plantType) {
        setPlantType(currentPlant.plantType);
      } else if (currentPlant && currentPlant.plantTypeId) {
        const typeData = await plantApi.getPlantTypeById(currentPlant.plantTypeId);
        setPlantType(typeData);
      }
      
      // 경험치 퍼센트 계산
      if (currentPlant) {
        const experience = currentPlant.experience ?? 0;
        const experienceToGrow = currentPlant.experienceToGrow ?? 100;
        
        if (experienceToGrow > 0) {
          const percent = Math.min((experience / experienceToGrow) * 100, 100);
          setProgressPercent(percent);
        } else {
          setProgressPercent(0);
        }
      }
    } catch (err) {
      console.error('식물 데이터 로드 오류:', err);
      setError('식물 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPlantData();
  }, [childId, isParent]);
  
  // 식물 이미지 가져오기
  const getPlantImage = () => {
    if (!plant || !plantType) return null;

    try {
      const imageStage = Math.max(
        1,
        Math.min(plant.currentStage, plantType.growthStages || 5),
      );
      
      if (plant.imageUrl) {
        // 서버에서 제공한 이미지 URL이 있으면 사용
        console.log('서버 이미지 URL:', plant.imageUrl);
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
  
  // 물주기 기능
  const waterPlant = async () => {
    if (!plant) return;
    
    try {
      const result = await plantApi.waterPlant(plant.id);
      setPlant(result.updatedPlant);
      
      // 경험치 퍼센트 갱신
      const experience = result.updatedPlant.experience ?? 0;
      const experienceToGrow = result.updatedPlant.experienceToGrow ?? 100;
      
      if (experienceToGrow > 0) {
        const percent = Math.min((experience / experienceToGrow) * 100, 100);
        setProgressPercent(percent);
      }
      
      return result;
    } catch (err) {
      console.error('물주기 오류:', err);
      throw err;
    }
  };
  
  // 성장 단계 올리기
  const growPlant = async () => {
    if (!plant || !plant.canGrow) return;
    
    try {
      const result = await plantApi.growPlant(plant.id);
      setPlant(result.plant);
      
      // 경험치 퍼센트 갱신
      const experience = result.plant.experience ?? 0;
      const experienceToGrow = result.plant.experienceToGrow ?? 100;
      
      if (experienceToGrow > 0) {
        const percent = Math.min((experience / experienceToGrow) * 100, 100);
        setProgressPercent(percent);
      } else {
        setProgressPercent(0);
      }
      
      return result;
    } catch (err) {
      console.error('식물 성장 오류:', err);
      throw err;
    }
  };
  
  // 식물 데이터 새로고침
  const refreshPlant = async () => {
    await loadPlantData();
  };
  
  return {
    plant,
    plantType,
    isLoading,
    error,
    progressPercent,
    plantImage: getPlantImage(),
    waterPlant,
    growPlant,
    refreshPlant
  };
};