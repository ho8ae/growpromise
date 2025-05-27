// src/api/modules/promise.ts - 티켓 시스템 연동 업데이트
import apiClient, { ApiResponse, apiRequest } from '../client';
import api from '../index';

// 약속 상태 타입
export enum PromiseStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// 약속 반복 타입
export enum RepeatType {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

// 약속 타입 (Promise 이름은 자바스크립트 내장 타입과 충돌하므로 PromiseTask로 변경)
export interface PromiseTask {
  id: string;
  title: string;
  description?: string;
  repeatType: RepeatType;
  startDate: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  assignments?: PromiseAssignment[];
  parent?: {
    user: {
      username: string;
    };
  };
}

// 약속 할당 타입
export interface PromiseAssignment {
  id: string;
  promiseId: string;
  childId: string;
  dueDate: string;
  status: PromiseStatus;
  verificationImage?: string;
  verificationTime?: string;
  verificationDescription?: string;
  completedAt?: string;
  rejectionReason?: string;
  message?: string;
  promise?: PromiseTask;
  child?: {
    user: {
      username: string;
      profileImage?: string;
    };
  };
}

// 약속 생성 요청 타입
export interface CreatePromiseRequest {
  title: string;
  description?: string;
  repeatType: RepeatType;
  startDate: string;
  endDate?: string;
  childIds: string[];
  isActive?: boolean;
}

// 약속 통계 응답 타입 (티켓 정보 추가)
export interface PromiseStats {
  totalPromises: number;
  completedPromises: number;
  pendingPromises: number;
  characterStage: number;
  stickerCount: number;
  // 🎯 티켓 시스템 연동: 추가 통계 정보
  verificationCount?: number; // 약속 인증 완료 횟수
  plantCompletionCount?: number; // 식물 완료 횟수
  wateringStreak?: number; // 연속 물주기 일수
  ticketCounts?: {
    BASIC: number;
    PREMIUM: number;
    SPECIAL: number;
  };
  totalTickets?: number;
}

// 약속 인증 응답 타입 (경험치 정보 추가)
export interface VerificationResponse {
  promiseAssignment: PromiseAssignment;
  experienceGained?: number; // 획득한 경험치
  ticketsEarned?: number; // 획득한 티켓 수 (마일스톤 달성 시)
  milestoneAchieved?: string; // 달성한 마일스톤 정보
}

// 갤러리 이미지 타입
export interface GalleryImage {
  id: string;
  promiseId: string;
  promiseTitle: string;
  imageUrl: string;
  verificationTime: string;
  childId: string;
  childName: string;
  childProfileImage?: string;
  isFavorite: boolean;
}

// 약속 API 함수들
const promiseApi = {
  // 약속 생성 (부모)
  createPromise: async (data: CreatePromiseRequest): Promise<PromiseTask> => {
    try {
      const requestData = {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
      };
      return await apiRequest<PromiseTask>('post', '/promises', requestData);
    } catch (error) {
      console.error('약속 생성 오류:', error);
      throw error;
    }
  },

  // 부모의 자녀 목록 조회
  getParentChildren: async () => {
    try {
      return await apiRequest<any[]>('get', '/promises/children');
    } catch (error) {
      console.error('자녀 목록 조회 오류:', error);
      throw error;
    }
  },

  // 부모의 약속 목록 조회
  getParentPromises: async (): Promise<PromiseTask[]> => {
    try {
      const response = await apiRequest<PromiseTask[]>('get', '/promises');
      return response.map((promise) => ({
        ...promise,
        isActive: promise.isActive !== undefined ? promise.isActive : true,
      }));
    } catch (error) {
      console.error('부모 약속 목록 조회 오류:', error);
      throw error;
    }
  },

  // 자녀의 약속 목록 조회
  getChildPromises: async (status?: PromiseStatus): Promise<PromiseAssignment[]> => {
    try {
      const url = status ? `/promises/child?status=${status}` : '/promises/child';
      const response = await apiRequest<PromiseAssignment[]>('get', url);

      return response.map((assignment) => {
        if (assignment.promise) {
          return {
            ...assignment,
            promise: {
              ...assignment.promise,
              isActive: assignment.promise.isActive !== undefined ? assignment.promise.isActive : true,
            },
          };
        }
        return assignment;
      });
    } catch (error) {
      console.error('자녀 약속 목록 조회 오류:', error);
      throw error;
    }
  },

  // 약속 상세 조회
  getPromiseById: async (id: string): Promise<PromiseTask> => {
    try {
      const response = await apiRequest<PromiseTask>('get', `/promises/${id}`);
      return {
        ...response,
        isActive: response.isActive !== undefined ? response.isActive : true,
      };
    } catch (error) {
      console.error('약속 상세 조회 오류:', error);
      throw error;
    }
  },

  // 약속 수정 (부모)
  updatePromise: async (id: string, data: Partial<CreatePromiseRequest>): Promise<PromiseTask> => {
    try {
      return await apiRequest<PromiseTask>('put', `/promises/${id}`, data);
    } catch (error) {
      console.error('약속 수정 오류:', error);
      throw error;
    }
  },

  // 약속 상태 업데이트 (활성화/비활성화)
  updatePromiseStatus: async (id: string, isActive: boolean): Promise<PromiseTask> => {
    try {
      return await apiRequest<PromiseTask>('put', `/promises/${id}/status`, { isActive });
    } catch (error) {
      console.error('약속 상태 업데이트 오류:', error);
      throw error;
    }
  },

  // 약속 삭제 (부모)
  deletePromise: async (id: string): Promise<any> => {
    try {
      return await apiRequest<any>('delete', `/promises/${id}`);
    } catch (error) {
      console.error('약속 삭제 오류:', error);
      throw error;
    }
  },

  // 약속 인증 제출 (자녀)
  submitVerification: async (
    promiseAssignmentId: string,
    imageUri: string,
    verificationDescription?: string,
  ): Promise<PromiseAssignment> => {
    try {
      const formData = new FormData();
      formData.append('promiseAssignmentId', promiseAssignmentId);

      if (verificationDescription) {
        formData.append('verificationDescription', verificationDescription);
      }

      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('verificationImage', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      const response = await apiClient.post<ApiResponse<PromiseAssignment>>(
        '/promises/verify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      console.error('약속 인증 제출 오류:', error);
      throw error;
    }
  },

  // 승인 대기 중인 약속 인증 목록 조회 (부모)
  getPendingVerifications: async (): Promise<PromiseAssignment[]> => {
    try {
      return await apiRequest<PromiseAssignment[]>('get', '/promises/verifications/pending');
    } catch (error) {
      console.error('대기 중인 인증 목록 조회 오류:', error);
      throw error;
    }
  },

  // 🎯 티켓 시스템 연동: 약속 인증 응답 (부모)
  respondToVerification: async (
    id: string,
    approved: boolean,
    rejectionReason?: string,
  ): Promise<VerificationResponse> => {
    try {
      return await apiRequest<VerificationResponse>('post', `/promises/verify/respond/${id}`, {
        approved,
        rejectionReason,
      });
    } catch (error) {
      console.error('약속 인증 응답 오류:', error);
      throw error;
    }
  },

  // 🎯 티켓 시스템 연동: 약속 통계 조회 (자녀) - 확장된 정보
  getChildPromiseStats: async (): Promise<PromiseStats> => {
    try {
      const response = await apiRequest<PromiseStats>('get', '/promises/stats');
      return {
        ...response,
        stickerCount: response.stickerCount !== undefined ? response.stickerCount : 0,
        verificationCount: response.verificationCount || 0,
        plantCompletionCount: response.plantCompletionCount || 0,
        wateringStreak: response.wateringStreak || 0,
        ticketCounts: response.ticketCounts || { BASIC: 0, PREMIUM: 0, SPECIAL: 0 },
        totalTickets: response.totalTickets || 0,
      };
    } catch (error) {
      console.error('약속 통계 조회 오류:', error);
      throw error;
    }
  },

  // 부모가 자녀의 약속 목록 조회 (childId 기준)
  getPromiseAssignmentsByChild: async (childId: string): Promise<PromiseAssignment[]> => {
    try {
      return await apiRequest<PromiseAssignment[]>('get', `/promises/assignments/${childId}`);
    } catch (error) {
      console.error('자녀 약속 목록 조회 오류:', error);
      return [];
    }
  },

  // 부모가 자녀 약속 통계 계산 (자녀의 약속 목록을 이용하여 통계 직접 계산)
  calculateChildPromiseStats: async (
    childId: string,
    childData?: any,
  ): Promise<PromiseStats> => {
    try {
      // 1. 자녀 약속 목록 조회
      const assignments = await promiseApi.getPromiseAssignmentsByChild(childId);

      // 2. 통계 계산
      const totalPromises = assignments.length;
      const completedPromises = assignments.filter((a) => a.status === 'APPROVED').length;
      const pendingPromises = assignments.filter(
        (a) => a.status === 'PENDING' || a.status === 'SUBMITTED',
      ).length;

      // 3. 캐릭터 단계 정보
      let characterStage = 1;

      if (childData && childData.characterStage) {
        characterStage = childData.characterStage;
      } else {
        try {
          const childrenList = await api.user.getParentChildren();
          const childInfo = childrenList.find((c) => c.childId === childId);
          if (childInfo && childInfo.child) {
            characterStage = childInfo.child.characterStage || 1;
          }
        } catch (profileError) {
          console.warn('자녀 프로필 정보 추가 조회 실패:', profileError);
        }
      }

      // 4. 스티커 개수
      let stickerCount = 0;
      try {
        const stickerStats = await apiRequest<{ totalStickers: number }>(
          'get',
          `/stickers/child/${childId}/count`,
        );
        stickerCount = stickerStats.totalStickers || 0;
      } catch (error) {
        console.log('스티커 통계 조회 실패 (무시됨):', error);
      }

      // 🎯 티켓 시스템 연동: 추가 통계 정보 조회
      let verificationCount = 0;
      let plantCompletionCount = 0;
      let wateringStreak = 0;
      let ticketCounts = { BASIC: 0, PREMIUM: 0, SPECIAL: 0 };
      let totalTickets = 0;

      try {
        // 티켓 시스템 통계 API가 있다면 호출
        const ticketStats = await apiRequest<{
          verificationCount: number;
          plantCompletionCount: number;
          wateringStreak: number;
          tickets: {
            counts: { BASIC: number; PREMIUM: number; SPECIAL: number };
            total: number;
          };
        }>('get', `/tickets/child/${childId}/stats`);

        verificationCount = ticketStats.verificationCount || 0;
        plantCompletionCount = ticketStats.plantCompletionCount || 0;
        wateringStreak = ticketStats.wateringStreak || 0;
        ticketCounts = ticketStats.tickets?.counts || { BASIC: 0, PREMIUM: 0, SPECIAL: 0 };
        totalTickets = ticketStats.tickets?.total || 0;
      } catch (error) {
        console.log('티켓 통계 조회 실패 (무시됨):', error);
      }

      return {
        totalPromises,
        completedPromises,
        pendingPromises,
        characterStage,
        stickerCount,
        verificationCount,
        plantCompletionCount,
        wateringStreak,
        ticketCounts,
        totalTickets,
      };
    } catch (error) {
      console.error('자녀 약속 통계 계산 오류:', error);
      return {
        totalPromises: 0,
        completedPromises: 0,
        pendingPromises: 0,
        characterStage: 1,
        stickerCount: 0,
        verificationCount: 0,
        plantCompletionCount: 0,
        wateringStreak: 0,
        ticketCounts: { BASIC: 0, PREMIUM: 0, SPECIAL: 0 },
        totalTickets: 0,
      };
    }
  },

  // 🎯 새로운 기능: 약속 인증 시 획득한 보상 정보 표시
  getVerificationRewards: (verificationResponse: VerificationResponse): string[] => {
    const rewards: string[] = [];

    if (verificationResponse.experienceGained && verificationResponse.experienceGained > 0) {
      rewards.push(`🌱 경험치 +${verificationResponse.experienceGained}`);
    }

    if (verificationResponse.ticketsEarned && verificationResponse.ticketsEarned > 0) {
      rewards.push(`🎫 티켓 +${verificationResponse.ticketsEarned}`);
    }

    if (verificationResponse.milestoneAchieved) {
      rewards.push(`🏆 ${verificationResponse.milestoneAchieved} 달성!`);
    }

    return rewards;
  },

  // 🎯 새로운 기능: 반복 약속의 다음 일정 계산
  getNextSchedule: (promise: PromiseTask): Date | null => {
    if (promise.repeatType === RepeatType.ONCE) {
      return null;
    }

    const now = new Date();
    const startDate = new Date(promise.startDate);
    
    switch (promise.repeatType) {
      case RepeatType.DAILY:
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        return nextDay;
        
      case RepeatType.WEEKLY:
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        return nextWeek;
        
      case RepeatType.MONTHLY:
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
        
      default:
        return null;
    }
  },

  // 🎯 새로운 기능: 약속 완료율 계산
  getCompletionRate: (assignments: PromiseAssignment[]): number => {
    if (assignments.length === 0) return 0;
    
    const completedCount = assignments.filter(a => a.status === PromiseStatus.APPROVED).length;
    return Math.round((completedCount / assignments.length) * 100);
  },

  // 약속 상태별 색상 가져오기
  getStatusColor: (status: PromiseStatus): string => {
    const colorMap = {
      [PromiseStatus.PENDING]: '#E5E5E5', // Disabled
      [PromiseStatus.SUBMITTED]: '#FFC800', // Child Yellow
      [PromiseStatus.APPROVED]: '#58CC02', // Primary Green
      [PromiseStatus.REJECTED]: '#FF4B4B', // Danger Red
      [PromiseStatus.EXPIRED]: '#E5E5E5', // Disabled
    };
    return colorMap[status] || '#E5E5E5';
  },

  // 약속 상태 한국어 변환
  getStatusText: (status: PromiseStatus): string => {
    const statusMap = {
      [PromiseStatus.PENDING]: '대기 중',
      [PromiseStatus.SUBMITTED]: '인증 제출됨',
      [PromiseStatus.APPROVED]: '승인됨',
      [PromiseStatus.REJECTED]: '거절됨',
      [PromiseStatus.EXPIRED]: '만료됨',
    };
    return statusMap[status] || status;
  },

  // 반복 타입 한국어 변환
  getRepeatTypeText: (repeatType: RepeatType): string => {
    const repeatMap = {
      [RepeatType.ONCE]: '한 번',
      [RepeatType.DAILY]: '매일',
      [RepeatType.WEEKLY]: '매주',
      [RepeatType.MONTHLY]: '매월',
    };
    return repeatMap[repeatType] || repeatType;
  },
};

export default promiseApi;