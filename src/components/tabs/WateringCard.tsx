import React from 'react';
import { Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';

interface WateringCardProps {
  handleAuthRequired: () => boolean;
}

const WateringCard = ({ handleAuthRequired }: WateringCardProps) => {
  return (
    <ActionCard
      icon={<MaterialIcons name="opacity" size={22} color={Colors.light.sky} />}
      title="오늘의 물주기"
      description="식물에게 물을 주면 더 빨리 성장해요!"
      actionText="물주기"
      color={Colors.light.sky}
      onPress={() => {
        if (handleAuthRequired()) return;
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        Alert.alert('물주기 성공!', '식물이 쑥쑥 자랄거에요!');
      }}
    />
  );
};

export default WateringCard;