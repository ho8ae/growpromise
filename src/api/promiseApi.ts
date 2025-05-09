import apiClient, { ApiResponse } from './client';

// 약속 타입
export interface Promise {
  id: string;
  title: string;
  description?: string;
  repeatType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
  assignments?: PromiseAssignment[];
}

// 약속 할당 타입
export interface PromiseAssignment {
  id: string;
  promiseId: string;
  childId: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  verificationImage?: string;
  verificationTime?: string;
  completedAt?: string;
  rejectionReason?: string;
  promise?: Promise;
  child?: any;
}

// 약속 생성 요청 타입
export interface CreatePromiseRequest {
  title: string;
  description?: string;
  repeatType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate?: string;
  childIds: string[];
}

// 약속 API 함수들
const promiseApi = {
  // 약속 생성 (부모)
  createPromise: async (data: CreatePromiseRequest) => {
    const response = await apiClient.post<ApiResponse<Promise>>('/promises', data);
    return response.data.data;
  },
  
  // 부모의 자녀 목록 조회
  getParentChildren: async () => {
    const response = await apiClient.get<ApiResponse<any[]>>('/promises/children');
    return response.data.data;
  },
  
  // 부모의 약속 목록 조회
  getParentPromises: async () => {
    const response = await apiClient.get<ApiResponse<Promise[]>>('/promises');
    return response.data.data;
  },
  
  // 자녀의 약속 목록 조회
  getChildPromises: async (status?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED') => {
    const url = status ? `/promises/child?status=${status}` : '/promises/child';
    const response = await apiClient.get<ApiResponse<PromiseAssignment[]>>(url);
    return response.data.data;
  },
  
  // 약속 상세 조회
  getPromiseById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Promise>>(`/promises/${id}`);
    return response.data.data;
  },
  
  // 약속 수정 (부모)
  updatePromise: async (id: string, data: Partial<CreatePromiseRequest>) => {
    const response = await apiClient.put<ApiResponse<Promise>>(`/promises/${id}`, data);
    return response.data.data;
  },
  
  // 약속 삭제 (부모)
  deletePromise: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<any>>(`/promises/${id}`);
    return response.data;
  },
  
  // 약속 인증 제출 (자녀)
  submitVerification: async (promiseAssignmentId: string, image: FormData) => {
    const response = await apiClient.post<ApiResponse<PromiseAssignment>>(
      '/promises/verify', 
      { promiseAssignmentId, image },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
  
  // 약속 인증 응답 (부모)
  respondToVerification: async (id: string, approved: boolean, rejectionReason?: string) => {
    const response = await apiClient.post<ApiResponse<PromiseAssignment>>(
      `/promises/verify/respond/${id}`,
      { approved, rejectionReason }
    );
    return response.data.data;
  },
  
  // 승인 대기 중인 약속 인증 목록 조회 (부모)
  getPendingVerifications: async () => {
    const response = await apiClient.get<ApiResponse<PromiseAssignment[]>>('/promises/verifications/pending');
    return response.data.data;
  },
  
  // 약속 통계 조회 (자녀)
  getChildPromiseStats: async () => {
    const response = await apiClient.get<ApiResponse<{
      totalPromises: number;
      completedPromises: number;
      pendingPromises: number;
      characterStage: number;
      stickerCount: number;
    }>>('/promises/stats');
    return response.data.data;
  }
};

export default promiseApi;