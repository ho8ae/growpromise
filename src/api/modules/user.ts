import apiClient, { ApiResponse, apiRequest } from '../client';

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  userType: 'PARENT' | 'CHILD';
  profileImage?: string;
  createdAt: string;
  parentProfile?: ParentProfile;
  childProfile?: ChildProfile;
}

// 부모 프로필 타입
export interface ParentProfile {
  id: string;
  children?: ChildParentConnection[];
}

// 자녀 프로필 타입
export interface ChildProfile {
  id: string;
  birthDate?: string;
  characterStage: number;
  parents?: ChildParentConnection[];
}

// 부모-자녀 연결 타입
export interface ChildParentConnection {
  id: string;
  childId: string;
  parentId: string;
  child?: {
    id: string;
    user: {
      id: string;
      username: string;
      profileImage?: string;
    };
  };
  parent?: {
    id: string;
    user: {
      id: string;
      username: string;
      profileImage?: string;
      email?: string;
    };
  };
}

// 프로필 업데이트 요청 타입
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  birthDate?: string | null;
}

// 사용자 관련 API 함수들
const userApi = {
  // 사용자 프로필 정보 조회
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      return await apiRequest<UserProfile>('get', '/users/profile');
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      throw error;
    }
  },
  
  // 프로필 정보 업데이트
  updateUserProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      return await apiRequest<UserProfile>('put', '/users/profile', data);
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      throw error;
    }
  },
  
  // 프로필 이미지 업데이트
  updateProfileImage: async (imageUri: string): Promise<{ id: string; username: string; profileImage: string }> => {
    try {
      const formData = new FormData();
      
      // 이미지 파일 준비
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: imageUri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      
      const response = await apiClient.patch<ApiResponse<{ id: string; username: string; profileImage: string }>>(
        '/users/profile/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('프로필 이미지 업데이트 오류:', error);
      throw error;
    }
  },
  
  // 부모의 자녀 목록 조회 (부모용)
  getParentChildren: async (): Promise<ChildParentConnection[]> => {
    try {
      return await apiRequest<ChildParentConnection[]>('get', '/users/children');
    } catch (error) {
      console.error('부모 자녀 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // 자녀의 부모 목록 조회 (자녀용)
  getChildParents: async (): Promise<ChildParentConnection[]> => {
    try {
      return await apiRequest<ChildParentConnection[]>('get', '/users/parents');
    } catch (error) {
      console.error('자녀 부모 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // 사용자 상세 정보 조회
  getUserById: async (userId: string): Promise<UserProfile> => {
    try {
      return await apiRequest<UserProfile>('get', `/users/${userId}`);
    } catch (error) {
      console.error('사용자 상세 조회 오류:', error);
      throw error;
    }
  }
};

export default userApi;