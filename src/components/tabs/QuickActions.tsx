// src/components/tabs/PlantStatus.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface PlantStatusProps {
  progress: number;
  total: number;
}

const PlantStatus: React.FC<PlantStatusProps> = ({ progress = 0, total = 15 }) => {
  // 진행률 계산 (0-100%)
  const percentage = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  
  // 경험치 표시 계산
  const displayProgress = `${progress}/${total}`;
  
  return (
    <View className="mx-4 mt-4 mb-2 bg-indigo-100 rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <MaterialIcons name="star" size={20} color="#F9A825" />
          <Text className="text-indigo-900 font-semibold text-base ml-1.5">
            약속 완료까지
          </Text>
        </View>
        <Text className="text-indigo-700 font-semibold">
          {displayProgress}
        </Text>
      </View>
      
      {/* 진행 바 */}
      <View className="h-3 bg-indigo-200 rounded-full overflow-hidden">
        <View 
          className="h-full bg-indigo-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
      
      {/* 남은 경험치 표시 */}
      <Text className="text-xs text-indigo-600 mt-1.5 text-right">
        {total - progress}xp 남음
      </Text>
    </View>
  );
};

export default PlantStatus;