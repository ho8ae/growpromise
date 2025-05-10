import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Pressable, 
  ScrollView, 
  Switch, 
  Text, 
  View, 
  Alert, 
  ActivityIndicator,
  Animated,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MaterialCommunityIcons, 
  MaterialIcons, 
  FontAwesome5 
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import Colors from '../../constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: '',
    userType: ''
  });

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // 애니메이션 시작
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
          return await api.user.getParentChildren();
        } else {
          // 자녀 계정인 경우 연결된 부모 정보 가져오기
          return await api.user.getChildParents();
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 로그아웃 처리
      await logout();
      
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (settingName === '연결된 계정') {
      handleConnectedAccounts();
      return;
    }
    
    Alert.alert('알림', `${settingName} 설정은 아직 개발 중입니다.`);
  };
  
  // 스위치 토글 핸들러
  const handleSwitchToggle = (type: 'notifications' | 'sound') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'notifications') {
      setNotifications(prev => !prev);
    } else {
      setSoundEffects(prev => !prev);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4">
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-3xl font-bold text-center my-5 text-emerald-700">설정</Text>
          </Animated.View>

          {isAuthenticated ? (
            <Animated.View 
              className="items-center py-6 mb-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200 shadow-sm"
              style={{ 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <View className="bg-white p-1 rounded-full border-2 border-emerald-300 shadow-md mb-3">
                <Image
                  source={require('../../assets/images/react-logo.png')}
                  style={{ width: 90, height: 90 }}
                  contentFit="contain"
                  className="rounded-full"
                />
              </View>
              <Text className="text-2xl font-bold text-emerald-700">{userProfile.name}</Text>
              <View className="bg-emerald-100 px-4 py-1 rounded-full mt-2">
                <Text className="text-emerald-700 font-medium">{userProfile.userType} 계정</Text>
              </View>
              
              <Pressable
                className="bg-emerald-100 mt-4 px-4 py-2 rounded-lg flex-row items-center active:opacity-80"
                onPress={() => handleSettingPress('프로필 정보')}
              >
                <MaterialIcons name="edit" size={16} color={Colors.light.leafGreen} style={{ marginRight: 4 }} />
                <Text className="text-emerald-700 font-medium">프로필 수정</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View 
              className="items-center py-6 mb-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200 shadow-sm"
              style={{ 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <View className="bg-amber-100 p-3 rounded-full shadow-sm mb-3">
                <FontAwesome5 name="user-circle" size={40} color="#92400e" />
              </View>
              <Text className="text-xl font-bold text-amber-800 mb-2">로그인하지 않았습니다</Text>
              <Text className="text-amber-700 text-center mb-4">
                모든 기능을 사용하려면 로그인하세요.
              </Text>
              <Pressable
                className="bg-gradient-to-r from-amber-500 to-amber-400 py-3 px-6 rounded-xl shadow-sm active:opacity-90 w-full"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.navigate('/(auth)/login');
                }}
              >
                <Text className="text-white font-bold text-center">로그인하기</Text>
              </Pressable>
            </Animated.View>
          )}

          {isAuthenticated && (
            <Animated.View 
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 mb-5 border border-blue-200 shadow-sm"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-200 p-3 rounded-full mr-3 shadow-sm">
                  <FontAwesome5 name="user-cog" size={16} color="#3b82f6" />
                </View>
                <Text className="text-xl font-bold text-blue-700">계정 설정</Text>
              </View>

              <Pressable
                className="flex-row justify-between items-center py-4 border-b border-gray-200 active:bg-blue-50 rounded-lg px-2"
                onPress={() => handleSettingPress('프로필 정보')}
              >
                <View className="flex-row items-center">
                  <FontAwesome5 name="user-edit" size={16} color="#3b82f6" style={{ width: 24 }} />
                  <Text className="text-lg ml-3 text-gray-700">프로필 정보 변경</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
              </Pressable>

              <Pressable
                className="flex-row justify-between items-center py-4 border-b border-gray-200 active:bg-blue-50 rounded-lg px-2"
                onPress={() => handleSettingPress('비밀번호')}
              >
                <View className="flex-row items-center">
                  <FontAwesome5 name="lock" size={16} color="#3b82f6" style={{ width: 24 }} />
                  <Text className="text-lg ml-3 text-gray-700">비밀번호 변경</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
              </Pressable>

              {/* 연결된 계정 관리 섹션 */}
              <View>
                <Pressable
                  className="flex-row justify-between items-center py-4 border-b border-gray-200 active:bg-blue-50 rounded-lg px-2"
                  onPress={() => handleSettingPress('연결된 계정')}
                >
                  <View className="flex-row items-center">
                    <FontAwesome5 name="link" size={16} color="#3b82f6" style={{ width: 24 }} />
                    <View className="flex-row items-center flex-1">
                      <Text className="text-lg ml-3 text-gray-700">
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
                          <View className="ml-2 px-2 py-1 bg-emerald-100 rounded-full">
                            <Text className="text-xs font-medium text-emerald-700">연결됨</Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
                </Pressable>
                
                {/* 연결된 계정 정보 표시 */}
                {user?.userType === 'PARENT' ? (
                  // 부모인 경우 자녀 목록 표시
                  <>
                    {Array.isArray(connectedAccounts) && connectedAccounts.length > 0 && (
                      <View className="mt-2 ml-7 bg-blue-50 p-3 rounded-lg">
                        <Text className="text-sm font-medium text-blue-700 mb-2">연결된 자녀</Text>
                        {connectedAccounts.map(child => (
                          <View key={child.id} className="flex-row items-center py-2 border-b border-blue-100">
                            <View className="bg-blue-100 p-2 rounded-full mr-2">
                              <MaterialCommunityIcons name="account-child" size={18} color="#3b82f6" />
                            </View>
                            <Text className="text-gray-700 font-medium">{child.id}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  // 자녀인 경우 부모 정보 표시
                  <>
                    {connectedAccounts && !Array.isArray(connectedAccounts) && (
                      <View className="mt-2 ml-7 bg-blue-50 p-3 rounded-lg">
                        <Text className="text-sm font-medium text-blue-700 mb-2">연결된 부모님</Text>
                        <View className="flex-row items-center py-2">
                          <View className="bg-blue-100 p-2 rounded-full mr-2">
                            <MaterialCommunityIcons name="account-tie" size={18} color="#3b82f6" />
                          </View>
                          <Text className="text-gray-700 font-medium">{connectedAccounts}</Text>
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* 계정 연결 안내 메시지 */}
                {(user?.userType === 'PARENT' && (!connectedAccounts || !Array.isArray(connectedAccounts) || connectedAccounts.length === 0)) ||
                (user?.userType === 'CHILD' && (!connectedAccounts || connectedAccounts === null)) ? (
                  <View className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Text className="text-amber-800 text-sm mb-2 font-medium">
                      {user?.userType === 'PARENT' 
                        ? '아직 연결된 자녀 계정이 없습니다'
                        : '아직 부모님 계정과 연결되지 않았습니다'}
                    </Text>
                    <Text className="text-amber-700 text-sm mb-3">
                      {user?.userType === 'PARENT' 
                        ? '자녀 계정을 연결하면 약속을 관리할 수 있어요.'
                        : '부모님 계정과 연결하면 약속을 인증하고 스티커를 모을 수 있어요.'}
                    </Text>
                    <Pressable
                      className="bg-gradient-to-r from-amber-500 to-amber-400 py-2.5 rounded-lg shadow-sm active:opacity-90"
                      onPress={handleConnectedAccounts}
                    >
                      <Text className="text-white text-center font-medium">
                        {user?.userType === 'PARENT' ? '자녀 계정 연결하기' : '부모님 계정 연결하기'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          )}

          <Animated.View 
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 mb-5 border border-emerald-200 shadow-sm"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-emerald-200 p-3 rounded-full mr-3 shadow-sm">
                <FontAwesome5 name="sliders-h" size={16} color={Colors.light.leafGreen} />
              </View>
              <Text className="text-xl font-bold text-emerald-700">앱 설정</Text>
            </View>

            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <FontAwesome5 name="bell" size={16} color={Colors.light.leafGreen} style={{ width: 24 }} />
                <Text className="text-lg ml-3 text-gray-700">알림</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={() => handleSwitchToggle('notifications')}
                trackColor={{ false: '#d1d5db', true: Colors.light.leafGreen }}
                thumbColor={notifications ? '#ffffff' : '#f4f4f5'}
                ios_backgroundColor="#d1d5db"
              />
            </View>

            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <FontAwesome5 name="volume-up" size={16} color={Colors.light.leafGreen} style={{ width: 24 }} />
                <Text className="text-lg ml-3 text-gray-700">효과음</Text>
              </View>
              <Switch
                value={soundEffects}
                onValueChange={() => handleSwitchToggle('sound')}
                trackColor={{ false: '#d1d5db', true: Colors.light.leafGreen }}
                thumbColor={soundEffects ? '#ffffff' : '#f4f4f5'}
                ios_backgroundColor="#d1d5db"
              />
            </View>

            <Pressable
              className="flex-row justify-between items-center py-4 active:bg-emerald-50 rounded-lg px-2"
              onPress={() => handleSettingPress('테마')}
            >
              <View className="flex-row items-center">
                <FontAwesome5 name="palette" size={16} color={Colors.light.leafGreen} style={{ width: 24 }} />
                <Text className="text-lg ml-3 text-gray-700">테마 설정</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>
          </Animated.View>

          <Animated.View 
            className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 mb-5 border border-purple-200 shadow-sm"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-purple-200 p-3 rounded-full mr-3 shadow-sm">
                <FontAwesome5 name="question-circle" size={16} color="#8b5cf6" />
              </View>
              <Text className="text-xl font-bold text-purple-700">지원</Text>
            </View>

            <Pressable
              className="flex-row justify-between items-center py-4 border-b border-gray-200 active:bg-purple-50 rounded-lg px-2"
              onPress={() => handleSettingPress('도움말')}
            >
              <View className="flex-row items-center">
                <FontAwesome5 name="info-circle" size={16} color="#8b5cf6" style={{ width: 24 }} />
                <Text className="text-lg ml-3 text-gray-700">도움말</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>

            <Pressable
              className="flex-row justify-between items-center py-4 border-b border-gray-200 active:bg-purple-50 rounded-lg px-2"
              onPress={() => handleSettingPress('문의하기')}
            >
              <View className="flex-row items-center">
                <FontAwesome5 name="envelope" size={16} color="#8b5cf6" style={{ width: 24 }} />
                <Text className="text-lg ml-3 text-gray-700">문의하기</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>

            <Pressable
              className="flex-row justify-between items-center py-4 active:bg-purple-50 rounded-lg px-2"
              onPress={() => handleSettingPress('앱 정보')}
            >
              <View className="flex-row items-center">
                <FontAwesome5 name="mobile-alt" size={16} color="#8b5cf6" style={{ width: 24 }} />
                <Text className="text-lg ml-3 text-gray-700">앱 정보</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </Pressable>
          </Animated.View>

          {isAuthenticated && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <Pressable
                className="bg-gradient-to-r from-red-500 to-red-400 py-3.5 rounded-2xl mb-6 shadow-sm active:opacity-90"
                onPress={handleLogout}
              >
                <Text className="text-white text-center font-bold">로그아웃</Text>
              </Pressable>
            </Animated.View>
          )}
          
          {/* 앱 버전 정보 */}
          <Animated.View 
            className="items-center mb-10"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-gray-400 text-sm">쑥쑥약속 v1.0.0</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}