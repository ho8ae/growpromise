// app/(auth)/login.tsx - 완성된 소셜 로그인 (Google + Apple)
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SocialLoginButtons from '../../../src/components/auth/SocialLoginButtons';
import SafeStatusBar from '../../../src/components/common/SafeStatusBar';
import { useAuthStore } from '../../../src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, error, login, googleSignIn, appleSignIn, clearError } =
    useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 포커스 상태
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // 애니메이션 값
  const logoScale = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;

  // 포커스 이동을 위한 ref
  const passwordInputRef = useRef<TextInput>(null);

  // 컴포넌트 마운트 시 애니메이션
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, []);

  // 키보드 포커스에 따른 로고 애니메이션
  React.useEffect(() => {
    if (isUsernameFocused || isPasswordFocused) {
      Animated.timing(logoScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();
    } else {
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  }, [isUsernameFocused, isPasswordFocused]);

  // 아이디 유효성 검증
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameError('아이디를 입력해주세요');
      return false;
    }

    if (value.trim().length < 2) {
      setUsernameError('아이디는 2자 이상이어야 합니다');
      return false;
    }

    setUsernameError('');
    return true;
  };

  // 비밀번호 유효성 검증
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('비밀번호를 입력해주세요');
      return false;
    }

    if (value.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다');
      return false;
    }

    setPasswordError('');
    return true;
  };

  // 일반 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: async () => {
      clearError();

      const isUsernameValid = validateUsername(username);
      const isPasswordValid = validatePassword(password);

      if (!isUsernameValid || !isPasswordValid) {
        throw new Error('입력 정보를 확인해주세요');
      }

      return await login({
        username,
        password,
      });
    },
    onSuccess: () => {
      console.log('✅ 일반 로그인 성공');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      console.error('❌ 일반 로그인 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        '로그인 실패',
        error.message || '아이디 또는 비밀번호가 올바르지 않습니다.',
        [{ text: '확인' }],
      );
    },
  });

  // Google 로그인 뮤테이션
  const googleLoginMutation = useMutation({
    mutationFn: async (userData: any) => {
      clearError();

      if (!userData.idToken) {
        throw new Error('Google 인증 토큰을 받지 못했습니다.');
      }

      console.log('🟡 Google 로그인 데이터 처리:', {
        hasIdToken: !!userData.idToken,
        userEmail: userData.email,
        userName: userData.name,
      });

      return await googleSignIn(userData.idToken, {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.photo,
        given_name: userData.givenName,
        family_name: userData.familyName,
        verified_email: userData.email,
      });
    },
    onSuccess: (response) => {
      console.log('🎉 Google 로그인 성공:', response);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (response.user.isNewUser) {
        // 신규 회원인 경우
        if (response.needsSetup) {
          Alert.alert(
            '환영합니다!',
            '쑥쑥약속에 가입해주셔서 감사합니다.\n초기 설정을 완료해주세요.',
            [
              {
                text: '설정하기',
                onPress: () => router.push('/(auth)/social-setup'),
              },
            ],
          );
        } else {
          Alert.alert('회원가입 완료!', '쑥쑥약속에 오신 것을 환영합니다!', [
            {
              text: '시작하기',
              onPress: () => router.replace('/(tabs)'),
            },
          ]);
        }
      } else {
        // 기존 회원 로그인
        if (response.needsSetup) {
          console.log('⚙️ Google 추가 설정 필요, 설정 화면으로 이동');
          router.push('/(auth)/social-setup');
        } else {
          console.log('✅ Google 설정 완료된 사용자, 메인으로 이동');
          router.replace('/(tabs)');
        }
      }
    },
    onError: (error: any) => {
      console.error('❌ Google 로그인 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Google 로그인 실패',
        error.message || 'Google 로그인 중 오류가 발생했습니다.',
        [{ text: '확인' }],
      );
    },
  });

  // Apple 로그인 뮤테이션
  const appleLoginMutation = useMutation({
    mutationFn: async (appleData: any) => {
      clearError();

      if (!appleData.identityToken) {
        throw new Error('Apple 인증 토큰을 받지 못했습니다.');
      }

      console.log('🍎 Apple 로그인 데이터 처리:', {
        hasIdentityToken: !!appleData.identityToken,
        userEmail: appleData.email,
        userName: appleData.name,
      });

      return await appleSignIn(appleData.identityToken, {
        id: appleData.id,
        email: appleData.email,
        name: appleData.name,
        fullName: appleData.fullName,
      });
    },
    onSuccess: (response) => {
      console.log('🎉 Apple 로그인 성공:', response);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (response.user.isNewUser) {
        // 신규 회원인 경우
        if (response.needsSetup) {
          Alert.alert(
            '환영합니다!',
            '쑥쑥약속에 가입해주셔서 감사합니다.\n초기 설정을 완료해주세요.',
            [
              {
                text: '설정하기',
                onPress: () => router.push('/(auth)/social-setup'),
              },
            ],
          );
        } else {
          Alert.alert('회원가입 완료!', '쑥쑥약속에 오신 것을 환영합니다!', [
            {
              text: '시작하기',
              onPress: () => router.replace('/(tabs)'),
            },
          ]);
        }
      } else {
        // 기존 회원 로그인
        if (response.needsSetup) {
          console.log('⚙️ Apple 추가 설정 필요, 설정 화면으로 이동');
          router.push('/(auth)/social-setup');
        } else {
          console.log('✅ Apple 설정 완료된 사용자, 메인으로 이동');
          router.replace('/(tabs)');
        }
      }
    },
    onError: (error: any) => {
      console.error('❌ Apple 로그인 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Apple 로그인 실패',
        error.message || 'Apple 로그인 중 오류가 발생했습니다.',
        [{ text: '확인' }],
      );
    },
  });

  const handleLogin = () => {
    console.log('🔐 일반 로그인 버튼 클릭');
    Keyboard.dismiss();
    loginMutation.mutate();
  };

  const handleSocialLogin = (provider: 'GOOGLE' | 'APPLE', userData: any) => {
    console.log(`${provider} 로그인 시도:`, {
      provider,
      hasUserData: !!userData,
      userEmail: userData?.email,
    });

    if (provider === 'GOOGLE') {
      googleLoginMutation.mutate(userData);
    } else if (provider === 'APPLE') {
      appleLoginMutation.mutate(userData);
    }
  };

  const isAnyLoading =
    loginMutation.isPending ||
    googleLoginMutation.isPending ||
    appleLoginMutation.isPending ||
    isLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="px-6 flex-1 justify-center">
            {/* 로고 및 타이틀 */}
            <Animated.View
              className="items-center mb-8"
              style={{
                transform: [{ scale: logoScale }],
              }}
            >
              <View className="">
                <Image
                  source={require('../../assets/images/icon.png')}
                  style={{ width: 130, height: 130 }}
                />
              </View>
              <Text className="text-2xl font-bold text-[#58CC02] mb-2">
                쑥쑥약속
              </Text>
              <Text className="text-gray-500">함께 약속하고 함께 자라요</Text>
            </Animated.View>

            {/* 일반 로그인 폼 */}
            <Animated.View
              className="mb-6"
              style={{
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              }}
            >
              <View className="mb-2">
                <Text className="text-gray-700 mb-2 font-medium ml-1">
                  아이디
                </Text>
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (text) validateUsername(text);
                  }}
                  onFocus={() => {
                    setIsUsernameFocused(true);
                    Haptics.selectionAsync();
                  }}
                  onBlur={() => {
                    setIsUsernameFocused(false);
                    validateUsername(username);
                  }}
                  onSubmitEditing={() => {
                    passwordInputRef.current?.focus();
                  }}
                  placeholder="아이디를 입력하세요"
                  className={`bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 ${
                    isUsernameFocused
                      ? 'border-2 border-[#58CC02]'
                      : usernameError
                        ? 'border border-red-500'
                        : ''
                  }`}
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  editable={!isAnyLoading}
                />

                {usernameError ? (
                  <Text className="text-red-500 text-sm ml-2 mt-1">
                    {usernameError}
                  </Text>
                ) : (
                  <Text className="text-transparent text-sm ml-2 mt-1">-</Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium ml-1">
                  비밀번호
                </Text>
                <TextInput
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (text) validatePassword(text);
                  }}
                  onFocus={() => {
                    setIsPasswordFocused(true);
                    Haptics.selectionAsync();
                  }}
                  onBlur={() => {
                    setIsPasswordFocused(false);
                    validatePassword(password);
                  }}
                  onSubmitEditing={handleLogin}
                  placeholder="비밀번호를 입력하세요"
                  className={`bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 ${
                    isPasswordFocused
                      ? 'border-2 border-[#58CC02]'
                      : passwordError
                        ? 'border border-red-500'
                        : ''
                  }`}
                  secureTextEntry
                  returnKeyType="done"
                  editable={!isAnyLoading}
                />

                {passwordError ? (
                  <Text className="text-red-500 text-sm ml-2 mt-1">
                    {passwordError}
                  </Text>
                ) : (
                  <Text className="text-transparent text-sm ml-2 mt-1">-</Text>
                )}
              </View>

              <Pressable
                className={`${
                  !username ||
                  !password ||
                  !!usernameError ||
                  !!passwordError ||
                  isAnyLoading
                    ? 'bg-[#AEDBAE]'
                    : 'bg-[#58CC02]'
                } py-4 rounded-xl shadow-sm  active:opacity-90`}
                onPress={handleLogin}
                disabled={
                  !username ||
                  !password ||
                  !!usernameError ||
                  !!passwordError ||
                  isAnyLoading
                }
                onPressIn={() => {
                  if (
                    username &&
                    password &&
                    !usernameError &&
                    !passwordError &&
                    !isAnyLoading
                  ) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
              >
                {isAnyLoading ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-medium ml-2">
                      로그인 중...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    로그인
                  </Text>
                )}
              </Pressable>

              {/* 소셜 로그인 버튼들 */}
              <Animated.View
                className="mb-6"
                style={{
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                }}
              >
                <SocialLoginButtons
                  onSocialLogin={handleSocialLogin}
                  isLoading={isAnyLoading}
                />
              </Animated.View>

              {/* 에러 메시지 */}
              {error && (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              )}
            </Animated.View>

            {/* 일반 회원가입 링크 */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.navigate('/(auth)/signup');
              }}
              className="active:opacity-70"
              disabled={isAnyLoading}
            >
              <Text className="text-center text-[#58CC02] font-medium">
                일반 계정으로 회원가입
              </Text>
            </Pressable>

            {/* 둘러보기 링크 */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.navigate('/(tabs)');
              }}
              className="mt-4 active:opacity-70"
              disabled={isAnyLoading}
            >
              <Text className="text-center text-gray-500">
                로그인 없이 둘러보기
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
