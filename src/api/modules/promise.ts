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
  isActive: boolean; // 추가: 약속 활성화 상태
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
  message?: string; // 추가: 인증 시 메시지
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
  isActive?: boolean; // 추가: 약속 활성화 상태 (선택적)
}

// 약속 통계 응답 타입
export interface PromiseStats {
  totalPromises: number;
  completedPromises: number;
  pendingPromises: number;
  characterStage: number;
  stickerCount: number; // 스티커 개수 추가
}

// 약속 API 함수들
const promiseApi = {
  // 약속 생성 (부모)
  createPromise: async (data: CreatePromiseRequest): Promise<PromiseTask> => {
    try {
      // isActive 필드가 없으면 기본값 true로 설정
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

      // 응답에 isActive 필드가 없는 경우 기본값 true 설정
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
  getChildPromises: async (
    status?: PromiseStatus,
  ): Promise<PromiseAssignment[]> => {
    try {
      const url = status
        ? `/promises/child?status=${status}`
        : '/promises/child';
      const response = await apiRequest<PromiseAssignment[]>('get', url);

      // promise 객체가 있는 경우 isActive 필드 설정
      return response.map((assignment) => {
        if (assignment.promise) {
          return {
            ...assignment,
            promise: {
              ...assignment.promise,
              isActive:
                assignment.promise.isActive !== undefined
                  ? assignment.promise.isActive
                  : true,
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

      // isActive 필드가 없는 경우 기본값 true 설정
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
  updatePromise: async (
    id: string,
    data: Partial<CreatePromiseRequest>,
  ): Promise<PromiseTask> => {
    try {
      return await apiRequest<PromiseTask>('put', `/promises/${id}`, data);
    } catch (error) {
      console.error('약속 수정 오류:', error);
      throw error;
    }
  },

  // 약속 상태 업데이트 (활성화/비활성화)
  updatePromiseStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<PromiseTask> => {
    try {
      return await apiRequest<PromiseTask>('put', `/promises/${id}/status`, {
        isActive,
      });
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
    verificationDescription?: string, // 변경: message -> verificationDescription
  ): Promise<PromiseAssignment> => {
    try {
      // 이미지 파일로 FormData 생성
      const formData = new FormData();
      formData.append('promiseAssignmentId', promiseAssignmentId);
  
      // 설명이 있으면 추가
      if (verificationDescription) {
        formData.append('verificationDescription', verificationDescription); // 변경: message -> verificationDescription
      }
  
      // 이미지 파일 준비
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
      return await apiRequest<PromiseAssignment[]>(
        'get',
        '/promises/verifications/pending',
      );
    } catch (error) {
      console.error('대기 중인 인증 목록 조회 오류:', error);
      throw error;
    }
  },

  // 약속 인증 응답 (부모)
  respondToVerification: async (
    id: string,
    approved: boolean,
    rejectionReason?: string,
  ): Promise<{
    promiseAssignment: PromiseAssignment;
    experienceGained?: number; // 추가: 획득한 경험치 정보
  }> => {
    try {
      return await apiRequest<{
        promiseAssignment: PromiseAssignment;
        experienceGained?: number;
      }>('post', `/promises/verify/respond/${id}`, {
        approved,
        rejectionReason,
      });
    } catch (error) {
      console.error('약속 인증 응답 오류:', error);
      throw error;
    }
  },

  // 약속 통계 조회 (자녀)
  getChildPromiseStats: async (): Promise<PromiseStats> => {
    try {
      const response = await apiRequest<PromiseStats>('get', '/promises/stats');

      // 만약 response에 stickerCount가 없으면 기본값 0 추가
      return {
        ...response,
        stickerCount:
          response.stickerCount !== undefined ? response.stickerCount : 0,
      };
    } catch (error) {
      console.error('약속 통계 조회 오류:', error);
      throw error;
    }
  },
  // 부모가 자녀의 약속 목록 조회 (childId 기준)

  // 부모가 자녀의 약속 목록 조회 (childId 기준)
  getPromiseAssignmentsByChild: async (
    childId: string,
  ): Promise<PromiseAssignment[]> => {
    try {
      return await apiRequest<PromiseAssignment[]>(
        'get',
        `/promises/assignments/${childId}`,
      );
    } catch (error) {
      console.error('자녀 약속 목록 조회 오류:', error);
      return [];
    }
  },

  // 부모가 자녀 약속 통계 계산 (자녀의 약속 목록을 이용하여 통계 직접 계산)
  calculateChildPromiseStats: async (
    childId: string, // 이것은 ChildProfile.id (child_profile 테이블의 ID)
    childData?: any, // 선택적으로 이미 로드된 자녀 데이터 전달
  ): Promise<PromiseStats> => {
    try {
      // 1. 자녀 약속 목록 조회
      const assignments = await promiseApi.getPromiseAssignmentsByChild(
        childId,
      );

      // 2. 통계 계산
      const totalPromises = assignments.length;
      const completedPromises = assignments.filter(
        (a) => a.status === 'APPROVED',
      ).length;
      const pendingPromises = assignments.filter(
        (a) => a.status === 'PENDING' || a.status === 'SUBMITTED',
      ).length;

      // 3. 캐릭터 단계 정보
      // 이미 로드된 자녀 데이터가 있으면 그것을 사용
      let characterStage = 1; // 기본값

      if (childData && childData.characterStage) {
        // 이미 로드된 데이터 사용
        characterStage = childData.characterStage;
      } else {
        // 자녀 데이터를 직접 조회해 볼 수 있지만, 필수는 아님
        try {
          const childrenList = await api.user.getParentChildren();
          const childInfo = childrenList.find((c) => c.childId === childId);
          if (childInfo && childInfo.child) {
            characterStage = childInfo.child.characterStage || 1;
          }
        } catch (profileError) {
          console.warn('자녀 프로필 정보 추가 조회 실패:', profileError);
          // 기본값 1 계속 사용
        }
      }

      // 4. 스티커 개수 (선택적)
      let stickerCount = 0;
      try {
        // 스티커 정보가 있다면 가져오기
        const stickerStats = await apiRequest<{ totalStickers: number }>(
          'get',
          `/stickers/child/${childId}/count`,
        );
        stickerCount = stickerStats.totalStickers || 0;
      } catch (error) {
        // 스티커 정보 조회 실패는 무시 (필수 정보가 아니므로)
        console.log('스티커 통계 조회 실패 (무시됨):', error);
      }

      return {
        totalPromises,
        completedPromises,
        pendingPromises,
        characterStage,
        stickerCount,
      };
    } catch (error) {
      console.error('자녀 약속 통계 계산 오류:', error);
      return {
        totalPromises: 0,
        completedPromises: 0,
        pendingPromises: 0,
        characterStage: 1,
        stickerCount: 0,
      };
    }
  },
};

export default promiseApi;
