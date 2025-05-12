import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import QuickActionItem from '../common/QuickActionItem';

interface QuickActionGridProps {
  userType?: string;
  handleAuthRequired: () => boolean;
  childId? : string | undefined;
}

const QuickActionGrid = ({
  userType,
  handleAuthRequired,
  childId,
}: QuickActionGridProps) => {
  const router = useRouter();

  return (
    <View className="mt-2">
      <Text className="text-gray-700 font-bold text-lg mb-3">빠른 액션</Text>
      <View className="flex-row flex-wrap justify-between">
        {/* 약속 관련 액션 */}
        <QuickActionItem
          icon={
            <MaterialIcons
              name="add-task"
              size={22}
              color={Colors.light.leafGreen}
            />
          }
          title={userType === 'PARENT' ? '약속 만들기' : '약속 보기'}
          color={Colors.light.leafGreen}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(
              userType === 'PARENT'
                ? '/(parent)/create-promise'
                : '/(child)/promises',
            );
          }}
        />

        {/* 인증/승인 액션 */}
        <QuickActionItem
          icon={
            <MaterialIcons
              name="check-circle-outline"
              size={22}
              color={Colors.light.sky}
            />
          }
          title={userType === 'PARENT' ? '승인하기' : '인증하기'}
          color={Colors.light.sky}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(
              userType === 'PARENT' ? '/(parent)/approvals' : '/(child)/verify',
            );
          }}
        />

        {/* 보상 관련 액션 */}
        <QuickActionItem
          icon={
            <MaterialIcons
              name="emoji-events"
              size={22}
              color={Colors.light.stemBrown}
            />
          }
          title={userType === 'PARENT' ? '보상 설정' : '보상 보기'}
          color={Colors.light.stemBrown}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(
              userType === 'PARENT'
                ? '/(parent)/set-rewards'
                : '/(child)/rewards',
            );
          }}
        />

        {/* 식물 도감 액션 - 수정됨 */}
        <QuickActionItem
          icon={
            <MaterialIcons
              name="eco"
              size={22}
              color={Colors.light.secondary}
            />
          }
          title="식물 도감"
          color={Colors.light.secondary}
          onPress={() => {
            if (handleAuthRequired()) return;
            router.navigate(
              userType === 'PARENT'
                ? '/(parent)/index'
                : '/(child)/plant-collection',
            );
          }}
        />
      </View>
    </View>
  );
};

export default QuickActionGrid;
