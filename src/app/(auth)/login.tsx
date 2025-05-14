// app/(auth)/login.tsx - 실시간 검증 및 향상된 UX 적용
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, error, login, clearError } = useAuthStore();

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

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: async () => {
      // 에러 상태 초기화
      clearError();

      // 입력 유효성 검사
      const isUsernameValid = validateUsername(username);
      const isPasswordValid = validatePassword(password);

      if (!isUsernameValid || !isPasswordValid) {
        throw new Error('입력 정보를 확인해주세요');
      }

      console.log('로그인 시도:', { username });

      // 서버에 로그인 요청
      return await login({
        username,
        password,
      });
    },
    onSuccess: () => {
      console.log('로그인 성공');
      // 햅틱 피드백 - 성공
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      console.error('로그인 실패:', error);
      // 햅틱 피드백 - 오류
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        '로그인 실패',
        error.message || '아이디 또는 비밀번호가 올바르지 않습니다.',
        [{ text: '확인' }],
      );
    },
  });

  const handleLogin = () => {
    console.log('로그인 버튼 클릭');
    Keyboard.dismiss();
    loginMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="px-6 flex-1 justify-center">
            {/* 로고 및 타이틀 */}
            <Animated.View
              className="items-center mb-10"
              style={{
                transform: [{ scale: logoScale }],
              }}
            >
              <View className="bg-[#E6F4D7] p-6 rounded-full mb-6">
                <FontAwesome5 name="seedling" size={50} color="#58CC02" />
              </View>
              <Text className="text-2xl font-bold text-[#58CC02] mb-2">
                쑥쑥약속
              </Text>
              <Text className="text-gray-500">함께 약속하고 함께 자라요</Text>
            </Animated.View>

            {/* 로그인 폼 */}
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
                    // 햅틱 피드백 - 가벼운 터치
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
                    // 햅틱 피드백 - 가벼운 터치
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
                  loginMutation.isPending ||
                  isLoading
                    ? 'bg-[#AEDBAE]'
                    : 'bg-[#58CC02]'
                } py-4 rounded-xl shadow-sm mb-4 active:opacity-90`}
                onPress={handleLogin}
                disabled={
                  !username ||
                  !password ||
                  !!usernameError ||
                  !!passwordError ||
                  loginMutation.isPending ||
                  isLoading
                }
                onPressIn={() => {
                  if (
                    username &&
                    password &&
                    !usernameError &&
                    !passwordError &&
                    !loginMutation.isPending &&
                    !isLoading
                  ) {
                    // 햅틱 피드백 - 중간 강도 터치
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
              >
                {loginMutation.isPending || isLoading ? (
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

              {/* 에러 메시지 */}
              {error && (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              )}
            </Animated.View>

            {/* 회원가입 링크 */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.navigate('/(auth)/signup');
              }}
              className="py-2 active:opacity-70"
            >
              <Text className="text-center text-[#58CC02] font-medium">
                계정이 없으신가요? 회원가입
              </Text>
            </Pressable>

            {/* 둘러보기 링크 */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.navigate('/(tabs)');
              }}
              className="mt-2 py-2 active:opacity-70"
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
