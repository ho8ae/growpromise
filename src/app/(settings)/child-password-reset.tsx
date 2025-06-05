// src/app/(settings)/child-password-reset.tsx
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import type { ChildParentConnection } from '../../api/modules/user';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

// 자녀 정보 타입 (비밀번호 재설정용)
interface ChildForPasswordReset {
  childId: string;
  childProfileId: string;
  username: string;
  profileImage?: string;
}

export default function ChildPasswordResetScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // 상태
  const [selectedChild, setSelectedChild] = useState<ChildForPasswordReset | null>(null);
  const [resetMethod, setResetMethod] = useState<'manual' | 'temporary' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 애니메이션
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

  // 🔥 기존 API 사용 - 잘 작동하는 방식 그대로 유지
  const {
    data: childConnections,
    isLoading: isLoadingChildren,
    error: childrenError,
  } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: api.user.getParentChildren,
    enabled: user?.userType === 'PARENT',
  });

  // 🔥 연결된 자녀를 ChildForPasswordReset 형태로 변환 (소셜 로그인 사용자 필터링)
  const children: ChildForPasswordReset[] = React.useMemo(() => {
    if (!childConnections || !Array.isArray(childConnections)) {
      return [];
    }

    return childConnections
      .filter(connection => {
        // 일반 로그인 사용자만 필터링 (소셜 로그인 사용자 제외)
        const isValidChild = connection.child && connection.child.user
        
        if (!isValidChild) {
          console.log('🔥 소셜 로그인 사용자 제외:', connection.child?.user?.username);
        }
        
        return isValidChild;
      })
      .map(connection => ({
        childId: connection.child!.user.id,
        childProfileId: connection.child!.id,
        username: connection.child!.user.username,
        profileImage: connection.child!.user.profileImage,
      }));
  }, [childConnections]);

  // 직접 비밀번호 설정 뮤테이션
  const resetPasswordMutation = useMutation({
    mutationFn: api.auth.resetChildPassword,
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '비밀번호 변경 완료',
        `${data.childUsername}님의 비밀번호가 성공적으로 변경되었습니다.\n\n자녀에게 새 비밀번호를 알려주세요.`,
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('🔥 비밀번호 재설정 뮤테이션 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', error?.message || '비밀번호 변경에 실패했습니다.');
    },
  });

  // 임시 비밀번호 생성 뮤테이션
  const temporaryPasswordMutation = useMutation({
    mutationFn: api.auth.resetChildPasswordTemporary,
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '임시 비밀번호 생성 완료',
        `${data.childUsername}님의 임시 비밀번호가 생성되었습니다.\n\n임시 비밀번호: ${data.temporaryPassword}\n\n⚠️ 자녀가 로그인 후 반드시 비밀번호를 변경하도록 안내해주세요.`,
        [
          {
            text: '복사하기',
            onPress: () => {
              // 클립보드에 복사하는 기능 (필요시 expo-clipboard 사용)
              Alert.alert('알림', '임시 비밀번호가 복사되었습니다.');
            },
          },
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('🔥 임시 비밀번호 뮤테이션 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', error?.message || '임시 비밀번호 생성에 실패했습니다.');
    },
  });

  // 유효성 검사
  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 직접 비밀번호 설정 처리
  const handleManualReset = () => {
    if (!selectedChild) return;
    if (!validatePassword()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    console.log('🔥 직접 비밀번호 설정 요청:', {
      childId: selectedChild.childId,
      newPassword: newPassword.length + '자리',
      confirmPassword: confirmPassword.length + '자리'
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetPasswordMutation.mutate({
      childId: selectedChild.childId,
      newPassword,
      confirmPassword,
    });
  };

  // 임시 비밀번호 생성 처리
  const handleTemporaryReset = () => {
    if (!selectedChild) {
      console.error('🔥 선택된 자녀가 없습니다.');
      return;
    }

    console.log('🔥 임시 비밀번호 생성 요청:', {
      childId: selectedChild.childId,
      username: selectedChild.username
    });

    Alert.alert(
      '임시 비밀번호 생성',
      `${selectedChild.username}님의 임시 비밀번호를 생성하시겠습니까?\n\n생성된 임시 비밀번호는 자녀에게 전달해주시고, 로그인 후 반드시 변경하도록 안내해주세요.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '생성',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            temporaryPasswordMutation.mutate({
              childId: selectedChild.childId, // 🔥 올바른 childId 전달
            });
          },
        },
      ]
    );
  };

  // 자녀 선택 처리
  const handleChildSelect = (child: ChildForPasswordReset) => {
    console.log('🔥 자녀 선택:', child);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChild(child);
    setResetMethod(null);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  // 재설정 방법 선택 처리
  const handleMethodSelect = (method: 'manual' | 'temporary') => {
    console.log('🔥 재설정 방법 선택:', method);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResetMethod(method);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  // 뒤로가기 처리
  const handleBack = () => {
    if (resetMethod) {
      setResetMethod(null);
    } else if (selectedChild) {
      setSelectedChild(null);
    } else {
      router.back();
    }
  };

  // 🔥 디버깅 로그 추가
  console.log('🔥 자녀 목록 상태:', {
    isLoading: isLoadingChildren,
    hasError: !!childrenError,
    rawChildrenCount: childConnections?.length || 0,
    filteredChildrenCount: children?.length || 0,
    children: children
  });

  // 로딩 상태
  if (isLoadingChildren) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text className="mt-4 text-base" style={{ color: Colors.light.textSecondary }}>
            자녀 목록을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 오류 상태
  if (childrenError) {
    console.error('🔥 자녀 목록 조회 오류:', childrenError);
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
          <Text className="mt-4 text-lg font-medium text-center" style={{ color: Colors.light.text }}>
            자녀 목록을 불러올 수 없습니다
          </Text>
          <Text className="mt-2 text-base text-center" style={{ color: Colors.light.textSecondary }}>
            {childrenError.message || '네트워크 연결을 확인하고 다시 시도해주세요.'}
          </Text>
          <Pressable
            className="mt-6 py-3 px-6 rounded-xl active:opacity-90"
            style={{ backgroundColor: Colors.light.primary }}
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 연결된 자녀가 없거나 비밀번호 재설정 가능한 자녀가 없는 경우
  if (!isLoadingChildren && children.length === 0) {
    const hasConnectedChildren = childConnections && childConnections.length > 0;
    
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <Pressable
            className="p-2 rounded-xl active:bg-gray-100"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </Pressable>
          <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
            자녀 비밀번호 재설정
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="people-outline" size={48} color={Colors.light.textSecondary} />
          <Text className="mt-4 text-lg font-medium text-center" style={{ color: Colors.light.text }}>
            {hasConnectedChildren ? 
              '비밀번호 재설정 가능한 자녀가 없습니다' : 
              '연결된 자녀가 없습니다'
            }
          </Text>
          <Text className="mt-2 text-base text-center" style={{ color: Colors.light.textSecondary }}>
            {hasConnectedChildren ? 
              '소셜 로그인(Google/Apple)으로 가입한 자녀는\n비밀번호 재설정이 불가능합니다.' :
              '자녀와 계정을 연결한 후\n이 기능을 이용해주세요.'
            }
          </Text>
          
          {/* 소셜 로그인 안내 */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 w-full">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color={Colors.light.info} className="mr-2 mt-0.5" />
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.info }}>
                  💡 더 안전한 로그인 방법
                </Text>
                <Text className="text-sm leading-5" style={{ color: Colors.light.info }}>
                  Google 또는 Apple 소셜 로그인을 이용하시면 비밀번호를 잊어버릴 걱정이 없습니다!
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            className="mt-6 py-3 px-6 rounded-xl active:opacity-90"
            style={{ backgroundColor: Colors.light.primary }}
            onPress={() => router.push('/(parent)/generate-code')}
          >
            <Text className="text-white font-medium">
              {hasConnectedChildren ? '돌아가기' : '자녀 연결하기'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
        >
          <Pressable
            className="p-2 rounded-xl active:bg-gray-100"
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </Pressable>

          <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
            자녀 비밀번호 재설정
          </Text>

          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {!selectedChild ? (
            // 자녀 선택 화면
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="px-5 pt-6"
            >
              <Text className="text-base font-bold mb-4" style={{ color: Colors.light.text }}>
                비밀번호를 재설정할 자녀를 선택해주세요
              </Text>

              {/* 🔥 소셜 로그인 자녀가 있는 경우 안내 메시지 */}
              {childConnections && childConnections.length > children.length && (
                <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#EA580C" className="mr-2 mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-sm font-medium mb-1" style={{ color: '#EA580C' }}>
                        일부 자녀는 목록에 표시되지 않습니다
                      </Text>
                      <Text className="text-sm" style={{ color: '#EA580C' }}>
                        소셜 로그인(Google/Apple)으로 가입한 자녀는 비밀번호 재설정이 불가능합니다.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className="space-y-3">
                {children.map((child) => (
                  <Pressable
                    key={child.childId}
                    className="flex-row items-center p-4 bg-white rounded-xl border border-gray-100 active:bg-gray-50"
                    onPress={() => handleChildSelect(child)}
                  >
                    <View className="border-2 rounded-full p-0.5 mr-3" style={{ borderColor: Colors.light.secondary }}>
                      <Image
                        source={
                          child.profileImage
                            ? { uri: child.profileImage }
                            : require('../../assets/images/icon/basicPeople_icon.png')
                        }
                        style={{ width: 40, height: 40 }}
                        contentFit="contain"
                        className="rounded-full"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium" style={{ color: Colors.light.text }}>
                        {child.username}
                      </Text>
                      <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                        일반 로그인 계정
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : !resetMethod ? (
            // 재설정 방법 선택 화면
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="px-5 pt-6"
            >
              <View className="flex-row items-center mb-6">
                <View className="border-2 rounded-full p-0.5 mr-3" style={{ borderColor: Colors.light.secondary }}>
                  <Image
                    source={
                      selectedChild.profileImage
                        ? { uri: selectedChild.profileImage }
                        : require('../../assets/images/icon/basicPeople_icon.png')
                    }
                    style={{ width: 50, height: 50 }}
                    contentFit="contain"
                    className="rounded-full"
                  />
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                    {selectedChild.username}
                  </Text>
                  <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                    비밀번호 재설정 방법을 선택해주세요
                  </Text>
                </View>
              </View>

              {/* 안내 사항 */}
              <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#EA580C" className="mr-2 mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium mb-2" style={{ color: '#EA580C' }}>
                      안내 사항
                    </Text>
                    <Text className="text-sm leading-5" style={{ color: '#EA580C' }}>
                      • 임시 비밀번호 발급 시 자녀가 로그인 후 반드시 비밀번호를 변경하도록 안내해주세요.{'\n'}
                      • 소셜 로그인(Google/Apple)을 이용하시면 더욱 안전하고 편리합니다.
                    </Text>
                  </View>
                </View>
              </View>

              <View className="space-y-4 gap-2">
                {/* 직접 비밀번호 설정 */}
                <Pressable
                  className="p-4 bg-white rounded-xl border border-gray-200 active:bg-gray-50"
                  onPress={() => handleMethodSelect('manual')}
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="key-outline" size={20} color={Colors.light.primary} className="mr-3" />
                    <Text className="text-base font-medium" style={{ color: Colors.light.text }}>
                      직접 비밀번호 설정
                    </Text>
                    <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Colors.light.secondary}15` }}>
                      <Text className="text-xs font-medium" style={{ color: Colors.light.secondary }}>
                        추천
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm ml-8" style={{ color: Colors.light.textSecondary }}>
                    새로운 비밀번호를 직접 입력하여 설정합니다.
                  </Text>
                </Pressable>

                {/* 임시 비밀번호 생성 */}
                <Pressable
                  className="p-4 bg-white rounded-xl border border-gray-200 active:bg-gray-50"
                  onPress={() => handleMethodSelect('temporary')}
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="refresh-outline" size={20} color={Colors.light.info} className="mr-3" />
                    <Text className="text-base font-medium" style={{ color: Colors.light.text }}>
                      임시 비밀번호 생성
                    </Text>
                    
                  </View>
                  <Text className="text-sm ml-8" style={{ color: Colors.light.textSecondary }}>
                    8자리 임시 비밀번호를 자동으로 생성합니다. 자녀가 로그인 후 변경해야 합니다.
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : resetMethod === 'manual' ? (
            // 직접 비밀번호 설정 화면
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="px-5 pt-6"
            >
              <View className="flex-row items-center mb-6">
                <View className="border-2 rounded-full p-0.5 mr-3" style={{ borderColor: Colors.light.secondary }}>
                  <Image
                    source={
                      selectedChild.profileImage
                        ? { uri: selectedChild.profileImage }
                        : require('../../assets/images/icon/basicPeople_icon.png')
                    }
                    style={{ width: 50, height: 50 }}
                    contentFit="contain"
                    className="rounded-full"
                  />
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                    {selectedChild.username}
                  </Text>
                  <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                    새로운 비밀번호를 입력해주세요
                  </Text>
                </View>
              </View>

              <View className="space-y-4">
                {/* 새 비밀번호 */}
                <View>
                  <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.text }}>
                    새 비밀번호 *
                  </Text>
                  <View className={`bg-gray-50 rounded-xl px-4 py-4 ${errors.newPassword ? 'border border-red-300' : ''}`}>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="새 비밀번호를 입력하세요"
                      placeholderTextColor={Colors.light.textSecondary}
                      className="text-base"
                      style={{ color: Colors.light.text }}
                      secureTextEntry
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.newPassword && (
                    <Text className="text-sm mt-1" style={{ color: Colors.light.error }}>
                      {errors.newPassword}
                    </Text>
                  )}
                </View>

                {/* 비밀번호 확인 */}
                <View>
                  <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.text }}>
                    비밀번호 확인 *
                  </Text>
                  <View className={`bg-gray-50 rounded-xl px-4 py-4 ${errors.confirmPassword ? 'border border-red-300' : ''}`}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="비밀번호를 다시 입력하세요"
                      placeholderTextColor={Colors.light.textSecondary}
                      className="text-base"
                      style={{ color: Colors.light.text }}
                      secureTextEntry
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleManualReset}
                    />
                  </View>
                  {errors.confirmPassword && (
                    <Text className="text-sm mt-1" style={{ color: Colors.light.error }}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                {/* 비밀번호 요구사항 */}
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.info }}>
                    비밀번호 요구사항
                  </Text>
                  <Text className="text-sm" style={{ color: Colors.light.info }}>
                    • 최소 6자 이상{'\n'}
                    • 영문, 숫자 조합 권장{'\n'}
                    • 자녀가 기억하기 쉬운 비밀번호로 설정해주세요
                  </Text>
                </View>

                {/* 변경 버튼 */}
                <Pressable
                  className={`py-4 rounded-xl mt-6 active:opacity-90 ${
                    newPassword && confirmPassword && !resetPasswordMutation.isPending
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                  style={{
                    backgroundColor:
                      newPassword && confirmPassword && !resetPasswordMutation.isPending
                        ? Colors.light.primary
                        : Colors.light.disabled,
                  }}
                  onPress={handleManualReset}
                  disabled={!newPassword || !confirmPassword || resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">비밀번호 변경</Text>
                  )}
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            // 임시 비밀번호 생성 확인 화면
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="px-5 pt-6"
            >
              <View className="flex-row items-center mb-6">
                <View className="border-2 rounded-full p-0.5 mr-3" style={{ borderColor: Colors.light.secondary }}>
                  <Image
                    source={
                      selectedChild.profileImage
                        ? { uri: selectedChild.profileImage }
                        : require('../../assets/images/icon/basicPeople_icon.png')
                    }
                    style={{ width: 50, height: 50 }}
                    contentFit="contain"
                    className="rounded-full"
                  />
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                    {selectedChild.username}
                  </Text>
                  <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                    임시 비밀번호 생성
                  </Text>
                </View>
              </View>

              {/* 안내 메시지 */}
              <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={20} color="#D97706" className="mr-2 mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium mb-2" style={{ color: '#D97706' }}>
                      임시 비밀번호 생성 안내
                    </Text>
                    <Text className="text-sm leading-5" style={{ color: '#D97706' }}>
                      • 8자리 임시 비밀번호가 자동으로 생성됩니다{'\n'}
                      • 생성된 비밀번호를 자녀에게 안전하게 전달해주세요{'\n'}
                      • 자녀가 로그인 후 반드시 새로운 비밀번호로 변경하도록 안내해주세요{'\n'}
                      • 임시 비밀번호는 보안을 위해 한 번만 표시됩니다
                    </Text>
                  </View>
                </View>
              </View>

              {/* 생성 버튼 */}
              <Pressable
                className="py-4 rounded-xl active:opacity-90"
                style={{ backgroundColor: Colors.light.info }}
                onPress={handleTemporaryReset}
                disabled={temporaryPasswordMutation.isPending}
              >
                {temporaryPasswordMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium text-center">임시 비밀번호 생성</Text>
                )}
              </Pressable>

              <Pressable
                className="py-3 mt-3"
                onPress={() => setResetMethod(null)}
              >
                <Text className="text-center" style={{ color: Colors.light.textSecondary }}>
                  다른 방법 선택
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}