// app/(tabs)/calendar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

// 약속 유형별 아이콘과 색상
const PROMISE_TYPES = {
  study: { icon: 'book', color: '#60a5fa' }, // blue-400
  chore: { icon: 'broom', color: '#a78bfa' }, // violet-400
  reading: { icon: 'book-reader', color: '#34d399' }, // emerald-400
  music: { icon: 'music', color: '#f87171' }, // red-400
  exercise: { icon: 'running', color: '#fcd34d' }, // amber-300
  health: { icon: 'tooth', color: '#f472b6' }, // pink-400
  family: { icon: 'home', color: '#fb923c' }, // orange-400
  default: { icon: 'check', color: '#9ca3af' }, // gray-400
};

// 날짜 형식 변환 함수 (YYYY-MM-DD -> MM월 DD일)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

// 현재 날짜 가져오기
const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

// 해당 월의 날짜 수 계산
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

// 해당 월의 첫 날 요일 계산
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay();
};

export default function CalendarScreen() {
  const { isAuthenticated } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPromises, setSelectedPromises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentYearMonth, setCurrentYearMonth] = useState(getCurrentYearMonth());
  const [promisesByDate, setPromisesByDate] = useState({});
  const [monthStats, setMonthStats] = useState({ total: 0, completed: 0 });
  
  // 약속 데이터 로드 (실제 구현 시 API 호출)
  useEffect(() => {
    if (isAuthenticated) {
      loadPromises();
    } else {
      // 비인증 상태일 때는 빈 데이터 설정
      setPromisesByDate({});
      setMonthStats({ total: 0, completed: 0 });
    }
  }, [isAuthenticated, currentYearMonth]);
  
  // 약속 데이터 로드 함수
  const loadPromises = async () => {
    try {
      // 실제 구현 시 API 호출 부분
      // const response = await promiseApi.getMonthlyPromises(
      //   currentYearMonth.year,
      //   currentYearMonth.month
      // );
      
      // 임시 빈 데이터
      const promises: PromiseData[] = [];
      
      // 날짜별 약속 데이터 그룹화
      const groupedPromises = promises.reduce((acc, promise) => {
        if (!acc[promise.date]) {
          acc[promise.date] = [];
        }
        acc[promise.date].push(promise);
        return acc;
      }, {});
      
      setPromisesByDate(groupedPromises);
      
      // 월간 통계 계산
      const total = promises.length;
      const completed = promises.filter(p => p.completed).length;
      setMonthStats({ total, completed });
    } catch (error) {
      console.error('약속 데이터 로드 중 오류:', error);
    }
  };
  
  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    const formattedDate = `${currentYearMonth.year}-${String(currentYearMonth.month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setSelectedPromises(promisesByDate[formattedDate] || []);
    setModalVisible(true);
  };
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentYearMonth(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      } else {
        return { year: prev.year, month: prev.month - 1 };
      }
    });
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentYearMonth(prev => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      } else {
        return { year: prev.year, month: prev.month + 1 };
      }
    });
  };
  
  // 달력 데이터 생성
  const daysInMonth = getDaysInMonth(currentYearMonth.year, currentYearMonth.month);
  const firstDayOfMonth = getFirstDayOfMonth(currentYearMonth.year, currentYearMonth.month);
  
  // 달력에 표시할 날짜 배열 생성
  const calendarDays = [];
  
  // 첫 주의 빈 칸 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // 일자 채우기
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  // 주별로 달력 데이터 그룹화
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  
  calendarDays.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
      // 마지막 주는 남은 칸 채우기
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push([...week]);
      week = [];
    }
  });
  
  // 요일 배열
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 해당 날짜에 약속이 있는지 확인하는 함수
  const hasPromisesOnDate = (day: number) => {
    if (!day) return false;
    const formattedDate = `${currentYearMonth.year}-${String(currentYearMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return promisesByDate[formattedDate] && promisesByDate[formattedDate].length > 0;
  };
  
  // 해당 날짜의 약속 완료 상태 계산
  const getPromiseCompletionStatus = (day: number) => {
    if (!day) return { total: 0, completed: 0 };
    
    const formattedDate = `${currentYearMonth.year}-${String(currentYearMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const promises = promisesByDate[formattedDate] || [];
    
    const total = promises.length;
    const completed = promises.filter(p => p.completed).length;
    
    return { total, completed };
  };
  
  // 완료율 계산
  const completionRate = monthStats.total > 0 
    ? Math.round((monthStats.completed / monthStats.total) * 100) 
    : 0;
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          약속 달력
        </Text>
        
        {/* 월 네비게이션 */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            className="p-2"
            onPress={goToPreviousMonth}
          >
            <FontAwesome5 name="chevron-left" size={20} color={Colors.light.leafGreen} />
          </Pressable>
          
          <Text className="text-xl font-bold text-emerald-700">
            {currentYearMonth.year}년 {currentYearMonth.month}월
          </Text>
          
          <Pressable
            className="p-2"
            onPress={goToNextMonth}
          >
            <FontAwesome5 name="chevron-right" size={20} color={Colors.light.leafGreen} />
          </Pressable>
        </View>
        
        {/* 요일 헤더 */}
        <View className="flex-row bg-emerald-100 rounded-t-xl">
          {weekdays.map((day, index) => (
            <View key={index} className="flex-1 py-2 items-center">
              <Text className={`font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-emerald-700'}`}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        
        {/* 달력 */}
        <View className="border border-emerald-200 rounded-b-xl overflow-hidden mb-4">
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row">
              {week.map((day, dayIndex) => {
                const status = getPromiseCompletionStatus(day);
                return (
                  <Pressable
                    key={dayIndex}
                    className={`flex-1 aspect-square border-t border-r border-emerald-100 ${
                      day ? 'bg-white' : 'bg-gray-50'
                    }`}
                    onPress={() => day && handleDateSelect(day.toString())}
                    disabled={!day}
                  >
                    {day && (
                      <View className="flex-1 p-1">
                        <Text
                          className={`text-right ${
                            dayIndex === 0
                              ? 'text-red-500'
                              : dayIndex === 6
                              ? 'text-blue-500'
                              : 'text-gray-700'
                          } ${hasPromisesOnDate(day) ? 'font-bold' : ''}`}
                        >
                          {day}
                        </Text>
                        
                        {hasPromisesOnDate(day) && (
                          <View className="flex-1 items-center justify-center">
                            <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center">
                              <Text className="text-xs font-medium text-emerald-700">
                                {status.completed}/{status.total}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* 약속 유형 범례 */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-emerald-200">
          <Text className="font-medium text-emerald-700 mb-2">약속 유형</Text>
          <View className="flex-row flex-wrap">
            {Object.entries(PROMISE_TYPES).map(([key, { icon, color }]) => (
              <View key={key} className="flex-row items-center mr-4 mb-2">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-1" style={{ backgroundColor: color + '20' }}>
                  <FontAwesome5 name={icon} size={14} color={color} />
                </View>
                <Text className="text-xs text-gray-700">{
                  key === 'study' ? '공부' :
                  key === 'chore' ? '집안일' :
                  key === 'reading' ? '독서' :
                  key === 'music' ? '음악' :
                  key === 'exercise' ? '운동' :
                  key === 'health' ? '건강' :
                  key === 'family' ? '가족' : '기타'
                }</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* 이번 달 통계 */}
        <View className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
          <Text className="font-medium text-emerald-700 mb-2">이번 달 약속 통계</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700">전체 약속 수:</Text>
            <Text className="font-medium text-emerald-700">{monthStats.total}개</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700">완료한 약속:</Text>
            <Text className="font-medium text-emerald-700">{monthStats.completed}개</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">완료율:</Text>
            <Text className="font-medium text-emerald-700">{completionRate}%</Text>
          </View>
        </View>
        
        {/* 날짜 선택 시 표시되는 모달 */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-white rounded-t-2xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-emerald-700">
                  {selectedDate && formatDate(selectedDate)}
                </Text>
                <Pressable
                  className="p-2"
                  onPress={() => setModalVisible(false)}
                >
                  <FontAwesome5 name="times" size={20} color="#9ca3af" />
                </Pressable>
              </View>
              
              {selectedPromises.length === 0 ? (
                <View className="p-4 items-center">
                  <FontAwesome5 name="calendar-times" size={40} color="#d1d5db" className="mb-2" />
                  <Text className="text-gray-500 text-center">
                    이 날에는 약속이 없어요.
                  </Text>
                </View>
              ) : (
                <ScrollView className="max-h-[400]">
                  {selectedPromises.map(promise => {
                    const { icon, color } = PROMISE_TYPES[promise.type] || PROMISE_TYPES.default;
                    return (
                      <View
                        key={promise.id}
                        className={`mb-3 p-3 rounded-xl border ${
                          promise.completed
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: color + '20' }}
                          >
                            <FontAwesome5 name={icon} size={16} color={color} />
                          </View>
                          <View className="flex-1">
                            <Text
                              className={`text-lg font-medium ${
                                promise.completed ? 'text-emerald-700' : 'text-gray-700'
                              }`}
                            >
                              {promise.title}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                              {promise.description}
                            </Text>
                          </View>
                          <View
                            className={`p-2 rounded-full ${
                              promise.completed
                                ? 'bg-emerald-500'
                                : 'bg-gray-300'
                            }`}
                          >
                            <FontAwesome5
                              name={promise.completed ? 'check' : 'clock'}
                              size={12}
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
                className="bg-emerald-500 py-3 rounded-xl mt-3"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-center font-medium">
                  확인
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}