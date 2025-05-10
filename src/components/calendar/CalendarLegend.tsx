import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { PROMISE_TYPES, getPromiseTypeName } from '../../utils/calendarHelpers';

const CalendarLegend: React.FC = () => {
  return (
    <View className="bg-white rounded-2xl p-5 mb-6 border border-emerald-200 shadow-sm">
      <Text className="font-bold text-lg text-emerald-700 mb-3">약속 유형</Text>
      <View className="flex-row flex-wrap justify-between">
        {Object.entries(PROMISE_TYPES).map(([key, { icon, color }]) => (
          <View key={key} className="flex-row items-center mb-3 w-[48%]">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-2 shadow-sm"
              style={{ 
                backgroundColor: color + '20',
                shadowColor: color,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
              }}
            >
              <FontAwesome5 name={icon} size={16} color={color} />
            </View>
            <Text className="text-gray-700 font-medium">
              {getPromiseTypeName(key as keyof typeof PROMISE_TYPES)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CalendarLegend;