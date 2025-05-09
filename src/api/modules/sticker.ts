import apiClient, { ApiResponse, apiRequest } from '../client';
import { Reward } from './reward';

// 스티커 타입
export interface Sticker {
  id: string;
  childId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  rewardId?: string;
  createdAt: string;
  child?: {
    user: {
      username: string;
    };
  };
  reward?: Reward;
}

// 스티커 통계 타입
export interface StickerStats {
  totalStickers: number;
  rewardStats: {
    rewardId: string | null;
    rewardTitle: string;
    count: number;
    requiredStickers: number;
    progress: number;
  }[];
}

// 스티커 API 함수들
const stickerApi = {
  // 스티커 생성 (부모)
  createSticker: async (childId: string, title: string, description?: string, imageUri?: string): Promise<Sticker> => {
    try {
      const formData = new FormData();
      formData.append('childId', childId);
      formData.append('title', title);
      
      if (description) {
        formData.append('description', description);
      }
      
      // 이미지가 있는 경우에만 추가
      if (imageUri) {
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('image', {
          uri: imageUri,
          name: `sticker.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
      
      const response = await apiClient.post<ApiResponse<Sticker>>(
        '/stickers', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('스티커 생성 오류:', error);
      throw error;
    }
  },
  
  // 자녀의 스티커 목록 조회 (자녀)
  getChildStickers: async (): Promise<Sticker[]> => {
    try {
      return await apiRequest<Sticker[]>('get', '/stickers/child');
    } catch (error) {
      console.error('자녀 스티커 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // 특정 자녀의 스티커 목록 조회 (부모)
  getChildStickersByParent: async (childId: string): Promise<Sticker[]> => {
    try {
      return await apiRequest<Sticker[]>('get', `/stickers/child/${childId}`);
    } catch (error) {
      console.error('특정 자녀 스티커 목록 조회 오류:', error);
      throw error;
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
      return await apiRequest<StickerStats>('get', '/stickers/stats');
    } catch (error) {
      console.error('스티커 통계 조회 오류:', error);
      throw error;
    }
  },
};

export default stickerApi;