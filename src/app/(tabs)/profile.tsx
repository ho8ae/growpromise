// app/(tabs)/profile.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Switch, Text, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api'; // 수정된 import

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

  // 연결된 계정 정보 가져오기 (부모인 경우 자녀 목록, 자녀인 경우 부모 정보)
  const { 
    data: connectedAccounts, 
    isLoading: isLoadingConnections,
    refetch: refetchConnections
  } = useQuery({
    queryKey: ['connectedAccounts'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return null;
      
      try {
        if (user.userType === 'PARENT') {
          // 부모 계정인 경우 연결된 자녀 목록 가져오기
          return await api.user.getParentChildren(); // 수정된 API 호출
        } else {
          // 자녀 계정인 경우 연결된 부모 정보 가져오기
          return await api.user.getChildParents(); // 수정된 API 호출
        }
      } catch (error) {
        console.error('연결된 계정 정보 로드 실패:', error);
        return null;
      }
    },
    enabled: isAuthenticated && !!user,
  });

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

  // 계정 연결 관리
  const handleConnectedAccounts = () => {
    if (handleAuthRequired()) return;
    
    if (user?.userType === 'PARENT') {
      // 부모 계정인 경우 연결 코드 생성 화면으로 이동
      router.push('/(parent)/generate-code');
    } else {
      // 자녀 계정인 경우 연결 코드 입력 화면으로 이동
      router.push('/(auth)/connect');
    }
  };

  // 설정 메뉴 항목 처리
  const handleSettingPress = (settingName: string) => {
    if (handleAuthRequired()) return;
    
    if (settingName === '연결된 계정') {
      handleConnectedAccounts();
      return;
    }
    
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
                  <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
                </Pressable>

                <Pressable
                  className="flex-row justify-between items-center py-3 border-b border-gray-200"
                  onPress={() => handleSettingPress('비밀번호')}
                >
                  <Text className="text-lg">비밀번호 변경</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
                </Pressable>

                {/* 연결된 계정 관리 섹션 - 수정된 부분 */}
                <View>
                  <Pressable
                    className="flex-row justify-between items-center py-3 border-b border-gray-200"
                    onPress={() => handleSettingPress('연결된 계정')}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-lg">
                        {user?.userType === 'PARENT' ? '자녀 계정 연결' : '부모님 계정 연결'}
                      </Text>
                      
                      {/* 연결 상태 표시 */}
                      {isLoadingConnections ? (
                        <ActivityIndicator size="small" color="#10b981" style={{ marginLeft: 8 }} />
                      ) : (
                        connectedAccounts && 
                        (Array.isArray(connectedAccounts) ? 
                          connectedAccounts.length > 0 : 
                          connectedAccounts !== null) && (
                          <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                            <Text className="text-xs text-green-700">연결됨</Text>
                          </View>
                        )
                      )}
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
                  </Pressable>
                  
                  {/* 연결된 계정 정보 표시 */}
                  {user?.userType === 'PARENT' ? (
                    // 부모인 경우 자녀 목록 표시
                    <>
                      {Array.isArray(connectedAccounts) && connectedAccounts.length > 0 && (
                        <View className="mt-2 ml-4">
                          <Text className="text-sm text-gray-500 mb-2">연결된 자녀</Text>
                          {connectedAccounts.map(child => (
                            <View key={child.id} className="flex-row items-center py-2">
                              <MaterialCommunityIcons name="account-child" size={20} color="#10b981" />
                              <Text className="ml-2 text-gray-700">{child.username}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    // 자녀인 경우 부모 정보 표시
                    <>
                      {connectedAccounts && !Array.isArray(connectedAccounts) && (
                        <View className="mt-2 ml-4">
                          <Text className="text-sm text-gray-500 mb-2">연결된 부모님</Text>
                          <View className="flex-row items-center py-2">
                            <MaterialCommunityIcons name="account-tie" size={20} color="#10b981" />
                            <Text className="ml-2 text-gray-700">{connectedAccounts.username}</Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* 계정 연결 안내 메시지 */}
                {(user?.userType === 'PARENT' && (!connectedAccounts || !Array.isArray(connectedAccounts) || connectedAccounts.length === 0)) ||
                 (user?.userType === 'CHILD' && (!connectedAccounts || connectedAccounts === null)) ? (
                  <View className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <Text className="text-amber-800 text-sm">
                      {user?.userType === 'PARENT' 
                        ? '아직 연결된 자녀 계정이 없습니다. 자녀 계정을 연결하면 약속을 관리할 수 있어요.'
                        : '아직 부모님 계정과 연결되지 않았습니다. 부모님 계정과 연결하면 약속을 인증하고 스티커를 모을 수 있어요.'}
                    </Text>
                    <Pressable
                      className="mt-2 py-2 bg-amber-500 rounded-lg"
                      onPress={handleConnectedAccounts}
                    >
                      <Text className="text-white text-center font-medium">
                        {user?.userType === 'PARENT' ? '자녀 계정 연결하기' : '부모님 계정 연결하기'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
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
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>
          </View>

          <View className="bg-purple-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">지원</Text>

            <Pressable
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => handleSettingPress('도움말')}
            >
              <Text className="text-lg">도움말</Text>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>

            <Pressable
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => handleSettingPress('문의하기')}
            >
              <Text className="text-lg">문의하기</Text>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>

            <Pressable
              className="flex-row justify-between items-center py-3"
              onPress={() => handleSettingPress('앱 정보')}
            >
              <Text className="text-lg">앱 정보</Text>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
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