import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// API 클라이언트 생성
const apiClient = axios.create({
  // 개발 환경에서는 로컬 IP, 프로덕션에서는 실제 서버 주소로 변경 필요
  baseURL: 'http://172.30.1.85:3000/api', //172.30.1.1 172.30.1.85
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15초로 설정
});

// 응답 데이터 변환 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// 네트워크 상태 확인 함수
export const checkNetwork = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

// 요청 인터셉터 - 모든 요청에 인증 토큰 추가 및 네트워크 확인
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 네트워크 연결 확인
      const isConnected = await checkNetwork();
      if (!isConnected) {
        throw new Error('인터넷 연결이 없습니다.');
      }
      
      // 인증 토큰 추가
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('요청 인터셉터 오류:', error.message);
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 리프레시 토큰 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // 네트워크 오류 처리
    if (!error.response) {
      console.error('네트워크 오류:', error.message);
      return Promise.reject(new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'));
    }
    
    // 401 에러(인증 실패)이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰 로직을 구현
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          // 리프레시 토큰이 없으면 로그아웃
          await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_type', 'user_id']);
          return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
        }
        
        // 리프레시 토큰으로 새 토큰 요청
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        // 새 토큰 저장
        const { token, refreshToken: newRefreshToken } = response.data.data;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
        
        // 헤더 업데이트 및 재요청
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 로그아웃 처리
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_type', 'user_id']);
        return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'));
      }
    }
    
    // 서버 오류 메시지 처리
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    
    // 기타 HTTP 상태 코드에 따른 처리
    switch (error.response?.status) {
      case 400:
        return Promise.reject(new Error('잘못된 요청입니다.'));
      case 403:
        return Promise.reject(new Error('접근 권한이 없습니다.'));
      case 404:
        return Promise.reject(new Error('요청한 리소스를 찾을 수 없습니다.'));
      case 500:
      case 502:
      case 503:
      case 504:
        return Promise.reject(new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
      default:
        return Promise.reject(error);
    }
  }
);

// API 요청 래퍼 함수 - 오류 처리를 일관되게 하기 위함
export const apiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    let response;
    
    switch (method) {
      case 'get':
        response = await apiClient.get<ApiResponse<T>>(url, config);
        break;
      case 'post':
        response = await apiClient.post<ApiResponse<T>>(url, data, config);
        break;
      case 'put':
        response = await apiClient.put<ApiResponse<T>>(url, data, config);
        break;
      case 'delete':
        response = await apiClient.delete<ApiResponse<T>>(url, config);
        break;
    }
    
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
};

export default apiClient;