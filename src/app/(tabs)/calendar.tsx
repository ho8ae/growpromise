import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Modal, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import promiseApi, { PromiseAssignment, PromiseStatus } from '../../api/modules/promise';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarBody from '../../components/calendar/CalendarBody';
import CalendarLegend from '../../components/calendar/CalendarLegend';
import CalendarStats from '../../components/calendar/CalendarStats';
import { DateUtils, getPromiseType, getPromiseTypeName, PROMISE_TYPES } from '../../utils/calendarHelpers';

// 약속 데이터 인터페이스
export interface PromiseData {
  id: string;
  title: string;
  description?: string;
  date: string;  // YYYY-MM-DD 형식
  type: keyof typeof PROMISE_TYPES | 'default';
  completed: boolean;
}

export default function CalendarScreen() {
  // 상태 관리
  const { user } = useAuthStore();
  const [userType, setUserType] = useState<'PARENT' | 'CHILD' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPromises, setSelectedPromises] = useState<PromiseData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentYearMonth, setCurrentYearMonth] = useState(DateUtils.getCurrentYearMonth());
  const [promisesByDate, setPromisesByDate] = useState<Record<string, PromiseData[]>>({});
  const [monthStats, setMonthStats] = useState({ total: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // 사용자 타입 확인
  useEffect(() => {
    if (user?.userType) {
      setUserType(user.userType);
    } else {
      setUserType(null);
    }
  }, [user]);
  
  // 화면 마운트 시 애니메이션 실행
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    loadPromises();
    
    return () => {
      // 화면에서 벗어날 때 정리 작업
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    };
  }, []);
  
  // 월이 변경될 때 데이터 다시 로드
  useEffect(() => {
    loadPromises();
  }, [currentYearMonth, userType]);
  
  // 약속 데이터 로드 함수
  const loadPromises = useCallback(async () => {
    if (!user || !userType) {
      // 비인증 상태일 때는 빈 데이터 설정
      setPromisesByDate({});
      setMonthStats({ total: 0, completed: 0 });
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 사용자 타입에 따라 다른 API 호출
      let promises: PromiseData[] = [];
      
      try {
        if (userType === 'PARENT') {
          // 부모의 경우 모든 약속 가져오기
          const parentPromises = await promiseApi.getParentPromises();
          
          // 약속 데이터 변환
          promises = parentPromises.flatMap(promise => 
            (promise.assignments?.map(assignment => {
              try {
                const dueDate = assignment.dueDate;
                // 해당 월의 데이터만 필터링
                const dueMonth = new Date(dueDate).getMonth() + 1;
                const dueYear = new Date(dueDate).getFullYear();
                
                if (dueYear === currentYearMonth.year && dueMonth === currentYearMonth.month) {
                  return {
                    id: assignment.id,
                    title: promise.title,
                    description: promise.description,
                    date: dueDate.split('T')[0], // 'T' 이후 시간 부분 제거
                    type: getPromiseType(promise.title),
                    completed: assignment.status === PromiseStatus.APPROVED
                  };
                }
                return null;
              } catch (err) {
                console.error("Assignment 데이터 변환 오류:", err);
                return null;
              }
            }) || []).filter(Boolean)
          ) as PromiseData[];
          
        } else if (userType === 'CHILD') {
          // 자녀의 경우 자신의 약속 할당 가져오기
          const childPromises = await promiseApi.getChildPromises();
          
          // 약속 데이터 변환
          promises = childPromises
            .map(assignment => {
              try {
                const dueDate = assignment.dueDate;
                // 해당 월의 데이터만 필터링
                const dueMonth = new Date(dueDate).getMonth() + 1;
                const dueYear = new Date(dueDate).getFullYear();
                
                if (dueYear === currentYearMonth.year && dueMonth === currentYearMonth.month) {
                  return {
                    id: assignment.id,
                    title: assignment.promise?.title || '제목 없음',
                    description: assignment.promise?.description,
                    date: dueDate.split('T')[0], // 'T' 이후 시간 부분 제거
                    type: getPromiseType(assignment.promise?.title || ''),
                    completed: assignment.status === PromiseStatus.APPROVED
                  };
                }
                return null;
              } catch (err) {
                console.error("Child 약속 데이터 변환 오류:", err);
                return null;
              }
            })
            .filter(Boolean) as PromiseData[];
        }
        
        // 날짜별 약속 데이터 그룹화
        const groupedPromises = promises.reduce((acc, promise) => {
          if (!acc[promise.date]) {
            acc[promise.date] = [];
          }
          acc[promise.date].push(promise);
          return acc;
        }, {} as Record<string, PromiseData[]>);
        
        setPromisesByDate(groupedPromises);
        
        // 월간 통계 계산
        const total = promises.length;
        const completed = promises.filter(p => p.completed).length;
        setMonthStats({ total, completed });
      } catch (err) {
        console.error("API 데이터 로딩 오류:", err);
        setError('약속 데이터를 불러오는 중 오류가 발생했습니다.');
      }
      
    } catch (error) {
      console.error('약속 데이터 로드 중 오류:', error);
      setError('약속 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentYearMonth.month, currentYearMonth.year, user, userType]);

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPromises();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // 날짜 선택 핸들러
  const handleDateSelect = (day: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const formattedDate = `${currentYearMonth.year}-${String(currentYearMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(formattedDate);
      setSelectedPromises(promisesByDate[formattedDate] || []);
      setModalVisible(true);
    } catch (err) {
      console.error("날짜 선택 오류:", err);
    }
  };
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentYearMonth(prev => {
        if (prev.month === 1) {
          return { year: prev.year - 1, month: 12 };
        } else {
          return { year: prev.year, month: prev.month - 1 };
        }
      });
    } catch (err) {
      console.error("이전 달 이동 오류:", err);
    }
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentYearMonth(prev => {
        if (prev.month === 12) {
          return { year: prev.year + 1, month: 1 };
        } else {
          return { year: prev.year, month: prev.month + 1 };
        }
      });
    } catch (err) {
      console.error("다음 달 이동 오류:", err);
    }
  };
  
  // 해당 날짜에 약속이 있는지 확인하는 함수
  const hasPromisesOnDate = useCallback((day: number | null) => {
    try {
      if (!day) return false;
      const formattedDate = `${currentYearMonth.year}-${String(currentYearMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return promisesByDate[formattedDate] && promisesByDate[formattedDate].length > 0;
    } catch (err) {
      console.error("약속 확인 오류:", err);
      return false;
    }
  }, [currentYearMonth.year, currentYearMonth.month, promisesByDate]);
  
  // 해당 날짜의 약속 완료 상태 계산
  const getPromiseCompletionStatus = useCallback((day: number | null) => {
    try {
      if (!day) return { total: 0, completed: 0 };
      
      const formattedDate = `${currentYearMonth.year}-${String(currentYearMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const promises = promisesByDate[formattedDate] || [];
      
      const total = promises.length;
      const completed = promises.filter(p => p.completed).length;
      
      return { total, completed };
    } catch (err) {
      console.error("약속 완료 상태 계산 오류:", err);
      return { total: 0, completed: 0 };
    }
  }, [currentYearMonth.year, currentYearMonth.month, promisesByDate]);
  
  // 완료율 계산
  const completionRate = monthStats.total > 0 
    ? Math.round((monthStats.completed / monthStats.total) * 100) 
    : 0;
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text className="text-3xl font-bold text-center my-4 text-emerald-700">
            약속 달력
          </Text>
          
          <CalendarHeader 
            currentYearMonth={currentYearMonth}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
          />
        </Animated.View>
        
        {/* 로딩 상태 */}
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-3 text-emerald-700">달력 정보를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-10 bg-red-50 rounded-xl shadow-sm">
            <FontAwesome5 name="exclamation-circle" size={30} color="#ef4444" />
            <Text className="mt-3 text-gray-700">{error}</Text>
            <Pressable
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 px-6 rounded-xl mt-4 shadow-sm active:opacity-90"
              onPress={loadPromises}
            >
              <Text className="text-white font-bold">다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <CalendarBody 
              currentYearMonth={currentYearMonth}
              hasPromisesOnDate={hasPromisesOnDate}
              getPromiseCompletionStatus={getPromiseCompletionStatus}
              handleDateSelect={handleDateSelect}
            />
            
            <CalendarLegend />
            
            <CalendarStats 
              monthStats={monthStats}
              completionRate={completionRate}
            />
          </Animated.View>
        )}
      </ScrollView>
      
      {/* 날짜 선택 시 표시되는 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <BlurView intensity={20} tint="dark" className="absolute inset-0" />
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-emerald-700">
                {selectedDate && DateUtils.formatDate(selectedDate)}
              </Text>
              <Pressable
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome5 name="times" size={20} color="#64748b" />
              </Pressable>
            </View>
            
            {selectedPromises.length === 0 ? (
              <View className="p-8 items-center">
                <View className="bg-gray-100 p-6 rounded-full mb-4">
                  <FontAwesome5 name="calendar-times" size={40} color="#94a3b8" />
                </View>
                <Text className="text-gray-600 text-center text-lg mb-4">
                  이 날에는 약속이 없어요.
                </Text>
                <Pressable
                  className="bg-emerald-100 py-3 px-5 rounded-xl active:opacity-90"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setModalVisible(false);
                  }}
                >
                  <Text className="text-emerald-700 text-center font-medium">
                    확인
                  </Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView className="max-h-[400]">
                {selectedPromises.map(promise => {
                  const { icon, color } = PROMISE_TYPES[promise.type] || PROMISE_TYPES.default;
                  return (
                    <View
                      key={promise.id}
                      className={`mb-3 p-4 rounded-2xl ${
                        promise.completed
                          ? 'border border-emerald-200 bg-emerald-50'
                          : 'border border-gray-200 bg-white'
                      } shadow-sm`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mr-4"
                          style={{ 
                            backgroundColor: promise.completed ? Colors.light.leafGreen + '20' : color + '20',
                            shadowColor: promise.completed ? Colors.light.leafGreen : color,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 1.5,
                          }}
                        >
                          <FontAwesome5 
                            name={promise.completed ? 'check-circle' : icon} 
                            size={20} 
                            color={promise.completed ? Colors.light.leafGreen : color} 
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`text-lg font-bold ${
                              promise.completed ? 'text-emerald-700' : 'text-gray-700'
                            }`}
                          >
                            {promise.title}
                          </Text>
                          {promise.description && (
                            <Text className="text-gray-500 mt-1">
                              {promise.description}
                            </Text>
                          )}
                          <View className="flex-row items-center mt-2">
                            <Text className={`text-xs font-medium ${promise.completed ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {promise.completed ? '완료됨' : '진행 중'}
                            </Text>
                            {promise.completed && (
                              <View className="flex-row items-center ml-2">
                                <FontAwesome5 name="star" size={10} color="#fbbf24" />
                                <FontAwesome5 name="star" size={10} color="#fbbf24" style={{ marginLeft: 2 }} />
                                <FontAwesome5 name="star" size={10} color="#fbbf24" style={{ marginLeft: 2 }} />
                              </View>
                            )}
                          </View>
                        </View>
                        <View
                          className={`p-3 rounded-full ${
                            promise.completed
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                          }`}
                        >
                          <FontAwesome5
                            name={promise.completed ? 'check' : 'clock'}
                            size={14}
                            color="white"
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            
            <Pressable
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 rounded-xl mt-4 shadow-sm active:opacity-90"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalVisible(false);
              }}
            >
              <Text className="text-white text-center font-bold">
                확인
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}