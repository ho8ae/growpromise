import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

// 타입 정의
type YearMonth = {
  year: number;
  month: number;
};

// 컴포넌트 props 인터페이스 정의
interface CalendarBodyProps {
  currentYearMonth: YearMonth;
  hasPromisesOnDate: (day: number | null) => boolean;
  getPromiseCompletionStatus: (day: number | null) => { total: number; completed: number };
  handleDateSelect: (day: number) => void;
}

// 요일 배열
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 관련 유틸리티 함수들
const DateUtils = {
  // 해당 월의 날짜 수 계산
  getDaysInMonth: (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  },

  // 해당 월의 첫 날 요일 계산
  getFirstDayOfMonth: (year: number, month: number): number => {
    return new Date(year, month - 1, 1).getDay();
  },
  
  // 오늘 날짜인지 확인
  isToday: (year: number, month: number, day: number | null): boolean => {
    if (!day) return false;
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() + 1 === month && 
           today.getDate() === day;
  }
};

// 캘린더 데이터 계산 함수
const calculateCalendarData = (year: number, month: number): (number | null)[][] => {
  try {
    const daysInMonth = DateUtils.getDaysInMonth(year, month);
    const firstDayOfMonth = DateUtils.getFirstDayOfMonth(year, month);
    
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
    const weeksArray: (number | null)[][] = [];
    let week: (number | null)[] = [];
    
    calendarDays.forEach((day, index) => {
      week.push(day);
      if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
        // 마지막 주는 남은 칸 채우기
        while (week.length < 7) {
          week.push(null);
        }
        weeksArray.push([...week]);
        week = [];
      }
    });
    
    return weeksArray;
  } catch (error) {
    console.error("달력 데이터 생성 오류:", error);
    return []; // 오류 발생 시 빈 배열 반환
  }
};

// CalendarBody 컴포넌트
function CalendarBody(props: CalendarBodyProps) {
  const { currentYearMonth, hasPromisesOnDate, getPromiseCompletionStatus, handleDateSelect } = props;
  
  // 달력 데이터 생성
  const calendarData = useMemo(() => {
    // 현재 날짜일 경우 빈 배열을 반환하지 않고 오류 방지
    try {
      return calculateCalendarData(currentYearMonth.year, currentYearMonth.month);
    } catch (e) {
      console.error('달력 데이터 계산 오류:', e);
      // 오류 발생 시 빈 배열이 아닌 기본 데이터 반환
      return [[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21], [22, 23, 24, 25, 26, 27, 28], [29, 30, 31, null, null, null, null]];
    }
  }, [currentYearMonth.year, currentYearMonth.month]);
  
  // 날짜 셀 렌더링 함수
  const renderDayCell = (day: number | null, dayIndex: number) => {
    if (!day) {
      return <View key={`empty-${dayIndex}`} className="aspect-square bg-gray-50/30" style={styles.dayCell} />;
    }
    
    try {
      const status = getPromiseCompletionStatus(day);
      const isCurrentDay = DateUtils.isToday(currentYearMonth.year, currentYearMonth.month, day);
      
      // 약속이 있는 날 표시 스타일
      const hasPromises = hasPromisesOnDate(day);
      const allCompleted = hasPromises && status.completed === status.total;
      const hasIncomplete = hasPromises && status.completed < status.total;
      
      return (
        <Pressable
          key={`day-${day}`}
          className={`aspect-square ${isCurrentDay ? 'bg-emerald-50' : 'bg-white'} active:bg-emerald-50`}
          style={styles.dayCell}
          onPress={() => handleDateSelect(day)}
        >
          <View className="flex-1 p-1">
            <Text
              className={`text-center py-1 ${
                dayIndex === 0
                  ? 'text-red-500'
                  : dayIndex === 6
                  ? 'text-blue-500'
                  : 'text-gray-700'
              } ${isCurrentDay ? 'font-bold' : ''}`}
              style={styles.dayText}
            >
              {day}
            </Text>
            
            {hasPromises && (
              <View className="flex-1 items-center justify-center mt-1">
                {allCompleted ? (
                  <View className="h-6 w-6 rounded-full items-center justify-center bg-emerald-500">
                    <MaterialIcons name="check" size={14} color="#ffffff" />
                  </View>
                ) : hasIncomplete ? (
                  <View className="h-5 w-5 items-center justify-center">
                    <Text className="text-xs font-bold text-amber-500">
                      {status.completed}/{status.total}
                    </Text>
                  </View>
                ) : (
                  <View className="h-2 w-2 rounded-full bg-amber-400 mt-1" />
                )}
              </View>
            )}
          </View>
        </Pressable>
      );
    } catch (error) {
      console.error("날짜 셀 렌더링 오류:", error);
      return (
        <Pressable
          key={`day-${day}`}
          className="aspect-square bg-white"
          style={styles.dayCell}
          onPress={() => handleDateSelect(day)}
        >
          <Text className="text-center py-1 text-gray-700">{day}</Text>
        </Pressable>
      );
    }
  };
  
  // 달력 데이터가 없거나 오류 발생 시 기본 출력
  if (!calendarData || calendarData.length === 0) {
    return (
      <View className="rounded-2xl p-4 mb-6 bg-white">
        <Text className="text-center text-gray-500">달력을 불러올 수 없습니다.</Text>
      </View>
    );
  }
  
  return (
    <>
      {/* 요일 헤더 */}
      <View className="flex-row bg-emerald-500 rounded-t-xl">
        {WEEKDAYS.map((day, index) => (
          <View key={`weekday-${index}`} className="flex-1 py-2.5 items-center">
            <Text className="font-bold text-white">
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      {/* 달력 본문 */}
      <View className="overflow-hidden rounded-b-xl">
        {calendarData.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} className="flex-row" style={styles.weekRow}>
            {week.map((day, dayIndex) => renderDayCell(day, dayIndex))}
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  weekRow: {
    borderBottomWidth: 0,
    borderBottomColor: '#e5e7eb',
  }
});

export default CalendarBody;