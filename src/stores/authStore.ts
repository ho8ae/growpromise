// stores/authStore.ts 수정
import { create } from 'zustand';
import authApi, { LoginRequest, ParentSignupRequest, ChildSignupRequest } from '../api/modules/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  email?: string;
  userType: 'PARENT' | 'CHILD';
  profileId: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  isAuthChecked: boolean;
  
  // 액션
  login: (data: LoginRequest) => Promise<void>;
  parentSignup: (data: ParentSignupRequest) => Promise<void>;
  childSignup: (data: ChildSignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  getParentConnectionCode: () => Promise<string>;
  connectParent: (parentCode: string) => Promise<void>;
}

// AsyncStorage 키 상수 정의
const AUTH_STORAGE_KEYS = [
  'auth_token',
  'refresh_token',
  'user_type',
  'user_id',
  'username',
  'profile_id',
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  isAuthChecked: false,
  
  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      // 로그인 전에 기존 인증 데이터 정리
      await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
      
      const response = await authApi.login(data);
      
      // AsyncStorage에 사용자 정보 저장
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_type', response.user.userType);
      await AsyncStorage.setItem('user_id', response.user.id);
      await AsyncStorage.setItem('username', response.user.username);
      if (response.user.profileId) {
        await AsyncStorage.setItem('profile_id', response.user.profileId);
      }
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true
      });
      
      console.log('Login successful:', response.user.username);
    } catch (error: any) {
      console.error('Login error:', error);
      set({
        error: error.response?.data?.message || '로그인 중 오류가 발생했습니다.',
        isLoading: false,
        isAuthChecked: true
      });
      throw error;
    }
  },
  
  parentSignup: async (data: ParentSignupRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.parentSignup(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '회원가입 중 오류가 발생했습니다.',
        isLoading: false
      });
      throw error;
    }
  },
  
  childSignup: async (data: ChildSignupRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.childSignup(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '회원가입 중 오류가 발생했습니다.',
        isLoading: false
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true });
      console.log('Starting logout process...');
      
      try {
        // API 호출 실패해도 계속 진행
        await authApi.logout();
        console.log('API logout successful');
      } catch (apiError) {
        console.warn('API logout failed, continuing with local logout:', apiError);
      }
      
      // 모든 인증 관련 데이터 완전히 제거
      await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
      console.log('AsyncStorage cleared');
      
      // 상태 완전 초기화
      set({
        user: null,
        token: null, 
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true
      });
      
      console.log('Auth store state reset: Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
      
      // 오류가 발생해도 로컬 상태는 초기화
      await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: '로그아웃 중 오류가 발생했습니다.',
        isLoading: false,
        isAuthChecked: true
      });
    }
  },
  
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true });
      console.log('Checking authentication status...');
      
      // 모든 인증 토큰 가져오기
      const token = await AsyncStorage.getItem('auth_token');
      const userType = await AsyncStorage.getItem('user_type');
      const userId = await AsyncStorage.getItem('user_id');
      const username = await AsyncStorage.getItem('username');
      const profileId = await AsyncStorage.getItem('profile_id');
      
      // 토큰이 있고 유효한 경우에만 인증된 것으로 처리
      if (token && userType && userId) {
        // 토큰 유효성 확인 (선택적)
        let isTokenValid = true;
        try {
          isTokenValid = await authApi.isAuthenticated();
        } catch (error) {
          console.warn('Token validation failed:', error);
          isTokenValid = false;
        }
        
        if (isTokenValid) {
          console.log('Valid authentication found for user:', username);
          set({
            isAuthenticated: true,
            token,
            user: {
              id: userId,
              username: username || '',
              userType: userType as 'PARENT' | 'CHILD',
              profileId: profileId || ''
            },
            isAuthChecked: true,
            isLoading: false
          });
        } else {
          console.log('Invalid token found, clearing authentication data');
          // 토큰이 유효하지 않으면 로그아웃 처리
          await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
          
          set({ 
            isAuthenticated: false, 
            user: null,
            token: null,
            isAuthChecked: true,
            isLoading: false
          });
        }
      } else {
        console.log('No authentication data found');
        // 토큰이 없으면 인증되지 않은 상태
        set({ 
          isAuthenticated: false, 
          user: null,
          token: null,
          isAuthChecked: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      
      // 오류 발생 시 인증되지 않은 상태로 설정
      set({ 
        isAuthenticated: false, 
        user: null,
        token: null,
        isLoading: false,
        isAuthChecked: true 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  getParentConnectionCode: async () => {
    try {
      set({ isLoading: true, error: null });
      const code = await authApi.getParentConnectionCode();
      set({ isLoading: false });
      return code.code;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '연결 코드 생성 중 오류가 발생했습니다.',
        isLoading: false
      });
      throw error;
    }
  },
  
  connectParent: async (parentCode: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.connectParent(parentCode);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '부모 연결 중 오류가 발생했습니다.',
        isLoading: false
      });
      throw error;
    }
  }
}));