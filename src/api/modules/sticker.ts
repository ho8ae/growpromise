import apiClient, { ApiResponse, apiRequest } from '../client';
import { Reward } from './reward';

// 스티커 템플릿 타입
export interface StickerTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

// 스티커 타입
export interface Sticker {
  id: string;
  childId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  rewardId?: string | null; // 추가: 보상에 사용된 경우 보상 ID
  child?: {
    user: {
      username: string;
    };
  };
}

// 스티커 통계 타입
export interface StickerStats {
  totalStickers: number;
  availableStickers: number; // 사용 가능한 스티커 수
  monthlyStats?: Array<{ month: string; count: number }>; // 월별 통계
  rewardStats?: {
    rewardId: string;
    rewardTitle: string;
    requiredStickers: number;
    progress: number;
    canAchieve: boolean; // 달성 가능 여부
  }[];
}

// 스티커 개수 통계 타입
export interface StickerCount {
  totalStickers: number;
  availableStickers: number;
}

// 스티커 API 함수들
const stickerApi = {
  // 모든 스티커 템플릿 조회
  getAllStickerTemplates: async (): Promise<StickerTemplate[]> => {
    try {
      return await apiRequest<StickerTemplate[]>('get', '/stickers/templates');
    } catch (error) {
      console.error('스티커 템플릿 조회 오류:', error);
      throw error;
    }
  },

  // 카테고리별 스티커 템플릿 조회
  getStickerTemplatesByCategory: async (category: string): Promise<StickerTemplate[]> => {
    try {
      return await apiRequest<StickerTemplate[]>('get', `/stickers/templates/category/${category}`);
    } catch (error) {
      console.error('카테고리별 스티커 템플릿 조회 오류:', error);
      throw error;
    }
  },

  // 스티커 생성 (템플릿 사용 방식)
  createSticker: async (
    childId: string, 
    title: string, 
    templateId: string,
    description?: string
  ): Promise<Sticker> => {
    try {
      return await apiRequest<Sticker>('post', '/stickers', {
        childId,
        title,
        templateId,
        description
      });
    } catch (error) {
      console.error('스티커 생성 오류:', error);
      throw error;
    }
  },
  
  // 자녀의 스티커 목록 조회 (자녀)
  getChildStickers: async (): Promise<Sticker[]> => {
    try {
      const result = await apiRequest<Sticker[]>('get', '/stickers/child');
      return result;
    } catch (error) {
      console.error('자녀 스티커 목록 조회 오류:', error);
      return []; // 오류 발생해도 빈 배열 반환
    }
  },
  
  // 특정 자녀의 스티커 목록 조회 (부모)
  getChildStickersByParent: async (childId: string): Promise<Sticker[]> => {
    try {
      return await apiRequest<Sticker[]>('get', `/stickers/child/${childId}`);
    } catch (error) {
      console.error('특정 자녀 스티커 목록 조회 오류:', error);
      return []; // 오류 발생해도 빈 배열 반환
    }
  },
  
  // 스티커 상세 조회
  getStickerById: async (id: string): Promise<Sticker> => {
    try {
      return await apiRequest<Sticker>('get', `/stickers/${id}`);
    } catch (error) {
      console.error('스티커 상세 조회 오류:', error);
      throw error;
    }
  },
  
  // 스티커 삭제 (부모)
  deleteSticker: async (id: string): Promise<any> => {
    try {
      return await apiRequest<any>('delete', `/stickers/${id}`);
    } catch (error) {
      console.error('스티커 삭제 오류:', error);
      throw error;
    }
  },
  
  // 스티커 통계 (자녀)
  getChildStickerStats: async (): Promise<StickerStats> => {
    try {
      // 직접 API 호출
      const response = await apiClient.get<ApiResponse<StickerStats>>('/stickers/stats');
      return response.data.data;
    } catch (error) {
      console.error('스티커 통계 조회 오류:', error);
      // 오류 발생 시 기본 값 반환
      return {
        totalStickers: 0,
        availableStickers: 0,
      };
    }
  },

  // 특정 자녀의 스티커 개수 조회 (부모용)
  getChildStickerCount: async (childId: string): Promise<StickerCount> => {
    try {
      const response = await apiClient.get<ApiResponse<StickerCount>>(`/stickers/child/${childId}/count`);
      return response.data.data;
    } catch (error) {
      console.error('자녀 스티커 개수 조회 오류:', error);
      // 오류 발생 시 기본 값 반환
      return {
        totalStickers: 0,
        availableStickers: 0,
      };
    }
  },
};

export default stickerApi;