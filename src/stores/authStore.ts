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
      const response = await authApi.login(data);
      
      // AsyncStorage에 사용자 정보 저장
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_type', response.user.userType);
      await AsyncStorage.setItem('user_id', response.user.id);
      await AsyncStorage.setItem('username', response.user.username); // 추가된 부분
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true
      });
    } catch (error: any) {
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
      
      // 로그아웃 API 호출
      await authApi.logout();
      
      // 추가 보안 - 직접 AsyncStorage에서 모든 인증 관련 항목 제거
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_type');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('username'); // 추가된 부분
      
      // 상태 완전 초기화
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true
      });
      
      console.log('로그아웃 완료:', get());
    } catch (error: any) {
      console.error('로그아웃 오류:', error);
      
      // 오류가 발생해도 로컬에서는 로그아웃을 진행
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_type');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('username'); // 추가된 부분
      
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
      
      // 모든 인증 토큰 가져오기
      const token = await AsyncStorage.getItem('auth_token');
      const userType = await AsyncStorage.getItem('user_type');
      const userId = await AsyncStorage.getItem('user_id');
      const username = await AsyncStorage.getItem('username'); // 추가된 부분
      
      console.log('확인된 인증 상태:', { token, userType, userId, username });
      
      // 토큰이 있고 유효한 경우에만 인증된 것으로 처리
      if (token && userType && userId) {
        // API로 토큰 유효성 검사
        const isValid = await authApi.isAuthenticated();
        
        if (isValid) {
          set({
            isAuthenticated: true,
            token,
            user: {
              id: userId,
              username: username || '',  // 수정된 부분
              userType: userType as 'PARENT' | 'CHILD',
              profileId: ''
            },
            isAuthChecked: true
          });
        } else {
          // 토큰이 유효하지 않으면 로그아웃 처리
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_type');
          await AsyncStorage.removeItem('user_id');
          await AsyncStorage.removeItem('username'); // 추가된 부분
          set({ 
            isAuthenticated: false, 
            user: null,
            token: null,
            isAuthChecked: true 
          });
        }
      } else {
        // 토큰이 없으면 인증되지 않은 상태
        set({ 
          isAuthenticated: false, 
          user: null,
          token: null,
          isAuthChecked: true 
        });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      
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