// hooks/usePlant.ts
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // 🔥 현재 식물 정보 쿼리
  const {
    data: plant,
    isLoading: isLoadingPlant,
    error: plantError,
    refetch: refetchPlant
  } = useQuery({
    queryKey: ['currentPlant', isParent ? 'PARENT' : 'CHILD', childId, plantId],
    queryFn: async () => {
      console.log('식물 데이터 조회 시작:', { isParent, childId, plantId });
      
      let currentPlant = null;
      
      // 부모모드인지 자녀모드인지에 따라 적절한 API 호출
      if (isParent && childId) {
        currentPlant = await plantApi.getChildCurrentPlant(childId);
      } else if (plantId) {
        // 특정 식물 ID가 있으면 해당 식물 정보 가져오기 (API에 없지만 필요시 추가)
        console.warn('특정 식물 ID 조회는 현재 API에서 지원하지 않습니다.');
        currentPlant = await plantApi.getCurrentPlant();
      } else {
        currentPlant = await plantApi.getCurrentPlant();
      }
      
      if (currentPlant) {
        console.log('식물 데이터 로드 완료:', {
          id: currentPlant.id,
          name: currentPlant.name,
          stage: currentPlant.currentStage,
          experience: currentPlant.experience,
          experienceToGrow: currentPlant.experienceToGrow,
          canGrow: currentPlant.canGrow,
          imageUrl: currentPlant.imageUrl,
          plantTypeId: currentPlant.plantTypeId
        });
      } else {
        console.log('현재 진행 중인 식물이 없습니다.');
      }
      
      return currentPlant;
    },
    enabled: !isParent || !!childId, // 부모모드면 childId 필수
    staleTime: 30000, // 30초 동안 fresh 상태 유지
    gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
  });

  // 🔥 식물 타입 정보 쿼리
  const {
    data: plantType,
    isLoading: isLoadingPlantType,
  } = useQuery({
    queryKey: ['plantType', plant?.plantTypeId],
    queryFn: async () => {
      if (!plant) return null;
      
      // 1. 이미 포함된 plantType 사용
      if (plant.plantType) {
        console.log('포함된 plantType 사용');
        return plant.plantType;
      }
      
      // 2. 별도로 plantType 조회
      if (plant.plantTypeId) {
        try {
          console.log('plantType 별도 조회:', plant.plantTypeId);
          const typeData = await plantApi.getPlantTypeById(plant.plantTypeId);
          return typeData;
        } catch (typeError) {
          console.error('식물 타입 조회 실패:', typeError);
          return null;
        }
      }
      
      return null;
    },
    enabled: !!plant,
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지 (타입 정보는 자주 바뀌지 않음)
  });

  // 🔥 식물 이미지 가져오기 함수
  const getPlantImage = useCallback(() => {
    if (!plant || !plantType) return null;

    try {
      const currentStage = Math.max(1, Math.min(plant.currentStage, plantType.growthStages));
      
      // 1. 서버에서 제공한 특정 이미지 URL이 있으면 사용
      if (plant.imageUrl) {
        console.log('서버 특정 이미지 URL 사용:', plant.imageUrl);
        return { uri: plant.imageUrl };
      }
      
      // 2. 모든 단계 이미지 URL 배열이 있으면 현재 단계에 맞는 것 사용
      if (plant.allStageImageUrls && plant.allStageImageUrls[currentStage - 1]) {
        console.log('서버 단계별 이미지 URL 사용:', plant.allStageImageUrls[currentStage - 1]);
        return { uri: plant.allStageImageUrls[currentStage - 1] };
      }
      
      // 3. PlantType의 이미지 URL 배열이 있으면 사용
      if (plantType.imageUrls && plantType.imageUrls[currentStage - 1]) {
        console.log('PlantType 이미지 URL 사용:', plantType.imageUrls[currentStage - 1]);
        return { uri: plantType.imageUrls[currentStage - 1] };
      }
      
      // 4. imagePrefix를 사용해서 동적으로 URL 생성
      if (plantType.imagePrefix) {
        const generatedUrl = plantApi.getPlantImageUrl(plantType.imagePrefix, currentStage);
        console.log('동적 생성 URL 사용:', generatedUrl);
        return { uri: generatedUrl };
      }
      
      // 5. 로컬 이미지 리소스 사용 (최종 폴백)
      console.log('로컬 이미지 사용, 단계:', currentStage);
      
      const imageMap: { [key: number]: any } = {
        1: require('../assets/images/character/level_1.png'),
        2: require('../assets/images/character/level_2.png'),
        3: require('../assets/images/character/level_3.png'),
        4: require('../assets/images/character/level_4.png'),
        5: require('../assets/images/character/level_5.png'),
      };
      
      return imageMap[currentStage] || imageMap[1];
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      // 에러 시에도 기본 이미지 반환
      return require('../assets/images/character/level_1.png');
    }
  }, [plant, plantType]);

  // 🔥 경험치 퍼센트 계산 함수
  const calculateProgressPercent = useCallback((plantData: Plant) => {
    const experience = plantData.experience ?? 0;
    const experienceToGrow = plantData.experienceToGrow ?? 100;
    
    if (experienceToGrow > 0) {
      return Math.min((experience / experienceToGrow) * 100, 100);
    }
    return 0;
  }, []);

  // 🔥 물주기 기능
  const waterPlant = useCallback(async () => {
    if (!plant) {
      throw new Error('식물이 없습니다.');
    }
    
    try {
      console.log('물주기 시작:', plant.id);
      const result = await plantApi.waterPlant(plant.id);
      
      // 🚀 모든 관련 쿼리 무효화 - 실시간 업데이트 핵심!
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['currentPlant'] }),
        queryClient.invalidateQueries({ queryKey: ['promiseStats'] }),
        queryClient.invalidateQueries({ queryKey: ['connectedChildren'] }),
      ]);
      
      console.log('물주기 완료 및 쿼리 무효화 완료');
      
      return result;
    } catch (err) {
      console.error('물주기 오류:', err);
      throw err;
    }
  }, [plant, queryClient]);
  
  // 🔥 성장 단계 올리기
  const growPlant = useCallback(async () => {
    if (!plant) {
      throw new Error('식물이 없습니다.');
    }
    
    if (!plant.canGrow) {
      throw new Error('아직 성장할 수 없습니다. 더 많은 경험치가 필요합니다.');
    }
    
    try {
      console.log('식물 성장 시작:', {
        plantId: plant.id,
        currentStage: plant.currentStage,
        experience: plant.experience,
        experienceToGrow: plant.experienceToGrow
      });
      
      const result = await plantApi.growPlant(plant.id);
      
      // 🚀 모든 관련 쿼리 무효화 - 실시간 업데이트 핵심!
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['currentPlant'] }),
        queryClient.invalidateQueries({ queryKey: ['promiseStats'] }),
        queryClient.invalidateQueries({ queryKey: ['connectedChildren'] }),
        queryClient.invalidateQueries({ queryKey: ['plantCollection'] }),
        queryClient.invalidateQueries({ queryKey: ['plantType'] }),
      ]);
      
      console.log('식물 성장 완료 및 쿼리 무효화 완료:', {
        newStage: result.plant?.currentStage,
        isCompleted: result.isCompleted,
        isMaxStage: result.isMaxStage
      });
      
      return result;
    } catch (err) {
      console.error('식물 성장 오류:', err);
      throw err;
    }
  }, [plant, queryClient]);
  
  // 🔥 식물 데이터 새로고침
  const refreshPlant = useCallback(async () => {
    console.log('식물 데이터 새로고침 시작');
    
    // 관련된 모든 쿼리를 다시 가져오기
    await Promise.all([
      refetchPlant(),
      queryClient.invalidateQueries({ queryKey: ['plantType'] }),
      queryClient.invalidateQueries({ queryKey: ['promiseStats'] }),
    ]);
    
    console.log('식물 데이터 새로고침 완료');
  }, [refetchPlant, queryClient]);

  // 계산된 값들
  const progressPercent = plant ? calculateProgressPercent(plant) : 0;
  const isLoading = isLoadingPlant || isLoadingPlantType;
  const error = plantError ? (plantError as Error).message : null;

  return {
    plant: plant || null,
    plantType: plantType || null,
    isLoading,
    error,
    progressPercent,
    plantImage: getPlantImage(),
    waterPlant,
    growPlant,
    refreshPlant
  };
};