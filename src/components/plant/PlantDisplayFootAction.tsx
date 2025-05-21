import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

interface PlantActionProps {
  userType: 'parent' | 'child' | 'PARENT' | 'CHILD';
  onWaterPress?: () => void;
  onFertilizePress?: () => void;
  onTalkPress?: () => void;
  onInfoPress?: () => void;
  childId?: string | undefined;

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
  
  
  // 부모용 액션 버튼 렌더링 (대소문자 구분 없이 처리)
  if (userType === 'parent' || userType === 'PARENT') {
    const handleInfoPress = () => {
      if (childId) {
        console.log("Moving to child-plant-detail with childId:", childId);
        
        // 라우팅 시도
        try {
          router.push({
            pathname: '/(parent)/child-plant-detail',
            params: { childId }
          });
        } catch (error) {
          console.error("Navigation error:", error);
          
          // 개발용 알림 (debugging)
          Alert.alert(
            "네비게이션 오류",
            `경로: /(parent)/child-plant-detail\nchildId: ${childId}\n오류: ${error}`
          );
        }
      } else {
        console.warn("자녀 ID가 없습니다");
        Alert.alert("오류", "자녀 ID를 찾을 수 없습니다.");
      }
    };
    
    return (
      <View className="flex-row gap-6 mt-4 items-center justify-center">
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
          // onPress={onWaterPress}
          onPress={() => {
            Alert.alert("현재 물주기는 자녀만 가능합니다.");
            // TODO: 물주기 로직 추가
          }}
        />
        <ActionButton 
          icon="info"
          label="정보"
          color={Colors.light.primary}
          onPress={handleInfoPress}
        />
      </View>
    );
  }
  
  // 자녀용 액션 버튼 렌더링
  return (
    <View className="mt-4 flex-row gap-6 items-center justify-center">
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
        // onPress={onFertilizePress}
        onPress={() => {
          Alert.alert("영양제 기능은 출시 예정입니다.");
          // TODO: 영양제 로직 추가
        }}
      />
      <ActionButton 
        icon="star"
        label="스티커"
        color={Colors.light.secondary}
        onPress={() => {
          router.push('/(child)/rewards')
        }}
      />
      <ActionButton 
        icon="info"
        label="정보"
        color={Colors.light.tertiary}
        onPress={() => router.push('/(child)/plant-detail')}
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
        <MaterialIcons name={icon} size={34} color={color} />
      </View>
      <Text className="text-xs text-gray-600">{label}</Text>
    </TouchableOpacity>
  );
};

export default PlantDisplayFootAction;