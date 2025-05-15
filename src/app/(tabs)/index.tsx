// src/app/(tabs)/index.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API
import api from '../../api';

// Components
import PlantContainer from '../../components/plant/PlantContainer'; // 새로운 경로로 업데이트
import AuthBanner from '../../components/tabs/AuthBanner';
import ConnectChildCard from '../../components/tabs/ConnectChildCard';
import ErrorMessage from '../../components/tabs/ErrorMessage';
import PromiseActionCard from '../../components/tabs/PromiseActionCard';
import TipsCard from '../../components/tabs/TipsCard';

// Stores
import { useAuthStore } from '../../stores/authStore';

export default function TabsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // 자녀 연결 데이터 (부모 계정용)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedChildData, setSelectedChildData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 경험치 획득 애니메이션 상태
  const [showExperienceAnimation, setShowExperienceAnimation] = useState(false);
  const [experienceGained, setExperienceGained] = useState(0);

  // 애니메이션 값 설정
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const translateY2 = useRef(new Animated.Value(20)).current;
  const translateY3 = useRef(new Animated.Value(20)).current;

  // 연결된 자녀 목록 조회 (부모 계정용)
  const { data: connectedChildren, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['connectedChildren'],
    queryFn: async () => {
      if (!isAuthenticated || user?.userType !== 'PARENT') return [];

      try {
        const children = await api.user.getParentChildren();
        console.log('Connected children fetched successfully');
        return children;
      } catch (error) {
        console.error('자녀 목록 조회 실패:', error);
        setError('자녀 정보를 불러오는 중 오류가 발생했습니다.');
        return [];
      }
    },
    enabled: isAuthenticated && user?.userType === 'PARENT',
  });

  // 현재 식물 정보 가져오기
  const { data: currentPlant, isLoading: isLoadingPlant } = useQuery({
    queryKey: ['currentPlant', user?.userType, selectedChildId],
    queryFn: async () => {
      if (!isAuthenticated) return null;

      try {
        if (user?.userType === 'PARENT' && selectedChildId) {
          // 부모가 자녀의 식물 조회
          return await api.plant.getChildCurrentPlant(selectedChildId);
        } else if (user?.userType === 'CHILD') {
          // 자녀가 자신의 식물 조회
          return await api.plant.getCurrentPlant();
        }
        return null;
      } catch (error) {
        console.error('식물 데이터 로딩 실패:', error);
        return null;
      }
    },
    enabled:
      isAuthenticated && (!!selectedChildId || user?.userType === 'CHILD'),
  });

  // 약속 통계 조회
  const { data: promiseStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['promiseStats', selectedChildId, user?.userType],
    queryFn: async () => {
      if (!isAuthenticated) return null;

      try {
        if (user?.userType === 'PARENT' && selectedChildId) {
          // 부모 계정인 경우 선택된 자녀의 약속 통계
          // 중요: 이미 로드된 자녀 데이터를 함께 전달
          return await api.promise.calculateChildPromiseStats(
            selectedChildId,
            selectedChildData?.child || null,
          );
        } else if (user?.userType === 'CHILD') {
          // 자녀 계정인 경우 자신의 약속 통계
          return await api.promise.getChildPromiseStats();
        }
        return null;
      } catch (error) {
        console.error('약속 통계 조회 실패:', error);
        return null;
      }
    },
    enabled:
      isAuthenticated && (!!selectedChildId || user?.userType === 'CHILD'),
  });

  // 첫 자녀 자동 선택
  useEffect(() => {
    if (connectedChildren && connectedChildren.length > 0 && !selectedChildId) {
      const firstChild = connectedChildren[0];
      setSelectedChildId(firstChild.childId);
      setSelectedChildData(firstChild); // 자녀 전체 데이터 저장
    }
  }, [connectedChildren]);

  // 자녀 선택 처리 (부모 계정용)
  const handleChildSelect = (childId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 선택된 자녀 ID 설정
    setSelectedChildId(childId);

    // 선택된 자녀 데이터 찾기
    if (connectedChildren) {
      const selectedChild = connectedChildren.find(
        (child) => child.childId === childId,
      );
      if (selectedChild) {
        setSelectedChildData(selectedChild);
      }
    }

    // 관련 쿼리 무효화하여 새로고침
    queryClient.invalidateQueries({ queryKey: ['promiseStats', childId] });
    queryClient.invalidateQueries({
      queryKey: ['currentPlant', 'PARENT', childId],
    });
  };

  useEffect(() => {
    // 순차적으로 애니메이션 실행
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateY2, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY3, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 비인증 사용자가 기능 사용 시도할 때 로그인 화면으로 안내
  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그인',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate('/(auth)/login');
          },
        },
      ]);
      return true;
    }
    return false;
  };

  // 식물 영역 클릭 시 처리
  const handlePlantPress = () => {
    if (handleAuthRequired()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (user?.userType === 'PARENT') {
      // 부모 계정은 대시보드로 이동
      router.push('/(parent)');
    } else if (user?.userType === 'CHILD') {
      // 자녀 계정은 식물 유무에 따라 다르게 처리
      if (currentPlant) {
        // 식물이 있으면 식물 상세 정보 화면으로 이동
        router.push('/(child)/plant-detail');
      } else {
        // 식물이 없으면 식물 선택 화면으로 이동
        router.push('/(child)/select-plant');
      }
    }
  };

  // 사용자 유형에 따른 대시보드 진입
  const navigateToDashboard = () => {
    if (handleAuthRequired()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (user?.userType === 'PARENT') {
      router.push('/(parent)');
    } else if (user?.userType === 'CHILD') {
      router.push('/(child)');
    }
  };

  // 새로고침 처리 함수
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // 관련 쿼리 무효화하여 데이터 다시 로드
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['connectedChildren'] }),
        queryClient.invalidateQueries({ queryKey: ['currentPlant'] }),
        queryClient.invalidateQueries({ queryKey: ['promiseStats'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),

        // 자녀 선택 ID가 있는 경우 해당 데이터도 새로고침
        selectedChildId
          ? queryClient.invalidateQueries({
              queryKey: ['currentPlant', 'PARENT', selectedChildId],
            })
          : Promise.resolve(),

        selectedChildId
          ? queryClient.invalidateQueries({
              queryKey: ['promiseStats', selectedChildId],
            })
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('새로고침 중 오류:', error);
    } finally {
      // 약간의 지연 시간을 주어 사용자가 새로고침이 완료되었음을 인지하게 함
      setTimeout(() => {
        setRefreshing(false);
      }, 800);
    }
  }, [isAuthenticated, selectedChildId, queryClient]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
            title="새로고침 중..."
            titleColor="#4CAF50"
          />
        }
      >
        <View className="px-4">
          {/* 비인증 사용자 알림 배너 */}
          {!isAuthenticated && (
            <AuthBanner fadeAnim={fadeAnim} translateY={translateY} />
          )}

          {/* 오류 메시지 */}
          <ErrorMessage
            error={error}
            fadeAnim={fadeAnim}
            translateY={translateY}
          />

          {/* 식물 영역 - 새로운 PlantContainer 컴포넌트 사용 */}
          <PlantContainer
            fadeAnim={fadeAnim}
            translateY={translateY}
            userType={user?.userType}
            isLoading={isLoadingChildren || isLoadingStats || isLoadingPlant}
            onPress={handlePlantPress}
            childId={selectedChildId || undefined}
            plant={currentPlant || undefined}
            connectedChildren={connectedChildren || []}
            handleChildSelect={handleChildSelect}
            showExperienceAnimation={showExperienceAnimation}
            experienceGained={experienceGained}
          />

          {/* 약속 카드 */}
          <PromiseActionCard
            userType={user?.userType}
            completedPromises={promiseStats?.completedPromises || 0}
            totalPromises={
              (promiseStats?.totalPromises || 0) +
                (promiseStats?.pendingPromises || 0) || 3
            }
            onPress={navigateToDashboard}
            childId={selectedChildId || undefined}
          />

          {/* 빠른 액션 - 2열 그리드 */}
          {/* <QuickActionGrid
            userType={user?.userType}
            handleAuthRequired={handleAuthRequired}
            childId={selectedChildId || undefined}
          /> */}

          {/* 사용자 팁 카드 */}
          <TipsCard userType={user?.userType} />

          {/* 자녀 연결이 없는 부모를 위한 안내 */}
          <ConnectChildCard
            isAuthenticated={isAuthenticated}
            userType={user?.userType}
            hasConnectedChildren={
              !!connectedChildren && connectedChildren.length > 0
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
