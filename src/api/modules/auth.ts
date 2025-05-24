import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { ApiResponse, apiRequest } from '../client';

// 인증 응답 타입
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email?: string;
    userType: 'PARENT' | 'CHILD';
    profileId: string;
    setupCompleted?: boolean;
    isNewUser?: boolean;
  };
  token: string;
  needsSetup?: boolean;
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 부모 회원가입 요청 타입
export interface ParentSignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 자녀 회원가입 요청 타입
export interface ChildSignupRequest {
  username: string;
  password: string;
  confirmPassword: string;
  birthDate?: string;
  parentCode?: string;
}

// 비밀번호 변경 요청 타입
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 아이디 찾기 요청 타입
export interface FindUsernameRequest {
  email: string;
}

// 비밀번호 재설정 요청 타입
export interface RequestPasswordResetRequest {
  email: string;
}

// 비밀번호 재설정 수행 타입
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// 소셜 로그인 요청 타입
export interface SocialSignInRequest {
  idToken: string;
  userInfo?: any; // Apple 로그인 시 사용
}

// 소셜 로그인 설정 완료 요청 타입
export interface SocialSetupRequest {
  userType: 'PARENT' | 'CHILD';
  birthDate?: string;
  parentCode?: string;
}

// 소셜 계정 비밀번호 설정 요청 타입
export interface SetSocialPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

// 계정 삭제 요청 타입
export interface DeleteAccountRequest {
  password?: string;
  confirmText: string;
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

// 인증 관련 API 함수들
const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        data,
      );

      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem('auth_token', response.data.data.token);
        await AsyncStorage.setItem(
          'user_type',
          response.data.data.user.userType,
        );
        await AsyncStorage.setItem('user_id', response.data.data.user.id);
        await AsyncStorage.setItem(
          'profile_id',
          response.data.data.user.profileId,
        );

        return response.data.data;
      } else {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  // 부모 회원가입
  parentSignup: async (data: ParentSignupRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/parent/signup',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('부모 회원가입 오류:', error);
      throw error;
    }
  },

  // 자녀 회원가입
  childSignup: async (data: ChildSignupRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/child/signup',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('자녀 회원가입 오류:', error);
      throw error;
    }
  },

  // 소셜 로그인 - Google
  googleSignIn: async (data: SocialSignInRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/social/google',
        data
      );
      
      if (response.data.success && response.data.data) {
        // 토큰이 있으면 저장, 없으면 설정이 필요한 상태
        if (response.data.data.token) {
          await AsyncStorage.setItem('auth_token', response.data.data.token);
          await AsyncStorage.setItem('user_type', response.data.data.user.userType);
          await AsyncStorage.setItem('user_id', response.data.data.user.id);
          if (response.data.data.user.profileId) {
            await AsyncStorage.setItem('profile_id', response.data.data.user.profileId);
          }
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Google 로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  },

  // 소셜 로그인 - Apple
  appleSignIn: async (data: SocialSignInRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/social/apple',
        data
      );
      
      if (response.data.success && response.data.data) {
        // 토큰이 있으면 저장, 없으면 설정이 필요한 상태
        if (response.data.data.token) {
          await AsyncStorage.setItem('auth_token', response.data.data.token);
          await AsyncStorage.setItem('user_type', response.data.data.user.userType);
          await AsyncStorage.setItem('user_id', response.data.data.user.id);
          if (response.data.data.user.profileId) {
            await AsyncStorage.setItem('profile_id', response.data.data.user.profileId);
          }
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Apple 로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Apple 로그인 오류:', error);
      throw error;
    }
  },

  // 소셜 로그인 설정 완료
  completeSocialSetup: async (data: SocialSetupRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/social/complete-setup',
        data
      );
      
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem('auth_token', response.data.data.token);
        await AsyncStorage.setItem('user_type', response.data.data.user.userType);
        await AsyncStorage.setItem('user_id', response.data.data.user.id);
        if (response.data.data.user.profileId) {
          await AsyncStorage.setItem('profile_id', response.data.data.user.profileId);
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || '설정 완료에 실패했습니다.');
      }
    } catch (error) {
      console.error('소셜 로그인 설정 완료 오류:', error);
      throw error;
    }
  },

  // 설정 상태 확인
  getSetupStatus: async () => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: any; needsSetup: boolean }>>(
        '/auth/setup-status'
      );
      return response.data.data;
    } catch (error) {
      console.error('설정 상태 확인 오류:', error);
      throw error;
    }
  },

  // 소셜 계정 비밀번호 설정
  setSocialPassword: async (data: SetSocialPasswordRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/set-social-password',
        data
      );
      return response.data;
    } catch (error) {
      console.error('소셜 계정 비밀번호 설정 오류:', error);
      throw error;
    }
  },

  // 계정 비활성화
  deactivateAccount: async (data: DeleteAccountRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/deactivate-account',
        data
      );
      return response.data;
    } catch (error) {
      console.error('계정 비활성화 오류:', error);
      throw error;
    }
  },

  // 계정 완전 삭제
  deleteAccount: async (data: DeleteAccountRequest) => {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(
        '/auth/delete-account',
        { data }
      );
      return response.data;
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    await AsyncStorage.multiRemove([
      'auth_token',
      'refresh_token',
      'user_type',
      'user_id',
      'profile_id',
    ]);
  },

  // 부모 연결 코드 생성
  getParentConnectionCode: async (): Promise<{
    code: string;
    expiresAt: string;
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ code: string; expiresAt: string }>
      >('/auth/parent/connection-code');
      return response.data.data;
    } catch (error) {
      console.error('부모 연결 코드 생성 오류:', error);
      throw error;
    }
  },

  // 자녀와 부모 연결
  connectParent: async (parentCode: string) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/child/connect-parent',
        { parentCode },
      );
      return response.data;
    } catch (error) {
      console.error('부모 연결 오류:', error);
      throw error;
    }
  },

  // 비밀번호 변경
  changePassword: async (data: ChangePasswordRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/change-password',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      throw error;
    }
  },

  // 아이디 찾기
  findUsername: async (data: FindUsernameRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<{ username: string; userType: string }>>(
        '/auth/find-username',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('아이디 찾기 오류:', error);
      throw error;
    }
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (data: RequestPasswordResetRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/request-password-reset',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('비밀번호 재설정 요청 오류:', error);
      throw error;
    }
  },

  // 비밀번호 재설정
  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/reset-password',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      throw error;
    }
  },

  // 현재 사용자가 인증되어 있는지 확인
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },

  // 현재 사용자 타입 가져오기
  getUserType: async (): Promise<'PARENT' | 'CHILD' | null> => {
    const userType = await AsyncStorage.getItem('user_type');
    return userType as 'PARENT' | 'CHILD' | null;
  },

  // 현재 사용자 ID 가져오기
  getUserId: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('user_id');
  },

  // 현재 사용자 프로필 ID 가져오기
  getProfileId: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('profile_id');
  },
};

export default authApi;