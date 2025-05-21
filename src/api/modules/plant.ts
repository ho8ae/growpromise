import { apiRequest } from '../client';

// 식물 유형 타입
export interface PlantType {
  id: string;
  name: string;
  description?: string;
  growthStages: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: 'FLOWER' | 'TREE' | 'VEGETABLE' | 'FRUIT' | 'OTHER';
  unlockRequirement?: number;
  imagePrefix: string;
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isBasic? : boolean
  createdAt: string;
  quantity?: number;

  // 이미지 URL (서버에서 추가됨)
  imageUrls?: string[];
  previewImageUrl?: string;
}

// 물주기 로그 타입
export interface WateringLog {
  id: string;
  plantId: string;
  timestamp: string;
  healthGain: number;
}

// 식물 인스턴스 타입
export interface Plant {
  id: string;
  childId: string;
  plantTypeId: string;
  name?: string;
  currentStage: number;
  health: number;
  lastWatered: string;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  plantType?: PlantType;
  wateringLogs?: WateringLog[];
  experience?: number;
  experienceToGrow?: number;
  canGrow?: boolean;

  // 이미지 URL (서버에서 추가됨)
  imageUrl?: string;
  allStageImageUrls?: string[];
}


// 물주기 결과 타입
export interface WateringResult {
  wateringLog: WateringLog;
  updatedPlant: Plant;
  wateringStreak: number;
}

// 성장 결과 타입
export interface GrowthResult {
  plant: Plant;
  isMaxStage: boolean;
  isCompleted: boolean;
}

// 식물 도감 그룹 타입
export interface PlantCollectionGroup {
  plantType: PlantType;
  plants: Plant[];
}

// 카드팩 타입
export enum PackType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  SPECIAL = 'SPECIAL',
}

// 식물 뽑기 결과 타입
export interface DrawResult {
  plantType: PlantType ;
  isDuplicate: boolean;
  experienceGained?: number;

}

// 인벤토리 식물 타입
export interface PlantInventoryItem {
  id: string;
  childId: string;
  plantTypeId: string;
  quantity?: number;
  acquiredAt: string;
  plantType: PlantType;
}

// 모의 응답 데이터 (API가 실제로 작동하지 않을 때 사용)
const mockPlantTypes = [
  {
    id: 'pt1',
    name: '무지개 장미',
    description: '칠색 빛깔의 아름다운 장미입니다.',
    growthStages: 3,
    difficulty: 'MEDIUM',
    category: 'FLOWER',
    imagePrefix: 'rainbow_rose',
    rarity: 'RARE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt2',
    name: '황금 선인장',
    description: '금빛이 도는 귀한 선인장입니다.',
    growthStages: 2,
    difficulty: 'EASY',
    category: 'FLOWER',
    imagePrefix: 'golden_cactus',
    rarity: 'UNCOMMON',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt3',
    name: '밤하늘 튤립',
    description: '밤하늘처럼 깊은 청색 튤립입니다.',
    growthStages: 4,
    difficulty: 'MEDIUM',
    category: 'FLOWER',
    imagePrefix: 'night_tulip',
    rarity: 'COMMON',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt4',
    name: '불꽃 나무',
    description: '불꽃처럼 붉은 잎을 가진 특별한 나무입니다.',
    growthStages: 5,
    difficulty: 'HARD',
    category: 'TREE',
    imagePrefix: 'fire_tree',
    rarity: 'EPIC',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt5',
    name: '전설의 사과나무',
    description: '황금 사과를 맺는 전설 속의 나무입니다.',
    growthStages: 6,
    difficulty: 'HARD',
    category: 'FRUIT',
    imagePrefix: 'legendary_apple',
    rarity: 'LEGENDARY',
    createdAt: new Date().toISOString(),
  },
];




