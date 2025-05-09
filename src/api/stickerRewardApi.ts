import apiClient, { ApiResponse } from './client';

// 스티커 타입
export interface Sticker {
  id: string;
  childId: string;
  rewardId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  reward?: Reward;
}

// 보상 타입
export interface Reward {
  id: string;
  parentId: string;
  title: string;
  description?: string;
  requiredStickers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 보상 생성 요청 타입
export interface CreateRewardRequest {
  title: string;
  description?: string;
  requiredStickers: number;
  isActive?: boolean;
}

// 스티커 및 보상 API 함수들
const stickerRewardApi = {
  // 스티커 생성 (부모)
  createSticker: async (childId: string, title: string, description?: string, image?: FormData) => {
    const formData = new FormData();
    formData.append('childId', childId);
    formData.append('title', title);
    
    if (description) {
      formData.append('description', description);
    }
    
    if (image) {
      // 이미지 파일 추가 로직
    }
    
    const response = await apiClient.post<ApiResponse<Sticker>>('/stickers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },
  
  // 자녀의 스티커 목록 조회 (자녀)
  getChildStickers: async () => {
    const response = await apiClient.get<ApiResponse<Sticker[]>>('/stickers/child');
    return response.data.data;
  },
  
  // 특정 자녀의 스티커 목록 조회 (부모)
  getChildStickersByParent: async (childId: string) => {
    const response = await apiClient.get<ApiResponse<Sticker[]>>(`/stickers/child/${childId}`);
    return response.data.data;
  },
  
  // 스티커 상세 조회
  getStickerById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Sticker>>(`/stickers/${id}`);
    return response.data.data;
  },
  
  // 스티커 삭제 (부모)
  deleteSticker: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<any>>(`/stickers/${id}`);
    return response.data;
  },
  
  // 스티커 통계 (자녀)
  getChildStickerStats: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/stickers/stats');
    return response.data.data;
  },
  
  // 보상 생성 (부모)
  createReward: async (data: CreateRewardRequest) => {
    const response = await apiClient.post<ApiResponse<Reward>>('/rewards', data);
    return response.data.data;
  },
  
  // 부모의 보상 목록 조회
  getParentRewards: async () => {
    const response = await apiClient.get<ApiResponse<Reward[]>>('/rewards/parent');
    return response.data.data;
  },
  
  // 자녀의 보상 목록 조회
  getChildRewards: async () => {
    const response = await apiClient.get<ApiResponse<any[]>>('/rewards/child');
    return response.data.data;
  },
  
  // 보상 상세 조회
  getRewardById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Reward>>(`/rewards/${id}`);
    return response.data.data;
  },
  
  // 보상 업데이트 (부모)
  updateReward: async (id: string, data: Partial<CreateRewardRequest>) => {
    const response = await apiClient.put<ApiResponse<Reward>>(`/rewards/${id}`, data);
    return response.data.data;
  },
  
  // 보상 삭제 (부모)
  deleteReward: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<any>>(`/rewards/${id}`);
    return response.data;
  },
  
  // 보상 달성 (자녀)
  achieveReward: async (id: string) => {
    const response = await apiClient.post<ApiResponse<any>>(`/rewards/${id}/achieve`, {});
    return response.data.data;
  }
};

export default stickerRewardApi;