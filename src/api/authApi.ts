import apiClient, { ApiResponse } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 인증 응답 타입
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email?: string;
    userType: 'PARENT' | 'CHILD';
    profileId: string;
  };
  token: string;
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
  userType: 'PARENT' | 'CHILD';
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

// 인증 관련 API 함수들
const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    await AsyncStorage.setItem('auth_token', response.data.data.token);
    await AsyncStorage.setItem('user_type', response.data.data.user.userType);
    await AsyncStorage.setItem('user_id', response.data.data.user.id);
    return response.data.data;
  },
  
  // 부모 회원가입
  parentSignup: async (data: ParentSignupRequest) => {
    const response = await apiClient.post<ApiResponse<any>>('/auth/parent/signup', data);
    return response.data;
  },
  
  // 자녀 회원가입
  childSignup: async (data: ChildSignupRequest) => {
    const response = await apiClient.post<ApiResponse<any>>('/auth/child/signup', data);
    return response.data;
  },
  
  // 로그아웃
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_type');
    await AsyncStorage.removeItem('user_id');
  },
  
  // 부모 연결 코드 생성
  getParentConnectionCode: async () => {
    const response = await apiClient.get<ApiResponse<{ code: string }>>('/auth/parent/connection-code');
    return response.data.data.code;
  },
  
  // 자녀와 부모 연결
  connectParent: async (parentCode: string) => {
    const response = await apiClient.post<ApiResponse<any>>('/auth/child/connect-parent', { parentCode });
    return response.data;
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
  }
};

export default authApi;