import React, { useState, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';

interface TipsCardProps {
  userType?: string;
}

const TipsCard = ({ userType }: TipsCardProps) => {
  // 팁 목록 (카테고리별로 구분)
  const parentTips = [
    "아이의 연령과 성향에 맞는 약속을 만들어보세요.",
    "작은 성취도 크게 칭찬해주세요.",
    "정기적으로 보상을 업데이트하세요.",
    "인증 요청에 빠르게 응답해주세요.",
    "일관된 규칙과 보상 체계를 유지하세요.",
    "아이와 함께 목표를 설정해보세요."
  ];
  
  const childTips = [
    "매일 물을 주면 식물의 건강도가 올라가요!",
    "약속을 완료하면 식물이 성장해요.",
    "연속으로 물을 주면 더 많은 건강도를 얻어요.",
    "모든 성장 단계를 완료하면 식물 도감에 기록돼요.",
    "다양한 종류의 식물을 모아보세요!",
    "특별 이벤트에 참여하여 희귀 식물을 얻어보세요."
  ];
  
  // 현재 표시할 팁 인덱스
  const [tipIndex, setTipIndex] = useState(0);
  // 애니메이션 값
  const fadeAnim = useState(new Animated.Value(1))[0];
  
  // 팁 자동 변경 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      // 현재 팁을 페이드 아웃
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start(() => {
        // 다음 팁으로 변경
        const tips = userType === 'PARENT' ? parentTips : childTips;
        setTipIndex(prevIndex => (prevIndex + 1) % tips.length);
        
        // 새 팁을 페이드 인
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      });
    }, 6000); // 6초마다 팁 변경
    
    return () => clearInterval(interval);
  }, [userType]);
  
  // 현재 표시할 팁 가져오기
  const getCurrentTip = () => {
    const tips = userType === 'PARENT' ? parentTips : childTips;
    return tips[tipIndex];
  };
  
  // 화면 선택 시 다른 팁으로 변경
  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 현재 팁을 페이드 아웃
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // 다음 팁으로 변경
      const tips = userType === 'PARENT' ? parentTips : childTips;
      setTipIndex(prevIndex => (prevIndex + 1) % tips.length);
      
      // 새 팁을 페이드 인
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };
  
  // 사용자 유형에 따른 색상 설정
  const tipColor = userType === 'PARENT' 
    ? Colors.light.tertiary // 부모 블루
    : Colors.light.info; // 정보 파랑 (아이)
  
  const tipBgColor = userType === 'PARENT'
    ? `${Colors.light.tertiary}10` // 부모 블루의 연한 배경
    : `${Colors.light.info}10`; // 정보 파랑의 연한 배경
  
  const tipBorderColor = userType === 'PARENT'
    ? `${Colors.light.tertiary}30` // 부모 블루의 테두리
    : `${Colors.light.info}30`; // 정보 파랑의 테두리
  
  return (
    <ActionCard
      icon={<MaterialIcons name="lightbulb" size={24} color={Colors.light.info} />}
      title="TIP"
      description={userType === 'PARENT' 
        ? "아이와 함께하는 약속 관리에 도움이 되는 팁이에요." 
        : "식물을 더 잘 키울 수 있는 팁이에요."}
      actionText="다음 팁 보기"
      color={Colors.light.info}
      bgColor="#FFFFFF"
      borderColor={Colors.light.cardBorder}
      onPress={handleCardPress}
      renderExtra={() => (
        <View 
          className="p-4 rounded-xl mb-4" 
          style={{ 
            backgroundColor: tipBgColor,
            borderWidth: 1,
            borderColor: tipBorderColor
          }}
        >
          <Animated.Text 
            className="text-base" 
            style={{ 
              opacity: fadeAnim,
              color: Colors.light.text,
              fontWeight: '500'
            }}
          >
            {getCurrentTip()}
          </Animated.Text>
        </View>
      )}
    />
  );
};

export default TipsCard;