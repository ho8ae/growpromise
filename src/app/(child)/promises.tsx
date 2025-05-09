import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../api';
import { PromiseAssignment, PromiseStatus } from '../../api/modules/promise';
import * as Haptics from 'expo-haptics';

export default function ChildPromisesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | PromiseStatus>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promises, setPromises] = useState<PromiseAssignment[]>([]);
  
  // 약속 데이터 로드
  useEffect(() => {
    loadPromises();
  }, [filter]);
  
  // 약속 데이터 로드 함수
  const loadPromises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      if (filter === 'ALL') {
        response = await api.promise.getChildPromises();
      } else {
        response = await api.promise.getChildPromises(filter);
      }
      setPromises(response);
      
      setIsLoading(false);
    } catch (error) {
      console.error('약속 데이터 로드 중 오류:', error);
      setError('약속 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPromises();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };
  
  // 약속 상태에 따른 배지 컴포넌트
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = 'text-white';
    let statusText = '';
    
    switch (status) {
      case 'PENDING':
        bgColor = 'bg-yellow-500';
        statusText = '대기 중';
        break;
      case 'SUBMITTED':
        bgColor = 'bg-blue-500';
        statusText = '인증 요청됨';
        break;
      case 'APPROVED':
        bgColor = 'bg-green-500';
        statusText = '완료';
        break;
      case 'REJECTED':
        bgColor = 'bg-red-500';
        statusText = '거절됨';
        break;
      case 'EXPIRED':
        bgColor = 'bg-gray-500';
        statusText = '만료됨';
        break;
      default:
        bgColor = 'bg-gray-300';
        textColor = 'text-gray-700';
        statusText = '알 수 없음';
    }
    
    return (
      <View className={`px-3 py-1 rounded-full ${bgColor}`}>
        <Text className={`text-xs font-medium ${textColor}`}>{statusText}</Text>
      </View>
    );
  };
  
  // 필터 버튼 컴포넌트
  const FilterButton = ({ 
    title, 
    value 
  }: { 
    title: string; 
    value: 'ALL' | PromiseStatus 
  }) => (
    <Pressable
      className={`px-4 py-2 rounded-full mr-2 ${filter === value ? 'bg-emerald-600' : 'bg-gray-200'}`}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(value);
      }}
    >
      <Text className={filter === value ? 'text-white' : 'text-gray-700'}>{title}</Text>
    </Pressable>
  );

  // 인증 화면으로 이동
  const navigateToVerify = (assignmentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ 
      pathname: '/(child)/verify', 
      params: { assignmentId } 
    });
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable 
            onPress={() => router.back()} 
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">약속 목록</Text>
          <View style={{ width: 30 }} />
        </View>
        
        {/* 필터 버튼 목록 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <FilterButton title="전체" value="ALL" />
          <FilterButton title="대기 중" value={PromiseStatus.PENDING} />
          <FilterButton title="인증 요청됨" value={PromiseStatus.SUBMITTED} />
          <FilterButton title="완료" value={PromiseStatus.APPROVED} />
          <FilterButton title="거절됨" value={PromiseStatus.REJECTED} />
        </ScrollView>
        
        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-2 text-gray-600">약속 목록을 불러오는 중...</Text>
          </View>
        )}
        
        {/* 에러 상태 */}
        {error && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="exclamation-circle" size={40} color="#ef4444" />
            <Text className="mt-2 text-gray-700">불러오기 실패</Text>
            <Text className="text-gray-500 text-center mb-4">{error}</Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg"
              onPress={() => loadPromises()}
            >
              <Text className="text-white font-medium">다시 시도</Text>
            </Pressable>
          </View>
        )}
        
        {/* 데이터가 없는 경우 */}
        {!isLoading && !error && (!promises || promises.length === 0) && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="calendar-alt" size={40} color="#d1d5db" />
            <Text className="mt-2 text-gray-700">약속이 없습니다</Text>
            <Text className="text-gray-500 text-center">
              아직 추가된 약속이 없습니다. 부모님께 약속을 만들어 달라고 요청해보세요!
            </Text>
          </View>
        )}
        
        {/* 약속 목록 */}
        {!isLoading && !error && promises && promises.length > 0 && (
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#10b981"
                colors={["#10b981"]}
              />
            }
          >
            {promises.map((assignment: PromiseAssignment) => (
              <Pressable
                key={assignment.id}
                className="mb-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
                onPress={() => assignment.status === 'PENDING' ? 
                  navigateToVerify(assignment.id) : null
                }
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-medium text-gray-800">
                    {assignment.promise?.title}
                  </Text>
                  <StatusBadge status={assignment.status} />
                </View>
                
                <Text className="text-gray-600 mb-2">
                  기한: {formatDate(assignment.dueDate)}
                </Text>
                
                {assignment.status === 'PENDING' && (
                  <Pressable
                    className="bg-emerald-500 py-2 rounded-lg mt-2"
                    onPress={() => navigateToVerify(assignment.id)}
                  >
                    <Text className="text-white text-center font-medium">인증하기</Text>
                  </Pressable>
                )}
                
                {assignment.status === 'SUBMITTED' && (
                  <View className="bg-blue-100 p-3 rounded-lg mt-2">
                    <Text className="text-blue-700">
                      인증이 완료되었습니다. 부모님의 승인을 기다리고 있어요.
                    </Text>
                  </View>
                )}
                
                {assignment.status === 'APPROVED' && (
                  <View className="bg-green-100 p-3 rounded-lg mt-2">
                    <Text className="text-green-700">
                      부모님이 인증을 승인했습니다. 스티커를 획득했어요!
                    </Text>
                  </View>
                )}
                
                {assignment.status === 'REJECTED' && (
                  <View className="bg-red-100 p-3 rounded-lg mt-2">
                    <Text className="text-red-700">
                      인증이 거절되었습니다. 사유: {assignment.rejectionReason || '없음'}
                    </Text>
                    <Pressable
                      className="bg-emerald-500 py-2 rounded-lg mt-2"
                      onPress={() => navigateToVerify(assignment.id)}
                    >
                      <Text className="text-white text-center font-medium">다시 인증하기</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}