// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'parent' | 'child'>('parent');
  
  const handleLogin = () => {
    // 실제 앱에서는 인증 로직 구현
    // 예: API 호출, AsyncStorage에 토큰 저장 등
    
    // 로그인 성공 후 메인 화면으로 이동
    router.replace('/(tabs)');
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
              userType === 'parent' ? 'bg-blue-500' : 'bg-gray-200'
            } rounded-l-xl`}
            onPress={() => setUserType('parent')}
          >
            <Text
              className={`font-medium ${
                userType === 'parent' ? 'text-white' : 'text-gray-700'
              }`}
            >
              부모
            </Text>
          </Pressable>
          
          <Pressable
            className={`flex-1 py-2 items-center ${
              userType === 'child' ? 'bg-green-500' : 'bg-gray-200'
            } rounded-r-xl`}
            onPress={() => setUserType('child')}
          >
            <Text
              className={`font-medium ${
                userType === 'child' ? 'text-white' : 'text-gray-700'
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
            placeholder={userType === 'parent' ? '부모 이름' : '아이 이름'}
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
        >
          <Text className="text-white text-center font-medium">
            로그인
          </Text>
        </Pressable>
        
        <Pressable onPress={() => router.push('/(auth)/signup')}>
          <Text className="text-center text-blue-500">
            계정이 없으신가요? 회원가입
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}