// src/services/stickerService.ts
import { StickerTemplate } from '../api/modules/sticker';

/**
 * API 통신에 문제가 생겼을 때를 대비한 기본 스티커 템플릿
 * 실제로는 API에서 이 정보를 가져옵니다.
 */
const FALLBACK_TEMPLATES: StickerTemplate[] = [
  {
    id: 'fallback-star',
    name: '별 스티커',
    description: '반짝이는 황금 별 모양의 스티커입니다.',
    category: '기본',
    imageUrl: 'https://growpromise-uploads.s3.ap-northeast-2.amazonaws.com/growpromise-sticker/sticker_1.png',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fallback-heart',
    name: '하트 스티커',
    description: '따뜻한 마음을 표현하는 하트 모양 스티커입니다.',
    category: '기본',
    imageUrl: 'https://growpromise-uploads.s3.ap-northeast-2.amazonaws.com/growpromise-sticker/sticker_2.png',
    createdAt: new Date().toISOString()
  }
];

/**
 * 스티커 이미지 소스 가져오기
 */
export const getStickerImageSource = (imageUrl: string) => {
  if (!imageUrl) {
    return { uri: 'https://growpromise-uploads.s3.ap-northeast-2.amazonaws.com/growpromise-sticker/sticker_1.png' };
  }
  
  return { uri: imageUrl };
};

/**
 * API 실패 시 폴백으로 사용할 기본 템플릿 반환
 */
export const getFallbackTemplates = () => {
  return FALLBACK_TEMPLATES;
};

export default {
  getStickerImageSource,
  getFallbackTemplates
};