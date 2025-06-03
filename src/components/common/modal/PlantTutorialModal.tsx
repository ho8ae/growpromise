// src/components/common/PlantTutorialModal.tsx
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import Colors from '../../../constants/Colors';

interface PlantTutorialModalProps {
  visible: boolean;
  onClose: () => void;
  plantName: string;
  plantType: string;
}

interface TutorialPage {
  id: number;
  title: string;
  description: string;
  icon: string;
  iconLibrary: 'FontAwesome' | 'MaterialIcons';
  color: string;
  animation?: string;
}

const { width, height } = Dimensions.get('window');

const tutorialPages: TutorialPage[] = [
  {
    id: 1,
    title: '🌱 식물 키우기 시작!',
    description:
      '축하해요! 새로운 식물 친구가 생겼어요.\n약속을 지키며 함께 성장해보세요!',
    icon: 'seedling',
    iconLibrary: 'FontAwesome',
    color: Colors.light.primary,
    animation: 'bounce',
  },
  {
    id: 2,
    title: '💧 물주기로 경험치 획득',
    description:
      '매일 식물에게 물을 주면\n경험치를 얻을 수 있어요!\n꾸준히 관리해주세요.',
    icon: 'opacity',
    iconLibrary: 'MaterialIcons',
    color: Colors.light.info,
    animation: 'wave',
  },
  {
    id: 3,
    title: '✅ 약속 완료로 빠른 성장',
    description:
      '약속을 지키고 인증하면\n더 많은 경험치를 얻어요!\n식물이 더 빨리 자라납니다.',
    icon: 'check-circle',
    iconLibrary: 'FontAwesome',
    color: Colors.light.secondary,
    animation: 'pulse',
  },
  {
    id: 4,
    title: '🌿 성장 단계별 진화',
    description:
      '경험치가 100이 되면\n식물이 다음 단계로 성장해요!\n최종 진화까지 키워보세요!',
    icon: 'trending-up',
    iconLibrary: 'MaterialIcons',
    color: Colors.light.accent,
    animation: 'scale',
  },
  {
    id: 5,
    title: '🏆 완성된 식물 수집',
    description:
      '완전히 자란 식물은\n컬렉션에 저장돼요!\n다양한 식물을 모아보세요!',
    icon: 'trophy',
    iconLibrary: 'FontAwesome',
    color: Colors.light.warning,
    animation: 'rotate',
  },
];

export default function PlantTutorialModal({
  visible,
  onClose,
  plantName,
  plantType,
}: PlantTutorialModalProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 초기 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // 연속 애니메이션들
      startContinuousAnimations();
    } else {
      // 초기화
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);
      setCurrentPage(0);
    }
  }, [visible]);

  const startContinuousAnimations = () => {
    // 바운스 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 웨이브 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 펄스 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 회전 애니메이션
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  };

  const nextPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentPage < tutorialPages.length - 1) {
      // 페이지 전환 애니메이션
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentPage(currentPage + 1);
    } else {
      // 마지막 페이지에서 완료
      handleComplete();
    }
  };

  const prevPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentPage > 0) {
      // 페이지 전환 애니메이션
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentPage(currentPage - 1);
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 완료 애니메이션
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
    ]).start(() => {
      onClose();
    });
  };

  const getAnimationStyle = (animation?: string) => {
    switch (animation) {
      case 'bounce':
        return {
          transform: [{ translateY: bounceAnim }],
        };
      case 'wave':
        return {
          transform: [
            {
              scale: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            },
          ],
        };
      case 'pulse':
        return {
          transform: [{ scale: pulseAnim }],
        };
      case 'scale':
        return {
          transform: [
            {
              scale: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [1, 1.15],
              }),
            },
          ],
        };
      case 'rotate':
        return {
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        };
      default:
        return {};
    }
  };

  const renderIcon = (page: TutorialPage) => {
    const IconComponent =
      page.iconLibrary === 'FontAwesome' ? FontAwesome : MaterialIcons;

    return (
      <Animated.View
        style={[
          {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: page.color + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            borderWidth: 3,
            borderColor: page.color + '40',
          },
          getAnimationStyle(page.animation),
        ]}
      >
        <IconComponent name={page.icon as any} size={50} color={page.color} />
      </Animated.View>
    );
  };

  const currentPageData = tutorialPages[currentPage];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleComplete}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            margin: 20,
            width: width * 0.9,
            maxWidth: 400,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
        >
          {/* 페이지 인디케이터 */}
          <View style={{ flexDirection: 'row', marginBottom: 24 }}>
            {tutorialPages.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentPage
                      ? Colors.light.primary
                      : Colors.light.disabled,
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>

          {/* 식물 정보 (첫 페이지에만) */}
          {currentPage === 0 && (
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: Colors.light.text,
                  textAlign: 'center',
                }}
              >
                {plantName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.light.textSecondary,
                  textAlign: 'center',
                }}
              >
                {plantType}
              </Text>
            </View>
          )}

          {/* 아이콘 */}
          {renderIcon(currentPageData)}

          {/* 제목 */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: currentPageData.color,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {currentPageData.title}
          </Text>

          {/* 설명 */}
          <Text
            style={{
              fontSize: 16,
              color: Colors.light.text,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            {currentPageData.description}
          </Text>

          {/* 하단 버튼 영역 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* 이전 버튼 */}
            <Pressable
              onPress={prevPage}
              disabled={currentPage === 0}
              style={{
                opacity: currentPage === 0 ? 0.3 : 1,
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: Colors.light.textSecondary,
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                이전
              </Text>
            </Pressable>

            {/* 페이지 정보 */}
            <Text
              style={{
                color: Colors.light.textSecondary,
                fontSize: 14,
              }}
            >
              {currentPage + 1} / {tutorialPages.length}
            </Text>

            {/* 다음/완료 버튼 */}
            <Pressable
              onPress={nextPage}
              style={{
                backgroundColor: currentPageData.color,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
                shadowColor: currentPageData.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {currentPage === tutorialPages.length - 1
                  ? '시작하기 🚀'
                  : '다음'}
              </Text>
            </Pressable>
          </View>

          {/* 건너뛰기 버튼 */}
          <Pressable
            onPress={handleComplete}
            style={{
              marginTop: 16,
              padding: 8,
            }}
          >
            <Text
              style={{
                color: Colors.light.textSecondary,
                fontSize: 14,
                textDecorationLine: 'underline',
              }}
            >
              건너뛰기
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
