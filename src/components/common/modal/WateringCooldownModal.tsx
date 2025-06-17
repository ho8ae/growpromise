// components/common/modal/WateringCooldownModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Text,
  View,
  Dimensions,
} from 'react-native';
import Colors from '../../../constants/Colors';

interface WateringCooldownModalProps {
  visible: boolean;
  onClose: () => void;
  remainingTime: string; // "6시간 30분" 형태로 전달받음
}

const { width: screenWidth } = Dimensions.get('window');

const WateringCooldownModal: React.FC<WateringCooldownModalProps> = ({
  visible,
  onClose,
  remainingTime,
}) => {
  // 애니메이션 값들
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // 디지털 시계 표시용 상태
  const [timeDisplay, setTimeDisplay] = useState('00:00:00');
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  // 남은 시간을 초로 변환하는 함수
  const parseTimeToSeconds = (timeStr: string): number => {
    const hourMatch = timeStr.match(/(\d+)시간/);
    const minuteMatch = timeStr.match(/(\d+)분/);
    
    let totalSec = 0;
    if (hourMatch) totalSec += parseInt(hourMatch[1]) * 3600;
    if (minuteMatch) totalSec += parseInt(minuteMatch[1]) * 60;
    
    return totalSec || 180; // 기본값 3분 (180초)
  };

  // 초를 HH:MM:SS 형식으로 변환하는 함수
  const formatSecondsToDisplay = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (visible) {
      // 초기 시간 설정
      const initialSeconds = parseTimeToSeconds(remainingTime);
      setTotalSeconds(initialSeconds);
      setCurrentSeconds(initialSeconds);
      setTimeDisplay(formatSecondsToDisplay(initialSeconds));

      // 모달 등장 애니메이션
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // 시계 펄스 애니메이션 (1초마다 깜빡)
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      // 진행바 애니메이션 (3초 동안)
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // 카운트다운 타이머
      let currentSec = initialSeconds;
      const countdownInterval = setInterval(() => {
        currentSec -= 1;
        setCurrentSeconds(currentSec);
        setTimeDisplay(formatSecondsToDisplay(currentSec));
        
        if (currentSec <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      // 3초 후 모달 닫기
      const modalTimer = setTimeout(() => {
        hideModal();
      }, 3000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(modalTimer);
        pulseAnimation.stop();
      };
    }
  }, [visible, remainingTime]);

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // 애니메이션 값 리셋
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      pulseAnim.setValue(1);
      progressAnim.setValue(1);
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={hideModal}
    >
      <Animated.View
        className="flex-1 justify-center items-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: opacityAnim,
        }}
      >
        <Animated.View
          className="bg-white rounded-3xl mx-8 p-8 items-center shadow-2xl"
          style={{
            transform: [{ scale: scaleAnim }],
            maxWidth: screenWidth * 0.85,
            minWidth: screenWidth * 0.75,
          }}
        >
          {/* 상단 아이콘 */}
          <View className="mb-6 relative">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.light.info}20` }}
            >
              <MaterialIcons
                name="schedule"
                size={36}
                color={Colors.light.info}
              />
            </View>
            
            {/* 작은 물방울 아이콘 */}
            <View 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.light.info }}
            >
              <MaterialIcons
                name="opacity"
                size={14}
                color="white"
              />
            </View>
          </View>

          {/* 메인 메시지 */}
          <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
            물주기 대기 시간
          </Text>

          <Text className="text-sm text-gray-500 mb-6 text-center">
            식물이 물을 충분히 흡수하고 있어요
          </Text>

          {/* 메인 디지털 시계 */}
          <Animated.View
            className="bg-white rounded-2xl px-6 py-4 mb-6"
            style={{ 
              transform: [{ scale: pulseAnim }],
              minWidth: 200,
            }}
          >
            <Text 
              className="text-center font-mono font-bold text-4xl tracking-wider"
              style={{ 
                color: '#000000',
                fontFamily: 'monospace',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 5,
              }}
            >
              {timeDisplay}
            </Text>
            
            {/* 하단 라벨 */}
            <Text className="text-center text-xs text-gray-400 mt-1 font-mono">
              HH : MM : SS
            </Text>
          </Animated.View>

          {/* 안내 메시지 */}
          <Text className="text-center text-gray-600 mb-4 text-sm leading-5">
            위 시간이 지나면 다시 물을 줄 수 있어요
          </Text>

          {/* 닫힘 안내 */}
          <Text className="text-xs text-gray-400 text-center mb-4">
            잠시 후 자동으로 닫힙니다
          </Text>

          {/* 진행 바 */}
          <View className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <Animated.View
              className="h-full rounded-full"
              style={{
                backgroundColor: Colors.light.info,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default WateringCooldownModal;