import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';

interface CalendarStatsProps {
  monthStats: {
    total: number;
    completed: number;
  };
  completionRate: number;
}

const CalendarStats = ({ monthStats, completionRate }: CalendarStatsProps) => {
  // 완료율에 따른 색상 설정
  const getProgressColor = () => {
    if (completionRate >= 80) return '#10b981'; // 진한 에메랄드
    if (completionRate >= 60) return '#22c55e'; // 녹색
    if (completionRate >= 40) return '#eab308'; // 노란색
    if (completionRate >= 20) return '#f59e0b'; // 주황색
    return '#ef4444';                          // 빨간색
  };
  
  // 완료율에 따른 메시지와 아이콘 설정
  const getFeedbackMessage = () => {
    if (completionRate >= 90) {
      return {
        message: '대단해요! 약속을 완벽하게 지키고 있어요!',
        icon: 'emoji-events',
        color: Colors.light.primary,
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      };
    } else if (completionRate >= 70) {
      return {
        message: '잘하고 있어요! 약속을 성실히 지키고 있네요!',
        icon: 'emoji-events',
        color: Colors.light.primary,
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      };
    } else if (completionRate >= 50) {
      return {
        message: '절반 이상 완료했어요. 계속 노력해봐요!',
        icon: 'thumb-up',
        color: '#EAB308',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else {
      return {
        message: '조금만 더 노력해볼까요? 함께 할 수 있어요!',
        icon: 'emoji-emotions',
        color: '#F97316',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
  };
  
  const feedback = getFeedbackMessage();
  const progressColor = getProgressColor();
  
  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-6" style={styles.container}>
      <View className="px-4 py-3 border-b border-emerald-100">
        <View className="flex-row items-center">
          <MaterialIcons name="bar-chart" size={22} color={Colors.light.primary} />
          <Text className="text-lg font-bold text-emerald-700 ml-2">이번 달 약속 통계</Text>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between mb-5">
          <View className="bg-emerald-50 p-3 rounded-xl w-[48%]" style={styles.statCard}>
            <Text className="text-sm text-gray-600 mb-1">전체 약속</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="assignment" size={17} color={Colors.light.primary} />
              <Text className="text-2xl font-bold text-emerald-700 ml-1">
                {monthStats.total}
              </Text>
            </View>
          </View>
          
          <View className="bg-emerald-50 p-3 rounded-xl w-[48%]" style={styles.statCard}>
            <Text className="text-sm text-gray-600 mb-1">완료한 약속</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="check-circle" size={17} color={Colors.light.primary} />
              <Text className="text-2xl font-bold text-emerald-700 ml-1">
                {monthStats.completed}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="mb-4">
          <View className="flex-row justify-between mb-2 items-center">
            <Text className="text-sm text-gray-700">완료율</Text>
            <Text className="text-sm font-bold text-emerald-700">{completionRate}%</Text>
          </View>
          
          <View className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            {completionRate > 0 && (
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${completionRate}%`,
                  backgroundColor: progressColor
                }}
              />
            )}
          </View>
        </View>
        
        {/* 칭찬 메시지 */}
        {monthStats.total > 0 && (
          <View className={`p-3 rounded-xl border mt-1 ${feedback.bgColor} ${feedback.borderColor}`}>
            <View className="flex-row items-center">
              <MaterialIcons 
                name={feedback.icon as any} 
                size={18} 
                color={feedback.color} 
              />
              <Text className={`ml-2 font-medium ${feedback.textColor}`}>
                {feedback.message}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCard: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  }
});

export default React.memo(CalendarStats);