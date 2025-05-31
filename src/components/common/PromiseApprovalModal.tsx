// src/components/common/PromiseApprovalModal.tsx
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';

interface PromiseApprovalModalProps {
  visible: boolean;
  onClose: () => void;
  approved: boolean; // true: 승인됨, false: 거절됨
  childName?: string;
  promiseTitle?: string;
  experienceGained?: number;
}

const { width, height } = Dimensions.get('window');

export default function PromiseApprovalModal({
  visible,
  onClose,
  approved,
  childName = '자녀',
  promiseTitle = '약속',
  experienceGained = 0,
}: PromiseApprovalModalProps) {
  // 애니메이션 값들
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 햅틱 피드백
      Haptics.notificationAsync(
        approved 
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
      
      // 순차적인 애니메이션 시작
      Animated.sequence([
        // 1. 모달 배경 페이드인
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // 2. 아이콘 바운스 애니메이션
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // 승인된 경우에만 축하 애니메이션
      if (approved) {
        // 3. 바운스 효과
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start();

        // 4. 반짝이 효과
        Animated.loop(
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          { iterations: 2 }
        ).start();

        // 5. 색종이 효과
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // 초기화
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
      fadeAnim.setValue(0);
      sparkleAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible, approved]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 닫기 애니메이션
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8],
  });

  // 색종이 위치들 (승인된 경우에만)
  const confettiPositions = approved ? [
    { left: width * 0.1, top: height * 0.2 },
    { left: width * 0.3, top: height * 0.15 },
    { left: width * 0.7, top: height * 0.18 },
    { left: width * 0.9, top: height * 0.22 },
    { left: width * 0.2, top: height * 0.7 },
    { left: width * 0.8, top: height * 0.75 },
  ] : [];

  const iconColor = approved ? Colors.light.primary : Colors.light.error;
  const iconName = approved ? 'check' : 'times';
  const title = approved ? '🎉 승인 완료!' : '😔 거절됨';
  const message = approved 
    ? `${childName}의 "${promiseTitle}" 약속을 승인했습니다!`
    : `${childName}의 "${promiseTitle}" 약속을 거절했습니다.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
        }}
      >
        {/* 색종이 효과 (승인된 경우에만) */}
        {approved && confettiPositions.map((pos, index) => (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, height],
                  }),
                },
                {
                  rotate: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '720deg'],
                  }),
                },
              ],
              opacity: confettiAnim.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: index % 2 === 0 ? Colors.light.secondary : Colors.light.primary,
                borderRadius: 4,
              }}
            />
          </Animated.View>
        ))}

        {/* 메인 모달 */}
        <Animated.View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            margin: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            transform: [
              { scale: scaleAnim },
              { translateY: bounceTransform },
            ],
          }}
        >
          {/* 상태 아이콘 */}
          <Animated.View
            style={{
              transform: approved ? [
                { rotate: sparkleRotate },
                { scale: sparkleScale },
              ] : [{ scale: scaleAnim }],
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: iconColor,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: iconColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <FontAwesome name={iconName} size={40} color="white" />
            </View>
          </Animated.View>

          {/* 제목 */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: iconColor,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>

          {/* 메시지 */}
          <Text
            style={{
              fontSize: 16,
              color: Colors.light.text,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: approved ? 8 : 16,
            }}
          >
            {message}
          </Text>

          {/* 경험치 정보 (승인된 경우에만) */}
          {approved && experienceGained > 0 && (
            <View
              style={{
                backgroundColor: Colors.light.primary + '15',
                borderRadius: 12,
                padding: 16,
                marginVertical: 16,
                borderWidth: 1,
                borderColor: Colors.light.primary + '30',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.light.primary }}>
                  🌱 +{experienceGained} 경험치 획득!
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.light.textSecondary,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                식물이 성장했어요!
              </Text>
            </View>
          )}

          {/* 부모용 추가 정보 */}
          <View
            style={{
              backgroundColor: approved ? Colors.light.primary + '10' : Colors.light.error + '10',
              borderRadius: 12,
              padding: 16,
              marginVertical: 8,
              borderWidth: 1,
              borderColor: approved ? Colors.light.primary + '20' : Colors.light.error + '20',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: Colors.light.textSecondary,
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              {approved 
                ? '✨ 자녀에게 스티커가 지급되었습니다'
                : '📝 자녀에게 거절 사유가 전달되었습니다'
              }
            </Text>
          </View>

          {/* 확인 버튼 */}
          <Pressable
            onPress={handleClose}
            style={{
              backgroundColor: iconColor,
              paddingHorizontal: 32,
              paddingVertical: 12,
              borderRadius: 25,
              shadowColor: iconColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              확인 👍
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}