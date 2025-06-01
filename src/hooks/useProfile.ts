import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import api from '../api';
import { useAuthStore } from '../stores/authStore';
import type { DetailUserProfile } from '../api/modules/user';

export interface ProfileFormData {
  username: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  birthDate?: string;
}

export interface ProfileValidationErrors {
  username?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
}

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user, updateUser, isAuthenticated } = useAuthStore();

  // 프로필 정보 조회
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userDetailProfile'],
    queryFn: api.user.getUserDetailProfile,
    enabled: isAuthenticated,
  });

  // 연결된 계정 정보 조회
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

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      const updateData: any = {
        username: data.username?.trim(),
        email: data.email?.trim() || undefined,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        bio: data.bio?.trim() || undefined,
      };

      // 자녀인 경우 생일 정보 추가
      if (user?.userType === 'CHILD' && data.birthDate) {
        updateData.birthDate = new Date(data.birthDate).toISOString();
      }

      return api.user.updateUserDetailProfile(updateData);
    },
    onSuccess: (data: DetailUserProfile) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Zustand 스토어 업데이트 (API 응답 데이터를 User 타입으로 변환)
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
      
      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['userDetailProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['connectedAccounts'] });
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('프로필 업데이트 오류:', error);
    },
  });

  // 프로필 이미지 업데이트 뮤테이션 (향후 구현)
  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      // 현재는 API가 준비되지 않았으므로 placeholder
      throw new Error('프로필 이미지 업데이트 기능은 곧 추가될 예정입니다.');
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['userDetailProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('프로필 이미지 업데이트 오류:', error);
    },
  });

  // 폼 데이터 유효성 검사
  const validateProfileForm = (data: ProfileFormData): ProfileValidationErrors => {
    const errors: ProfileValidationErrors = {};

    // 이름 유효성 검사
    if (!data.username?.trim()) {
      errors.username = '이름을 입력해주세요.';
    } else if (data.username.trim().length < 2) {
      errors.username = '이름은 2글자 이상 입력해주세요.';
    } else if (data.username.trim().length > 20) {
      errors.username = '이름은 20글자 이하로 입력해주세요.';
    }

    // 이메일 유효성 검사
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 전화번호 유효성 검사
    if (data.phoneNumber && !/^[0-9\-\+\(\)\s]+$/.test(data.phoneNumber)) {
      errors.phoneNumber = '올바른 전화번호 형식을 입력해주세요.';
    }

    // 생년월일 유효성 검사 (자녀인 경우만)
    if (data.birthDate && user?.userType === 'CHILD') {
      const selectedDate = new Date(data.birthDate);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 25); // 최대 25세
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 3); // 최소 3세

      if (isNaN(selectedDate.getTime())) {
        errors.birthDate = '올바른 날짜 형식을 입력해주세요.';
      } else if (selectedDate > today) {
        errors.birthDate = '생년월일은 오늘 이전 날짜여야 합니다.';
      } else if (selectedDate < minDate) {
        errors.birthDate = '생년월일을 다시 확인해주세요.';
      } else if (selectedDate > maxDate) {
        errors.birthDate = '만 3세 이상이어야 합니다.';
      }
    }

    return errors;
  };

  // 변경사항 확인
  const hasProfileChanges = (formData: ProfileFormData): boolean => {
    if (!profileData) return false;

    const hasUsernameChanged = formData.username !== (profileData.username || '');
    const hasEmailChanged = formData.email !== (profileData.email || '');
    const hasPhoneChanged = formData.phoneNumber !== (profileData.phoneNumber || '');
    const hasBioChanged = formData.bio !== (profileData.bio || '');

    let hasBirthDateChanged = false;
    if (profileData.userType === 'CHILD') {
      if (profileData.childProfile?.birthDate) {
        const originalBirthDate = new Date(profileData.childProfile.birthDate).toISOString().split('T')[0];
        hasBirthDateChanged = formData.birthDate !== originalBirthDate;
      } else {
        hasBirthDateChanged = !!formData.birthDate;
      }
    }

    return hasUsernameChanged || hasEmailChanged || hasPhoneChanged || hasBioChanged || hasBirthDateChanged;
  };

  // 프로필 업데이트 실행
  const updateProfile = async (formData: ProfileFormData): Promise<boolean> => {
    try {
      const validationErrors = validateProfileForm(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return false;
      }

      await updateProfileMutation.mutateAsync(formData);
      return true;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      return false;
    }
  };

  // 프로필 이미지 업데이트 실행
  const updateProfileImage = async (imageUri: string): Promise<boolean> => {
    try {
      await updateProfileImageMutation.mutateAsync(imageUri);
      return true;
    } catch (error) {
      console.error('프로필 이미지 업데이트 실패:', error);
      Alert.alert('알림', '프로필 이미지 변경 기능은 곧 추가될 예정입니다.');
      return false;
    }
  };

  // 계정 연결 상태 확인
  const getConnectionStatus = () => {
    if (!connectedAccounts || !user) {
      return { isConnected: false, connectionCount: 0 };
    }

    if (user.userType === 'PARENT') {
      const childrenCount = Array.isArray(connectedAccounts) ? connectedAccounts.length : 0;
      return { 
        isConnected: childrenCount > 0, 
        connectionCount: childrenCount,
        connections: connectedAccounts 
      };
    } else {
      const isConnectedToParent = connectedAccounts && !Array.isArray(connectedAccounts);
      return { 
        isConnected: !!isConnectedToParent, 
        connectionCount: isConnectedToParent ? 1 : 0,
        connections: isConnectedToParent ? [connectedAccounts] : []
      };
    }
  };

  // 초기 폼 데이터 생성
  const getInitialFormData = (): ProfileFormData => {
    if (!profileData) {
      return {
        username: '',
        email: '',
        phoneNumber: '',
        bio: '',
        birthDate: '',
      };
    }

    let birthDate = '';
    if (profileData.userType === 'CHILD' && profileData.childProfile?.birthDate) {
      birthDate = new Date(profileData.childProfile.birthDate).toISOString().split('T')[0];
    }

    return {
      username: profileData.username || '',
      email: profileData.email || '',
      phoneNumber: profileData.phoneNumber || '',
      bio: profileData.bio || '',
      birthDate,
    };
  };

  return {
    // 데이터
    profileData,
    connectedAccounts,
    connectionStatus: getConnectionStatus(),
    
    // 로딩 상태
    isLoadingProfile,
    isLoadingConnections,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingImage: updateProfileImageMutation.isPending,
    
    // 오류 상태
    profileError,
    updateError: updateProfileMutation.error,
    
    // 함수들
    validateProfileForm,
    hasProfileChanges,
    updateProfile,
    updateProfileImage,
    getInitialFormData,
    refetchProfile,
    refetchConnections,
    
    // 원시 뮤테이션 (필요한 경우)
    updateProfileMutation,
    updateProfileImageMutation,
  };
};

// 프로필 관련 유틸리티 함수들
export const profileUtils = {
  // 사용자 타입에 따른 컬러 반환
  getUserTypeColor: (userType: 'PARENT' | 'CHILD') => {
    return userType === 'PARENT' ? '#2B70C9' : '#FFC800';
  },
  
  // 사용자 타입 텍스트 반환
  getUserTypeText: (userType: 'PARENT' | 'CHILD') => {
    return userType === 'PARENT' ? '부모' : '아이';
  },
  
  // 소셜 프로바이더 텍스트 반환
  getSocialProviderText: (provider?: 'GOOGLE' | 'APPLE') => {
    if (!provider) return '일반 로그인';
    return provider === 'GOOGLE' ? 'Google 로그인' : 'Apple 로그인';
  },
  
  // 날짜 포맷팅
  formatDate: (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  // 나이 계산
  calculateAge: (birthDate: string | Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },
};