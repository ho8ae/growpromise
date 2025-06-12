// app/(auth)/signup.tsx - 실시간 아이디 중복 확인 추가
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Keyboard,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import authApi from '../../../src/api/modules/auth';
import SafeStatusBar from '../../../src/components/common/SafeStatusBar';
import Colors from '../../../src/constants/Colors';
import { useAuthStore } from '../../../src/stores/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { clearError } = useAuthStore();

  // 단계 관리
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'PARENT' | 'CHILD' | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [parentCode, setParentCode] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 🔥 아이디 중복 확인 상태 추가
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameCheckResult, setUsernameCheckResult] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({ checked: false, available: false, message: '' });

  // 폼 유효성 검증 상태
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentCode: '',
  });

  // 애니메이션 값
  const [slideAnim] = useState(new Animated.Value(0));

  // 슬라이드 애니메이션 효과
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  // 한국어 설정 (컴포넌트 외부에 한 번만)
  LocaleConfig.locales['ko'] = {
    monthNames: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    monthNamesShort: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    dayNames: [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘',
  };
  LocaleConfig.defaultLocale = 'ko';

  // 🔥 아이디 중복 확인 함수
  const checkUsernameAvailability = async (usernameValue: string) => {
    if (!usernameValue.trim() || usernameValue.length < 2) {
      setUsernameCheckResult({ checked: false, available: false, message: '' });
      return;
    }

    try {
      setIsCheckingUsername(true);
      const response = await authApi.checkUsername({ username: usernameValue });
      
      setUsernameCheckResult({
        checked: true,
        available: response.available,
        message: response.message,
      });
    } catch (error: any) {
      setUsernameCheckResult({
        checked: true,
        available: false,
        message: '아이디 확인 중 오류가 발생했습니다.',
      });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 🔥 디바운스된 아이디 중복 확인
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim() && username.length >= 2) {
        checkUsernameAvailability(username);
      } else {
        setUsernameCheckResult({ checked: false, available: false, message: '' });
      }
    }, 500); // 500ms 후에 확인

    return () => clearTimeout(timeoutId);
  }, [username]);

  // 다음 단계로 전환 시 애니메이션
  const goToNextStep = () => {
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(step + 1);
      slideAnim.setValue(400);
      setErrors({
        ...errors,
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        parentCode: '',
      });
    });
  };

  // 이전 단계로 이동 시 애니메이션
  const goToPrevStep = () => {
    if (step === 1) {
      router.back();
      return;
    }

    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(step - 1);
      slideAnim.setValue(-400);
    });
  };

  // 회원가입 뮤테이션
  const signupMutation = useMutation({
    mutationFn: async () => {
      clearError();

      console.log('📝 회원가입 시도:', {
        userType,
        username,
        email: userType === 'PARENT' ? email : undefined,
        hasBirthDate: !!birthDate,
        hasParentCode: !!parentCode,
      });

      if (!username || !password || !confirmPassword || !userType) {
        throw new Error('모든 필수 항목을 입력해주세요.');
      }

      if (password !== confirmPassword) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      // 🔥 아이디 중복 확인이 완료되지 않은 경우
      if (!usernameCheckResult.checked || !usernameCheckResult.available) {
        throw new Error('아이디 중복 확인을 완료해주세요.');
      }

      if (userType === 'PARENT') {
        if (!email) {
          throw new Error('이메일은 필수입니다.');
        }

        console.log('👔 부모 회원가입 요청...');
        return await authApi.parentSignup({
          username,
          email,
          password,
          confirmPassword,
        });
      } else {
        console.log('👶 자녀 회원가입 요청...');
        return await authApi.childSignup({
          username,
          password,
          confirmPassword,
          birthDate: birthDate ? birthDate.toISOString() : undefined,
          parentCode: parentCode || undefined,
        });
      }
    },
    onSuccess: (response) => {
      console.log('✅ 회원가입 성공:', response);
      Alert.alert('회원가입 완료!', '계정이 성공적으로 생성되었습니다.', [
        {
          text: '로그인하기',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    },
    onError: (error: any) => {
      console.error('❌ 회원가입 실패:', error);
      Alert.alert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.',
        [{ text: '확인' }],
      );
    },
  });

  // 계정 타입 토글 함수
  const handleUserTypeToggle = (type: 'PARENT' | 'CHILD') => {
    if (userType === type) {
      // 이미 선택된 타입을 다시 클릭하면 해제
      setUserType(null);
    } else {
      // 다른 타입 선택
      setUserType(type);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSignup = () => {
    if (validateAll()) {
      signupMutation.mutate();
    }
  };

  // 🔥 사용자 이름 유효성 검사 (중복 확인 포함)
  const validateUsername = (value: string) => {
    let error = '';
    if (!value.trim()) {
      error = '이름을 입력해주세요.';
    } else if (value.trim().length < 2) {
      error = '이름은 2자 이상이어야 합니다.';
    } else if (value.trim().length > 30) {
      error = '이름은 30자 이하여야 합니다.';
    } else if (usernameCheckResult.checked && !usernameCheckResult.available) {
      error = '이미 사용 중인 아이디입니다.';
    }

    setErrors({ ...errors, username: error });
    return !error;
  };

  // 이메일 유효성 검사
  const validateEmail = (value: string) => {
    let error = '';

    if (!value.trim()) {
      error = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = '유효한 이메일 형식이 아닙니다.';
    }

    setErrors({ ...errors, email: error });
    return !error;
  };

  // 비밀번호 유효성 검사
  const validatePassword = (value: string) => {
    let error = '';
    const minLength = userType === 'PARENT' ? 8 : 6;

    if (!value) {
      error = '비밀번호를 입력해주세요.';
    } else if (value.length < minLength) {
      error = `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`;
    }

    setErrors({ ...errors, password: error });
    return !error;
  };

  // 비밀번호 확인 유효성 검사
  const validateConfirmPassword = (value: string, password: string) => {
    let error = '';

    if (!value) {
      error = '비밀번호 확인을 입력해주세요.';
    } else if (value !== password) {
      error = '비밀번호가 일치하지 않습니다.';
    }

    setErrors({ ...errors, confirmPassword: error });
    return !error;
  };

  // 부모 연결 코드 유효성 검사 (6자리 숫자)
  const validateParentCode = (value: string) => {
    let error = '';

    if (value && value.length !== 6) {
      error = '연결 코드는 6자리 숫자여야 합니다.';
    }

    setErrors({ ...errors, parentCode: error });
    return !error;
  };

  // 모든 필드 유효성 검사
  const validateAll = () => {
    let isValid = true;

    // 공통 필드 검증
    isValid = validateUsername(username) && isValid;
    isValid = validatePassword(password) && isValid;
    isValid = validateConfirmPassword(confirmPassword, password) && isValid;

    // 🔥 아이디 중복 확인 여부 검사
    if (!usernameCheckResult.checked || !usernameCheckResult.available) {
      setErrors(prev => ({ ...prev, username: '아이디 중복 확인을 완료해주세요.' }));
      isValid = false;
    }

    // 사용자 타입에 따른 추가 검증
    if (userType === 'PARENT') {
      isValid = validateEmail(email) && isValid;
    } else if (userType === 'CHILD' && parentCode) {
      isValid = validateParentCode(parentCode) && isValid;
    }

    return isValid;
  };

  // 현재 단계 유효성 검사
  const validateCurrentStep = () => {
    switch (step) {
      case 2: // 사용자 이름
        return validateUsername(username) && usernameCheckResult.checked && usernameCheckResult.available;
      case 3: // 이메일 또는 생년월일
        if (userType === 'PARENT') {
          return validateEmail(email);
        }
        return true; // 생년월일은 선택사항
      case 4: // 비밀번호
        return (
          validatePassword(password) &&
          validateConfirmPassword(confirmPassword, password)
        );
      case 5: // 부모 연결 코드
        if (userType === 'CHILD' && parentCode) {
          return validateParentCode(parentCode);
        }
        return true; // 부모 연결 코드는 선택사항
      default:
        return true;
    }
  };

  const isNextButtonDisabled = () => {
    switch (step) {
      case 1: // 계정 타입 선택
        return !userType; // 계정 타입이 선택되지 않으면 비활성화
      case 2:
        // 🔥 아이디 검사 상태 포함
        return (
          !username.trim() || 
          !!errors.username || 
          isCheckingUsername || 
          !usernameCheckResult.checked || 
          !usernameCheckResult.available
        );
      case 3:
        if (userType === 'PARENT') {
          return !email.trim() || !!errors.email;
        }
        return false; // 생년월일은 선택사항
      case 4:
        return (
          !password.trim() ||
          !confirmPassword.trim() ||
          !!errors.password ||
          !!errors.confirmPassword
        );
      case 5:
        if (userType === 'CHILD' && parentCode) {
          return !!errors.parentCode;
        }
        return false; // 부모 연결 코드는 선택사항
      default:
        return false;
    }
  };

  // 🔥 아이디 상태 표시 컴포넌트
  const renderUsernameStatus = () => {
    if (isCheckingUsername) {
      return (
        <View className="flex-row items-center ml-2 mt-1">
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text className="text-gray-500 text-sm ml-2">확인 중...</Text>
        </View>
      );
    }

    if (errors.username) {
      return (
        <View className="flex-row items-center ml-2 mt-1">
          <FontAwesome5 name="times-circle" size={14} color="#ef4444" />
          <Text className="text-red-500 text-sm ml-2">{errors.username}</Text>
        </View>
      );
    }

    if (usernameCheckResult.checked) {
      if (usernameCheckResult.available) {
        return (
          <View className="flex-row items-center ml-2 mt-1">
            <FontAwesome5 name="check-circle" size={14} color="#10b981" />
            <Text className="text-green-500 text-sm ml-2">사용 가능한 아이디입니다</Text>
          </View>
        );
      } else {
        return (
          <View className="flex-row items-center ml-2 mt-1">
            <FontAwesome5 name="times-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-2">{usernameCheckResult.message}</Text>
          </View>
        );
      }
    }

    return <Text className="text-transparent text-sm ml-2 mt-1">-</Text>;
  };

  // 현재 단계에 따라 다른 화면 렌더링
  const renderStepContent = () => {
    switch (step) {
      case 1: // 사용자 타입 선택
        return (
          <View className="p-6 flex-1 justify-center">
            <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
              어떤 계정을 만들까요?
            </Text>

            <View className="flex-row justify-center mb-6">
              <Pressable
                className={`mr-4 w-40 h-40 rounded-3xl shadow-sm justify-center items-center active:scale-95 ${
                  userType === 'PARENT'
                    ? 'bg-[#2B70C9] border-4 border-[#1a5a9a]'
                    : 'bg-[#2B70C9] border-4 border-transparent'
                }`}
                onPress={() => handleUserTypeToggle('PARENT')}
                style={{ elevation: 4 }}
                disabled={signupMutation.isPending}
              >
                <View className="bg-white p-4 rounded-full mb-3">
                  <FontAwesome5 name="user-tie" size={40} color="#2B70C9" />
                </View>
                <Text className="text-white text-xl font-bold">부모님</Text>
                {userType === 'PARENT' && (
                  <View className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                    <FontAwesome5 name="check" size={16} color="#2B70C9" />
                  </View>
                )}
              </Pressable>

              <Pressable
                className={`w-40 h-40 rounded-3xl shadow-sm justify-center items-center active:scale-95 ${
                  userType === 'CHILD'
                    ? 'bg-[#FFC800] border-4 border-[#e6b300]'
                    : 'bg-[#FFC800] border-4 border-transparent'
                }`}
                onPress={() => handleUserTypeToggle('CHILD')}
                style={{ elevation: 4 }}
                disabled={signupMutation.isPending}
              >
                <View className="bg-white p-4 rounded-full mb-3">
                  <FontAwesome5 name="child" size={40} color="#FFC800" />
                </View>
                <Text className="text-white text-xl font-bold">아이</Text>
                {userType === 'CHILD' && (
                  <View className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                    <FontAwesome5 name="check" size={16} color="#FFC800" />
                  </View>
                )}
              </Pressable>
            </View>

            <Text className="text-center text-gray-500 mt-4">
              계정 유형에 따라 다른 기능을 제공합니다
            </Text>

            {userType && (
              <Text className="text-center text-gray-400 mt-2 text-sm">
                다시 누르면 선택을 해제할 수 있어요
              </Text>
            )}
          </View>
        );

      case 2: // 사용자 이름 입력
        return (
          <View className="p-6 flex-1 justify-center">
            <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
              {userType === 'PARENT'
                ? '부모님 이름을 알려주세요'
                : '이름을 알려주세요'}
            </Text>
            <Text className="text-center text-gray-500 mb-8">
              앱에서 사용할 이름을 입력해주세요
            </Text>

            <View className="mb-8">
              <TextInput
                className={`bg-gray-100 rounded-2xl px-4 py-5 text-gray-800 mb-1 ${
                  errors.username ? 'border border-red-500' : 
                  usernameCheckResult.checked && usernameCheckResult.available ? 'border border-green-500' :
                  ''
                }`}
                placeholder="이름 입력"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  // 🔥 입력 시 중복 확인 상태 초기화
                  setUsernameCheckResult({ checked: false, available: false, message: '' });
                  setErrors({ ...errors, username: '' });
                }}
                onBlur={() => validateUsername(username)}
                autoFocus
                editable={!signupMutation.isPending}
                textAlignVertical="center"
              />

              {/* 🔥 아이디 상태 표시 */}
              {renderUsernameStatus()}
            </View>
          </View>
        );

      case 3: // 부모일 경우 이메일, 자녀일 경우 생년월일(선택)
        return userType === 'PARENT' ? (
          <View className="p-6 flex-1 justify-center">
            <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
              이메일을 입력해주세요
            </Text>
            <Text className="text-center text-gray-500 mb-8">
              비밀번호 찾기 등에 사용됩니다
            </Text>

            <View className="mb-8">
              <TextInput
                className={`bg-gray-100 rounded-2xl px-4 py-5 text-gray-800 mb-1 ${errors.email ? 'border border-red-500' : ''}`}
                placeholder="이메일 주소"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (text) validateEmail(text);
                }}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                editable={!signupMutation.isPending}
                textAlignVertical="center"
              />

              {errors.email ? (
                <Text className="text-red-500 text-sm ml-2 mt-1">
                  {errors.email}
                </Text>
              ) : (
                <Text className="text-transparent text-sm ml-2 mt-1">-</Text>
              )}
            </View>
          </View>
        ) : (
          <View className="p-6 flex-1 justify-center">
            <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
              생년월일을 알려주세요 (선택)
            </Text>
            <Text className="text-center text-gray-500 mb-8">
              맞춤형 콘텐츠를 제공하는데 도움이 됩니다
            </Text>

            <Pressable
              className="bg-gray-100 rounded-2xl px-4 py-5 flex-row justify-between items-center mb-8"
              onPress={() => setShowDatePicker(true)}
              disabled={signupMutation.isPending}
            >
              <Text
                className={
                  birthDate ? 'text-gray-800 text-lg' : 'text-gray-400 text-lg'
                }
              >
                {birthDate
                  ? format(birthDate, 'yyyy년 MM월 dd일', { locale: ko })
                  : '생년월일 선택'}
              </Text>
              <FontAwesome5
                name="calendar-alt"
                size={20}
                color={Colors.light.primary}
              />
            </Pressable>

            {showDatePicker && (
              <Calendar
                onDayPress={(day) => {
                  setBirthDate(new Date(day.dateString));
                  setShowDatePicker(false);
                }}
                maxDate={new Date().toISOString().split('T')[0]}
                theme={{
                  selectedDayBackgroundColor: Colors.light.primary,
                  arrowColor: Colors.light.primary,
                  todayTextColor: Colors.light.primary,
                  textDayFontFamily: 'System',
                  textMonthFontFamily: 'System',
                  textDayHeaderFontFamily: 'System',
                }}
                firstDay={0} // 일요일부터 시작
              />
            )}
          </View>
        );

      case 4: // 비밀번호 입력
        return (
          <View className="p-6 flex-1 justify-center">
            <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
              비밀번호를 설정해주세요
            </Text>
            <Text className="text-center text-gray-500 mb-8">
              안전한 비밀번호를 입력해주세요
            </Text>

            <View className="mb-4">
              <TextInput
                className={`bg-gray-100 rounded-2xl px-4 py-5 text-gray-800 mb-1 ${errors.password ? 'border border-red-500' : ''}`}
                placeholder="비밀번호"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text) validatePassword(text);
                  if (confirmPassword)
                    validateConfirmPassword(confirmPassword, text);
                }}
                onBlur={() => validatePassword(password)}
                secureTextEntry
                autoFocus
                editable={!signupMutation.isPending}
                textAlignVertical="center"
              />

              {errors.password ? (
                <Text className="text-red-500 text-sm ml-2 mt-1">
                  {errors.password}
                </Text>
              ) : (
                <Text className="text-green-500 text-sm ml-2 mt-1">
                  {password
                    ? `비밀번호는 ${userType === 'PARENT' ? '8' : '6'}자 이상이어야 합니다`
                    : ''}
                </Text>
              )}
            </View>

            <View className="mb-2">
              <TextInput
                className={`bg-gray-100 rounded-2xl px-4 py-5 text-gray-800 mb-1 ${errors.confirmPassword ? 'border border-red-500' : ''}`}
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (text) validateConfirmPassword(text, password);
                }}
                onBlur={() =>
                  validateConfirmPassword(confirmPassword, password)
                }
                secureTextEntry
                editable={!signupMutation.isPending}
                textAlignVertical="center"
              />

              {errors.confirmPassword ? (
                <Text className="text-red-500 text-sm ml-2 mt-1">
                  {errors.confirmPassword}
                </Text>
              ) : confirmPassword ? (
                <Text className="text-green-500 text-sm ml-2 mt-1">
                  {password === confirmPassword ? '비밀번호가 일치합니다' : ''}
                </Text>
              ) : (
                <Text className="text-transparent text-sm ml-2 mt-1">-</Text>
              )}
            </View>
          </View>
        );

      case 5: // 자녀일 경우 부모 연결 코드 (선택)
        return userType === 'CHILD' ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="p-6 flex-1 justify-center">
              <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
                부모님과 연결할까요? (선택)
              </Text>
              <Text className="text-center text-gray-500 mb-8">
                부모님이 알려준 연결 코드를 입력하세요
              </Text>

              <View className="mb-4">
                <TextInput
                  className={`bg-gray-100 rounded-2xl px-4 py-5 text-gray-800 text-lg text-center tracking-widest mb-1 ${errors.parentCode ? 'border border-red-500' : ''}`}
                  placeholder="000000"
                  value={parentCode}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    setParentCode(numericText);
                    if (numericText) validateParentCode(numericText);
                  }}
                  onBlur={() => validateParentCode(parentCode)}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  editable={!signupMutation.isPending}
                  textAlignVertical="center"
                />

                {errors.parentCode ? (
                  <Text className="text-red-500 text-sm text-center mt-1">
                    {errors.parentCode}
                  </Text>
                ) : (
                  <Text className="text-transparent text-sm text-center mt-1">
                    -
                  </Text>
                )}
              </View>

              <Text className="text-center text-gray-500 mb-8">
                나중에 연결할 수도 있어요
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View className="p-6 flex-1 justify-center items-center">
            <FontAwesome5
              name="check-circle"
              size={60}
              color={Colors.light.primary}
              className="mb-8"
            />
            <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
              회원가입 정보 입력 완료!
            </Text>
            <Text className="text-center text-gray-500 mb-8">
              이제 &apos;쑥쑥약속&apos;을 시작해볼까요?
            </Text>
          </View>
        );

      case 6: // 최종 확인
        return (
          <View className="p-6 flex-1 justify-center items-center">
            <FontAwesome5
              name="check-circle"
              size={60}
              color={Colors.light.primary}
              className="mb-8"
            />
            <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
              회원가입 정보 입력 완료!
            </Text>
            <Text className="text-center text-gray-500 mb-8">
              이제 &apos;쑥쑥약속&apos;을 시작해볼까요?
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  // 단계별 하단 버튼 텍스트
  const getButtonText = () => {
    if (step === 1) return '다음';
    if (
      (userType === 'PARENT' && step === 5) ||
      (userType === 'CHILD' && step === 6)
    )
      return '가입하기';
    if (userType === 'CHILD' && step === 5)
      return parentCode.trim() ? '다음' : '이 단계 건너뛰기'; // 부모 연결 코드는 선택사항
    return '다음';
  };

  // 마지막 단계인지 확인
  const isFinalStep = () => {
    return (
      (userType === 'PARENT' && step === 5) ||
      (userType === 'CHILD' && step === 6)
    );
  };

  // 다음 버튼 핸들러
  const handleNextButton = () => {
    // 현재 단계 검증
    if (step > 1) {
      const isValid = validateCurrentStep();
      if (!isValid && step !== 5) return; // 자녀의 부모 코드 단계는 선택사항이므로 예외 처리
    }

    if (isFinalStep()) {
      handleSignup();
    } else if (step === 5 && userType === 'CHILD' && !parentCode.trim()) {
      // 부모 연결 코드 건너뛰기
      goToNextStep();
    } else {
      goToNextStep();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <Pressable
          onPress={goToPrevStep}
          className="p-2"
          disabled={signupMutation.isPending}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium text-gray-800">
          회원가입 {step}/{userType === 'PARENT' ? 5 : 6}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 진행 상태 표시 */}
      <View className="h-1 bg-gray-200 w-full">
        <View
          className="h-full bg-[#58CC02]"
          style={{
            width: `${(step / (userType === 'PARENT' ? 5 : 6)) * 100}%`,
          }}
        />
      </View>

      {/* 콘텐츠 */}
      <Animated.View
        className="flex-1"
        style={{ transform: [{ translateX: slideAnim }] }}
      >
        {renderStepContent()}
      </Animated.View>

      {/* 하단 버튼 */}
      <View className="p-6 border-t border-gray-100">
        <Pressable
          className={`py-4 rounded-2xl ${
            isNextButtonDisabled() || signupMutation.isPending
              ? 'bg-gray-300'
              : 'bg-[#58CC02]'
          }`}
          onPress={handleNextButton}
          disabled={isNextButtonDisabled() || signupMutation.isPending}
        >
          {signupMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              {getButtonText()}
            </Text>
          )}
        </Pressable>

        {step === 1 && (
          <Pressable
            className="mt-4"
            onPress={() => router.push('/(auth)/login')}
            disabled={signupMutation.isPending}
          >
            <Text className="text-[#58CC02] text-center">
              이미 계정이 있으신가요? 로그인하기
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}