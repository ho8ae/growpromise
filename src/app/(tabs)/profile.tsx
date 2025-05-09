// app/(tabs)/profile.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Switch, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: '',
    userType: ''
  });

  // 사용자 프로필 정보 설정
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserProfile({
        name: user.username || '',
        userType: user.userType === 'PARENT' ? '부모' : '아이'
      });
    } else {
      setUserProfile({
        name: '',
        userType: ''
      });
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작');
      
      // 로그아웃 처리
      await logout();
      
      console.log('로그아웃 함수 완료, 화면 전환 시작');
      
      // 로그인 화면으로 이동
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 미인증 상태일 때 로그인 화면으로 이동
  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그인',
          onPress: () => router.navigate('/(auth)/login')
        }
      ]);
      return true;
    }
    return false;
  };

  // 설정 메뉴 항목 처리
  const handleSettingPress = (settingName: string) => {
    if (handleAuthRequired()) return;
    
    Alert.alert('알림', `${settingName} 설정은 아직 개발 중입니다.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">설정</Text>

          {isAuthenticated ? (
            <View className="items-center py-4 mb-4">
              <Image
                source={require('../../assets/images/react-logo.png')}
                style={{ width: 80, height: 80 }}
                contentFit="contain"
                className="rounded-full mb-2"
              />
              <Text className="text-xl font-bold">{userProfile.name}</Text>
              <Text className="text-gray-500">{userProfile.userType} 계정</Text>
            </View>
          ) : (
            <View className="items-center py-4 mb-4 bg-amber-50 rounded-xl p-4">
              <Text className="text-amber-800 font-medium mb-2">로그인하지 않았습니다</Text>
              <Text className="text-amber-700 text-center mb-3">
                모든 기능을 사용하려면 로그인하세요.
              </Text>
              <Pressable
                className="bg-amber-500 py-2 px-4 rounded-lg"
                onPress={() => router.navigate('/(auth)/login')}
              >
                <Text className="text-white font-medium">로그인하기</Text>
              </Pressable>
            </View>
          )}

          {isAuthenticated && (
            <>
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <Text className="text-lg font-medium mb-4">계정 설정</Text>

                <Pressable
                  className="flex-row justify-between items-center py-3 border-b border-gray-200"
                  onPress={() => handleSettingPress('프로필 정보')}
                >
                  <Text className="text-lg">프로필 정보 변경</Text>
                  <Text className="text-gray-400">›</Text>
                </Pressable>

                <Pressable
                  className="flex-row justify-between items-center py-3 border-b border-gray-200"
                  onPress={() => handleSettingPress('비밀번호')}
                >
                  <Text className="text-lg">비밀번호 변경</Text>
                  <Text className="text-gray-400">›</Text>
                </Pressable>

                <Pressable
                  className="flex-row justify-between items-center py-3"
                  onPress={() => handleSettingPress('연결된 계정')}
                >
                  <Text className="text-lg">연결된 계정 관리</Text>
                  <Text className="text-gray-400">›</Text>
                </Pressable>
              </View>
            </>
          )}

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
              onPress={() => handleSettingPress('테마')}
            >
              <Text className="text-lg">테마 설정</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>

          <View className="bg-purple-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">지원</Text>

            <Pressable
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => handleSettingPress('도움말')}
            >
              <Text className="text-lg">도움말</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>

            <Pressable
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => handleSettingPress('문의하기')}
            >
              <Text className="text-lg">문의하기</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>

            <Pressable
              className="flex-row justify-between items-center py-3"
              onPress={() => handleSettingPress('앱 정보')}
            >
              <Text className="text-lg">앱 정보</Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>

          {isAuthenticated && (
            <Pressable
              className="bg-red-500 py-3 rounded-xl mb-6"
              onPress={handleLogout}
            >
              <Text className="text-white text-center font-medium">로그아웃</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}