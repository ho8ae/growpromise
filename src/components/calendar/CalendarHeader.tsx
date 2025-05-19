import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

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
    <View className="flex-row items-center justify-between mb-5 px-4">
      <Pressable
        className="p-2.5 rounded-full active:bg-gray-100 bg-white shadow"
        style={styles.navButton}
        onPress={goToPreviousMonth}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="chevron-left" size={24} color={Colors.light.primary} />
      </Pressable>

      <View className="bg-white px-6 py-2.5 rounded-full shadow" style={styles.monthIndicator}>
        <Text className="text-xl font-bold text-emerald-700">
          {currentYearMonth.year}년 {currentYearMonth.month}월
        </Text>
      </View>

      <Pressable
        className="p-2.5 rounded-full active:bg-gray-100 bg-white shadow"
        style={styles.navButton}
        onPress={goToNextMonth}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="chevron-right" size={24} color={Colors.light.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  navButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthIndicator: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  }
});

export default CalendarHeader;