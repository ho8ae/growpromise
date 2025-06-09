import apiClient, { ApiResponse, apiRequest } from '../client';

// 기본 사용자 프로필 타입
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

// 상세 사용자 프로필 타입 (소셜 로그인 정보 포함)
export interface DetailUserProfile extends UserProfile {
  phoneNumber?: string;
  bio?: string;
  socialProvider?: 'GOOGLE' | 'APPLE';
  setupCompleted: boolean;
  parentProfile?: DetailParentProfile;
  childProfile?: DetailChildProfile;
}

// 부모 프로필 타입
export interface ParentProfile {
  id: string;
  children?: ChildParentConnection[];
}

// 상세 부모 프로필 타입
export interface DetailParentProfile extends ParentProfile {
  connectionCode?: string;
  connectionCodeExpires?: string;
}

// 자녀 프로필 타입
export interface ChildProfile {
  id: string;
  birthDate?: string;
  characterStage: number;
  parents?: ChildParentConnection[];
}

// 상세 자녀 프로필 타입
export interface DetailChildProfile extends ChildProfile {
  totalCompletedPlants: number;
  wateringStreak: number;
}

// 부모-자녀 연결 타입
export interface ChildParentConnection {
  id: string;
  userId: string;
  childId: string;
  parentId: string;
  child?: {
    id: string;
    userId: string;
    characterStage: number; 
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

// 기본 프로필 업데이트 요청 타입
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  birthDate?: string | null;
}

// 상세 프로필 업데이트 요청 타입
export interface UpdateDetailProfileRequest {
  username?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  birthDate?: string | null;
}

// 아바타 타입
export interface Avatar {
  id: string;
  url: string;
  name: string;
}

// 아바타 선택 요청 타입
export interface SelectAvatarRequest {
  avatarId: string;
}

// 계정 상태 응답 타입
export interface AccountStatusResponse {
  id: string;
  username: string;
  email?: string;
  userType: 'PARENT' | 'CHILD';
  socialProvider?: 'GOOGLE' | 'APPLE';
  setupCompleted: boolean;
  hasPassword: boolean;
  isSocialAccount: boolean;
  canSetPassword: boolean;
  createdAt: string;
  isActive: boolean;
}

// 푸시 토큰 업데이트 요청 타입
export interface UpdatePushTokenRequest {
  expoPushToken: string;
}

// 알림 설정 업데이트 요청 타입  
export interface UpdateNotificationSettingsRequest {
  enabled: boolean;
}

// 알림 설정 응답 타입
export interface NotificationSettingsResponse {
  hasToken: boolean;
  isEnabled: boolean;
  lastUpdated?: string;
}

// 사용자 관련 API 함수들
const userApi = {
  // 기본 사용자 프로필 정보 조회
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      return await apiRequest<UserProfile>('get', '/users/profile');
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      throw error;
    }
  },

  // 상세 사용자 프로필 정보 조회 (소셜 로그인 정보 포함)
  getUserDetailProfile: async (): Promise<DetailUserProfile> => {
    try {
      return await apiRequest<DetailUserProfile>('get', '/users/profile/detail');
    } catch (error) {
      console.error('상세 프로필 조회 오류:', error);
      throw error;
    }
  },
  
  // 기본 프로필 정보 업데이트
  updateUserProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      return await apiRequest<UserProfile>('put', '/users/profile', data);
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      throw error;
    }
  },

  // 상세 프로필 정보 업데이트
  updateUserDetailProfile: async (data: UpdateDetailProfileRequest): Promise<DetailUserProfile> => {
    try {
      return await apiRequest<DetailUserProfile>('put', '/users/profile/detail', data);
    } catch (error) {
      console.error('상세 프로필 업데이트 오류:', error);
      throw error;
    }
  },

  // 사용 가능한 아바타 목록 조회
  getAvailableAvatars: async (): Promise<Avatar[]> => {
    try {
      return await apiRequest<Avatar[]>('get', '/users/profile/avatars');
    } catch (error) {
      console.error('아바타 목록 조회 오류:', error);
      throw error;
    }
  },

  // 아바타 선택
  selectAvatar: async (data: SelectAvatarRequest): Promise<{ id: string; username: string; profileImage: string }> => {
    try {
      return await apiRequest<{ id: string; username: string; profileImage: string }>('put', '/users/profile/avatar', data);
    } catch (error) {
      console.error('아바타 선택 오류:', error);
      throw error;
    }
  },

  // 계정 상태 조회
  getAccountStatus: async (): Promise<AccountStatusResponse> => {
    try {
      return await apiRequest<AccountStatusResponse>('get', '/users/account-status');
    } catch (error) {
      console.error('계정 상태 조회 오류:', error);
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
  },

   // 푸시 토큰 저장/업데이트
   updatePushToken: async (data: UpdatePushTokenRequest): Promise<void> => {
    try {
      await apiRequest<void>('post', '/users/push-token', data);
    } catch (error) {
      console.error('푸시 토큰 업데이트 오류:', error);
      throw error;
    }
  },

  // 알림 설정 조회
  getNotificationSettings: async (): Promise<NotificationSettingsResponse> => {
    try {
      return await apiRequest<NotificationSettingsResponse>('get', '/users/notification-settings');
    } catch (error) {
      console.error('알림 설정 조회 오류:', error);
      throw error;
    }
  },

  // 알림 설정 업데이트
  updateNotificationSettings: async (data: UpdateNotificationSettingsRequest): Promise<void> => {
    try {
      await apiRequest<void>('put', '/users/notification-settings', data);
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error);
      throw error;
    }
  },

  // 테스트 푸시 알림 전송
  sendTestPushNotification: async (): Promise<void> => {
    try {
      console.log('sendTestPushNotification API 호출 시작');
      const response = await apiRequest<void>('post', '/users/test-push');
      console.log('sendTestPushNotification API 응답:', response);
    } catch (error) {
      console.error('sendTestPushNotification API 오류:', error);
      throw error;
    }
  },
  /* 
  // S3 프로필 이미지 업로드 기능 (필요할 때 주석 해제)
  updateProfileImage: async (imageUri: string): Promise<{ id: string; username: string; profileImage: string }> => {
    try {
      const formData = new FormData();
      
      // 이미지 파일 준비
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('profileImage', {
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
  */
};

export default userApi;