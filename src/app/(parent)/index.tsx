import SafeStatusBar from '@/src/components/common/SafeStatusBar';
import RevolveFAB from '@/src/components/common/toggle/RevolveFAB'; // 새로 추가
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import promiseApi, { PromiseAssignment } from '../../api/modules/promise';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

// 슬라이드인 애니메이션 훅
const useSlideInAnimation = (initialValue = 100, duration = 500) => {
  const animation = React.useRef(new Animated.Value(initialValue)).current;

  const startAnimation = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startAnimation();
    return () => {
      animation.stopAnimation();
    };
  }, []);

  return { animation, startAnimation };
};

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { animation, startAnimation } = useSlideInAnimation();
  const [pendingVerifications, setPendingVerifications] = useState<
    PromiseAssignment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 애니메이션 시작 및 데이터 로드
  useEffect(() => {
    startAnimation();
    loadPendingVerifications();
  }, []);

  // 승인 대기 중인 약속 인증 목록 조회
  const loadPendingVerifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await promiseApi.getPendingVerifications();
      setPendingVerifications(response);

      setIsLoading(false);
    } catch (error) {
      console.error('인증 요청 목록 로드 중 오류:', error);
      setError('인증 요청 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await loadPendingVerifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 현재 시간 기준으로 상대적 시간 표시
  const getRelativeTime = useCallback((dateString?: string) => {
    if (!dateString) return '시간 정보 없음';

    const now = new Date();
    const date = new Date(dateString);

    // 시간 차이 계산 (밀리초 단위)
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  }, []);

  // 이미지 URL 변환
  const getImageUrl = useCallback((imagePath?: string) => {
    if (!imagePath) return require('../../assets/images/icon/help_icon.png');

    // 서버 URL과 이미지 경로 결합
    if (imagePath.startsWith('http')) {
      return { uri: imagePath };
    } else {
      // 개발 환경에 맞는 기본 URL 설정
      const baseUrl = __DEV__
        ? 'http://localhost:3000'
        : 'https://api.kidsplan.app';
      return { uri: `${baseUrl}/${imagePath}` };
    }
  }, []);

  // 인증 확인 화면으로 이동
  const navigateToApproval = useCallback(
    (verificationId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/(parent)/approvals',
        params: { id: verificationId },
      });
    },
    [router],
  );

  // 섹션 헤더 컴포넌트
  const SectionHeader = ({
    title,
    count,
  }: {
    title: string;
    count?: number;
  }) => (
    <View className="flex-row justify-between items-center py-3 mb-2">
      <View className="flex-row items-center">
        <FontAwesome5
          name="check-circle"
          size={18}
          color={Colors.light.primary}
          className="mr-2"
        />
        <Text className="text-lg font-medium text-emerald-700">{title}</Text>
      </View>
      {count !== undefined && count > 0 && (
        <View className="bg-emerald-500 px-2 py-1 rounded-full">
          <Text className="text-white text-sm">{count}개 대기 중</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* 헤더 */}
      <View className="px-5 py-4 bg-gray-50 border-b border-gray-100 items-left">
        <Text className="text-2xl font-bold text-emerald-700">
          {user?.username ? `${user.username}님의 대시보드` : '부모 대시보드'}
        </Text>
      </View>

      {/* 메인 컨텐츠 */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32" // FAB 공간을 위해 여백 추가
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        <View className="px-5 pt-4">
          {/* 인증 요청 섹션 */}
          <View className="mb-6">
            <SectionHeader
              title="인증 요청"
              count={pendingVerifications.length}
            />

            {/* 로딩 상태 */}
            {isLoading && (
              <View className="items-center justify-center py-10 bg-white rounded-xl shadow-sm">
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text className="text-gray-500 mt-2">
                  인증 요청을 불러오는 중...
                </Text>
              </View>
            )}

            {/* 오류 상태 */}
            {error && (
              <View className="items-center py-6 bg-red-50 rounded-xl shadow-sm">
                <FontAwesome5
                  name="exclamation-circle"
                  size={24}
                  color="#ef4444"
                />
                <Text className="text-red-500 mt-2">{error}</Text>
                <Pressable
                  className="bg-emerald-500 px-5 py-2 rounded-lg mt-4 active:bg-emerald-600"
                  onPress={loadPendingVerifications}
                >
                  <Text className="text-white font-medium">다시 시도</Text>
                </Pressable>
              </View>
            )}

            {/* 데이터가 없는 경우 */}
            {!isLoading && !error && pendingVerifications.length === 0 && (
              <View className="items-center py-8 bg-white rounded-xl shadow-sm">
                <FontAwesome5
                  name="clipboard-check"
                  size={30}
                  color="#9ca3af"
                />
                <Text className="text-gray-600 mt-3 font-medium">
                  현재 대기 중인 인증 요청이 없습니다.
                </Text>
                <Text className="text-gray-500 text-center mt-1">
                  자녀가 약속을 인증하면 여기에 표시됩니다.
                </Text>
              </View>
            )}

            {/* 인증 요청 목록 */}
            {!isLoading && !error && pendingVerifications.length > 0 && (
              <View>
                {pendingVerifications.map((verification) => (
                  <Animated.View
                    key={verification.id}
                    style={{
                      opacity: animation.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0],
                      }),
                      transform: [{ translateX: animation }],
                    }}
                  >
                    <Pressable
                      className="mb-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50"
                      onPress={() => navigateToApproval(verification.id)}
                    >
                      <View className="flex-row items-center gap-2">
                        <Image
                          source={
                            verification.child?.user.profileImage
                              ? getImageUrl(
                                  verification.child.user.profileImage,
                                )
                              : require('../../assets/images/icon/basicPeople_icon.png')
                          }
                          style={{ width: 50, height: 50 }}
                          contentFit="contain"
                          className="rounded-full bg-gray-200"
                        />
                        <View className="flex-1 ml-2">
                          <Text className="text-base font-bold text-gray-800">
                            {verification.promise?.title || '제목 없음'}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {verification.child?.user.username || '이름 없음'} •{' '}
                            {verification.verificationTime
                              ? getRelativeTime(verification.verificationTime)
                              : '시간 정보 없음'}
                          </Text>
                        </View>
                        <View className="bg-emerald-500 px-3 py-1.5 rounded-full">
                          <Text className="text-white text-xs font-medium">
                            확인하기
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 리볼버 FAB 메뉴 */}
      <RevolveFAB />
    </SafeAreaView>
  );
}
