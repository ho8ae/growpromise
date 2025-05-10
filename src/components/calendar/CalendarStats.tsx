import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface CalendarStatsProps {
  monthStats: {
    total: number;
    completed: number;
  };
  completionRate: number;
}

const CalendarStats: React.FC<CalendarStatsProps> = ({ monthStats, completionRate }) => {
  return (
    <View className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 mb-6 border border-emerald-200 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-emerald-200 p-3 rounded-full mr-3 shadow-sm">
          <FontAwesome5 name="chart-pie" size={16} color={Colors.light.leafGreen} />
        </View>
        <Text className="text-xl font-bold text-emerald-700">이번 달 약속 통계</Text>
      </View>
      
      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-gray-700 font-medium text-base">전체 약속 수:</Text>
        <View className="bg-white px-4 py-2 rounded-full border border-emerald-200">
          <Text className="font-bold text-emerald-700">{monthStats.total}개</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-gray-700 font-medium text-base">완료한 약속:</Text>
        <View className="bg-white px-4 py-2 rounded-full border border-emerald-200">
          <Text className="font-bold text-emerald-700">{monthStats.completed}개</Text>
        </View>
      </View>
      
      <View className="mt-1 mb-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-700 font-medium text-base">완료율:</Text>
          <Text className="font-bold text-emerald-700">{completionRate}%</Text>
        </View>
        
        <View className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <View 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
            style={{ width: `${completionRate}%` }}
          />
        </View>
      </View>
      
      {/* 칭찬 메시지 */}
      {monthStats.total > 0 && (
        <View className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-2">
          <Text className="text-amber-800 text-center font-medium">
            {completionRate >= 90 
              ? '정말 잘하고 있어요! 약속을 아주 잘 지키고 있네요! 👏'
              : completionRate >= 70 
                ? '대단해요! 약속을 잘 지키고 있어요! 👍'
                : completionRate >= 50 
                  ? '절반 이상 완료했어요. 계속 잘 해봐요! 😊'
                  : '조금만 더 노력해볼까요? 할 수 있어요! 💪'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CalendarStats;