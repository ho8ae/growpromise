import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// 약속 할당 인터페이스 정의
interface PromiseAssignment {
  id: string;
  promise?: {
    id: string;
    title: string;
    description?: string;
  };
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  rejectionReason?: string;
}

export default function ChildPromisesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
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
      
      // 실제 구현 시 API 호출 부분
      // let response;
      // if (filter === 'ALL') {
      //   response = await promiseApi.getChildPromises();
      // } else {
      //   response = await promiseApi.getChildPromises(filter);
      // }
      // setPromises(response);
      
      // 개발 중에는 빈 데이터 설정
      setPromises([]);
      
      setIsLoading(false);
    } catch (error) {
      console.error('약속 데이터 로드 중 오류:', error);
      setError('약속 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
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
  const FilterButton = ({ title, value }: { title: string; value: typeof filter }) => (
    <Pressable
      className={`px-4 py-2 rounded-full mr-2 ${filter === value ? 'bg-emerald-600' : 'bg-gray-200'}`}
      onPress={() => setFilter(value)}
    >
      <Text className={filter === value ? 'text-white' : 'text-gray-700'}>{title}</Text>
    </Pressable>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">약속 목록</Text>
          <View style={{ width: 30 }} />
        </View>
        
        {/* 필터 버튼 목록 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <FilterButton title="전체" value="ALL" />
          <FilterButton title="대기 중" value="PENDING" />
          <FilterButton title="인증 요청됨" value="SUBMITTED" />
          <FilterButton title="완료" value="APPROVED" />
          <FilterButton title="거절됨" value="REJECTED" />
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
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {promises.map((assignment: PromiseAssignment) => (
              <Pressable
                key={assignment.id}
                className="mb-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
                onPress={() => assignment.status === 'PENDING' ? 
                  router.push({ pathname: '/(child)/verify', params: { assignmentId: assignment.id } }) :
                  null
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
                    onPress={() => router.push({ 
                      pathname: '/(child)/verify', 
                      params: { assignmentId: assignment.id }
                    })}
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
                      onPress={() => router.push({ 
                        pathname: '/(child)/verify', 
                        params: { assignmentId: assignment.id }
                      })}
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