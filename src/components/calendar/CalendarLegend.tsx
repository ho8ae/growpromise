import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PROMISE_TYPES, getPromiseTypeName } from '../../utils/calendarHelpers';

const CalendarLegend = () => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4" style={styles.legendContainer}>
      <Text className="font-bold text-base text-emerald-700 mb-3">약속 유형 안내</Text>
      
      <View className="flex-row flex-wrap justify-between">
        {Object.entries(PROMISE_TYPES).map(([key, { icon, color }]) => (
          key !== 'default' && (
            <View key={key} className="flex-row items-center mb-3 w-[47%]">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ 
                  backgroundColor: color + '10',
                  borderWidth: 1,
                  borderColor: color + '30',
                }}
              >
                <MaterialIcons name={icon as any} size={16} color={color} />
              </View>
              <Text className="text-gray-700 text-sm">
                {getPromiseTypeName(key as keyof typeof PROMISE_TYPES)}
              </Text>
            </View>
          )
        ))}
      </View>
      
      <View className="mt-1 pt-3 border-t border-gray-100">
        <Text className="font-medium text-sm text-emerald-700 mb-3">약속 완료 상태</Text>
        <View className="flex-row justify-between">
          <View className="flex-row items-center mb-2 w-[47%]">
            <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center mr-2">
              <MaterialIcons name="check" size={14} color="#ffffff" />
            </View>
            <Text className="text-gray-700 text-sm">모두 완료</Text>
          </View>
          
          <View className="flex-row items-center mb-2 w-[47%]">
            <View className="w-6 h-6 rounded-full bg-amber-400 items-center justify-center mr-2">
              <Text className="text-xs font-bold text-white">1/2</Text>
            </View>
            <Text className="text-gray-700 text-sm">일부 완료</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  }
});

export default React.memo(CalendarLegend);