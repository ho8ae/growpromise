// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  
  const handleLogout = () => {
    // 실제 앱에서는 로그아웃 로직 구현
    router.replace('/');
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">
            설정
          </Text>
          
          <View className="items-center py-4 mb-4">
            <Image
              source={require('../../assets/images/react-logo.png')}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
              className="rounded-full mb-2"
            />
            <Text className="text-xl font-bold">민준</Text>
            <Text className="text-gray-500">아이 계정</Text>
          </View>
          
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">계정 설정</Text>
            
            <Pressable 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => {}}
            >
              <Text className="text-lg">프로필 정보 변경</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
            
            <Pressable 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => {}}
            >
              <Text className="text-lg">비밀번호 변경</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
            
            <Pressable 
              className="flex-row justify-between items-center py-3"
              onPress={() => {}}
            >
              <Text className="text-lg">연결된 계정 관리</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>
          
          <View className="bg-green-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">앱 설정</Text>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-lg">알림</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              />
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-lg">효과음</Text>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              />
            </View>
            
            <Pressable 
              className="flex-row justify-between items-center py-3"
              onPress={() => {}}
            >
              <Text className="text-lg">테마 설정</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>
          
          <View className="bg-purple-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">지원</Text>
            
            <Pressable 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => {}}
            >
              <Text className="text-lg">도움말</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
            
            <Pressable 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => {}}
            >
              <Text className="text-lg">문의하기</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
            
            <Pressable 
              className="flex-row justify-between items-center py-3"
              onPress={() => {}}
            >
              <Text className="text-lg">앱 정보</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>
          
          <Pressable
            className="bg-red-500 py-3 rounded-xl mb-6"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-medium">
              로그아웃
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}