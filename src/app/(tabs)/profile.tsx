import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: '',
    userType: '',
  });

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 애니메이션 시작
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 사용자 프로필 정보 설정
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserProfile({
        name: user.username || '',
        userType: user.userType === 'PARENT' ? '부모' : '아이',
      });
    } else {
      setUserProfile({
        name: '',
        userType: '',
      });
    }
  }, [isAuthenticated, user]);

  // 연결된 계정 정보 가져오기 (부모인 경우 자녀 목록, 자녀인 경우 부모 정보)
  const {
    data: connectedAccounts,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
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

      // 1. 모든 쿼리 캐시 무효화 (이전 데이터 제거)
      // queryClient.clear();

      // 2. 로그아웃 처리
      await logout();

      // 3. 로그인 화면으로 이동 - replace 대신 navigate 사용
      router.replace({ pathname: '/', params: { fromLogout: '1' } });
    } catch (error) {
      console.error('로그아웃 오류:', error);
      Alert.alert(
        '오류',
        '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.',
      );
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
          onPress: () => router.navigate('/(auth)/login'),
        },
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
      setNotifications((prev) => !prev);
    } else {
      setSoundEffects((prev) => !prev);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4">
          {/* 헤더 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-6"
          >
            <Text
              className="text-2xl font-bold"
              style={{ color: Colors.light.text }}
            >
              설정
            </Text>
          </Animated.View>

          {/* 프로필 섹션 */}
          {isAuthenticated ? (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <View className="flex-row items-center">
                <View
                  className="border-2 rounded-full p-0.5 mr-4"
                  style={{
                    borderColor:
                      user?.userType === 'PARENT'
                        ? Colors.light.tertiary
                        : Colors.light.secondary,
                  }}
                >
                  <Image
                    source={require('../../assets/images/react-logo.png')}
                    style={{ width: 60, height: 60 }}
                    contentFit="cover"
                    className="rounded-full"
                  />
                </View>
                <View>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: Colors.light.text }}
                  >
                    {userProfile.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className="px-2 py-0.5 rounded-full mr-2"
                      style={{
                        backgroundColor:
                          user?.userType === 'PARENT'
                            ? `${Colors.light.tertiary}15`
                            : `${Colors.light.secondary}15`,
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{
                          color:
                            user?.userType === 'PARENT'
                              ? Colors.light.tertiary
                              : Colors.light.secondary,
                        }}
                      >
                        {userProfile.userType} 계정
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleSettingPress('프로필 정보')}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: Colors.light.primary }}
                      >
                        프로필 수정
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6 p-4 rounded-xl"
              // style={{ backgroundColor: '#F5F5F5' }}
            >
              <View className="flex-row items-center mb-3">
                <View className="bg-gray-200 rounded-full p-2 mr-3">
                  <Ionicons name="person-outline" size={24} color="#777777" />
                </View>
                <Text
                  className="text-lg font-medium"
                  style={{ color: Colors.light.text }}
                >
                  로그인하지 않았습니다
                </Text>
              </View>
              <Text
                className="text-sm mb-4"
                style={{ color: Colors.light.textSecondary }}
              >
                모든 기능을 사용하려면 로그인이 필요합니다.
              </Text>
              <Pressable
                className="py-2.5 rounded-lg active:opacity-90"
                style={{ backgroundColor: Colors.light.primary }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.navigate('/(auth)/login');
                }}
              >
                <Text className="text-white font-medium text-center">
                  로그인하기
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* 구분선 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="my-4 border-t border-gray-100"
          />

          {/* 계정 섹션 */}
          {isAuthenticated && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <Text
                className="text-base font-bold mb-3 px-1"
                style={{ color: Colors.light.text }}
              >
                계정
              </Text>

              <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Pressable
                  className="flex-row items-center justify-between p-4 active:bg-gray-50"
                  onPress={() => handleSettingPress('프로필 정보')}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={Colors.light.text}
                      className="mr-3"
                    />
                    <Text
                      className="text-base"
                      style={{ color: Colors.light.text }}
                    >
                      프로필 정보 변경
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color="#BDBDBD"
                  />
                </Pressable>

                <View className="h-px bg-gray-100 mx-4" />

                <Pressable
                  className="flex-row items-center justify-between p-4 active:bg-gray-50"
                  onPress={() => handleSettingPress('비밀번호')}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={Colors.light.text}
                      className="mr-3"
                    />
                    <Text
                      className="text-base"
                      style={{ color: Colors.light.text }}
                    >
                      비밀번호 변경
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color="#BDBDBD"
                  />
                </Pressable>

                <View className="h-px bg-gray-100 mx-4" />

                <Pressable
                  className="flex-row items-center justify-between p-4 active:bg-gray-50"
                  onPress={() => handleSettingPress('연결된 계정')}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name="link-outline"
                      size={18}
                      color={Colors.light.text}
                      className="mr-3"
                    />
                    <View className="flex-row items-center flex-1">
                      <Text
                        className="text-base"
                        style={{ color: Colors.light.text }}
                      >
                        {user?.userType === 'PARENT'
                          ? '자녀 계정 연결'
                          : '부모님 계정 연결'}
                      </Text>

                      {/* 연결 상태 표시 */}
                      {isLoadingConnections ? (
                        <ActivityIndicator
                          size="small"
                          color={Colors.light.primary}
                          style={{ marginLeft: 8 }}
                        />
                      ) : (
                        connectedAccounts &&
                        (Array.isArray(connectedAccounts)
                          ? connectedAccounts.length > 0
                          : connectedAccounts !== null) && (
                          <View
                            className="ml-2 px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${Colors.light.primary}15`,
                            }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{ color: Colors.light.primary }}
                            >
                              연결됨
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color="#BDBDBD"
                  />
                </Pressable>

                {/* 연결된 계정 정보 표시 */}
                {(user?.userType === 'PARENT' &&
                  Array.isArray(connectedAccounts) &&
                  connectedAccounts.length > 0) ||
                (user?.userType === 'CHILD' &&
                  connectedAccounts &&
                  !Array.isArray(connectedAccounts)) ? (
                  <View
                    className="mx-4 my-2 p-3 rounded-lg"
                    style={{ backgroundColor: '#F8F8F8' }}
                  >
                    <Text
                      className="text-xs font-medium mb-2"
                      style={{ color: Colors.light.textSecondary }}
                    >
                      {user?.userType === 'PARENT'
                        ? '연결된 자녀'
                        : '연결된 부모님'}
                    </Text>

                    {user?.userType === 'PARENT' &&
                    Array.isArray(connectedAccounts) ? (
                      connectedAccounts.map((child, index) => (
                        <View
                          key={child.id}
                          className={`flex-row items-center py-2 ${
                            index < connectedAccounts.length - 1
                              ? 'border-b border-gray-100'
                              : ''
                          }`}
                        >
                          <View
                            className="p-1 rounded-full mr-2"
                            style={{ backgroundColor: '#EFEFEF' }}
                          >
                            <Ionicons
                              name="person"
                              size={16}
                              color={Colors.light.secondary}
                            />
                          </View>
                          <Text style={{ color: Colors.light.text }}>
                            {child.id}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View className="flex-row items-center py-2">
                        <View
                          className="p-1 rounded-full mr-2"
                          style={{ backgroundColor: '#EFEFEF' }}
                        >
                          <Ionicons
                            name="person"
                            size={16}
                            color={Colors.light.tertiary}
                          />
                        </View>
                        {/* <Text style={{ color: Colors.light.text }}>{connectedAccounts?.userId}</Text> */}
                      </View>
                    )}
                  </View>
                ) : null}
              </View>

              {/* 계정 연결 안내 메시지 */}
              {(user?.userType === 'PARENT' &&
                (!connectedAccounts ||
                  !Array.isArray(connectedAccounts) ||
                  connectedAccounts.length === 0)) ||
              (user?.userType === 'CHILD' &&
                (!connectedAccounts || connectedAccounts === null)) ? (
                <View
                  className="mt-3 p-4 rounded-lg"
                  style={{ backgroundColor: '#F8F8F8' }}
                >
                  <Text
                    className="text-sm font-medium mb-2"
                    style={{ color: Colors.light.text }}
                  >
                    {user?.userType === 'PARENT'
                      ? '아직 연결된 자녀 계정이 없습니다'
                      : '아직 부모님 계정과 연결되지 않았습니다'}
                  </Text>
                  <Text
                    className="text-sm mb-3"
                    style={{ color: Colors.light.textSecondary }}
                  >
                    {user?.userType === 'PARENT'
                      ? '자녀 계정을 연결하면 약속을 관리할 수 있어요.'
                      : '부모님 계정과 연결하면 약속을 인증하고 스티커를 모을 수 있어요.'}
                  </Text>
                  <Pressable
                    className="py-2.5 rounded-lg active:opacity-90"
                    style={{ backgroundColor: Colors.light.primary }}
                    onPress={handleConnectedAccounts}
                  >
                    <Text className="text-white text-center font-medium">
                      {user?.userType === 'PARENT'
                        ? '자녀 계정 연결하기'
                        : '부모님 계정 연결하기'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </Animated.View>
          )}

          {/* 앱 설정 섹션 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-6"
          >
            <Text
              className="text-base font-bold mb-3 px-1"
              style={{ color: Colors.light.text }}
            >
              앱 설정
            </Text>

            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    알림
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={() => handleSwitchToggle('notifications')}
                  trackColor={{
                    false: '#E5E5E5',
                    true: `${Colors.light.primary}80`,
                  }}
                  thumbColor={notifications ? Colors.light.primary : '#FFFFFF'}
                  ios_backgroundColor="#E5E5E5"
                />
              </View>

              <View className="h-px bg-gray-100 mx-4" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  <Ionicons
                    name="volume-medium-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    효과음
                  </Text>
                </View>
                <Switch
                  value={soundEffects}
                  onValueChange={() => handleSwitchToggle('sound')}
                  trackColor={{
                    false: '#E5E5E5',
                    true: `${Colors.light.primary}80`,
                  }}
                  thumbColor={soundEffects ? Colors.light.primary : '#FFFFFF'}
                  ios_backgroundColor="#E5E5E5"
                />
              </View>

              <View className="h-px bg-gray-100 mx-4" />

              <Pressable
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
                onPress={() => handleSettingPress('테마')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="color-palette-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    테마 설정
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#BDBDBD" />
              </Pressable>
            </View>
          </Animated.View>

          {/* 지원 섹션 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-6"
          >
            <Text
              className="text-base font-bold mb-3 px-1"
              style={{ color: Colors.light.text }}
            >
              지원
            </Text>

            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Pressable
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
                onPress={() => handleSettingPress('도움말')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    도움말
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#BDBDBD" />
              </Pressable>

              <View className="h-px bg-gray-100 mx-4" />

              <Pressable
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
                onPress={() => handleSettingPress('문의하기')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    문의하기
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#BDBDBD" />
              </Pressable>

              <View className="h-px bg-gray-100 mx-4" />

              <Pressable
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
                onPress={() => handleSettingPress('앱 정보')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    앱 정보
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#BDBDBD" />
              </Pressable>
            </View>
          </Animated.View>

          {/* 로그아웃 버튼 */}
          {isAuthenticated && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mt-4 mb-6"
            >
              <Pressable
                className="py-3 rounded-lg active:opacity-90 border border-gray-200"
                onPress={handleLogout}
              >
                <Text
                  className="text-center font-medium"
                  style={{ color: Colors.light.error }}
                >
                  로그아웃
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* 앱 버전 정보 */}
          <Animated.View
            className="items-center mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text
              className="text-xs"
              style={{ color: Colors.light.textSecondary }}
            >
              쑥쑥약속 v1.0.0
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
