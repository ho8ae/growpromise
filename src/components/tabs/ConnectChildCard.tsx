import React from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';

interface ConnectChildCardProps {
  isAuthenticated: boolean;
  userType?: string;
  hasConnectedChildren: boolean;
}

const ConnectChildCard = ({ 
  isAuthenticated, 
  userType, 
  hasConnectedChildren 
}: ConnectChildCardProps) => {
  const router = useRouter();
  
  // 자녀 연결이 없는 부모 계정만 보여주기
  if (!isAuthenticated || userType !== 'PARENT' || hasConnectedChildren) {
    return null;
  }
  
  return (
    <ActionCard
      icon={<MaterialIcons name="people" size={22} color={Colors.light.secondary} />}
      title="자녀 연결하기"
      description="아직 연결된 자녀가 없습니다. 자녀 계정을 연결하고 함께 약속을 관리해보세요!"
      actionText="자녀 계정 연결하기"
      color={Colors.light.secondary}
      bgColor="#f5f3ff"
      onPress={() => {
        router.navigate('/(parent)/generate-code');
      }}
    />
  );
};

export default ConnectChildCard;