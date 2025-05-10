import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import QuickActionItem from '../common/QuickActionItem';
import Colors from '../../constants/Colors';

interface QuickActionGridProps {
  userType?: string;
  handleAuthRequired: () => boolean;
}

const QuickActionGrid = ({ userType, handleAuthRequired }: QuickActionGridProps) => {
  const router = useRouter();

  return (
    <View className="mt-2">
      <Text className="text-gray-700 font-bold text-lg mb-3">빠른 액션</Text>
      <View className="flex-row flex-wrap justify-between">
        <QuickActionItem
          icon={<MaterialIcons name="add-task" size={22} color={Colors.light.leafGreen} />}
          title={userType === 'PARENT' ? '약속 만들기' : '약속 보기'}
          color={Colors.light.leafGreen}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(userType === 'PARENT' ? '/(parent)/create-promise' : '/(child)/promises');
          }}
        />
        
        <QuickActionItem
          icon={<MaterialIcons name="check-circle-outline" size={22} color={Colors.light.sky} />}
          title={userType === 'PARENT' ? '승인하기' : '인증하기'}
          color={Colors.light.sky}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(userType === 'PARENT' ? '/(parent)/approvals' : '/(child)/verify');
          }}
        />
        
        <QuickActionItem
          icon={<MaterialIcons name="emoji-events" size={22} color={Colors.light.stemBrown} />}
          title={userType === 'PARENT' ? '보상 설정' : '보상 보기'}
          color={Colors.light.stemBrown}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(userType === 'PARENT' ? '/(parent)/set-rewards' : '/(child)/rewards');
          }}
        />
        
        <QuickActionItem
          icon={<MaterialIcons name="calendar-today" size={22} color={Colors.light.secondary} />}
          title="달력 보기"
          color={Colors.light.secondary}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate('/(tabs)/calendar');
          }}
        />
      </View>
    </View>
  );
};

export default QuickActionGrid;