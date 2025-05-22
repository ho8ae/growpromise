// src/utils/imageUrl.ts

// API에서 제공하는 이미지 기본 URL
export const PLANT_IMAGE_BASE_URL = 'https://growpromise-uploads.s3.ap-northeast-2.amazonaws.com/plant';

/**
 * 식물 이미지 URL을 생성합니다.
 * @param imagePrefix 이미지 접두사 (식물 타입별 고유 식별자)
 * @param stage 성장 단계 (기본값: 1)
 * @returns 완성된 이미지 URL
 */
export const getPlantImageUrl = (imagePrefix: string, stage = 1): string => {
  return `${PLANT_IMAGE_BASE_URL}/${imagePrefix}_${stage}.png`;
};

/**
 * 식물 성장 단계별 이미지 URL 배열을 생성합니다.
 * @param plantType 식물 타입 객체
 * @returns 성장 단계별 이미지 URL 배열
 */
export const getPlantStageImages = (plantType: any): string[] => {
  const urls: string[] = [];
  
  for (let stage = 1; stage <= plantType.growthStages; stage++) {
    urls.push(getPlantImageUrl(plantType.imagePrefix, stage));
  }
  
  return urls;
};

/**
 * 이미지 로딩 실패 시 사용할 대체 이미지를 반환합니다.
 * @param imagePrefix 이미지 접두사 또는 카테고리
 * @returns 로컬 이미지 리소스
 */
export const getPlantFallbackImage = (imagePrefix: string) => {
  // 이미지 prefix에 따라 적절한 이미지 반환
  switch (imagePrefix) {
    case 'rainbow_rose':
      return require('../assets/images/character/level_2.png');
    case 'golden_cactus':
      return require('../assets/images/character/level_3.png');
    case 'night_tulip':
      return require('../assets/images/character/level_4.png');
    case 'fire_tree':
      return require('../assets/images/character/level_5.png');
    case 'legendary_apple':
      return require('../assets/images/character/level_1.png');
    default:
      // 기본 이미지
      return require('../assets/images/character/level_1.png');
  }
};

/**
 * 서버 이미지 URL을 정규화하는 함수
 * 
 * @param url 원본 이미지 URL 또는 경로
 * @returns 정규화된 이미지 URI 객체
 */
export const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  
  if (url.startsWith('http')) {
    return { uri: url };
  } else {
    // 개발 환경과 프로덕션 환경에 따라 기본 URL 설정
    const baseUrl = __DEV__ 
      ? 'http://localhost:3000' 
      : 'https://api.kidsplan.app';
    
    return { uri: `${baseUrl}/${url}` };
  }
};