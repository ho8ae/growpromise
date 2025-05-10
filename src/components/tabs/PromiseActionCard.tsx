import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';

interface PromiseActionCardProps {
  userType?: string;
  completedPromises: number;
  totalPromises: number;
  onPress: () => void;
}

const PromiseActionCard = ({ 
  userType, 
  completedPromises, 
  totalPromises, 
  onPress 
}: PromiseActionCardProps) => {
  return (
    <ActionCard
      icon={<MaterialIcons name="assignment" size={22} color={Colors.light.leafGreen} />}
      title={userType === 'PARENT' ? "자녀의 약속" : "오늘의 약속"}
      description={
        completedPromises < totalPromises 
          ? `${totalPromises - completedPromises}개의 약속이 남아있어요!`
          : "모든 약속을 완료했어요!"
      }
      actionText={
        completedPromises < totalPromises 
          ? "약속 확인하기"
          : "보상 확인하기"
      }
      color={Colors.light.leafGreen}
      onPress={onPress}
    />
  );
};

export default PromiseActionCard;