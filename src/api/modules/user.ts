// src/api/modules/user.ts - 기존 코드 기반 FCM 지원 추가
import { Platform } from 'react-native';
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

// 🔥 플랫폼별 푸시 토큰 업데이트 요청 타입 (새로 추가)
export interface UpdatePushTokenRequest {
  expoPushToken?: string;    // iOS용
  fcmToken?: string;         // Android용
  platform: 'ios' | 'android';
}

// 🔥 레거시 푸시 토큰 요청 타입 (하위 호환성)
export interface LegacyPushTokenRequest {
  expoPushToken: string;
}

// 알림 설정 업데이트 요청 타입  
export interface UpdateNotificationSettingsRequest {
  enabled: boolean;
}

// 🔥 알림 설정 응답 타입 (플랫폼별 정보 포함)
export interface NotificationSettingsResponse {
  hasToken: boolean;         // 전체 토큰 보유 여부
  hasExpoToken: boolean;     // Expo 토큰 보유 여부 (새로 추가)
  hasFcmToken: boolean;      // FCM 토큰 보유 여부 (새로 추가)
  platform?: string;        // 현재 플랫폼 (새로 추가)
  isEnabled: boolean;        // 알림 활성화 여부
  lastUpdated?: string;      // 마지막 업데이트 시간
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

  // 🔥 플랫폼별 푸시 토큰 업데이트 (새로운 방식)
  updatePushToken: async (tokenData: UpdatePushTokenRequest): Promise<void> => {
    try {
      console.log(`[${tokenData.platform.toUpperCase()}] 푸시 토큰 업데이트 요청:`, {
        hasExpoToken: !!tokenData.expoPushToken,
        hasFcmToken: !!tokenData.fcmToken,
        platform: tokenData.platform
      });

      await apiRequest<void>('post', '/users/push-token', tokenData);
      
      console.log(`✅ ${tokenData.platform.toUpperCase()} 푸시 토큰 업데이트 완료`);
    } catch (error) {
      console.error(`❌ ${tokenData.platform.toUpperCase()} 푸시 토큰 업데이트 실패:`, error);
      throw error;
    }
  },

  // 🔥 레거시 푸시 토큰 업데이트 (하위 호환성)
  updatePushTokenLegacy: async (tokenData: LegacyPushTokenRequest): Promise<void> => {
    try {
      console.log('레거시 푸시 토큰 업데이트 요청');
      
      await apiRequest<void>('post', '/users/push-token/legacy', tokenData);
      
      console.log('✅ 레거시 푸시 토큰 업데이트 완료');
    } catch (error) {
      console.error('❌ 레거시 푸시 토큰 업데이트 실패:', error);
      throw error;
    }
  },

  // 🔥 현재 플랫폼에 맞는 푸시 토큰 자동 업데이트
  updateCurrentPlatformPushToken: async (expoPushToken?: string, fcmToken?: string): Promise<void> => {
    const currentPlatform = Platform.OS as 'ios' | 'android';
    
    const tokenData: UpdatePushTokenRequest = {
      platform: currentPlatform,
    };

    if (currentPlatform === 'ios' && expoPushToken) {
      tokenData.expoPushToken = expoPushToken;
    } else if (currentPlatform === 'android') {
      if (fcmToken) {
        tokenData.fcmToken = fcmToken;
      } else if (expoPushToken) {
        // FCM 토큰이 없으면 Expo 토큰으로 폴백
        tokenData.expoPushToken = expoPushToken;
      }
    }

    if (!tokenData.expoPushToken && !tokenData.fcmToken) {
      throw new Error(`${currentPlatform.toUpperCase()}에서 사용할 수 있는 푸시 토큰이 없습니다.`);
    }

    return await userApi.updatePushToken(tokenData);
  },

  // 🔥 알림 설정 조회 (플랫폼별 정보 포함)
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