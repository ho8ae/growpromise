// src/app/(tabs)/index.tsx - 연결 모달이 추가된 홈 화면
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// API
import api from '../../api';

// Components
import PlantContainer from '../../components/plant/PlantContainer';
import AuthBanner from '../../components/tabs/AuthBanner';
import ConnectChildCard from '../../components/tabs/ConnectChildCard';
import ErrorMessage from '../../components/tabs/ErrorMessage';
import PromiseActionCard from '../../components/tabs/PromiseActionCard';
import PlantHeader from '../../components/tabs/TabsHeader';
import TipsCard from '../../components/tabs/TipsCard';
import ConnectionPromptModal from '../../components/common/modal/ConnectionPromptModal'; // 새로 추가

// Stores
import SafeStatusBar from '@/src/components/common/SafeStatusBar';
import { useAuthStore } from '../../stores/authStore';

export default function TabsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // 자녀 연결 데이터 (부모 계정용)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedChildData, setSelectedChildData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 경험치 획득 애니메이션 상태
  const [showExperienceAnimation, setShowExperienceAnimation] = useState(false);
  const [experienceGained, setExperienceGained] = useState(0);

  // 🔥 연결 모달 상태 (새로 추가)
  const [showConnectionModal, setShowConnectionModal] = useState(false);

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

  // 🔥 연결된 부모 목록 조회 (자녀 계정용) - 새로 추가
  const { data: connectedParents, isLoading: isLoadingParents } = useQuery({
    queryKey: ['connectedParents'],
    queryFn: async () => {
      if (!isAuthenticated || user?.userType !== 'CHILD') return [];

      try {
        const parents = await api.user.getChildParents();
        console.log('Connected parents fetched successfully');
        return parents;
      } catch (error) {
        console.error('부모 목록 조회 실패:', error);
        setError('부모 정보를 불러오는 중 오류가 발생했습니다.');
        return [];
      }
    },
    enabled: isAuthenticated && user?.userType === 'CHILD',
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
  }, [connectedChildren, selectedChildId]);

  // 🔥 연결 모달 표시 로직 (새로 추가)
  useEffect(() => {
    if (!isAuthenticated) return;

    // 데이터 로딩 완료를 기다림
    const isDataLoaded = user?.userType === 'PARENT' 
      ? !isLoadingChildren 
      : !isLoadingParents;

    if (isDataLoaded) {
      // 부모인 경우 자녀 연결 확인
      if (user?.userType === 'PARENT') {
        const hasConnectedChildren = connectedChildren && connectedChildren.length > 0;
        if (!hasConnectedChildren) {
          // 잠시 딜레이 후 모달 표시 (화면 로딩 완료 대기)
          setTimeout(() => {
            setShowConnectionModal(true);
          }, 1000);
        }
      }
      
      // 자녀인 경우 부모 연결 확인
      if (user?.userType === 'CHILD') {
        const hasConnectedParents = connectedParents && connectedParents.length > 0;
        if (!hasConnectedParents) {
          // 잠시 딜레이 후 모달 표시 (화면 로딩 완료 대기)
          setTimeout(() => {
            setShowConnectionModal(true);
          }, 1000);
        }
      }
    }
  }, [isAuthenticated, user?.userType, connectedChildren, connectedParents, isLoadingChildren, isLoadingParents]);

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

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isAuthenticated) {
        queryClient.refetchQueries({ queryKey: ['currentPlant'] });
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [isAuthenticated, queryClient]);

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

  // 식물 영역 클릭 시 처리 - 개선된 버전
  const handlePlantPress = () => {
    if (handleAuthRequired()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (user?.userType === 'PARENT') {
      // 부모 계정은 대시보드로 이동
      router.push('/(parent)');
    }

    if (user?.userType === 'CHILD') {
      // 자녀 계정은 식물 유무에 따라 다르게 처리
      if (currentPlant) {
        // 자녀 화면으로 이동
        router.push('/(child)');
      }
    }

    if (user?.userType === 'CHILD') {
      if (currentPlant === undefined || currentPlant == null) {
        // 식물이 없으면 식물 선택 화면으로 이동
        router.push('/(child)/select-plant');
      }
    }
  };

  console.log('currentPlant 식물있는지 ', currentPlant);

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

  // 식물 정보 자세히 보기
  const handlePlantInfoPress = () => {
    if (handleAuthRequired()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (user?.userType === 'PARENT' && selectedChildId) {
      // 부모 계정인 경우 자녀 식물 상세 페이지로 이동
      router.push({
        pathname: '/(parent)/child-plant-detail',
        params: { childId: selectedChildId },
      });
    } else if (user?.userType === 'CHILD') {
      // 자녀 계정인 경우 식물 상세 페이지로 이동
      router.push('/(child)/plant-detail');
    }
  };

  // 새로고침 처리 함수
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // invalidate 대신 refetch 사용
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['connectedChildren'] }),
        queryClient.refetchQueries({ queryKey: ['connectedParents'] }), // 새로 추가
        queryClient.refetchQueries({ queryKey: ['currentPlant'] }),
        queryClient.refetchQueries({ queryKey: ['promiseStats'] }),
        queryClient.refetchQueries({ queryKey: ['notifications'] }),
      ]);
    } catch (error) {
      console.error('새로고침 중 오류:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 800);
    }
  }, [isAuthenticated, queryClient]);

  // 🔥 연결 모달 닫기 처리 (새로 추가)
  const handleConnectionModalClose = () => {
    setShowConnectionModal(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />

      <ScrollView
        style={{ paddingTop: insets.top }}
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
        <PlantHeader />
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

          {/* 식물 영역 - PlantContainer 컴포넌트 사용 */}
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

      {/* 🔥 연결 안내 모달 (새로 추가) */}
      {isAuthenticated && user?.userType && (
        <ConnectionPromptModal
          visible={showConnectionModal}
          onClose={handleConnectionModalClose}
          userType={user.userType}
        />
      )}
    </View>
  );
}