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
  const getTipTitle = () => {
    if (userType === 'PARENT') {
      return "부모님 팁";
    } else {
      return "식물 키우기 팁";
    }
  };

  const getTipDescription = () => {
    if (userType === 'PARENT') {
      return "자녀와 함께 약속을 만들고 성취를 축하해주세요. 스티커와 보상으로 자녀의 성장을 응원해보세요!";
    } else {
      return "약속을 완료하고 매일 물을 주면 식물이 쑥쑥 자라요! 다양한 종류의 식물을 모아 나만의 정원을 만들어보세요.";
    }
  };

  const getMoreTips = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (userType === 'PARENT') {
      Alert.alert(
        '부모님 팁',
        '1. 아이의 연령과 성향에 맞는 약속을 만들어주세요.\n\n' +
        '2. 작은 성취도 크게 칭찬해주세요.\n\n' +
        '3. 정기적으로 보상을 업데이트하여 동기부여를 해주세요.\n\n' +
        '4. 자녀가 식물을 키우는 과정을 함께 지켜봐주세요.\n\n' +
        '5. 인증 요청에 빠르게 응답해 주세요.'
      );
    } else {
      Alert.alert(
        '식물 키우기 팁',
        '1. 매일 물을 주면 식물의 건강도가 올라가요!\n\n' +
        '2. 약속을 완료하면 식물이 성장할 수 있어요.\n\n' +
        '3. 연속으로 물을 주면 더 많은 건강도를 얻을 수 있어요.\n\n' +
        '4. 모든 성장 단계를 완료하면 식물 도감에 기록돼요.\n\n' +
        '5. 다양한 종류의 식물을 모아보세요!'
      );
    }
  };

  return (
    <ActionCard
      icon={<MaterialIcons name="lightbulb-outline" size={22} color={Colors.light.amber} />}
      title={getTipTitle()}
      description={getTipDescription()}
      actionText="더 알아보기"
      color={Colors.light.amber}
      bgColor="#fffbeb"
      onPress={getMoreTips}
    />
  );
};

export default TipsCard;