import React from 'react';
import { Pressable, Text, View } from 'react-native';
// FontAwesome5 대신 '@expo/vector-icons'에서 직접 Feather 아이콘을 가져옵니다
import { AntDesign } from '@expo/vector-icons';

// 색상을 직접 상수로 정의
const COLORS = {
  leafGreen: '#10b981',
};

interface CalendarHeaderProps {
  currentYearMonth: {
    year: number;
    month: number;
  };
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

const CalendarHeader = ({
  currentYearMonth,
  goToPreviousMonth,
  goToNextMonth,
}: CalendarHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between mb-5 mx-2">
      <Pressable
        className="bg-white p-3 rounded-full shadow-sm active:bg-gray-100"
        onPress={goToPreviousMonth}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <AntDesign name="leftsquareo" size={24} color={COLORS.leafGreen} />
      </Pressable>

      <View className="bg-emerald-50 px-6 py-2 rounded-full border border-emerald-200">
        <Text className="text-xl font-bold text-emerald-700">
          {currentYearMonth.year}년 {currentYearMonth.month}월
        </Text>
      </View>

      <Pressable
        className="bg-white p-3 rounded-full shadow-sm active:bg-gray-100"
        onPress={goToNextMonth}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <AntDesign name="rightsquareo" size={24} color={COLORS.leafGreen} />
      </Pressable>
    </View>
  );
};

export default CalendarHeader;
