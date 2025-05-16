import apiClient, { ApiResponse, apiRequest } from '../client';

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
  createdAt: string;
  
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
  SPECIAL = 'SPECIAL'
}

// 식물 뽑기 결과 타입
export interface DrawResult {
  plantType: PlantType;
  isDuplicate: boolean;
  experienceGained?: number;
}

// 인벤토리 식물 타입
export interface PlantInventoryItem {
  id: string;
  childId: string;
  plantTypeId: string;
  acquiredAt: string;
  plantType: PlantType;
}

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
      if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
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
        `/plants/children/${childId}/current`
      );
    } catch (error) {
      console.error('자녀 현재 식물 조회 오류:', error);
      // 현재 식물이 없는 경우는 오류가 아닐 수 있음
      if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
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
  startNewPlant: async (plantTypeId: string, plantName?: string): Promise<Plant> => {
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
        {}
      );
    } catch (error) {
      console.error('식물 물주기 오류:', error);
      throw error;
    }
  },

  // 식물 성장 단계 올리기
  growPlant: async (plantId: string): Promise<GrowthResult> => {
    try {
      return await apiRequest<GrowthResult>('post', `/plants/${plantId}/grow`, {});
    } catch (error) {
      console.error('식물 성장 오류:', error);
      throw error;
    }
  },

  // 식물 도감 조회 (자녀용)
  getPlantCollection: async (): Promise<PlantCollectionGroup[]> => {
    try {
      return await apiRequest<PlantCollectionGroup[]>('get', '/plants/collection');
    } catch (error) {
      console.error('식물 도감 조회 오류:', error);
      throw error;
    }
  },

  // 자녀의 식물 도감 조회 (부모용)
  getChildPlantCollection: async (childId: string): Promise<PlantCollectionGroup[]> => {
    try {
      return await apiRequest<PlantCollectionGroup[]>(
        'get',
        `/plants/children/${childId}/collection`
      );
    } catch (error) {
      console.error('자녀 식물 도감 조회 오류:', error);
      throw error;
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
  }): Promise<PlantType> => {
    try {
      return await apiRequest<PlantType>('post', '/plants/types', plantTypeData);
    } catch (error) {
      console.error('식물 유형 생성 오류:', error);
      throw error;
    }
  },
  
  
  
  // 식물 뽑기 (카드팩 오픈)
  drawPlant: async (packType: PackType): Promise<DrawResult> => {
    try {
      return await apiRequest<DrawResult>('post', '/plants/draw', {
        packType: packType
      });
    } catch (error) {
      console.error('식물 뽑기 오류:', error);
      throw error;
    }
  },
  
  // 보유한 식물 유형 목록 조회 (인벤토리)
  getPlantInventory: async (): Promise<PlantInventoryItem[]> => {
    try {
      return await apiRequest<PlantInventoryItem[]>('get', '/plants/inventory');
    } catch (error) {
      console.error('식물 인벤토리 조회 오류:', error);
      throw error;
    }
  },
  
  // 자녀의 보유한 식물 유형 목록 조회 (부모용)
  getChildPlantInventory: async (childId: string): Promise<PlantInventoryItem[]> => {
    try {
      return await apiRequest<PlantInventoryItem[]>(
        'get',
        `/plants/children/${childId}/inventory`
      );
    } catch (error) {
      console.error('자녀 식물 인벤토리 조회 오류:', error);
      throw error;
    }
  },
  
  // 카드팩 가격 정보 조회
  getPackPrices: async (): Promise<Record<PackType, number>> => {
    try {
      return await apiRequest<Record<PackType, number>>('get', '/plants/packs/prices');
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
  }
};

export default plantApi;