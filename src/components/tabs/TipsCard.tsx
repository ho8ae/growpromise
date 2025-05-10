import React from 'react';
import { Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';

interface TipsCardProps {
  userType?: string;
}

const TipsCard = ({ userType }: TipsCardProps) => {
  return (
    <ActionCard
      icon={<MaterialIcons name="lightbulb-outline" size={22} color={Colors.light.amber} />}
      title="사용팁"
      description={`식물을 터치하면 ${userType === 'PARENT' ? '부모' : '아이'} 화면으로 이동합니다. 약속을 많이 지킬수록 식물이 쑥쑥 자라요!`}
      actionText="더 알아보기"
      color={Colors.light.amber}
      bgColor="#fffbeb"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
          '도움말',
          '약속을 등록하고 완료하면 캐릭터가 성장합니다! 더 많은 도움말은 설정 탭에서 확인할 수 있어요.',
        );
      }}
    />
  );
};

export default TipsCard;