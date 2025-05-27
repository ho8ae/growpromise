// src/api/modules/plant.ts - 티켓 시스템 연동 완전판
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
  isBasic?: boolean;
  createdAt: string;
  quantity?: number;
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
  imageUrl?: string;
  allStageImageUrls?: string[];
}

// 🎯 티켓 시스템 연동: 물주기 결과 타입 - 티켓 정보 추가
export interface WateringResult {
  wateringLog: WateringLog;
  updatedPlant: Plant;
  wateringStreak: number;
  ticketsEarned?: number; // 연속 물주기 보상으로 획득한 티켓 수
  milestoneAchieved?: string; // 달성한 마일스톤 정보
}

// 🎯 티켓 시스템 연동: 성장 결과 타입 - 티켓 정보 추가
export interface GrowthResult {
  plant: Plant;
  isMaxStage: boolean;
  isCompleted: boolean;
  ticketsEarned?: number; // 식물 완료로 획득한 티켓 수
  milestoneAchieved?: string; // 달성한 마일스톤 정보
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

// 🎯 티켓 시스템 연동: 식물 뽑기 결과 타입 - 티켓 사용 정보 추가
export interface DrawResult {
  plantType: PlantType;
  isDuplicate: boolean;
  experienceGained?: number;
  usedTicket?: boolean; // 티켓을 사용했는지 여부
  ticketType?: PackType; // 사용한 티켓 타입
  coinsCost?: number; // 소모한 코인 (티켓 사용이 아닌 경우)
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

// 🎯 티켓 시스템 연동: 식물 통계 타입
export interface PlantStats {
  totalPlants: number;
  completedPlants: number;
  activePlants: number;
  wateringStreak: number;
  plantCompletionCount: number; // 티켓 시스템 카운트
  ticketsFromPlants: number; // 식물 관련으로 획득한 총 티켓 수
}

// 모의 응답 데이터
const mockPlantTypes = [
  {
    id: 'pt1',
    name: '빈 데이터 입니다.',
    description: 'API가 실제로 작동하지 않을 때 사용됩니다.',
    growthStages: 3,
    difficulty: 'MEDIUM',
    category: 'FLOWER',
    imagePrefix: 'rainbow_rose',
    rarity: 'RARE',
    createdAt: new Date().toISOString(),
  }
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
      if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
        return null;
      }
      throw error;
    }
  },

  // 부모가 자녀의 식물 조회
  getChildCurrentPlant: async (childId: string): Promise<Plant | null> => {
    try {
      return await apiRequest<Plant | null>('get', `/plants/children/${childId}/current`);
    } catch (error) {
      console.error('자녀 현재 식물 조회 오류:', error);
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

  // 🎯 티켓 시스템 연동: 식물에 물주기 - 티켓 보상 정보 포함
  waterPlant: async (plantId: string): Promise<WateringResult> => {
    try {
      return await apiRequest<WateringResult>('post', `/plants/${plantId}/water`, {});
    } catch (error) {
      console.error('식물 물주기 오류:', error);
      throw error;
    }
  },

  // 🎯 티켓 시스템 연동: 식물 성장 단계 올리기 - 티켓 보상 정보 포함
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
      return await apiRequest<PlantCollectionGroup[]>('get', `/plants/children/${childId}/collection`);
    } catch (error) {
      console.error('자녀 식물 도감 조회 오류:', error);
      throw error;
    }
  },

  // 인벤토리에서 식물 제거
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
      return await apiRequest<PlantType>('post', '/plants/types', plantTypeData);
    } catch (error) {
      console.error('식물 유형 생성 오류:', error);
      throw error;
    }
  },

  // 🎯 티켓 시스템 연동: 식물 뽑기 (티켓 또는 코인 사용)
  drawPlant: async (packType: PackType, useTicket: boolean = false, ticketId?: string): Promise<DrawResult> => {
    try {
      if (useTicket && ticketId) {
        // 티켓 사용 뽑기
        const result = await apiRequest<DrawResult>('post', `/tickets/${ticketId}/use`);
        return {
          ...result,
          usedTicket: true,
          ticketType: packType,
        };
      } else {
        // 코인 사용 뽑기 (기존 방식)
        try {
          const result = await apiRequest<DrawResult>('post', '/tickets/draw', { packType });
          return {
            ...result,
            usedTicket: false,
            coinsCost: plantApi.getPackPrice(packType),
          };
        } catch (error) {
          console.warn('식물 뽑기 API 실패, 모의 데이터 사용:', error);
          // API 실패 시 모의 데이터 사용
          const randomIndex = Math.floor(Math.random() * mockPlantTypes.length);
          const randomPlantType = mockPlantTypes[randomIndex];
          const isDuplicate = Math.random() < 0.1;
          
          return {
            plantType: randomPlantType as PlantType,
            isDuplicate: isDuplicate,
            experienceGained: isDuplicate ? 15 : undefined,
            usedTicket: false,
            coinsCost: plantApi.getPackPrice(packType),
          };
        }
      }
    } catch (error) {
      console.error('식물 뽑기 오류:', error);
      throw error;
    }
  },

  // 식물 인벤토리 조회
  getPlantInventory: async (): Promise<PlantInventoryItem[]> => {
    try {
      try {
        return await apiRequest<PlantInventoryItem[]>('get', '/plants/inventory');
      } catch (error) {
        console.warn('식물 인벤토리 API 실패, 모의 데이터 사용:', error);
        // API 실패 시 모의 데이터 사용
        const randomPlants: PlantInventoryItem[] = [];
        const usedIndices = new Set<number>();
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
      }
    } catch (error) {
      console.error('식물 인벤토리 조회 오류:', error);
      return [];
    }
  },

  // 자녀의 보유한 식물 유형 목록 조회 (부모용)
  getChildPlantInventory: async (childId: string): Promise<PlantInventoryItem[]> => {
    try {
      return await apiRequest<PlantInventoryItem[]>('get', `/plants/children/${childId}/inventory`);
    } catch (error) {
      console.error('자녀 식물 인벤토리 조회 오류:', error);
      throw error;
    }
  },

  // 🎯 티켓 시스템 연동: 식물 통계 조회
  getPlantStats: async (): Promise<PlantStats> => {
    try {
      return await apiRequest<PlantStats>('get', '/plants/stats');
    } catch (error) {
      console.error('식물 통계 조회 오류:', error);
      return {
        totalPlants: 0,
        completedPlants: 0,
        activePlants: 0,
        wateringStreak: 0,
        plantCompletionCount: 0,
        ticketsFromPlants: 0,
      };
    }
  },

  // 카드팩 가격 정보 조회
  getPackPrices: async (): Promise<Record<PackType, number>> => {
    try {
      return await apiRequest<Record<PackType, number>>('get', '/plants/packs/prices');
    } catch (error) {
      console.error('카드팩 가격 정보 조회 오류:', error);
      // 기본 가격 반환
      return {
        [PackType.BASIC]: 100,
        [PackType.PREMIUM]: 300,
        [PackType.SPECIAL]: 500,
      };
    }
  },

  // 개별 팩 가격 조회
  getPackPrice: (packType: PackType): number => {
    const priceMap = {
      [PackType.BASIC]: 100,
      [PackType.PREMIUM]: 300,
      [PackType.SPECIAL]: 500,
    };
    return priceMap[packType] || 100;
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

  // 🎯 새로운 기능: 물주기 보상 정보 표시
  getWateringRewards: (wateringResult: WateringResult): string[] => {
    const rewards: string[] = [];

    rewards.push(`💧 건강도 +${wateringResult.wateringLog.healthGain}`);

    if (wateringResult.wateringStreak > 1) {
      rewards.push(`🔥 연속 물주기 ${wateringResult.wateringStreak}일`);
    }

    if (wateringResult.ticketsEarned && wateringResult.ticketsEarned > 0) {
      rewards.push(`🎫 티켓 +${wateringResult.ticketsEarned}`);
    }

    if (wateringResult.milestoneAchieved) {
      rewards.push(`🏆 ${wateringResult.milestoneAchieved} 달성!`);
    }

    return rewards;
  },

  // 🎯 새로운 기능: 성장 보상 정보 표시
  getGrowthRewards: (growthResult: GrowthResult): string[] => {
    const rewards: string[] = [];

    if (growthResult.isCompleted) {
      rewards.push('🌟 식물 완료!');
    } else {
      rewards.push(`🌱 성장 단계 ${growthResult.plant.currentStage}`);
    }

    if (growthResult.ticketsEarned && growthResult.ticketsEarned > 0) {
      rewards.push(`🎫 티켓 +${growthResult.ticketsEarned}`);
    }

    if (growthResult.milestoneAchieved) {
      rewards.push(`🏆 ${growthResult.milestoneAchieved} 달성!`);
    }

    return rewards;
  },

  // 희귀도별 색상 가져오기
  getRarityColor: (rarity: string): string => {
    const colorMap = {
      COMMON: '#E5E5E5', // Disabled
      UNCOMMON: '#58CC02', // Primary Green
      RARE: '#1CB0F6', // Info Blue
      EPIC: '#CE82FF', // Accent Purple
      LEGENDARY: '#FFD700', // Gold
    };
    return colorMap[rarity as keyof typeof colorMap] || '#E5E5E5';
  },

  // 희귀도 한국어 변환
  getRarityText: (rarity: string): string => {
    const rarityMap = {
      COMMON: '일반',
      UNCOMMON: '고급',
      RARE: '희귀',
      EPIC: '영웅',
      LEGENDARY: '전설',
    };
    return rarityMap[rarity as keyof typeof rarityMap] || '일반';
  },

  // 난이도별 색상 가져오기
  getDifficultyColor: (difficulty: string): string => {
    const colorMap = {
      EASY: '#58CC02', // Primary Green
      MEDIUM: '#FFC800', // Child Yellow
      HARD: '#FF4B4B', // Danger Red
    };
    return colorMap[difficulty as keyof typeof colorMap] || '#58CC02';
  },

  // 난이도 한국어 변환
  getDifficultyText: (difficulty: string): string => {
    const difficultyMap = {
      EASY: '쉬움',
      MEDIUM: '보통',
      HARD: '어려움',
    };
    return difficultyMap[difficulty as keyof typeof difficultyMap] || '보통';
  },

  // 식물 건강 상태별 색상
  getHealthColor: (health: number): string => {
    if (health >= 80) return '#58CC02'; // Primary Green - 건강
    if (health >= 50) return '#FFC800'; // Child Yellow - 보통
    if (health >= 30) return '#FF8C00'; // Orange - 주의
    return '#FF4B4B'; // Danger Red - 위험
  },

  // 식물 건강 상태 텍스트
  getHealthText: (health: number): string => {
    if (health >= 80) return '매우 건강';
    if (health >= 50) return '건강';
    if (health >= 30) return '주의 필요';
    return '위험';
  },

  // 경험치 진행률 계산
  getExperienceProgress: (plant: Plant): number => {
    if (!plant.experience || !plant.experienceToGrow) return 0;
    return Math.round((plant.experience / plant.experienceToGrow) * 100);
  },

  // 다음 물주기까지 남은 시간 계산
  getTimeUntilNextWatering: (lastWatered: string): { hours: number; canWater: boolean } => {
    const lastWateredDate = new Date(lastWatered);
    const now = new Date();
    const diffMs = now.getTime() - lastWateredDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    // 하루(24시간) 후에 다시 물주기 가능
    const hoursUntilNext = Math.max(0, 24 - diffHours);
    
    return {
      hours: hoursUntilNext,
      canWater: hoursUntilNext === 0,
    };
  },

  // 식물 성장 가능 여부 확인
  canPlantGrow: (plant: Plant): boolean => {
    return plant.canGrow === true && plant.experience! >= (plant.experienceToGrow || 0);
  },

  // 식물 완료까지 필요한 경험치 계산
  getRequiredExperienceForCompletion: (plant: Plant): number => {
    if (!plant.plantType || !plant.experienceToGrow) return 0;
    
    const currentStageExp = plant.experience || 0;
    const remainingStages = plant.plantType.growthStages - plant.currentStage;
    const avgExpPerStage = plant.experienceToGrow;
    
    return (remainingStages * avgExpPerStage) - currentStageExp;
  },

  // 카테고리별 아이콘 가져오기
  getCategoryIcon: (category: string): string => {
    const iconMap = {
      FLOWER: '🌸',
      TREE: '🌳',
      VEGETABLE: '🥕',
      FRUIT: '🍎',
      OTHER: '🌿',
    };
    return iconMap[category as keyof typeof iconMap] || '🌿';
  },

  // 팩 타입별 아이콘 가져오기
  getPackIcon: (packType: PackType): string => {
    const iconMap = {
      [PackType.BASIC]: '📦',
      [PackType.PREMIUM]: '🎁',
      [PackType.SPECIAL]: '💎',
    };
    return iconMap[packType] || '📦';
  },

  // 팩 타입 한국어 변환
  getPackTypeText: (packType: PackType): string => {
    const typeMap = {
      [PackType.BASIC]: '기본 팩',
      [PackType.PREMIUM]: '프리미엄 팩',
      [PackType.SPECIAL]: '스페셜 팩',
    };
    return typeMap[packType] || '기본 팩';
  },

  // 뽑기 결과 요약 텍스트 생성
  getDrawResultSummary: (result: DrawResult): string => {
    const plantName = result.plantType.name;
    const rarity = plantApi.getRarityText(result.plantType.rarity || 'COMMON');
    
    if (result.isDuplicate) {
      return `중복! ${rarity} ${plantName} (+${result.experienceGained || 0} 경험치)`;
    }
    
    return `새로운 ${rarity} ${plantName} 획득!`;
  },

  // 🎯 티켓 시스템 연동: 뽑기 비용 정보 표시
  getDrawCostInfo: (packType: PackType, hasTicket: boolean = false): {
    canUseTicket: boolean;
    coinCost: number;
    costText: string;
  } => {
    const coinCost = plantApi.getPackPrice(packType);
    
    return {
      canUseTicket: hasTicket,
      coinCost,
      costText: hasTicket 
        ? `티켓 사용 또는 ${coinCost} 코인`
        : `${coinCost} 코인`,
    };
  },
};

export default plantApi;