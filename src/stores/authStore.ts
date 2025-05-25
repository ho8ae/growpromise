// src/stores/authStore.ts - Google 로그인 관련 부분만 수정
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import authApi, { AuthResponse, LoginRequest, SocialSetupRequest } from '../api/modules/auth';

interface User {
  id: string;
  username: string;
  email?: string;
  userType: 'PARENT' | 'CHILD';
  profileId: string;
  setupCompleted?: boolean;
  isNewUser?: boolean;
  socialProvider?: 'GOOGLE' | 'APPLE';
}

interface AuthStore {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthChecked: boolean;
  error: string | null;
  redirectAfterLogin: string | null;

  // 액션
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  googleSignIn: (idToken: string, userInfo?: any) => Promise<AuthResponse>;
  appleSignIn: (idToken: string, userInfo?: any) => Promise<AuthResponse>;
  completeSocialSetup: (setupData: SocialSetupRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  setRedirectAfterLogin: (path: string | null) => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // 초기 상태
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthChecked: false,
  error: null,
  redirectAfterLogin: null,

  // 일반 로그인
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🔐 일반 로그인 시도:', credentials.username);
      const response = await authApi.login(credentials);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ 일반 로그인 성공:', response.user.username);
      return response;
    } catch (error: any) {
      console.error('❌ 일반 로그인 실패:', error);
      set({
        isLoading: false,
        error: error.message || '로그인에 실패했습니다.',
      });
      throw error;
    }
  },

  // Google 로그인
  googleSignIn: async (idToken: string, userInfo?: any) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🟡 Google 로그인 API 호출 시작');
      console.log('📤 전송 데이터:', {
        hasIdToken: !!idToken,
        userEmail: userInfo?.email,
        userName: userInfo?.name,
      });

      const response = await authApi.googleSignIn({
        idToken,
        userInfo,
      });

      console.log('📨 서버 응답:', {
        hasUser: !!response.user,
        userType: response.user?.userType,
        isNewUser: response.user?.isNewUser,
        needsSetup: response.needsSetup,
        hasToken: !!response.token,
      });

      // 토큰이 있으면 완전한 로그인 상태
      if (response.token) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log('✅ Google 로그인 완료:', response.user.username);
      } else {
        // 토큰이 없으면 설정이 필요한 상태
        set({
          user: response.user,
          isAuthenticated: false, // 아직 완전히 인증되지 않음
          isLoading: false,
          error: null,
        });
        console.log('⚠️ Google 로그인 - 추가 설정 필요');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      set({
        isLoading: false,
        error: error.message || 'Google 로그인에 실패했습니다.',
      });
      throw error;
    }
  },

  // Apple 로그인 (향후 구현)
  appleSignIn: async (idToken: string, userInfo?: any) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🍎 Apple 로그인 API 호출 시작');

      const response = await authApi.appleSignIn({
        idToken,
        userInfo,
      });

      if (response.token) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log('✅ Apple 로그인 완료:', response.user.username);
      } else {
        set({
          user: response.user,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        console.log('⚠️ Apple 로그인 - 추가 설정 필요');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Apple 로그인 실패:', error);
      set({
        isLoading: false,
        error: error.message || 'Apple 로그인에 실패했습니다.',
      });
      throw error;
    }
  },

  // 소셜 로그인 설정 완료
  completeSocialSetup: async (setupData: SocialSetupRequest) => {
    set({ isLoading: true, error: null });

    try {
      console.log('⚙️ 소셜 로그인 설정 완료:', setupData);

      const response = await authApi.completeSocialSetup(setupData);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ 소셜 로그인 설정 완료:', response.user.username);
      return response;
    } catch (error: any) {
      console.error('❌ 소셜 로그인 설정 실패:', error);
      set({
        isLoading: false,
        error: error.message || '설정 완료에 실패했습니다.',
      });
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    set({ isLoading: true });

    try {
      console.log('🚪 로그아웃 시작...');

      // AsyncStorage 정리
      await authApi.logout();

      // 상태 초기화
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        redirectAfterLogin: null,
      });

      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 중 오류:', error);
      // 오류가 있어도 로컬 상태는 정리
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        redirectAfterLogin: null,
      });
    }
  },

  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },

  // 리다이렉트 경로 설정
  setRedirectAfterLogin: (path: string | null) => {
    set({ redirectAfterLogin: path });
  },

  // 인증 상태 확인
  checkAuthStatus: async () => {
    set({ isLoading: true });

    try {
      console.log('🔍 인증 상태 확인 시작...');

      const [token, userType, userId, profileId] = await AsyncStorage.multiGet([
        'auth_token',
        'user_type',
        'user_id',
        'profile_id',
      ]);

      console.log('📱 저장된 인증 정보:', {
        hasToken: !!token[1],
        userType: userType[1],
        userId: userId[1],
        profileId: profileId[1],
      });

      if (token[1] && userType[1] && userId[1]) {
        // 저장된 인증 정보가 있으면 인증된 상태로 설정
        const user: User = {
          id: userId[1],
          username: '', // 필요시 API에서 가져오기
          userType: userType[1] as 'PARENT' | 'CHILD',
          profileId: profileId[1] || '',
        };

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true,
        });

        console.log('✅ 기존 로그인 상태 복원:', {
          userId: user.id,
          userType: user.userType,
        });
      } else {
        // 인증 정보가 없으면 비인증 상태
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthChecked: true,
        });

        console.log('❌ 저장된 인증 정보 없음');
      }
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true,
        error: '인증 상태 확인에 실패했습니다.',
      });
    }
  },
}));