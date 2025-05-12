import apiClient, { ApiResponse, apiRequest } from '../client';
import { Sticker } from './sticker';

// 보상 타입
export interface Reward {
  id: string;
  parentId: string;
  title: string;
  description?: string;
  requiredStickers: number;
  isActive: boolean;
  createdAt: string;
  parent?: {
    user: {
      username: string;
    };
  };
}

// 자녀 보상 타입 (추가 필드 포함)
export interface ChildReward extends Reward {
  availableStickers: number;
  progress: number;
  isAchievable: boolean; // 달성 가능 여부 추가
}

// 보상 생성 요청 타입
export interface CreateRewardRequest {
  title: string;
  description?: string;
  requiredStickers: number;
  isActive?: boolean;
}

// 보상 달성 결과 타입
export interface RewardAchievement {
  reward: Reward;
  usedStickers: number;
}

// 보상 API 함수들
const rewardApi = {
  // 보상 생성 (부모)
  createReward: async (data: CreateRewardRequest): Promise<Reward> => {
    try {
      return await apiRequest<Reward>('post', '/rewards', data);
    } catch (error) {
      console.error('보상 생성 오류:', error);
      throw error;
    }
  },
  
  // 부모의 보상 목록 조회
  getParentRewards: async (): Promise<Reward[]> => {
    try {
      return await apiRequest<Reward[]>('get', '/rewards/parent');
    } catch (error) {
      console.error('부모 보상 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // 자녀의 보상 목록 조회
  getChildRewards: async (): Promise<ChildReward[]> => {
    try {
      return await apiRequest<ChildReward[]>('get', '/rewards/child');
    } catch (error) {
      console.error('자녀 보상 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // 보상 상세 조회
  getRewardById: async (id: string): Promise<Reward> => {
    try {
      return await apiRequest<Reward>('get', `/rewards/${id}`);
    } catch (error) {
      console.error('보상 상세 조회 오류:', error);
      throw error;
    }
  },
  
  // 보상 업데이트 (부모)
  updateReward: async (id: string, data: Partial<CreateRewardRequest>): Promise<Reward> => {
    try {
      return await apiRequest<Reward>('put', `/rewards/${id}`, data);
    } catch (error) {
      console.error('보상 업데이트 오류:', error);
      throw error;
    }
  },
  
  // 보상 삭제 (부모)
  deleteReward: async (id: string): Promise<any> => {
    try {
      return await apiRequest<any>('delete', `/rewards/${id}`);
    } catch (error) {
      console.error('보상 삭제 오류:', error);
      throw error;
    }
  },
  
  // 보상 달성 (자녀) - 스티커 삭제 버전
  achieveReward: async (id: string): Promise<RewardAchievement> => {
    try {
      return await apiRequest<RewardAchievement>('post', `/rewards/${id}/achieve`, {});
    } catch (error) {
      console.error('보상 달성 오류:', error);
      throw error;
    }
  }
};

export default rewardApi;