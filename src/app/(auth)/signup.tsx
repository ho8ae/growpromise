import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function SignupScreen() {
  const router = useRouter();
  const { parentSignup, childSignup, clearError } = useAuthStore();
  
  const [userType, setUserType] = useState<'PARENT' | 'CHILD'>('PARENT');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [parentCode, setParentCode] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 회원가입 뮤테이션
  const signupMutation = useMutation({
    mutationFn: async () => {
      // 에러 상태 초기화
      clearError();
      
      // 기본 유효성 검사
      if (!username || !password || !confirmPassword) {
        throw new Error('모든 필수 항목을 입력해주세요.');
      }
      
      if (password !== confirmPassword) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      
      // 부모 계정 생성
      if (userType === 'PARENT') {
        if (!email) {
          throw new Error('이메일은 필수입니다.');
        }
        
        await parentSignup({
          username,
          email,
          password,
          confirmPassword
        });
      } 
      // 자녀 계정 생성
      else {
        await childSignup({
          username,
          password,
          confirmPassword,
          birthDate: birthDate ? birthDate.toISOString() : undefined,
          parentCode: parentCode || undefined
        });
      }
    },
    onSuccess: () => {
      Alert.alert(
        '회원가입 성공',
        '계정이 성공적으로 생성되었습니다. 이제 로그인할 수 있습니다.',
        [{ text: '로그인하기', onPress: () => router.replace('/(auth)/login') }]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    },
  });
  
  const handleSignup = () => {
    signupMutation.mutate();
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-8 flex-1">
          <View className="flex-row items-center mb-6">
            <Pressable onPress={() => router.back()} className="p-2">
              <Image
                source={require('../../assets/images/react-logo.png')}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </Pressable>
            <Text className="text-2xl font-bold flex-1 text-center">회원가입</Text>
            <View style={{ width: 26 }} />
          </View>
          
          <View className="flex-row mb-6">
            <Pressable
              className={`flex-1 py-2 items-center ${
                userType === 'PARENT' ? 'bg-blue-500' : 'bg-gray-200'
              } rounded-l-xl`}
              onPress={() => setUserType('PARENT')}
            >
              <Text
                className={`font-medium ${
                  userType === 'PARENT' ? 'text-white' : 'text-gray-700'
                }`}
              >
                부모
              </Text>
            </Pressable>
            
            <Pressable
              className={`flex-1 py-2 items-center ${
                userType === 'CHILD' ? 'bg-green-500' : 'bg-gray-200'
              } rounded-r-xl`}
              onPress={() => setUserType('CHILD')}
            >
              <Text
                className={`font-medium ${
                  userType === 'CHILD' ? 'text-white' : 'text-gray-700'
                }`}
              >
                아이
              </Text>
            </Pressable>
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">이름</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={userType === 'PARENT' ? '부모 이름' : '아이 이름'}
              className="border border-gray-300 rounded-xl p-3"
            />
          </View>
          
          {userType === 'PARENT' && (
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">이메일</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="이메일 주소"
                keyboardType="email-address"
                className="border border-gray-300 rounded-xl p-3"
              />
            </View>
          )}
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">비밀번호</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              secureTextEntry
              className="border border-gray-300 rounded-xl p-3"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">비밀번호 확인</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호 확인"
              secureTextEntry
              className="border border-gray-300 rounded-xl p-3"
            />
          </View>
          
          {userType === 'CHILD' && (
            <>
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">생년월일 (선택사항)</Text>
                <Pressable
                  className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>
                    {birthDate ? format(birthDate, 'yyyy년 MM월 dd일', { locale: ko }) : '생년월일 선택'}
                  </Text>
                  <Image
                    source={require('../../assets/images/react-logo.png')}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
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
              
              <View className="mb-6">
                <Text className="text-gray-700 mb-1">부모 연결 코드 (선택사항)</Text>
                <TextInput
                  value={parentCode}
                  onChangeText={setParentCode}
                  placeholder="부모 연결 코드를 입력하세요"
                  className="border border-gray-300 rounded-xl p-3"
                />
              </View>
            </>
          )}
          
          <Pressable
            className="bg-blue-500 py-3 rounded-xl mb-4"
            onPress={handleSignup}
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-medium ml-2">처리 중...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-medium">
                회원가입
              </Text>
            )}
          </Pressable>
          
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className="text-center text-blue-500">
              이미 계정이 있으신가요? 로그인
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}