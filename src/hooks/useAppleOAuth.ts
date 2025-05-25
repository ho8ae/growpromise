// src/hooks/useAppleOAuth.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface AppleUser {
  id: string;
  email: string | null;
  fullName: {
    givenName: string | null;
    familyName: string | null;
  } | null;
  name?: string;
  identityToken: string;
  authorizationCode: string | null;
  state?: string | null;
}

export function useAppleOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AppleUser | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Apple Sign-In 사용 가능 여부 확인
  useEffect(() => {
    const checkAppleSignInAvailability = async () => {
      if (Platform.OS !== 'ios') {
        console.log('🍎 Apple Sign-In: iOS가 아님');
        setIsAvailable(false);
        return;
      }

      try {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        console.log('🍎 Apple Sign-In 사용 가능:', isAvailable);
        setIsAvailable(isAvailable);
      } catch (error) {
        console.error('❌ Apple Sign-In 사용 가능 여부 확인 실패:', error);
        setIsAvailable(false);
      }
    };

    checkAppleSignInAvailability();
  }, []);

  const signIn = async (): Promise<AppleUser | null> => {
    if (Platform.OS !== 'ios') {
      Alert.alert('지원하지 않음', 'Apple 로그인은 iOS에서만 사용 가능합니다.');
      return null;
    }

    if (!isAvailable) {
      Alert.alert('사용 불가', 'Apple 로그인을 사용할 수 없습니다.');
      return null;
    }

    try {
      setIsLoading(true);
      console.log('🍎 Apple 로그인 시작...');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('📨 Apple 로그인 응답:', {
        hasUser: !!credential.user,
        hasEmail: !!credential.email,
        hasFullName: !!credential.fullName,
        hasIdentityToken: !!credential.identityToken,
        hasAuthCode: !!credential.authorizationCode,
      });

      if (credential.user) {
        // 이름 조합 (Apple은 처음 로그인 시에만 이름 정보 제공)
        const fullName = credential.fullName;
        let name = '';
        if (fullName?.givenName || fullName?.familyName) {
          name = `${fullName.familyName || ''}${fullName.givenName || ''}`.trim();
        }

        const appleUser: AppleUser = {
          id: credential.user,
          email: credential.email,
          fullName: credential.fullName,
          name: name || undefined,
          identityToken: credential.identityToken || '',
          authorizationCode: credential.authorizationCode,
          state: credential.state,
        };

        // identityToken 필수 검증
        if (!appleUser.identityToken) {
          console.error('❌ Apple identityToken이 없습니다.');
          throw new Error('Apple 인증 토큰을 받지 못했습니다. 다시 시도해주세요.');
        }

        setUser(appleUser);
        console.log('✅ Apple 사용자 정보 설정 완료:', {
          id: appleUser.id,
          email: appleUser.email,
          name: appleUser.name,
        });

        return appleUser;
      } else {
        throw new Error('Apple 사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('❌ Apple 로그인 오류:', error);

      // 에러 타입별 처리
      if (error.code === 'ERR_CANCELED') {
        console.log('📱 사용자가 Apple 로그인을 취소했습니다.');
        return null;
      } else if (error.code === 'ERR_INVALID_RESPONSE') {
        Alert.alert(
          '로그인 실패',
          'Apple에서 잘못된 응답을 받았습니다. 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      } else if (error.code === 'ERR_REQUEST_FAILED') {
        Alert.alert(
          '네트워크 오류',
          '네트워크 연결을 확인하고 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      } else {
        // 기타 오류
        const errorMessage = error.message || 'Apple 로그인 중 오류가 발생했습니다.';
        Alert.alert('로그인 실패', errorMessage, [{ text: '확인' }]);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🍎 Apple 로그아웃...');
      // Apple Sign-In은 별도의 로그아웃 메서드가 없음
      // 로컬 상태만 정리
      setUser(null);
      console.log('✅ Apple 로그아웃 완료 (로컬 상태 정리)');
    } catch (error) {
      console.error('❌ Apple 로그아웃 오류:', error);
      // 실패해도 로컬 상태는 정리
      setUser(null);
    }
  };

  // Apple 로그인 상태 확인 (iOS 13+ 필요)
  const getCredentialState = async (userID: string): Promise<string | null> => {
    try {
      if (Platform.OS !== 'ios' || !isAvailable) {
        return null;
      }

      const credentialState = await AppleAuthentication.getCredentialStateAsync(userID);
      
      switch (credentialState) {
        case AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED:
          return 'AUTHORIZED';
        case AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND:
          return 'NOT_FOUND';
        case AppleAuthentication.AppleAuthenticationCredentialState.REVOKED:
          return 'REVOKED';
        case AppleAuthentication.AppleAuthenticationCredentialState.TRANSFERRED:
          return 'TRANSFERRED';
        default:
          return 'UNKNOWN';
      }
    } catch (error) {
      console.error('❌ Apple 자격 증명 상태 확인 실패:', error);
      return null;
    }
  };

  return {
    // 메서드
    signIn,
    signOut,
    getCredentialState,

    // 상태
    user,
    isLoading,
    isAvailable,

    // 유틸리티
    isSignedIn: !!user,
    isSupported: Platform.OS === 'ios',
  };
}