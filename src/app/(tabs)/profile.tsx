// src/app/(tabs)/profile.tsx - 업데이트된 버전
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
import PrivacyPolicyModal from '../../components/common/modal/PrivacyPolicyModal';
import TermsOfServiceModal from '../../components/common/modal/TermsOfServiceModal';
import Colors from '../../constants/Colors';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const {
    settings: notificationSettings,
    toggleNotifications,
    sendTestNotification,
    sendImmediateTestNotification,
    checkScheduledNotifications,
    debugPermissions,
    isLoading: isNotificationLoading,
  } = useNotifications();

  // 모달 상태
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

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

  // 연결된 계정 정보 가져오기
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
          return await api.user.getParentChildren();
        } else {
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
      await logout();
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
      router.push('/(parent)/generate-code');
    } else {
      router.push('/(auth)/connect');
    }
  };

  // 설정 메뉴 항목 처리
  const handleSettingPress = (settingName: string) => {
    if (handleAuthRequired()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (settingName) {
      case '프로필 정보':
      case '프로필 정보 변경':
        router.push('/(settings)/edit-profile');
        break;

      case '연결된 계정':
        handleConnectedAccounts();
        break;

      case '비밀번호':
      case '비밀번호 변경':
        router.push('/(settings)/change-password');
        break;

      case '테마':
      case '테마 설정':
        Alert.alert('알림', '테마 설정 기능은 곧 출시될 예정입니다.');
        break;

      case '도움말':
        router.push('/(settings)/help');
        break;

      case '문의하기':
        router.push('/(settings)/contact');
        break;

      case '앱 정보':
        router.push('/(settings)/app-info');
        break;

      case '개인정보처리방침':
        setPrivacyModalVisible(true);
        break;

      case '이용약관':
        setTermsModalVisible(true);
        break;

      default:
        Alert.alert('알림', `${settingName} 설정은 아직 개발 중입니다.`);
    }
  };

  // 알림 테스트 메뉴 선택 핸들러
  const handleNotificationTest = () => {
    if (notificationSettings.permissionStatus !== 'granted') {
      Alert.alert('알림 권한 필요', '먼저 알림 권한을 허용해주세요.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (__DEV__) {
      Alert.alert('알림 테스트 선택', '어떤 테스트를 실행하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '일반 테스트 (2초 후)',
          onPress: sendTestNotification,
        },
        {
          text: '즉시 테스트',
          onPress: sendImmediateTestNotification,
        },
        {
          text: '예약된 알림 확인',
          onPress: checkScheduledNotifications,
        },
        {
          text: '권한 디버깅',
          onPress: debugPermissions,
        },
      ]);
    } else {
      sendTestNotification();
    }
  };

  // 알림 토글 핸들러
  const handleNotificationToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (notificationSettings.isEnabled) {
      Alert.alert(
        '알림 끄기',
        '알림을 끄려면 설정에서 알림 권한을 해제해주세요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => {
              import('expo-linking').then(({ default: Linking }) => {
                Linking.openSettings();
              });
            },
          },
        ],
      );
    } else {
      const success = await toggleNotifications();

      if (success) {
        Alert.alert(
          '알림 설정 완료',
          '알림이 활성화되었습니다! 테스트 알림을 보내보시겠습니까?',
          [
            { text: '나중에', style: 'cancel' },
            { text: '테스트', onPress: sendTestNotification },
          ],
        );
      }
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
                    source={require('../../assets/images/icon/help_icon.png')}
                    style={{ width: 60, height: 60 }}
                    contentFit="contain"
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
              </View>
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
              {/* 알림 설정 */}
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-base"
                      style={{ color: Colors.light.text }}
                    >
                      알림
                    </Text>
                    <Text
                      className="text-xs mt-0.5"
                      style={{
                        color:
                          notificationSettings.permissionStatus === 'granted'
                            ? Colors.light.primary
                            : notificationSettings.permissionStatus === 'denied'
                              ? Colors.light.error
                              : Colors.light.textSecondary,
                      }}
                    >
                      {notificationSettings.permissionStatus === 'granted'
                        ? '허용됨'
                        : notificationSettings.permissionStatus === 'denied'
                          ? '거부됨'
                          : '미설정'}
                    </Text>
                  </View>
                </View>

                {isNotificationLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.light.primary}
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Switch
                    value={notificationSettings.isEnabled}
                    onValueChange={handleNotificationToggle}
                    trackColor={{
                      false: '#E5E5E5',
                      true: `${Colors.light.primary}80`,
                    }}
                    thumbColor={
                      notificationSettings.isEnabled
                        ? Colors.light.primary
                        : '#FFFFFF'
                    }
                    ios_backgroundColor="#E5E5E5"
                  />
                )}
              </View>

              {/* 알림 테스트 버튼 */}
              {/* {notificationSettings.isEnabled && (
                <>
                  <View className="h-px bg-gray-100 mx-4" />
                  <Pressable
                    className="flex-row items-center justify-between p-4 active:bg-gray-50"
                    onPress={handleNotificationTest}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="send-outline"
                        size={18}
                        color={Colors.light.info}
                        className="mr-3"
                      />
                      <View>
                        <Text
                          className="text-base"
                          style={{ color: Colors.light.text }}
                        >
                          알림 테스트
                        </Text>
                        <Text
                          className="text-xs mt-0.5"
                          style={{ color: Colors.light.textSecondary }}
                        >
                          {__DEV__
                            ? '개발 모드: 다양한 테스트 옵션'
                            : '2초 후 테스트 알림 전송'}
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color="#BDBDBD"
                    />
                  </Pressable>
                </>
              )} */}

              <View className="h-px bg-gray-100 mx-4" />

              {/* <Pressable
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
              </Pressable> */}
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

              {/* <Pressable
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
              </Pressable> */}

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

          {/* 약관 및 정책 섹션 */}
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
              약관 및 정책
            </Text>

            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Pressable
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
                onPress={() => handleSettingPress('개인정보처리방침')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    개인정보처리방침
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#BDBDBD" />
              </Pressable>

              <View className="h-px bg-gray-100 mx-4" />

              <Pressable
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
                onPress={() => handleSettingPress('이용약관')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={Colors.light.text}
                    className="mr-3"
                  />
                  <Text
                    className="text-base"
                    style={{ color: Colors.light.text }}
                  >
                    서비스 이용약관
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
            <Text
              className="text-xs mt-1"
              style={{ color: Colors.light.textSecondary }}
            >
              Made with ❤️ for families
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* 모달들 */}
      <PrivacyPolicyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      <TermsOfServiceModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
    </SafeAreaView>
  );
}
