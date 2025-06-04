import { Plant } from '@/src/api/modules/plant';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useToast } from '@/src/hooks/useToast';
import { Toast } from '@/src/components/common/Toast';

interface PlantActionProps {
  plant: Plant | null;
  userType: 'parent' | 'child' | 'PARENT' | 'CHILD';
  onWaterPress?: () => void;
  onFertilizePress?: () => void;
  onTalkPress?: () => void;
  onInfoPress?: () => void;
  childId?: string | undefined;
}

const PlantDisplayFootAction: React.FC<PlantActionProps> = ({
  plant,
  userType,
  onWaterPress,
  onFertilizePress,
  onTalkPress,
  onInfoPress,
  childId,
}) => {
  const router = useRouter();
  const toast = useToast();

  // 부모용 액션 버튼 렌더링 (대소문자 구분 없이 처리)
  if (userType === 'parent' || userType === 'PARENT') {
    const handleInfoPress = () => {
      if (childId) {
        console.log('Moving to child-plant-detail with childId:', childId);

        // 라우팅 시도
        try {
          router.push({
            pathname: '/(parent)/child-plant-detail',
            params: { childId },
          });
        } catch (error) {
          console.error('Navigation error:', error);

          // 개발용 알림 (debugging)
          Alert.alert(
            '네비게이션 오류',
            `경로: /(parent)/child-plant-detail\nchildId: ${childId}\n오류: ${error}`,
          );
        }
      } else {
        toast.error('자녀 ID를 찾을 수 없습니다.');
      }
    };

    return (
      <>
        {/* Toast 컴포넌트 추가 */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          translateY={toast.translateY}
          opacity={toast.opacity}
          onHide={toast.hideToast}
        />
        
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
            onPress={() =>
              router.push({
                pathname: '/(parent)/child-rewards',
                params: { childId },
              })
            }
          />
          <ActionButton
            icon="opacity"
            label="물주기"
            color={Colors.light.info}
            onPress={() => {
              toast.info('현재 물주기는 자녀만 가능합니다.');
            }}
          />
          <ActionButton
            icon="info"
            label="정보"
            color={Colors.light.primary}
            onPress={handleInfoPress}
          />
        </View>
      </>
    );
  }

  // 자녀용 액션 버튼 렌더링
  return (
    <>
      {/* Toast 컴포넌트 추가 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        translateY={toast.translateY}
        opacity={toast.opacity}
        onHide={toast.hideToast}
      />
      
      <View className="mt-4 flex-row gap-6 items-center justify-center">
      {plant !== null ? (
        <ActionButton
          icon="opacity"
          label="물주기"
          color={Colors.light.info}
          onPress={onWaterPress}
        />
      ) : (
        <ActionButton
          icon="opacity"
          label="물주기"
          color={Colors.light.textSecondary}
          onPress={() => {
            toast.warning('식물이 없습니다.');
          }}
        />
      )}
        <ActionButton
          icon="book"
          label="식물 도감"
          color={Colors.light.primary}
          onPress={() => {
            router.push('/(child)/plant-collection')
          }}
        />
        <ActionButton
          icon="star"
          label="스티커"
          color={Colors.light.secondary}
          onPress={() => {
            router.push('/(child)/rewards');
          }}
        />
        {plant !== null ? (
          <ActionButton
            icon="info"
            label="정보"
            color={Colors.light.tertiary}
            onPress={() => router.push('/(child)/plant-detail')}
          />
        ) : (
          <ActionButton 
            icon="info" 
            label="정보" 
            color={Colors.light.textSecondary} 
            onPress={() => {
              toast.info('정보를 확인할 수 없습니다.');
            }}
          />
        )}
      </View>
    </>
  );
};

// 액션 버튼 컴포넌트
interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  color: string;
  onPress?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  color,
  onPress,
}) => {
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