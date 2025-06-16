import { Plant } from '@/src/api/modules/plant';
import { Toast } from '@/src/components/common/Toast';
import { useToast } from '@/src/hooks/useToast';
import { usePendingCount } from '@/src/hooks/usePendingVerifications';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View, Animated } from 'react-native';
import Colors from '../../constants/Colors';

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
  
  //  인증 대기 개수 가져오기 (새로운 훅 사용)
  const { count: pendingCount, isLoading: isPendingLoading } = usePendingCount(childId);

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

    const handleDashboardPress = () => {
      router.push('/(parent)');
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
          {/*  대시보드 버튼 (배지 포함) */}
          <ActionButtonWithBadge
            icon="dashboard"
            label="대시보드"
            color={Colors.light.tertiary}
            onPress={handleDashboardPress}
            badgeCount={userType === 'parent' || userType === 'PARENT' ? pendingCount : 0}
            isLoading={isPendingLoading}
          />
          
          <ActionButton
            icon="star"
            label="칭찬 스티커"
            color={Colors.light.secondary}
            onPress={() =>
              router.push({
                pathname: '/(parent)/child-rewards',
                params: { childId },
              })
            }
          />
          
          {plant !== null ? (
            <ActionButton
              icon="opacity"
              label="물주기"
              color={Colors.light.info}
              onPress={() => {
                toast.info('현재 물주기는 자녀만 가능합니다.');
              }}
            />
          ) : (
            <ActionButton
              icon="opacity"
              label="물주기"
              color={Colors.light.textSecondary}
              onPress={() => {
                toast.info('아직 자녀의 식물이 없습니다.');
              }}
            />
          )}
          
          {plant !== null ? (
            <ActionButton
              icon="info"
              label="정보"
              color={Colors.light.primary}
              onPress={handleInfoPress}
            />
          ) : (
            <ActionButton
              icon="info"
              label="정보"
              color={Colors.light.textSecondary}
              onPress={() => {
                toast.info('아직 자녀의 식물이 없습니다.');
              }}
            />
          )}
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
            router.push('/(child)/plant-collection');
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

//  배지가 포함된 액션 버튼 컴포넌트
interface ActionButtonWithBadgeProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  color: string;
  onPress?: () => void;
  badgeCount?: number;
  isLoading?: boolean;
}

const ActionButtonWithBadge: React.FC<ActionButtonWithBadgeProps> = ({
  icon,
  label,
  color,
  onPress,
  badgeCount = 0,
  isLoading = false,
}) => {
  // 배지 애니메이션
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (badgeCount > 0 && !isLoading) {
      // 배지가 나타날 때 스케일 애니메이션
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // 계속 깜빡이는 펄스 애니메이션 (긴급한 경우)
      if (badgeCount >= 3) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();

        return () => {
          pulseAnimation.stop();
        };
      }
    }
  }, [badgeCount, isLoading, scaleAnim, pulseAnim]);

  // 로딩 애니메이션
  React.useEffect(() => {
    if (isLoading) {
      const loadingAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      loadingAnimation.start();

      return () => {
        loadingAnimation.stop();
        rotateAnim.setValue(0);
      };
    }
  }, [isLoading, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      className="items-center relative"
      onPress={onPress}
      disabled={!onPress || isLoading}
    >
      <View
        className="w-20 h-20 rounded-xl items-center justify-center mb-1 relative"
        style={{ backgroundColor: `${color}20` }} // 20% 투명도
      >
        <Animated.View
          style={{
            transform: isLoading ? [{ rotate }] : [],
          }}
        >
          <MaterialIcons 
            name={icon} 
            size={34} 
            color={isLoading ? `${color}60` : color} 
          />
        </Animated.View>
        
        {/*  인증 대기 배지 */}
        {badgeCount > 0 && !isLoading && (
          <Animated.View
            className="absolute -top-2 -right-2 rounded-full min-w-[20px] h-6 items-center justify-center px-1 shadow-sm"
            style={{
              backgroundColor: badgeCount >= 5 ? '#FF4B4B' : badgeCount >= 3 ? '#FF8C00' : '#FF4B4B',
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim },
              ],
            }}
          >
            <Text className="text-white text-xs font-bold leading-none">
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </Animated.View>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <View className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full items-center justify-center">
            <View className="w-2 h-2 bg-white rounded-full" />
          </View>
        )}
      </View>
      
      <Text className="text-xs text-gray-600">{label}</Text>
    </TouchableOpacity>
  );
};

// 기본 액션 버튼 컴포넌트
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