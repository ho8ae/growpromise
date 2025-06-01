import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
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
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // 폼 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 비밀번호 변경 뮤테이션
  const changePasswordMutation = useMutation({
    mutationFn: api.auth.changePassword,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '변경 완료',
        '비밀번호가 성공적으로 변경되었습니다.',
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('비밀번호 변경 오류:', error);
      
      const errorMessage = error?.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.';
      Alert.alert('오류', errorMessage);
    },
  });

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

  // 변경사항 감지
  useEffect(() => {
    setHasChanges(
      currentPassword.length > 0 || 
      newPassword.length > 0 || 
      confirmPassword.length > 0
    );
  }, [currentPassword, newPassword, confirmPassword]);

  // 유효성 검사
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자리 이상이어야 합니다.';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = '비밀번호는 영문과 숫자를 모두 포함해야 합니다.';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호와 일치하지 않습니다.';
    }
    
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = '현재 비밀번호와 다른 비밀번호를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 처리
  const handleSave = async () => {
    if (!validateForm()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  // 뒤로가기 처리
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        '변경사항이 있습니다',
        '저장하지 않고 나가시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '나가기', 
            style: 'destructive',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // 소셜 로그인 사용자 체크
  const isSocialUser = user?.socialProvider && user.socialProvider !== null;
  const canChangePassword = !isSocialUser || (isSocialUser && user?.setupCompleted);

  if (isSocialUser && !user?.setupCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="lock-closed-outline" size={48} color={Colors.light.textSecondary} />
          <Text className="mt-4 text-lg font-medium text-center" style={{ color: Colors.light.text }}>
            비밀번호 설정이 필요합니다
          </Text>
          <Text className="mt-2 text-base text-center" style={{ color: Colors.light.textSecondary }}>
            소셜 로그인 계정에서 비밀번호를 변경하려면{'\n'}먼저 비밀번호를 설정해주세요.
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
            비밀번호 변경
          </Text>
          
          <Pressable
            className={`py-2 px-4 rounded-xl active:opacity-90 ${
              hasChanges && !changePasswordMutation.isPending
                ? 'opacity-100' 
                : 'opacity-40'
            }`}
            style={{ 
              backgroundColor: hasChanges && !changePasswordMutation.isPending 
                ? Colors.light.primary 
                : Colors.light.disabled 
            }}
            onPress={handleSave}
            disabled={!hasChanges || changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">변경</Text>
            )}
          </Pressable>
        </Animated.View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-5 pt-6">
            {/* 안내 메시지 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6 p-4 rounded-xl"
            >
              <View className="flex-row items-start">
                <Ionicons 
                  name="information-circle-outline" 
                  size={20} 
                  color={Colors.light.info}
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium mb-1" style={{ color: Colors.light.info }}>
                    비밀번호 변경 안내
                  </Text>
                  <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                    • 비밀번호는 8자리 이상이어야 합니다{'\n'}
                    • 영문과 숫자를 모두 포함해야 합니다{'\n'}
                    • 현재 비밀번호와 다른 비밀번호를 사용해주세요
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* 비밀번호 변경 폼 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <Text className="text-base font-bold mb-4" style={{ color: Colors.light.text }}>
                비밀번호 정보
              </Text>

              {/* 현재 비밀번호 */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.text }}>
                  현재 비밀번호 *
                </Text>
                <View className={`bg-gray-50 rounded-xl px-4 py-4 flex-row items-center ${
                  errors.currentPassword ? 'border border-red-300' : ''
                }`}>
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="현재 비밀번호를 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base flex-1"
                    style={{ color: Colors.light.text }}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                  <Pressable
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="p-2"
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                </View>
                {errors.currentPassword && (
                  <Text className="text-sm mt-1" style={{ color: Colors.light.error }}>
                    {errors.currentPassword}
                  </Text>
                )}
              </View>

              {/* 새 비밀번호 */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.text }}>
                  새 비밀번호 *
                </Text>
                <View className={`bg-gray-50 rounded-xl px-4 py-4 flex-row items-center ${
                  errors.newPassword ? 'border border-red-300' : ''
                }`}>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="새 비밀번호를 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base flex-1"
                    style={{ color: Colors.light.text }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                  <Pressable
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    className="p-2"
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                </View>
                {errors.newPassword && (
                  <Text className="text-sm mt-1" style={{ color: Colors.light.error }}>
                    {errors.newPassword}
                  </Text>
                )}
              </View>

              {/* 새 비밀번호 확인 */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: Colors.light.text }}>
                  새 비밀번호 확인 *
                </Text>
                <View className={`bg-gray-50 rounded-xl px-4 py-4 flex-row items-center ${
                  errors.confirmPassword ? 'border border-red-300' : ''
                }`}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="새 비밀번호를 다시 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base flex-1"
                    style={{ color: Colors.light.text }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2"
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                </View>
                {errors.confirmPassword && (
                  <Text className="text-sm mt-1" style={{ color: Colors.light.error }}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* 보안 정보 섹션 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <Text className="text-base font-bold mb-4" style={{ color: Colors.light.text }}>
                보안 정보
              </Text>

              <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                    계정 유형
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: user?.userType === 'PARENT' 
                        ? `${Colors.light.tertiary}15` 
                        : `${Colors.light.secondary}15`,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: user?.userType === 'PARENT' 
                          ? Colors.light.tertiary 
                          : Colors.light.secondary,
                      }}
                    >
                      {user?.userType === 'PARENT' ? '부모' : '아이'} 계정
                    </Text>
                  </View>
                </View>

                {user?.socialProvider && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                      로그인 방식
                    </Text>
                    <Text className="text-sm font-medium" style={{ color: Colors.light.text }}>
                      {user.socialProvider === 'GOOGLE' ? 'Google' : 'Apple'} 연동
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm" style={{ color: Colors.light.textSecondary }}>
                    마지막 변경
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: Colors.light.text }}>
                    변경 예정
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}