// components/plant/PlantDisplayFootAction.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';



interface PlantActionProps {
  userType: 'parent' | 'child';
  onWaterPress?: () => void;
  onFertilizePress?: () => void;
  onTalkPress?: () => void;
  onInfoPress?: () => void;
  childId?: string;
}

const PlantDisplayFootAction: React.FC<PlantActionProps> = ({
  userType,
  onWaterPress,
  onFertilizePress,
  onTalkPress,
  onInfoPress,
  childId,
}) => {
  const router = useRouter();
  
  // 부모용 액션 버튼 렌더링
  if (userType === 'parent') {
    return (
      <View className="flex-row gap-6 mt-4">
        <ActionButton 
          icon="dashboard"
          label="대시보드"
          color={Colors.light.tertiary}
          onPress={() => router.push('/(parent)')}
        />
        <ActionButton 
          icon="star"
          label="보상"
          color={Colors.light.secondary}
          onPress={() => router.push({
            pathname: '/(parent)/child-rewards',
            params: { childId }
          })}
        />
        <ActionButton 
          icon="opacity"
          label="물주기"
          color={Colors.light.info}
          onPress={onWaterPress}
        />
        <ActionButton 
          icon="info"
          label="자세히"
          color={Colors.light.primary}
          onPress={onInfoPress}
        />
      </View>
    );
  }
  
  // 자녀용 액션 버튼 렌더링
  return (
    <View className="mt-4 flex-row gap-6">
      <ActionButton 
        icon="opacity"
        label="물주기"
        color={Colors.light.info}
        onPress={onWaterPress}
      />
      <ActionButton 
        icon="eco"
        label="영양제"
        color={Colors.light.primary}
        onPress={onFertilizePress}
      />
      <ActionButton 
        icon="chat"
        label="대화하기"
        color={Colors.light.secondary}
        onPress={onTalkPress}
      />
      <ActionButton 
        icon="info"
        label="정보"
        color={Colors.light.tertiary}
        onPress={onInfoPress}
      />
    </View>
  );
};

// 액션 버튼 컴포넌트
interface ActionButtonProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    color: string;
    onPress?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, onPress }) => {
  return (
    <TouchableOpacity 
      className="items-center" 
      onPress={onPress}
      disabled={!onPress}
    >
      <View 
        className="w-20 h-20 rounded-xl items-center justify-center mb-1"
        style={{ backgroundColor: `${color}20` }} // 20% 투명도
      >
        <MaterialIcons name={icon} size={38} color={color} />
      </View>
      <Text className="text-xs text-gray-600">{label}</Text>
    </TouchableOpacity>
  );
};

export default PlantDisplayFootAction;