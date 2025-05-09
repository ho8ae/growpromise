import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: 'http://172.30.1.85:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

// 요청 인터셉터 - 모든 요청에 인증 토큰 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 추가 실패:', error);
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
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러(인증 실패)이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 여기서 리프레시 토큰 로직을 구현할 수 있습니다
        // const refreshToken = await AsyncStorage.getItem('refresh_token');
        // const response = await axios.post('/auth/refresh', { refreshToken });
        // const { token } = response.data;
        // await AsyncStorage.setItem('auth_token', token);
        // originalRequest.headers.Authorization = `Bearer ${token}`;
        // return apiClient(originalRequest);
        
        // 리프레시 토큰 로직이 없거나 실패한 경우 로그아웃
        await AsyncStorage.removeItem('auth_token');
        // 로그인 화면으로 리디렉션 코드
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 로그아웃 및 로그인 화면으로 리디렉션
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 응답 데이터 변환 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export default apiClient;