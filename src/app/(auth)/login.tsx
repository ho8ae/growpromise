// 로그인 화면에서 수동 네비게이션 처리
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, error, login, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'PARENT' | 'CHILD'>('PARENT');
  
  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: async () => {
      // 에러 상태 초기화
      clearError();
      
      // 입력 유효성 검사
      if (!username || !password) {
        throw new Error('이름과 비밀번호를 입력해주세요.');
      }
      
      console.log('로그인 시도:', { username, userType });
      
      // 로그인 요청
      await login({ username, password, userType });
    },
    onSuccess: () => {
      console.log('로그인 성공, 리디렉션 시작');
      // 로그인 성공 시 수동으로 경로 이동
      if (userType === 'PARENT') {
        router.replace('/(parent)');
      } else if (userType === 'CHILD') {
        router.replace('/(child)');
      } else {
        router.replace('/(tabs)');
      }
    },
    onError: (error: any) => {
      console.error('로그인 실패:', error);
      // 로그인 실패 시 에러 메시지 표시
      Alert.alert(
        '로그인 실패',
        error.message || '로그인 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    },
  });
  
  const handleLogin = () => {
    console.log('로그인 버튼 클릭');
    loginMutation.mutate();
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 flex-1 justify-center">
        <View className="items-center mb-8">
          <Image
            source={require('../../assets/images/react-logo.png')}
            style={{ width: 80, height: 80 }}
            contentFit="contain"
          />
          <Text className="text-2xl font-bold mt-4">로그인</Text>
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
        
        <View className="mb-6">
          <Text className="text-gray-700 mb-1">비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            secureTextEntry
            className="border border-gray-300 rounded-xl p-3"
          />
        </View>
        
        <Pressable
          className="bg-blue-500 py-3 rounded-xl mb-4"
          onPress={handleLogin}
          disabled={loginMutation.isPending || isLoading}
        >
          {loginMutation.isPending || isLoading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-medium ml-2">로그인 중...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-medium">
              로그인
            </Text>
          )}
        </Pressable>
        
        {error && (
          <Text className="text-red-500 text-center mb-4">
            {error}
          </Text>
        )}
        
        <Pressable onPress={() => router.navigate('/(auth)/signup')}>
          <Text className="text-center text-blue-500">
            계정이 없으신가요? 회원가입
          </Text>
        </Pressable>
        
        <Pressable 
          onPress={() => router.navigate('/(tabs)')}
          className="mt-4"
        >
          <Text className="text-center text-gray-500">
            로그인 없이 둘러보기
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}