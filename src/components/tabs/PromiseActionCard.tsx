import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';
import api from '../../api';
import { PromiseAssignment, PromiseStatus } from '../../api/modules/promise';
import { useAuthStore } from '../../stores/authStore';

interface PromiseActionCardProps {
  userType?: string;
  completedPromises: number;
  totalPromises: number;
  onPress: () => void;
  childId?: string; // 부모가 특정 자녀의 약속을 볼 때 필요
}

const PromiseActionCard = ({
  userType,
  completedPromises,
  totalPromises,
  onPress,
  childId
}: PromiseActionCardProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [modalVisible, setModalVisible] = useState(false);
  
  // 오늘의 약속 목록 조회 - 쿼리 함수 최적화
  const fetchPromiseAssignments = useCallback(async () => {
    if (!isAuthenticated) return [];
    
    try {
      // 부모가 자녀의 약속 목록 조회 - 오늘 날짜로 필터링
      if (userType === 'PARENT' && childId) {
        // 부모 화면에서는 오늘의 PENDING 상태 약속만 가져오도록 수정
        const assignments = await api.promise.getPromiseAssignmentsByChild(childId);
        return assignments.filter(assignment => {
          if (!assignment.dueDate) return false;
          const dueDate = assignment.dueDate.split('T')[0];
          return dueDate === todayStr && assignment.status === PromiseStatus.PENDING;
        });
      } 
      // 자녀가 자신의 약속 목록 조회 - PENDING 상태인 것만 가져오기
      else if (userType === 'CHILD') {
        const assignments = await api.promise.getChildPromises(PromiseStatus.PENDING);
        return assignments.filter(assignment => {
          if (!assignment.dueDate) return false;
          const dueDate = assignment.dueDate.split('T')[0];
          return dueDate === todayStr;
        });
      }
      return [];
    } catch (error) {
      console.error('약속 조회 오류:', error);
      return [];
    }
  }, [isAuthenticated, userType, childId, todayStr]);
  
  // 부모 화면에서 승인 대기 중(SUBMITTED)인 약속 목록 조회
  const fetchPendingApprovals = useCallback(async () => {
    if (!isAuthenticated || userType !== 'PARENT' || !childId) return [];
    
    try {
      const assignments = await api.promise.getPromiseAssignmentsByChild(childId);
      return assignments.filter(assignment => {
        if (!assignment.dueDate) return false;
        const dueDate = assignment.dueDate.split('T')[0];
        return dueDate === todayStr && assignment.status === PromiseStatus.SUBMITTED;
      });
    } catch (error) {
      console.error('승인 대기 약속 조회 오류:', error);
      return [];
    }
  }, [isAuthenticated, userType, childId, todayStr]);
  
  // 오늘의 PENDING 약속 쿼리
  const { 
    data: todayPendingPromises = [], 
    isLoading: isPendingLoading 
  } = useQuery({
    queryKey: ['todayPendingPromises', userType, childId, todayStr],
    queryFn: fetchPromiseAssignments,
    enabled: isAuthenticated && (userType === 'CHILD' || (userType === 'PARENT' && !!childId))
  });
  
  // 승인 대기 중인 약속 쿼리
  const { 
    data: pendingApprovals = [], 
    isLoading: isApprovalsLoading 
  } = useQuery({
    queryKey: ['pendingApprovals', childId, todayStr],
    queryFn: fetchPendingApprovals,
    enabled: isAuthenticated && userType === 'PARENT' && !!childId
  });
  
  // 오늘의 PENDING 약속 개수
  const pendingPromisesCount = todayPendingPromises.length;
  
  // 승인 대기 중인 약속 개수
  const pendingApprovalCount = pendingApprovals.length;
  
  // 인증 화면으로 이동하는 함수
  const navigateToVerify = (assignmentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(false); // 모달 닫기
    
    // 인증 화면으로 이동
    router.push({
      pathname: '/(child)/verify',
      params: { assignmentId }
    });
  };
  
  // 카드 클릭 처리
  const handleCardPress = () => {
    if (userType === 'CHILD' && pendingPromisesCount > 0) {
      // 자녀 계정이고 인증 대기 약속이 있으면 모달 표시
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setModalVisible(true);
    } else {
      // 그 외의 경우 기존 onPress 함수 실행
      onPress();
    }
  };
  
  // 로딩 상태 통합
  const isLoading = isPendingLoading || isApprovalsLoading;
  
  // 아이콘과 메시지 설정
  const getStatusIcon = () => {
    if (isLoading) {
      return <MaterialIcons name="sync" size={22} color={Colors.light.primary} />;
    }
    
    if (pendingPromisesCount === 0) {
      return <MaterialIcons name="event-available" size={22} color={Colors.light.primary} />;
    }
    
    return <MaterialIcons name="assignment" size={22} color={Colors.light.warning} />;
  };
  
  const getDescription = () => {
    if (isLoading) {
      return "약속 정보를 불러오는 중...";
    }
    
    if (pendingPromisesCount === 0) {
      return userType === 'PARENT' 
        ? "오늘은 자녀의 인증할 약속이 없어요"
        : "오늘은 인증할 약속이 없어요";
    }
    
    return userType === 'PARENT' 
      ? `오늘 자녀가 인증해야 할 약속이 ${pendingPromisesCount}개 있어요`
      : `오늘 인증해야 할 약속이 ${pendingPromisesCount}개 있어요`;
  };
  
  const getActionText = () => {
    if (isLoading) {
      return "불러오는 중...";
    }
    
    if (pendingPromisesCount === 0) {
      return userType === 'PARENT' ? "약속 관리하기" : "약속 둘러보기";
    }
    
    return userType === 'PARENT' ? "약속 확인하기" : "지금 인증하기";
  };
  
  // 디버깅 로그
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PromiseActionCard] User Type: ${userType}`);
      console.log(`[PromiseActionCard] Today's PENDING assignments: ${pendingPromisesCount}`);
      
      if (userType === 'PARENT') {
        console.log(`[PromiseActionCard] Pending approval assignments: ${pendingApprovalCount}`);
      }
      
      todayPendingPromises.forEach(a => {
        console.log(`[PromiseActionCard] Assignment ID: ${a.id}, Title: ${a.promise?.title}, Status: ${a.status}`);
      });
    }
  }, [todayPendingPromises, pendingPromisesCount, pendingApprovalCount, userType]);
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${month}월 ${day}일 (${weekday})`;
  };
  
  return (
    <>
      <ActionCard
        icon={getStatusIcon()}
        title={userType === 'PARENT' ? "자녀의 인증 대기 약속" : "오늘의 인증 대기 약속"}
        description={getDescription()}
        actionText={getActionText()}
        color={pendingPromisesCount > 0 ? Colors.light.warning : Colors.light.primary}
        onPress={handleCardPress}
        renderExtra={() => (
          <View className="mt-2 mb-1">
            {/* 자녀 계정일 때 인증 안내 메시지 */}
            {userType === 'CHILD' && pendingPromisesCount > 0 && (
              <View className="p-2 bg-amber-50 rounded-lg mb-2 border border-amber-200">
                <Text className="text-amber-700 text-xs">
                  약속을 인증하고 식물을 성장시켜보세요!
                </Text>
              </View>
            )}
            
            {/* 부모 계정이고 승인 대기 중인 약속이 있는 경우 알림 표시 */}
            {userType === 'PARENT' && pendingApprovalCount > 0 && (
              <View className="mt-2 flex-row items-center">
                <MaterialIcons name="notifications-active" size={16} color={Colors.light.warning} />
                <Text className="text-xs text-warning ml-1">
                  {pendingApprovalCount}개의 약속 승인 대기 중
                </Text>
              </View>
            )}
          </View>
        )}
      />
      
      {/* 약속 선택 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-emerald-700">오늘의 인증 대기 약속</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color="#777" />
              </Pressable>
            </View>
            
            {/* 약속 목록 */}
            {todayPendingPromises.length > 0 ? (
              <FlatList
                data={todayPendingPromises}
                keyExtractor={(item) => item.id}
                renderItem={({ item: assignment }) => (
                  <Pressable
                    className="mb-3 p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
                    onPress={() => navigateToVerify(assignment.id)}
                  >
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-lg font-medium text-gray-800">
                        {assignment.promise?.title || '제목 없음'}
                      </Text>
                    </View>
                    
                    <Text className="text-gray-600 mb-2">
                      기한: {formatDate(assignment.dueDate)}
                    </Text>
                    
                    <View className="flex-row justify-end">
                      <Pressable
                        className="bg-emerald-500 py-2 px-4 rounded-lg"
                        onPress={() => navigateToVerify(assignment.id)}
                      >
                        <Text className="text-white font-medium">인증하기</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                )}
                ListFooterComponent={() => (
                  <Text className="text-gray-600 text-center mt-2 text-sm">
                    인증하고 싶은 약속을 선택하세요
                  </Text>
                )}
              />
            ) : (
              <View className="items-center justify-center py-10">
                <MaterialIcons name="event-available" size={40} color="#d1d5db" />
                <Text className="mt-2 text-gray-700">인증할 약속이 없습니다</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default React.memo(PromiseActionCard);