import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface ConnectionPromptModalProps {
  visible: boolean;
  onClose: () => void;
  userType: 'PARENT' | 'CHILD';
}

const { width: screenWidth } = Dimensions.get('window');

const ConnectionPromptModal: React.FC<ConnectionPromptModalProps> = ({
  visible,
  onClose,
  userType,
}) => {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
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
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    
    // 약간의 딜레이 후 네비게이션
    setTimeout(() => {
      if (userType === 'PARENT') {
        router.push('/(parent)/generate-code');
      } else {
        router.push('/(auth)/connect');
      }
    }, 200);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const getModalContent = () => {
    if (userType === 'PARENT') {
      return {
        icon: 'child',
        title: '자녀와 연결하세요!',
        description: '자녀와 연결하여 함께 약속을 만들고\n성장하는 즐거움을 경험해보세요.',
        buttonText: '지금 자녀 연결하기!',
        buttonStyle: 'bg-emerald-500 active:bg-emerald-600',
        iconBgStyle: 'bg-emerald-100',
        iconColor: '#10b981',
      };
    } else {
      return {
        icon: 'users',
        title: '부모님과 연결하세요!',
        description: '부모님과 연결하여 함께 약속을 지키고\n칭찬 스티커를 받아보세요.',
        buttonText: '지금 부모님 연결하기!',
        buttonStyle: 'bg-yellow-400 active:bg-yellow-500',
        iconBgStyle: 'bg-yellow-100',
        iconColor: '#FFC800',
      };
    }
  };

  const content = getModalContent();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        className="flex-1 justify-center items-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <Pressable
          className="absolute w-full h-full"
          onPress={handleSkip}
        />
        
        <Animated.View
          className="bg-white rounded-3xl p-8 mx-5 shadow-2xl"
          style={{
            transform: [{ scale: scaleAnim }],
            maxWidth: screenWidth * 0.85,
          }}
        >
          {/* 아이콘 */}
          <View className="items-center mb-6">
            <View className={`w-20 h-20 rounded-full ${content.iconBgStyle} justify-center items-center mb-4`}>
              <FontAwesome5
                name={content.icon}
                size={36}
                color={content.iconColor}
              />
            </View>
          </View>

          {/* 제목 */}
          <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
            {content.title}
          </Text>

          {/* 설명 */}
          <Text className="text-base text-center text-gray-600 leading-6 mb-8">
            {content.description}
          </Text>

          {/* 버튼들 */}
          <View className="gap-3">
            {/* 연결하기 버튼 */}
            <Pressable
              onPress={handleConnect}
              className={`${content.buttonStyle} py-4 px-6 rounded-2xl shadow-lg`}
            >
              <Text className="text-white text-lg font-bold text-center">
                {content.buttonText}
              </Text>
            </Pressable>

            {/* 나중에 하기 버튼 */}
            <Pressable
              onPress={handleSkip}
              className="py-3 active:opacity-70"
            >
              <Text className="text-gray-400 text-sm text-center">
                괜찮아요
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ConnectionPromptModal;