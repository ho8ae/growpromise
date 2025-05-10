import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// API
import promiseApi from '../../api/modules/promise';
import userApi, { ChildParentConnection } from '../../api/modules/user';

// Components
import AppHeader from '../../components/tabs/AppHeader';
import AuthBanner from '../../components/tabs/AuthBanner';
import CharacterContainer from '../../components/tabs/CharacterContainer';
import ChildSelector from '../../components/tabs/ChildSelector';
import ConnectChildCard from '../../components/tabs/ConnectChildCard';
import ErrorMessage from '../../components/tabs/ErrorMessage';
import PromiseActionCard from '../../components/tabs/PromiseActionCard';
import QuickActionGrid from '../../components/tabs/QuickActionGrid';
import TipsCard from '../../components/tabs/TipsCard';
import WateringCard from '../../components/tabs/WateringCard';

// Stores
import { useAuthStore } from '../../stores/authStore';

// Types and interfaces
interface CharacterData {
  stage: number;
  completedPromises: number;
  totalPromises: number;
}

export default function TabsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // 기본 캐릭터 데이터
  const [characterData, setCharacterData] = useState<CharacterData>({
    stage: 1,
    completedPromises: 0,
    totalPromises: 0,
  });

  // 자녀 연결 데이터 (부모 계정용)
  const [connectedChildren, setConnectedChildren] = useState<ChildParentConnection[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 애니메이션 값 설정
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const translateY2 = useRef(new Animated.Value(20)).current;
  const translateY3 = useRef(new Animated.Value(20)).current;

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        setError(null);
        
        try {
          if (user.userType === 'PARENT') {
            // 부모 계정일 경우 연결된 자녀 목록 조회
            await loadParentData();
          } else {
            // 자녀 계정일 경우 자신의 약속 통계 조회
            await loadChildData();
          }
        } catch (error) {
          console.error('데이터 로드 오류:', error);
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 비인증 사용자용 기본 데이터
        setCharacterData({
          stage: 1,
          completedPromises: 0,
          totalPromises: 3,
        });
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // 부모 계정의 데이터 로드
  const loadParentData = async () => {
    try {
      // 1. 자녀 연결 정보 조회 - userApi 사용
      const childConnections = await userApi.getParentChildren();
      setConnectedChildren(childConnections);
      
      if (childConnections.length > 0) {
        // 첫 번째 자녀를 기본 선택
        const firstChildConnection = childConnections[0];
        const firstChildId = firstChildConnection.childId;
        setSelectedChildId(firstChildId);
        
        // 중요: firstChildConnection.child.user.id가 실제 자녀의 userId입니다
        const childUserId = firstChildConnection.child?.user.id;        
  
        // 자녀 프로필 정보 (아직 구현 다 안됨)
        const characterStage = firstChildConnection.child?.characterStage || 1;
        
        try {
          // 자녀의 약속 목록으로부터 통계 계산
          const assignments = await promiseApi.getPromiseAssignmentsByChild(firstChildId);
          
          // 통계 계산
          const completedPromises = assignments.filter(a => a.status === 'APPROVED').length;
          const totalPromises = assignments.length;
          
          setCharacterData({
            stage: characterStage,
            completedPromises: completedPromises || 0,
            totalPromises: totalPromises || 3,
          });
        } catch (statsError) {
          console.error('자녀 약속 통계 계산 오류:', statsError);
          
          // 통계 계산 실패시 기본값 사용
          setCharacterData({
            stage: characterStage,
            completedPromises: 0,
            totalPromises: 3,
          });
        }
      } else {
        // 연결된 자녀가 없는 경우
        setCharacterData({
          stage: 1,
          completedPromises: 0,
          totalPromises: 0,
        });
      }
    } catch (error) {
      console.error('부모 데이터 로드 오류:', error);
      throw error;
    }
  };

  // 자녀 계정의 데이터 로드
  const loadChildData = async () => {
    try {
      // 자녀 자신의 약속 통계 조회 (GET /api/promises/stats)
      const promiseStats = await promiseApi.getChildPromiseStats();
      
      setCharacterData({
        stage: promiseStats.characterStage || 1,
        completedPromises: promiseStats.completedPromises || 0,
        totalPromises:
          (promiseStats.pendingPromises || 0) + (promiseStats.completedPromises || 0) || 3,
      });
    } catch (error) {
      console.error('자녀 데이터 로드 오류:', error);
      throw error;
    }
  };

  // 자녀 선택 처리 (부모 계정용)
  const handleChildSelect = async (childId: string) => {
    try {
      setIsLoading(true);
      setSelectedChildId(childId);
      
      // 자녀 프로필 정보 조회
      const childUser = await userApi.getUserById(childId);
      const characterStage = childUser.childProfile?.characterStage || 1;
      
      // 자녀의 약속 목록 조회 후 통계 계산
      try {
        const promiseStats = await promiseApi.calculateChildPromiseStats(childId);
        
        setCharacterData({
          stage: characterStage,
          completedPromises: promiseStats.completedPromises || 0,
          totalPromises: 
            (promiseStats.pendingPromises || 0) + (promiseStats.completedPromises || 0) || 3,
        });
      } catch (statsError) {
        console.error('자녀 약속 통계 계산 오류:', statsError);
        
        // 통계 계산 실패시 기본값 사용
        setCharacterData({
          stage: characterStage,
          completedPromises: 0,
          totalPromises: 3,
        });
      }
    } catch (error) {
      console.error('자녀 선택 오류:', error);
      Alert.alert('오류', '자녀 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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

  // 자녀 선택 메뉴 렌더링 (부모 계정용)
  const renderChildSelector = () => {
    if (!isAuthenticated || user?.userType !== 'PARENT' || connectedChildren.length <= 1) {
      return null;
    }

    return (
      <ChildSelector
        fadeAnim={fadeAnim}
        translateY={translateY}
        connectedChildren={connectedChildren}
        selectedChildId={selectedChildId}
        handleChildSelect={handleChildSelect}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {/* 비인증 사용자 알림 배너 */}
          {!isAuthenticated && <AuthBanner fadeAnim={fadeAnim} translateY={translateY} />}

          {/* 앱 타이틀 */}
          <AppHeader fadeAnim={fadeAnim} translateY={translateY} />

          {/* 자녀 선택기 (부모 계정용) */}
          {renderChildSelector()}

          {/* 오류 메시지 */}
          <ErrorMessage error={error} fadeAnim={fadeAnim} translateY={translateY} />

          {/* 캐릭터 영역 */}
          <CharacterContainer
            fadeAnim={fadeAnim}
            translateY={translateY}
            characterStage={characterData.stage}
            completedPromises={characterData.completedPromises}
            totalPromises={characterData.totalPromises}
            userType={user?.userType}
            isLoading={isLoading}
            onPress={navigateToDashboard}
          />

          {/* 약속 카드 */}
          <PromiseActionCard 
            userType={user?.userType}
            completedPromises={characterData.completedPromises}
            totalPromises={characterData.totalPromises}
            onPress={navigateToDashboard}
          />

          {/* 물주기 카드 */}
          <WateringCard handleAuthRequired={handleAuthRequired} />

          {/* 빠른 액션 - 2열 그리드 */}
          <QuickActionGrid 
            userType={user?.userType} 
            handleAuthRequired={handleAuthRequired} 
          />

          {/* 사용자 팁 카드 */}
          <TipsCard userType={user?.userType} />

          {/* 자녀 연결이 없는 부모를 위한 안내 */}
          <ConnectChildCard
            isAuthenticated={isAuthenticated}
            userType={user?.userType}
            hasConnectedChildren={connectedChildren.length > 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}