// src/hooks/useGoogleOAuth.ts - 최종 버전
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo: string;
  familyName: string;
  givenName: string;
  idToken?: string | null;
  serverAuthCode?: string | null;
}

export function useGoogleOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Google Sign-In 초기화 및 설정 상태 확인
  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        console.log('🔧 Google Sign-In 설정 상태 확인 시작...');

        // hasPreviousSignIn()으로 이전 로그인 확인
        const hasPrevious = GoogleSignin.hasPreviousSignIn();
        console.log('📋 이전 로그인 여부:', hasPrevious);

        // 이미 로그인된 사용자가 있다면 정보 가져오기
        if (hasPrevious) {
          try {
            const currentUser = GoogleSignin.getCurrentUser();
            if (currentUser) {
              const userData: GoogleUser = {
                id: currentUser.user.id,
                name: currentUser.user.name || '',
                email: currentUser.user.email,
                photo: currentUser.user.photo || '',
                familyName: currentUser.user.familyName || '',
                givenName: currentUser.user.givenName || '',
                idToken: currentUser.idToken,
                serverAuthCode: currentUser.serverAuthCode,
              };
              setUser(userData);
              console.log('📱 기존 로그인 사용자 복원:', userData.email);
            }
          } catch (error) {
            console.log('⚠️ 기존 사용자 정보 가져오기 실패:', error);
          }
        }

        setIsConfigured(true);
        console.log('✅ Google Sign-In 설정 확인 완료');
      } catch (error) {
        console.error('❌ Google Sign-In 설정 확인 실패:', error);
        setIsConfigured(false);
      }
    };

    checkConfiguration();
  }, []);

  const signIn = async (): Promise<GoogleUser | null> => {
    if (!isConfigured) {
      Alert.alert('설정 오류', 'Google 로그인이 아직 준비되지 않았습니다.');
      return null;
    }

    try {
      setIsLoading(true);
      console.log('🔵 Google 로그인 시작...');

      // Android: Google Play Services 확인
      if (Platform.OS === 'android') {
        const hasPlayServices = await GoogleSignin.hasPlayServices({ 
          showPlayServicesUpdateDialog: true 
        });
        if (!hasPlayServices) {
          throw new Error('Google Play Services가 필요합니다.');
        }
      }

      // 기존 로그인 세션 정리 (선택적)
      try {
        const hasPrevious = GoogleSignin.hasPreviousSignIn();
        if (hasPrevious) {
          console.log('🔄 기존 세션 감지, 로그아웃 후 재시도...');
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.log('⚠️ 기존 세션 정리 중 오류 (무시):', error);
      }

      // 로그인 실행
      const response = await GoogleSignin.signIn();
      console.log('📨 Google 로그인 응답:', {
        type: response.type,
        hasData: response.type === 'success' && !!response.data,
        platform: Platform.OS,
      });

      if (response.type === 'success' && response.data) {
        const userInfo = response.data;
        
        console.log('📋 사용자 정보:', {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name,
          hasIdToken: !!userInfo.idToken,
          hasServerAuthCode: !!userInfo.serverAuthCode,
        });

        const userData: GoogleUser = {
          id: userInfo.user.id,
          name: userInfo.user.name || '',
          email: userInfo.user.email,
          photo: userInfo.user.photo || '',
          familyName: userInfo.user.familyName || '',
          givenName: userInfo.user.givenName || '',
          idToken: userInfo.idToken,
          serverAuthCode: userInfo.serverAuthCode,
        };

        // idToken 필수 검증
        if (!userData.idToken) {
          console.error('❌ idToken이 없습니다. 서버 인증이 불가능합니다.');
          throw new Error('Google 인증 토큰을 받지 못했습니다. 다시 시도해주세요.');
        }

        setUser(userData);
        console.log('✅ 사용자 정보 설정 완료:', {
          id: userData.id,
          email: userData.email,
          name: userData.name,
        });

        return userData;
      } else if (response.type === 'cancelled') {
        console.log('📱 사용자가 로그인을 취소했습니다.');
        return null;
      } else {
        throw new Error('알 수 없는 응답 타입입니다.');
      }
    } catch (error: any) {
      console.error('❌ Google 로그인 오류:', error);
      
      // 에러 타입별 처리
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('📱 사용자가 로그인을 취소했습니다.');
        return null;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('알림', '이미 로그인이 진행 중입니다. 잠시 후 다시 시도해주세요.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Google Play Services 필요', 
          'Google 로그인을 위해 Google Play Services를 업데이트해주세요.',
          [
            { text: '확인', style: 'default' }
          ]
        );
      } else {
        // 네트워크 오류나 기타 오류
        const errorMessage = error.message || 'Google 로그인 중 오류가 발생했습니다.';
        Alert.alert(
          '로그인 실패', 
          errorMessage,
          [
            { text: '확인', style: 'default' }
          ]
        );
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🔴 Google 로그아웃 시작...');
      
      const hasPrevious = GoogleSignin.hasPreviousSignIn();
      if (hasPrevious) {
        await GoogleSignin.signOut();
        console.log('✅ Google 로그아웃 완료');
      } else {
        console.log('📱 이미 로그아웃된 상태입니다.');
      }
      
      setUser(null);
    } catch (error) {
      console.error('❌ Google 로그아웃 오류:', error);
      // 로그아웃 실패해도 로컬 상태는 정리
      setUser(null);
    }
  };

  // 토큰 갱신 (필요한 경우)
  const refreshToken = async (): Promise<string | null> => {
    try {
      const tokens = await GoogleSignin.getTokens();
      console.log('🔄 토큰 갱신 완료');
      return tokens.idToken;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      return null;
    }
  };

  // 현재 사용자 정보 다시 가져오기
  const getCurrentUser = async (): Promise<GoogleUser | null> => {
    try {
      const currentUser = GoogleSignin.getCurrentUser();
      if (currentUser) {
        const userData: GoogleUser = {
          id: currentUser.user.id,
          name: currentUser.user.name || '',
          email: currentUser.user.email,
          photo: currentUser.user.photo || '',
          familyName: currentUser.user.familyName || '',
          givenName: currentUser.user.givenName || '',
          idToken: currentUser.idToken,
          serverAuthCode: currentUser.serverAuthCode,
        };
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('현재 사용자 정보 가져오기 실패:', error);
      return null;
    }
  };

  // 무음 로그인 시도
  const signInSilently = async (): Promise<GoogleUser | null> => {
    try {
      console.log('🔇 무음 로그인 시도...');
      const response = await GoogleSignin.signInSilently();
      
      if (response.type === 'success' && response.data) {
        const userInfo = response.data;
        const userData: GoogleUser = {
          id: userInfo.user.id,
          name: userInfo.user.name || '',
          email: userInfo.user.email,
          photo: userInfo.user.photo || '',
          familyName: userInfo.user.familyName || '',
          givenName: userInfo.user.givenName || '',
          idToken: userInfo.idToken,
          serverAuthCode: userInfo.serverAuthCode,
        };
        setUser(userData);
        console.log('✅ 무음 로그인 성공:', userData.email);
        return userData;
      } else {
        console.log('📱 무음 로그인 실패: 저장된 자격 증명 없음');
        return null;
      }
    } catch (error) {
      console.log('⚠️ 무음 로그인 실패:', error);
      return null;
    }
  };

  // 접근 권한 취소 (완전 연결 해제)
  const revokeAccess = async (): Promise<void> => {
    try {
      console.log('🗑️ Google 접근 권한 취소 시작...');
      await GoogleSignin.revokeAccess();
      setUser(null);
      console.log('✅ Google 접근 권한 취소 완료');
    } catch (error) {
      console.error('❌ 접근 권한 취소 실패:', error);
      // 실패해도 로컬 상태는 정리
      setUser(null);
    }
  };

  return {
    // 메서드
    signIn,
    signOut,
    signInSilently,
    revokeAccess,
    refreshToken,
    getCurrentUser,
    
    // 상태
    user,
    isLoading,
    isConfigured,
    
    // 유틸리티
    isSignedIn: !!user,
    hasPreviousSignIn: GoogleSignin.hasPreviousSignIn,
  };
}