// 식물 관련 API 함수들
const plantApi = {
  // 모든 식물 유형 조회
  getAllPlantTypes: async (childId?: string): Promise<PlantType[]> => {
    try {
      let url = '/plants/types';
      if (childId) {
        url += `?childId=${childId}`;
      }
      return await apiRequest<PlantType[]>('get', url);
    } catch (error) {
      console.error('식물 유형 조회 오류:', error);
      throw error;
    }
  },

  // 식물 유형 상세 조회
  getPlantTypeById: async (id: string): Promise<PlantType> => {
    try {
      return await apiRequest<PlantType>('get', `/plants/types/${id}`);
    } catch (error) {
      console.error('식물 유형 상세 조회 오류:', error);
      throw error;
    }
  },

  // 현재 자녀의 식물 조회 (자녀용)
  getCurrentPlant: async (): Promise<Plant | null> => {
    try {
      return await apiRequest<Plant | null>('get', '/plants/current');
    } catch (error) {
      console.error('현재 식물 조회 오류:', error);
      // 현재 식물이 없는 경우는 오류가 아닐 수 있음
      if (
        error instanceof Error &&
        error.message.includes('찾을 수 없습니다')
      ) {
        return null;
      }
      throw error;
    }
  },

  // 부모가 자녀의 식물 조회
  getChildCurrentPlant: async (childId: string): Promise<Plant | null> => {
    try {
      return await apiRequest<Plant | null>(
        'get',
        `/plants/children/${childId}/current`,
      );
    } catch (error) {
      console.error('자녀 현재 식물 조회 오류:', error);
      // 현재 식물이 없는 경우는 오류가 아닐 수 있음
      if (
        error instanceof Error &&
        error.message.includes('찾을 수 없습니다')
      ) {
        return null;
      }
      throw error;
    }
  },

  // 자녀의 모든 식물 조회
  getChildPlants: async (childId: string): Promise<Plant[]> => {
    try {
      return await apiRequest<Plant[]>('get', `/plants/children/${childId}`);
    } catch (error) {
      console.error('자녀 식물 목록 조회 오류:', error);
      throw error;
    }
  },

  // 새 식물 시작하기 (자녀)
  startNewPlant: async (
    plantTypeId: string,
    plantName?: string,
  ): Promise<Plant> => {
    try {
      return await apiRequest<Plant>('post', '/plants/start', {
        plantTypeId,
        plantName,
      });
    } catch (error) {
      console.error('새 식물 시작 오류:', error);
      throw error;
    }
  },

  // 식물에 물주기
  waterPlant: async (plantId: string): Promise<WateringResult> => {
    try {
      return await apiRequest<WateringResult>(
        'post',
        `/plants/${plantId}/water`,
        {},
      );
    } catch (error) {
      console.error('식물 물주기 오류:', error);
      throw error;
    }
  },

  // 식물 성장 단계 올리기
  growPlant: async (plantId: string): Promise<GrowthResult> => {
    try {
      return await apiRequest<GrowthResult>(
        'post',
        `/plants/${plantId}/grow`,
        {},
      );
    } catch (error) {
      console.error('식물 성장 오류:', error);
      throw error;
    }
  },

  // 식물 도감 조회 (자녀용)
  getPlantCollection: async (): Promise<PlantCollectionGroup[]> => {
    try {
      return await apiRequest<PlantCollectionGroup[]>(
        'get',
        '/plants/collection',
      );
    } catch (error) {
      console.error('식물 도감 조회 오류:', error);
      throw error;
    }
  },

  // 자녀의 식물 도감 조회 (부모용)
  getChildPlantCollection: async (
    childId: string,
  ): Promise<PlantCollectionGroup[]> => {
    try {
      return await apiRequest<PlantCollectionGroup[]>(
        'get',
        `/plants/children/${childId}/collection`,
      );
    } catch (error) {
      console.error('자녀 식물 도감 조회 오류:', error);
      throw error;
    }
  },

  removeFromInventory: async (plantTypeId: string): Promise<boolean> => {
    try {
      await apiRequest<void>('delete', `/plants/inventory/${plantTypeId}`);
      return true;
    } catch (error) {
      console.error('인벤토리에서 식물 제거 오류:', error);
      return false;
    }
  },
  

  // 식물 유형 추가 (관리자용)
  createPlantType: async (plantTypeData: {
    name: string;
    description?: string;
    growthStages: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    category: 'FLOWER' | 'TREE' | 'VEGETABLE' | 'FRUIT' | 'OTHER';
    unlockRequirement?: number;
    imagePrefix: string;
    rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    isBasic?: boolean;
  }): Promise<PlantType> => {
    try {
      return await apiRequest<PlantType>(
        'post',
        '/plants/types',
        plantTypeData,
      );
    } catch (error) {
      console.error('식물 유형 생성 오류:', error);
      throw error;
    }
  },

  // 식물 뽑기 (카드팩 오픈) - 모의 구현
  drawPlant: async (packType: PackType): Promise<DrawResult> => {
    try {
      // 실제 API 호출 시도 (단, 실패해도 모의 데이터 반환)
      try {
        return await apiRequest<DrawResult>('post', '/plants/draw', {
          packType: packType
        });
      } catch (error) {
        console.warn('식물 뽑기 API 실패, 모의 데이터 사용:', error);
        // API 실패 시 모의 데이터 사용
      }
      
      // 랜덤 식물 타입 선택
      const randomIndex = Math.floor(Math.random() * mockPlantTypes.length);
      const randomPlantType = mockPlantTypes[randomIndex];
      
      // 중복 여부 랜덤 결정 (10% 확률로 중복)
      const isDuplicate = Math.random() < 0.1;
      
      // 모의 응답 반환
      return {
        plantType: randomPlantType as PlantType,
        isDuplicate: isDuplicate,
        experienceGained: isDuplicate ? 15 : undefined
      };
    } catch (error) {
      console.error('식물 뽑기 오류:', error);
      throw error;
    }
  },
  
  // 모의 식물 인벤토리 구현
  getPlantInventory: async (): Promise<PlantInventoryItem[]> => {
    try {
      // 실제 API 호출 시도
      try {
        return await apiRequest<PlantInventoryItem[]>('get', '/plants/inventory');
      } catch (error) {
        console.warn('식물 인벤토리 API 실패, 모의 데이터 사용:', error);
        // API 실패 시 모의 데이터 사용
      }
      
      // 항상 3개의 식물을 랜덤하게 선택하여 반환
      const randomPlants: PlantInventoryItem[] = [];
      const usedIndices = new Set<number>();
      
      // 3개 또는 그 이하의 랜덤 식물 선택
      const count = Math.min(3, mockPlantTypes.length);
      
      while (randomPlants.length < count) {
        const randomIndex = Math.floor(Math.random() * mockPlantTypes.length);
        
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          const plantType = mockPlantTypes[randomIndex];
          
          randomPlants.push({
            id: `inv_${randomIndex}`,
            childId: 'mock_child_id',
            plantTypeId: plantType.id,
            acquiredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            plantType: plantType as PlantType
          });
        }
      }
      
      return randomPlants;
    } catch (error) {
      console.error('식물 인벤토리 조회 오류:', error);
      return [];
    }
  },

  // 자녀의 보유한 식물 유형 목록 조회 (부모용)
  getChildPlantInventory: async (
    childId: string,
  ): Promise<PlantInventoryItem[]> => {
    try {
      return await apiRequest<PlantInventoryItem[]>(
        'get',
        `/plants/children/${childId}/inventory`,
      );
    } catch (error) {
      console.error('자녀 식물 인벤토리 조회 오류:', error);
      throw error;
    }
  },

  // 카드팩 가격 정보 조회
  getPackPrices: async (): Promise<Record<PackType, number>> => {
    try {
      return await apiRequest<Record<PackType, number>>(
        'get',
        '/plants/packs/prices',
      );
    } catch (error) {
      console.error('카드팩 가격 정보 조회 오류:', error);
      throw error;
    }
  },

  // 식물 이미지 URL 헬퍼 함수
  getPlantImageUrl: (imagePrefix: string, stage: number): string => {
    return `https://growpromise-uploads.s3.ap-northeast-2.amazonaws.com/plant/${imagePrefix}_${stage}.png`;
  },

  // 로컬에서 식물 성장 단계별 이미지 URL 생성
  getPlantStageImages: (plantType: PlantType): string[] => {
    const urls: string[] = [];

    for (let stage = 1; stage <= plantType.growthStages; stage++) {
      urls.push(plantApi.getPlantImageUrl(plantType.imagePrefix, stage));
    }

    return urls;
  },
};

export default plantApi;
