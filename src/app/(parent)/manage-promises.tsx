import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import promiseApi, { PromiseTask, RepeatType } from '../../api/modules/promise';
import * as Haptics from 'expo-haptics';

export default function ManagePromisesScreen() {
  const router = useRouter();
  const [promises, setPromises] = useState<PromiseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  
  // 약속 목록 로드
  useEffect(() => {
    loadPromises();
  }, []);
  
  // 약속 목록 로드 함수
  const loadPromises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await promiseApi.getParentPromises();
      
      // API 응답에 isActive 필드가 없는 경우 추가
      const processedPromises = response.map(promise => ({
        ...promise,
        isActive: promise.hasOwnProperty('isActive') ? promise.isActive : true // 기본값 설정
      }));
      
      setPromises(processedPromises);
      
      setIsLoading(false);
    } catch (error) {
      console.error('약속 목록 로드 중 오류:', error);
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
  
  // 약속 활성화/비활성화 함수
  const togglePromiseStatus = async (promise: PromiseTask) => {
    const newStatus = !promise.isActive;
    const actionText = newStatus ? '활성화' : '비활성화';
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '확인',
      `이 약속을 ${actionText}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: async () => {
            try {
              // API에 updatePromiseStatus가 구현되어 있지 않으면 updatePromise 사용
              await promiseApi.updatePromise(promise.id, { 
                // 다른 필드는 유지하고 isActive만 업데이트
                title: promise.title,
                description: promise.description,
                repeatType: promise.repeatType,
                startDate: promise.startDate,
                endDate: promise.endDate,
                childIds: promise.assignments?.map(a => a.childId) || []
              });
              
              // 상태 업데이트
              setPromises(prev => 
                prev.map(p => 
                  p.id === promise.id ? { ...p, isActive: newStatus } : p
                )
              );
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('성공', `약속이 ${actionText}되었습니다.`);
            } catch (error) {
              console.error(`약속 ${actionText} 중 오류:`, error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('오류', `약속 ${actionText} 중 문제가 발생했습니다.`);
            }
          }
        }
      ]
    );
  };
  
  // 약속 삭제 함수
  const handleDelete = async (promiseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '확인',
      '이 약속을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await promiseApi.deletePromise(promiseId);
              
              // 상태 업데이트
              setPromises(prev => prev.filter(p => p.id !== promiseId));
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('성공', '약속이 삭제되었습니다.');
            } catch (error) {
              console.error('약속 삭제 중 오류:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('오류', '약속 삭제 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };
  
  // 약속 수정 함수
  const handleEdit = (promiseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // 수정 화면으로 이동
    router.push({
      pathname: '/(parent)/create-promise',
      params: { id: promiseId }
    });
  };
  
  // 반복 유형 텍스트 변환
  const getRepeatTypeText = (repeatType: RepeatType) => {
    switch (repeatType) {
      case RepeatType.ONCE: return '한 번만';
      case RepeatType.DAILY: return '매일';
      case RepeatType.WEEKLY: return '매주';
      case RepeatType.MONTHLY: return '매월';
      default: return '알 수 없음';
    }
  };
  
  // 필터링된 약속 목록
  const filteredPromises = activeFilter !== null
    ? promises.filter(p => p.isActive === activeFilter)
    : promises;
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable 
            onPress={() => router.back()} 
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">약속 관리</Text>
          <View style={{ width: 30 }} />
        </View>
        
        <Pressable
          className="bg-emerald-500 py-3 rounded-xl mb-4 shadow-sm"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(parent)/create-promise');
          }}
        >
          <View className="flex-row items-center justify-center">
            <FontAwesome5 name="plus" size={16} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-center font-medium">
              새 약속 만들기
            </Text>
          </View>
        </Pressable>
        
        {/* 필터 버튼 */}
        {/* <View className="flex-row mb-4">
          <Pressable
            className={`flex-1 py-2 rounded-l-xl ${activeFilter === null ? 'bg-emerald-600' : 'bg-gray-200'}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFilter(null);
            }}
          >
            <Text className={`text-center ${activeFilter === null ? 'text-white' : 'text-gray-700'}`}>
              전체
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 ${activeFilter === true ? 'bg-emerald-600' : 'bg-gray-200'}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFilter(true);
            }}
          >
            <Text className={`text-center ${activeFilter === true ? 'text-white' : 'text-gray-700'}`}>
              활성
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-r-xl ${activeFilter === false ? 'bg-emerald-600' : 'bg-gray-200'}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFilter(false);
            }}
          >
            <Text className={`text-center ${activeFilter === false ? 'text-white' : 'text-gray-700'}`}>
              비활성
            </Text>
          </Pressable>
        </View> */}
        
        {/* 로딩 상태 */}
        {isLoading && (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#10b981" />
            <Text className="text-gray-500 mt-2">약속 목록을 불러오는 중...</Text>
          </View>
        )}
        
        {/* 에러 상태 */}
        {error && (
          <View className="items-center py-6 bg-red-50 rounded-xl">
            <FontAwesome5 name="exclamation-circle" size={24} color="#ef4444" />
            <Text className="text-red-500 mt-2">{error}</Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg mt-4"
              onPress={loadPromises}
            >
              <Text className="text-white">다시 시도</Text>
            </Pressable>
          </View>
        )}
        
        {/* 데이터가 없는 경우 */}
        {!isLoading && !error && filteredPromises.length === 0 && (
          <View className="items-center py-8 bg-gray-50 rounded-xl">
            <FontAwesome5 name="calendar-check" size={30} color="#9ca3af" />
            <Text className="text-gray-600 mt-3 font-medium">
              {activeFilter === null ? '약속이 없습니다' :
               activeFilter ? '활성화된 약속이 없습니다' : '비활성화된 약속이 없습니다'}
            </Text>
            <Text className="text-gray-500 text-center mt-1">
              {activeFilter === null ? '새 약속을 만들어보세요!' :
               activeFilter ? '약속을 활성화하거나 새로 만들어보세요!' : '비활성화된 약속이 없습니다.'}
            </Text>
          </View>
        )}
        
        {/* 약속 목록 */}
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={["#10b981"]}
            />
          }
        >
          {!isLoading && !error && filteredPromises.length > 0 && (
            filteredPromises.map(promise => (
              <View 
                key={promise.id} 
                className={`mb-3 p-4 rounded-xl border ${
                  promise.isActive 
                    ? 'border-emerald-300 bg-white'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-lg ${promise.isActive ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                      {promise.title}
                    </Text>
                    {promise.description && (
                      <Text className="text-gray-500 text-sm mb-1">{promise.description}</Text>
                    )}
                    <View className={`self-start px-2 py-1 rounded-full ${
                      promise.isActive ? 'bg-emerald-100' : 'bg-gray-200'
                    }`}>
                      <Text className={
                        promise.isActive ? 'text-emerald-700 text-xs' : 'text-gray-700 text-xs'
                      }>
                        {getRepeatTypeText(promise.repeatType)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row">
                    <Pressable 
                      className="mr-2 p-2 bg-gray-200 rounded-full"
                      onPress={() => handleEdit(promise.id)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <FontAwesome5 name="edit" size={16} color="#4b5563" />
                    </Pressable>
                    
                    {/* <Pressable 
                      className="mr-2 p-2 rounded-full"
                      style={{ backgroundColor: promise.isActive ? '#fee2e2' : '#d1fae5' }}
                      onPress={() => togglePromiseStatus(promise)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <FontAwesome5 
                        name={promise.isActive ? 'toggle-off' : 'toggle-on'} 
                        size={16} 
                        color={promise.isActive ? '#ef4444' : '#10b981'} 
                      />
                    </Pressable> */}
                    
                    <Pressable 
                      className="p-2 bg-red-100 rounded-full"
                      onPress={() => handleDelete(promise.id)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <FontAwesome5 name="trash" size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}