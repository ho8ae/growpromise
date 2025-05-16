// types/plant.ts
/**
 * 식물 관련 공통 타입 정의
 */

// 식물 기본 정보
export interface Plant {
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
  
  // API 응답용 식물 타입 (옵셔널 필드 허용)
  export interface ApiPlant {
    id?: string;
    name?: string;
    imageUrl?: string;
    plantTypeId?: string;
    plantType?: PlantType;
    experience?: number;
    experienceToGrow?: number;
    currentStage?: number;
    health?: number;
    canGrow?: boolean;
  }
  
  // 식물 종류 정보
  export interface PlantType {
    id?: string;
    name?: string;
    category?: string;
    growthStages: number;
    description?: string;
    unlockLevel?: number;
    imageUrl?: string;
  }
  
  // 자녀 관련 타입
  export interface ChildUserInfo {
    username: string;
    profileImage?: string;
  }
  
  export interface ChildInfo {
    user: ChildUserInfo;
  }
  
  export interface ChildParentConnection {
    childId: string;
    child?: ChildInfo;
  }
  
  // 식물 액션 결과 타입
  export interface PlantActionResult {
    success: boolean;
    experience?: number;
    message?: string;
    levelUp?: boolean;
  }
  
  // API 응답을 내부 Plant 타입으로 변환하는 함수
  export const convertApiPlantToPlant = (apiPlant: ApiPlant | null): Plant | null => {
    if (!apiPlant) return null;
    
    return {
      id: apiPlant.id,
      name: apiPlant.name,
      imageUrl: apiPlant.imageUrl,
      plantTypeId: apiPlant.plantTypeId,
      plantType: apiPlant.plantType,
      experience: apiPlant.experience ?? 0,
      experienceToGrow: apiPlant.experienceToGrow ?? 100,
      currentStage: apiPlant.currentStage ?? 1,
      health: apiPlant.health ?? 100,
      canGrow: apiPlant.canGrow ?? false
    };
  };
  
  // 이미지 경로를 가져오는 유틸리티 함수
  export const getPlantImagePath = (plant: Plant | null, plantType: PlantType | null): any => {
    if (!plant || !plantType) return null;
  
    try {
      const imageStage = Math.max(
        1,
        Math.min(plant.currentStage, plantType.growthStages || 5),
      );
      
      // API에서 이미지 URL을 제공하는 경우
      if (plant.imageUrl) {
        return { uri: plant.imageUrl };
      }
      
      // 로컬 이미지 사용
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