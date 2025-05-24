// src/hooks/useGoogleOAuth.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { Alert } from 'react-native';

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

  const signIn = async () => {
    try {
      setIsLoading(true);
      
      // Google Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 로그인 실행
      const userInfo = await GoogleSignin.signIn();
      
      console.log('✅ Google 로그인 성공:', userInfo);
      
      if (userInfo.data) {
        const userData: GoogleUser = {
          id: userInfo.data.user.id,
          name: userInfo.data.user.name || '',
          email: userInfo.data.user.email,
          photo: userInfo.data.user.photo || '',
          familyName: userInfo.data.user.familyName || '',
          givenName: userInfo.data.user.givenName || '',
        };
        
        setUser(userData);
        setIsLoading(false);
        
        // idToken과 serverAuthCode도 함께 반환
        return {
          ...userData,
          idToken: userInfo.data.idToken,
          serverAuthCode: userInfo.data.serverAuthCode,
        };
      }
      
      setIsLoading(false);
      return null;
    } catch (error: any) {
      setIsLoading(false);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('사용자가 로그인을 취소했습니다.');
        return null;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('알림', '이미 로그인이 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('오류', 'Google Play Services가 필요합니다.');
      } else {
        console.error('Google 로그인 오류:', error);
        Alert.alert('로그인 실패', 'Google 로그인 중 오류가 발생했습니다.');
      }
      
      return null;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUser(null);
      console.log('✅ Google 로그아웃 완료');
    } catch (error) {
      console.error('Google 로그아웃 오류:', error);
    }
  };

  return {
    signIn,
    signOut,
    user,
    isLoading,
    isConfigured: true, // configure에서 설정됨
  };
}