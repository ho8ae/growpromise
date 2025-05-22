// app/(auth)/social-setup.tsx - 소셜 로그인 후 초기 설정 화면
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import authApi from '../../api/modules/auth';

export default function SocialSetupScreen() {
  const router = useRouter();
  
  const [userType, setUserType] = useState<'PARENT' | 'CHILD' | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [parentCode, setParentCode] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 부모 연결 코드 유효성 검사
  const [parentCodeError, setParentCodeError] = useState('');

  const validateParentCode = (value: string) => {
    if (value && value.length !== 6) {
      setParentCodeError('연결 코드는 6자리 숫자여야 합니다.');
      return false;
    }
    setParentCodeError('');
    return true;
  };

  // 설정 완료 뮤테이션
  const setupMutation = useMutation({
    mutationFn: async () => {
      if (!userType) {
        throw new Error('사용자 유형을 선택해주세요.');
      }

      // 자녀인 경우 부모 코드 유효성 검사
      if (userType === 'CHILD' && parentCode && !validateParentCode(parentCode)) {
        throw new Error('올바른 부모 연결 코드를 입력해주세요.');
      }

      const setupData = {
        userType,
        birthDate: birthDate ? birthDate.toISOString() : undefined,
        parentCode: parentCode || undefined
      };

      return await authApi.completeSocialSetup(setupData);
    },
    onSuccess: (response) => {
      console.log('소셜 로그인 설정 完료:', response);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '설정 완료!',
        '계정 설정이 완료되었습니다.',
        [
          { 
            text: '시작하기', 
            onPress: () => {
              // 사용자 타입에 따라 적절한 화면으로 이동
              if (response.user.userType === 'PARENT') {
                router.replace('/(parent)');
              } else {
                router.replace('/(child)');
              }
            }
          }
        ]
      );
    },
    onError: (error: any) => {
      console.error('소셜 로그인 설정 실패:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        '설정 실패',
        error.message || '설정 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    },
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleComplete = () => {
    setupMutation.mutate();
  };

  const handleUserTypeSelect = (type: 'PARENT' | 'CHILD') => {
    setUserType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <Pressable 
          onPress={() => router.back()}
          className="p-2"
          disabled={setupMutation.isPending}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-medium text-gray-800">
          계정 설정
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-6 flex-1">
          {/* 안내 메시지 */}
          <View className="items-center mb-8">
            <View className="bg-[#E6F4D7] p-6 rounded-full mb-4">
              <FontAwesome5 name="user-cog" size={40} color="#58CC02" />
            </View>
            <Text className="text-2xl font-bold text-center mb-2 text-gray-800">
              계정 설정을 완료해주세요
            </Text>
            <Text className="text-center text-gray-500">
              추가 정보를 입력하여 설정을 완료합니다
            </Text>
          </View>

          {/* 사용자 타입 선택 */}
          <View className="mb-8">
            <Text className="text-lg font-bold mb-4 text-gray-800">
              어떤 계정인가요?
            </Text>
            
            <View className="flex-row justify-between">
              <Pressable 
                className={`flex-1 mr-2 p-4 rounded-xl border-2 ${
                  userType === 'PARENT' 
                    ? 'border-[#2B70C9] bg-[#2B70C9]' 
                    : 'border-gray-200 bg-white'
                } active:opacity-90`}
                onPress={() => handleUserTypeSelect('PARENT')}
                disabled={setupMutation.isPending}
              >
                <View className="items-center">
                  <FontAwesome5 
                    name="user-tie" 
                    size={30} 
                    color={userType === 'PARENT' ? 'white' : '#2B70C9'} 
                  />
                  <Text className={`mt-2 font-semibold ${
                    userType === 'PARENT' ? 'text-white' : 'text-[#2B70C9]'
                  }`}>
                    부모님
                  </Text>
                </View>
              </Pressable>
              
              <Pressable 
                className={`flex-1 ml-2 p-4 rounded-xl border-2 ${
                  userType === 'CHILD' 
                    ? 'border-[#FFC800] bg-[#FFC800]' 
                    : 'border-gray-200 bg-white'
                } active:opacity-90`}
                onPress={() => handleUserTypeSelect('CHILD')}
                disabled={setupMutation.isPending}
              >
                <View className="items-center">
                  <FontAwesome5 
                    name="child" 
                    size={30} 
                    color={userType === 'CHILD' ? 'white' : '#FFC800'} 
                  />
                  <Text className={`mt-2 font-semibold ${
                    userType === 'CHILD' ? 'text-white' : 'text-[#FFC800]'
                  }`}>
                    아이
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* 자녀인 경우 생년월일 (선택) */}
          {userType === 'CHILD' && (
            <View className="mb-6">
              <Text className="text-lg font-bold mb-4 text-gray-800">
                생년월일 (선택)
              </Text>
              <Text className="text-sm text-gray-500 mb-3">
                맞춤형 콘텐츠 제공을 위해 사용됩니다
              </Text>
              
              <Pressable
                className="bg-gray-100 rounded-xl px-4 py-4 flex-row justify-between items-center"
                onPress={() => setShowDatePicker(true)}
                disabled={setupMutation.isPending}
              >
                <Text className={birthDate ? "text-gray-800" : "text-gray-400"}>
                  {birthDate ? format(birthDate, 'yyyy년 MM월 dd일', { locale: ko }) : '생년월일 선택'}
                </Text>
                <FontAwesome5 name="calendar-alt" size={16} color="#58CC02" />
              </Pressable>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}

          {/* 자녀인 경우 부모 연결 코드 (선택) */}
          {userType === 'CHILD' && (
            <View className="mb-8">
              <Text className="text-lg font-bold mb-4 text-gray-800">
                부모님과 연결 (선택)
              </Text>
              <Text className="text-sm text-gray-500 mb-3">
                부모님이 알려준 6자리 연결 코드를 입력하세요
              </Text>
              
              <TextInput
                className={`bg-gray-100 rounded-xl px-4 py-4 text-center text-lg tracking-widest ${
                  parentCodeError ? 'border border-red-500' : ''
                }`}
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
                editable={!setupMutation.isPending}
              />
              
              {parentCodeError ? (
                <Text className="text-red-500 text-sm mt-2 text-center">
                  {parentCodeError}
                </Text>
              ) : (
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  나중에 연결할 수도 있어요
                </Text>
              )}
            </View>
          )}

          {/* 완료 버튼 */}
          <View className="mt-auto">
            <Pressable
              className={`py-4 rounded-xl ${
                !userType || setupMutation.isPending
                  ? 'bg-gray-300'
                  : 'bg-[#58CC02]'
              } active:opacity-90`}
              onPress={handleComplete}
              disabled={!userType || setupMutation.isPending}
            >
              {setupMutation.isPending ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">
                    설정 중...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  설정 완료
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}