import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
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
  Modal,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import type { DetailUserProfile } from '../../api/modules/user';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, updateUser, isAuthenticated, logout } = useAuthStore();

  // 폼 상태
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');

  // UI 상태
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 🔥 새로 추가: 회원탈퇴 모달 상태
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 현재 프로필 정보 조회
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userDetailProfile'],
    queryFn: api.user.getUserDetailProfile,
    enabled: isAuthenticated,
  });

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: api.user.updateUserDetailProfile,
    onSuccess: (data: DetailUserProfile) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      updateUser({
        id: data.id,
        username: data.username,
        email: data.email,
        userType: data.userType,
        profileId: data.parentProfile?.id || data.childProfile?.id || '',
        socialProvider: data.socialProvider,
        profileImage: data.profileImage,
        phoneNumber: data.phoneNumber,
        bio: data.bio,
        setupCompleted: data.setupCompleted,
      });

      queryClient.invalidateQueries({ queryKey: ['userDetailProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      Alert.alert('저장 완료', '프로필 정보가 성공적으로 업데이트되었습니다.', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('프로필 업데이트 오류:', error);

      const errorMessage =
        error?.response?.data?.message ||
        '프로필 업데이트 중 오류가 발생했습니다.';
      Alert.alert('오류', errorMessage);
    },
  });


  

  // 🔥 새로 추가: 회원탈퇴 뮤테이션
  const deleteAccountMutation = useMutation({
    mutationFn: api.auth.deleteAccount,
    onSuccess: async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowDeleteAccountModal(false);

      Alert.alert(
        '회원탈퇴 완료',
        '계정이 성공적으로 삭제되었습니다.\n그동안 쑥쑥약속을 이용해 주셔서 감사합니다.',
        [
          {
            text: '확인',
            onPress: async () => {
              await logout();
              router.replace('/(auth)');
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('회원탈퇴 오류:', error);

      const errorMessage =
        error?.response?.data?.message ||
        '회원탈퇴 중 오류가 발생했습니다.';
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

  // 프로필 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || '');
      setEmail(profileData.email || '');
      setPhoneNumber(profileData.phoneNumber || '');
      setBio(profileData.bio || '');

      if (
        profileData.userType === 'CHILD' &&
        profileData.childProfile?.birthDate
      ) {
        setBirthDate(new Date(profileData.childProfile.birthDate));
      }
    }
  }, [profileData]);

  // 변경사항 감지
  useEffect(() => {
    if (!profileData) return;

    const hasUsernameChanged = username !== (profileData.username || '');
    const hasEmailChanged = email !== (profileData.email || '');
    const hasPhoneChanged = phoneNumber !== (profileData.phoneNumber || '');
    const hasBioChanged = bio !== (profileData.bio || '');

    let hasBirthDateChanged = false;
    if (profileData.userType === 'CHILD') {
      if (profileData.childProfile?.birthDate) {
        const originalDate = new Date(profileData.childProfile.birthDate);
        hasBirthDateChanged = birthDate
          ? birthDate.getTime() !== originalDate.getTime()
          : false;
      } else {
        hasBirthDateChanged = birthDate !== null;
      }
    }

    setHasChanges(
      hasUsernameChanged ||
        hasEmailChanged ||
        hasPhoneChanged ||
        hasBioChanged ||
        hasBirthDateChanged,
    );
  }, [username, email, phoneNumber, bio, birthDate, profileData]);



  // 🔥 새로 추가: 회원탈퇴 처리
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== '삭제') {
      Alert.alert('오류', "'삭제'라고 정확히 입력해주세요.");
      return;
    }

    if (!profileData?.socialProvider && !deletePassword) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }

    Alert.alert(
      '정말 탈퇴하시겠습니까?',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            deleteAccountMutation.mutate({
              password: deletePassword || undefined,
              confirmText: deleteConfirmText,
            });
          },
        },
      ]
    );
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!username.trim()) {
      newErrors.username = '이름을 입력해주세요.';
    } else if (username.trim().length < 2) {
      newErrors.username = '이름은 2글자 이상 입력해주세요.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (phoneNumber && !/^[0-9\-\+\(\)\s]+$/.test(phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식을 입력해주세요.';
    }

    if (birthDate && profileData?.userType === 'CHILD') {
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 25);
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 3);

      if (birthDate > today) {
        newErrors.birthDate = '생년월일은 오늘 이전 날짜여야 합니다.';
      } else if (birthDate < minDate) {
        newErrors.birthDate = '생년월일을 다시 확인해주세요.';
      } else if (birthDate > maxDate) {
        newErrors.birthDate = '만 3세 이상이어야 합니다.';
      }
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

    const updateData: any = {
      username: username.trim(),
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      bio: bio.trim() || undefined,
    };

    if (profileData?.userType === 'CHILD' && birthDate) {
      updateData.birthDate = birthDate.toISOString();
    }

    updateProfileMutation.mutate(updateData);
  };

  // 날짜 선택 처리
  const handleDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setBirthDate(selectedDate);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDatePicker(true);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'PPP', { locale: ko });
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert('변경사항이 있습니다', '저장하지 않고 나가시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text
            className="mt-4 text-base"
            style={{ color: Colors.light.textSecondary }}
          >
            프로필 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 오류 상태
  if (error || !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.light.error}
          />
          <Text
            className="mt-4 text-lg font-medium text-center"
            style={{ color: Colors.light.text }}
          >
            프로필 정보를 불러올 수 없습니다
          </Text>
          <Text
            className="mt-2 text-base text-center"
            style={{ color: Colors.light.textSecondary }}
          >
            네트워크 연결을 확인하고 다시 시도해주세요.
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

          <Text
            className="text-lg font-bold"
            style={{ color: Colors.light.text }}
          >
            프로필 수정
          </Text>

          <Pressable
            className={`py-2 px-4 rounded-xl active:opacity-90 ${
              hasChanges && !updateProfileMutation.isPending
                ? 'opacity-100'
                : 'opacity-40'
            }`}
            style={{
              backgroundColor:
                hasChanges && !updateProfileMutation.isPending
                  ? Colors.light.primary
                  : Colors.light.disabled,
            }}
            onPress={handleSave}
            disabled={!hasChanges || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">저장</Text>
            )}
          </Pressable>
        </Animated.View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-5 pt-6">
            {/* 프로필 이미지 섹션 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="items-center mb-8"
            >
              <View className="relative">
                <View
                  className="border-2 rounded-full p-0.5"
                  style={{
                    borderColor:
                      profileData.userType === 'PARENT'
                        ? Colors.light.tertiary
                        : Colors.light.secondary,
                  }}
                >
                  <Image
                    source={
                      profileData.profileImage
                        ? { uri: profileData.profileImage }
                        : require('../../assets/images/icon/basicPeople_icon.png')
                    }
                    style={{ width: 80, height: 80 }}
                    contentFit="contain"
                    className="rounded-full"
                  />
                </View>
                <Pressable
                  className="absolute -bottom-1 -right-1 p-2 rounded-full shadow-sm active:opacity-90"
                  style={{ backgroundColor: Colors.light.primary }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert(
                      '알림',
                      '프로필 이미지 변경 기능은 곧 추가될 예정입니다.',
                    );
                  }}
                >
                  <Ionicons name="camera" size={16} color="white" />
                </Pressable>
              </View>
              <Text
                className="mt-3 text-sm"
                style={{ color: Colors.light.textSecondary }}
              >
                프로필 사진 변경
              </Text>
            </Animated.View>

            {/* 기본 정보 섹션 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <Text
                className="text-base font-bold mb-4"
                style={{ color: Colors.light.text }}
              >
                기본 정보
              </Text>

              {/* 이름 */}
              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: Colors.light.text }}
                >
                  이름 *
                  <Text className="text-[10px] text-gray-500">
                    {' '}
                    (아이디로 사용되오니 변경에 주의해주세요)
                  </Text>
                </Text>
                <View
                  className={`bg-gray-50 rounded-xl px-4 py-4 ${errors.username ? 'border border-red-300' : ''}`}
                >
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="이름을 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base"
                    style={{ color: Colors.light.text }}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                {errors.username && (
                  <Text
                    className="text-sm mt-1"
                    style={{ color: Colors.light.error }}
                  >
                    {errors.username}
                  </Text>
                )}
              </View>

              {/* 이메일 */}
              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: Colors.light.text }}
                >
                  이메일
                </Text>
                <View
                  className={`bg-gray-50 rounded-xl px-4 py-4 ${errors.email ? 'border border-red-300' : ''}`}
                >
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="이메일을 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base"
                    style={{ color: Colors.light.text }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
                {errors.email && (
                  <Text
                    className="text-sm mt-1"
                    style={{ color: Colors.light.error }}
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* 전화번호 */}
              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: Colors.light.text }}
                >
                  전화번호
                </Text>
                <View
                  className={`bg-gray-50 rounded-xl px-4 py-4 ${errors.phoneNumber ? 'border border-red-300' : ''}`}
                >
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="전화번호를 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base"
                    style={{ color: Colors.light.text }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
                {errors.phoneNumber && (
                  <Text
                    className="text-sm mt-1"
                    style={{ color: Colors.light.error }}
                  >
                    {errors.phoneNumber}
                  </Text>
                )}
              </View>

              {/* 자녀인 경우 생년월일 */}
              {profileData.userType === 'CHILD' && (
                <View className="mb-4">
                  <Text
                    className="text-sm font-medium mb-2"
                    style={{ color: Colors.light.text }}
                  >
                    생년월일
                  </Text>
                  <Pressable
                    className={`bg-gray-50 rounded-xl px-4 py-4 flex-row items-center justify-between ${
                      errors.birthDate ? 'border border-red-300' : ''
                    }`}
                    onPress={openDatePicker}
                  >
                    <Text
                      className="text-base flex-1"
                      style={{
                        color: birthDate
                          ? Colors.light.text
                          : Colors.light.textSecondary,
                      }}
                    >
                      {birthDate
                        ? formatDate(birthDate)
                        : '생년월일을 선택해주세요'}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                  {errors.birthDate && (
                    <Text
                      className="text-sm mt-1"
                      style={{ color: Colors.light.error }}
                    >
                      {errors.birthDate}
                    </Text>
                  )}
                </View>
              )}

              {/* 자기소개 */}
              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: Colors.light.text }}
                >
                  자기소개
                </Text>
                <View className="bg-gray-50 rounded-xl px-4 py-4">
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="자기소개를 입력해주세요"
                    placeholderTextColor={Colors.light.textSecondary}
                    className="text-base"
                    style={{ color: Colors.light.text, minHeight: 80 }}
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </Animated.View>

            {/* 계정 정보 섹션 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <Text
                className="text-base font-bold mb-4"
                style={{ color: Colors.light.text }}
              >
                계정 정보
              </Text>

              <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-sm"
                    style={{ color: Colors.light.textSecondary }}
                  >
                    계정 유형
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        profileData.userType === 'PARENT'
                          ? `${Colors.light.tertiary}15`
                          : `${Colors.light.secondary}15`,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color:
                          profileData.userType === 'PARENT'
                            ? Colors.light.tertiary
                            : Colors.light.secondary,
                      }}
                    >
                      {profileData.userType === 'PARENT' ? '부모' : '아이'} 계정
                    </Text>
                  </View>
                </View>

                {profileData.socialProvider && (
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-sm"
                      style={{ color: Colors.light.textSecondary }}
                    >
                      로그인 방식
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: Colors.light.text }}
                    >
                      {profileData.socialProvider === 'GOOGLE'
                        ? 'Google'
                        : 'Apple'}{' '}
                      로그인
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-sm"
                    style={{ color: Colors.light.textSecondary }}
                  >
                    가입일
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: Colors.light.text }}
                  >
                    {new Date(profileData.createdAt).toLocaleDateString(
                      'ko-KR',
                    )}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* 🔥 새로 추가: 위험한 작업 섹션 */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="mb-6"
            >
              <Text
                className="text-base font-bold mb-4"
                style={{ color: Colors.light.text }}
              >
                위험한 작업
              </Text>

              {/* 회원탈퇴 */}
              <Pressable
                className="bg-red-50 rounded-xl p-4 flex-row items-center justify-between active:bg-red-100"
                onPress={() => setShowDeleteAccountModal(true)}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full justify-center items-center mr-3"
                    style={{ backgroundColor: `${Colors.light.error}15` }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={Colors.light.error}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-base font-medium"
                      style={{ color: Colors.light.error }}
                    >
                      회원탈퇴
                    </Text>
                    <Text
                      className="text-sm mt-1"
                      style={{ color: Colors.light.textSecondary }}
                    >
                      계정과 모든 데이터가 영구적으로 삭제됩니다
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>

      

        {/* 🔥 새로 추가: 회원탈퇴 모달 */}
        <Modal
          visible={showDeleteAccountModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDeleteAccountModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl">
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text
                    className="text-xl font-bold"
                    style={{ color: Colors.light.error }}
                  >
                    회원탈퇴
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowDeleteAccountModal(false);
                      setDeleteConfirmText('');
                      setDeletePassword('');
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                </View>

                <View className="bg-red-50 rounded-xl p-4 mb-6">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="warning"
                      size={20}
                      color={Colors.light.error}
                      style={{ marginTop: 1, marginRight: 8 }}
                    />
                    <View className="flex-1">
                      <Text
                        className="text-sm font-medium mb-2"
                        style={{ color: Colors.light.error }}
                      >
                        ⚠️ 주의사항
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.light.error }}
                      >
                        • 모든 약속 데이터가 영구적으로 삭제됩니다{'\n'}
                        • 스티커와 보상 기록이 사라집니다{'\n'}
                        • 키운 식물 정보가 모두 삭제됩니다{'\n'}
                        • 삭제된 데이터는 복구할 수 없습니다
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mb-4">
                  <Text
                    className="text-sm font-medium mb-2"
                    style={{ color: Colors.light.text }}
                  >
                    확인 문구 입력
                  </Text>
                  <Text
                    className="text-xs mb-2"
                    style={{ color: Colors.light.textSecondary }}
                  >
                    정말로 탈퇴하시려면 &quot;삭제&quot;라고 입력해주세요
                  </Text>
                  <View className="bg-gray-50 rounded-xl px-4 py-4">
                    <TextInput
                      value={deleteConfirmText}
                      onChangeText={setDeleteConfirmText}
                      placeholder="삭제"
                      placeholderTextColor={Colors.light.textSecondary}
                      className="text-base"
                      style={{ color: Colors.light.text }}
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {!profileData?.socialProvider && (
                  <View className="mb-6">
                    <Text
                      className="text-sm font-medium mb-2"
                      style={{ color: Colors.light.text }}
                    >
                      비밀번호 확인
                    </Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-4">
                      <TextInput
                        value={deletePassword}
                        onChangeText={setDeletePassword}
                        placeholder="현재 비밀번호를 입력해주세요"
                        placeholderTextColor={Colors.light.textSecondary}
                        className="text-base"
                        style={{ color: Colors.light.text }}
                        secureTextEntry
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                )}

                <View className="flex-row space-x-3">
                  <Pressable
                    className="flex-1 py-4 rounded-xl active:opacity-90"
                    style={{ backgroundColor: Colors.light.disabled }}
                    onPress={() => {
                      setShowDeleteAccountModal(false);
                      setDeleteConfirmText('');
                      setDeletePassword('');
                    }}
                  >
                    <Text className="text-gray-600 text-center font-medium">
                      취소
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 py-4 rounded-xl active:opacity-90"
                    style={{
                      backgroundColor: Colors.light.error,
                      opacity: deleteAccountMutation.isPending ? 0.7 : 1,
                    }}
                    onPress={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white text-center font-medium">
                        탈퇴하기
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* DateTimePickerModal */}
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={handleDateCancel}
          date={birthDate || new Date(2010, 0, 1)}
          maximumDate={new Date()}
          minimumDate={new Date(1990, 0, 1)}
          locale="ko_KR"
          confirmTextIOS="확인"
          cancelTextIOS="취소"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}