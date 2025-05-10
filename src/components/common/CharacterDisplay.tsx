import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator, 
  Animated, 
  Easing, 
  Pressable, 
  Text, 
  View 
} from 'react-native';
import Colors from '../../constants/Colors';

interface CharacterDisplayProps {
  characterStage: number;
  completedPromises: number;
  totalPromises: number;
  userType: 'parent' | 'child';
  isLoading?: boolean;
  onPress?: () => void;
}

// 안전한 아이콘 렌더링 함수
const renderIcon = (name: string, size: number, color: string) => {
  switch (name) {
    case 'seedling':
      return <MaterialIcons name="grass" size={size} color={color} />;
    case 'spa':
      return <MaterialIcons name="eco" size={size} color={color} />;
    case 'leaf':
      return <MaterialIcons name="eco" size={size} color={color} />;
    case 'tree':
      return <MaterialIcons name="nature" size={size} color={color} />;
    case 'apple-alt':
      return (
        <MaterialIcons name="emoji-food-beverage" size={size} color={color} />
      );
    case 'user-tie':
      return <MaterialIcons name="person" size={size} color={color} />;
    case 'child':
      return (
        <MaterialCommunityIcons name="human-child" size={size} color={color} />
      );
    default:
      return <MaterialIcons name="help" size={size} color={color} />;
  }
};

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  characterStage,
  completedPromises,
  totalPromises,
  userType,
  isLoading = false,
  onPress,
}) => {
  // 애니메이션 값 설정
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);
  
  // 터치 시 크기 애니메이션
  const touchScaleAnim = useRef(new Animated.Value(1)).current;

  // 캐릭터 단계에 따른 이미지 가져오기
  const getCharacterImage = () => {
    switch (characterStage) {
      case 1:
        return require('../../assets/images/character/level_1.png');
      case 2:
        // 만약 다른 레벨 이미지가 있다면 추가
        return require('../../assets/images/character/level_2.png');
      case 3:
        return require('../../assets/images/character/level_3.png');
      case 4:
        return require('../../assets/images/character/level_5.png');
      default:
        return require('../../assets/images/character/level_1.png');
    }
  };

  // 캐릭터 단계에 따른 크기
  const getPlantSize = () => {
    switch (characterStage) {
      case 1:
        return { width: 100, height: 100 };
      case 2:
        return { width: 110, height: 110 };
      case 3:
        return { width: 120, height: 120 };
      case 4:
        return { width: 130, height: 130 };
      default:
        return { width: 140, height: 140 };
    }
  };

  // 캐릭터 단계에 따른 아이콘 (이미지 없을 때 대체용)
  const getPlantIcon = () => {
    switch (characterStage) {
      case 1:
        return 'seedling';
      case 2:
        return 'spa';
      case 3:
        return 'leaf';
      case 4:
        return 'tree';
      default:
        return 'apple-alt';
    }
  };

  // 애니메이션 효과
  useEffect(() => {
    // 부드러운 바운스 효과
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 미묘한 회전 효과
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 주기적인 팝 효과
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }, 10000); // 10초마다 실행

    return () => clearInterval(interval);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  // 사용자 유형에 따른 다른 색상표 적용
  const getThemeColors = () => {
    return userType === 'parent' 
      ? { 
          primary: Colors.light.leafGreen, 
          secondary: Colors.light.stemBrown,
          light: '#d1fae5',
          accent: '#047857'
        }
      : { 
          primary: Colors.light.leafGreen, 
          secondary: Colors.light.amber,
          light: '#d1fae5',
          accent: '#047857' 
        };
  };

  const colors = getThemeColors();
  const plantSize = getPlantSize();
  const characterImage = getCharacterImage();

  // 터치 시 크기 변경 애니메이션
  const handlePressIn = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(touchScaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(touchScaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  if (isLoading) {
    return (
      <View className="rounded-3xl overflow-hidden bg-white shadow-md">
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color={Colors.light.leafGreen} />
          <Text className="mt-3 text-emerald-700">
            데이터를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  const getCharacterTitle = () => {
    const titles = ['씨앗', '새싹', '어린 나무', '큰 나무', '열매 맺은 나무'];
    return titles[characterStage - 1] || '씨앗';
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        className="rounded-3xl overflow-hidden shadow-md border border-gray-200"
        style={{ 
          transform: [{ scale: touchScaleAnim }] 
        }}
      >
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* 상단 타이틀 영역 */}
          <View className="px-5 pt-5 pb-2 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View 
                className="rounded-full p-2 mr-2"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                {renderIcon(
                  userType === 'parent' ? 'user-tie' : 'child',
                  18,
                  colors.primary
                )}
              </View>
              <Text className="font-bold text-lg" style={{ color: colors.primary }}>
                {userType === 'parent' ? '부모님 모드' : '어린이 모드'}
              </Text>
            </View>
            <View 
              className="bg-white rounded-full h-8 px-3 border flex-row items-center"
              style={{ borderColor: colors.primary }}
            >
              <Text className="font-semibold" style={{ color: colors.primary }}>
                레벨 {characterStage}
              </Text>
            </View>
          </View>

          {/* 캐릭터 이미지 영역 */}
          <View className="items-center px-4">
            <Text className="text-center font-bold text-lg mb-2" style={{ color: colors.primary }}>
              {getCharacterTitle()}
            </Text>
            <View className="relative items-center">
              <Animated.View
                style={{
                  transform: [
                    { translateY: bounceAnim },
                    { rotate },
                    { scale: scaleAnim },
                  ],
                }}
                className="items-center justify-center mb-2"
              >
                {/* 캐릭터 배경 서클 */}
                <LinearGradient
                  colors={[`${colors.primary}15`, `${colors.primary}05`]}
                  style={{
                    width: plantSize.width + 30,
                    height: plantSize.height + 30,
                    borderRadius: (plantSize.width + 30) / 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: `${colors.primary}30`,
                  }}
                >
                  <Image
                    source={characterImage}
                    style={{
                      width: plantSize.width,
                      height: plantSize.height,
                    }}
                    contentFit="contain"
                  />
                </LinearGradient>
              </Animated.View>

              {/* 화분 */}
              <View className="items-center">
                <LinearGradient
                  colors={['#b45309', '#d97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: 84,
                    height: 16,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                  }}
                />
                <LinearGradient
                  colors={['#d97706', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    width: 70,
                    height: 36,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                />
              </View>
            </View>

            {/* 화살표 아이콘 (터치 유도) */}
            {isPressed && (
              <View className="absolute -bottom-2 left-1/2 -ml-6">
                <LinearGradient
                  colors={[`${colors.primary}`, `${colors.accent}`]}
                  className="px-3 py-1 rounded-full"
                >
                
                </LinearGradient>
              </View>
            )}
          </View>

          {/* 진행 정보 */}
          <View className="p-5">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-700 font-medium text-base">약속 진행률</Text>
              <Text className="text-emerald-600 font-bold">
                {completedPromises}/{totalPromises}
              </Text>
            </View>

            {/* 프로그레스 바 */}
            <View className="h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: `${(completedPromises / totalPromises) * 100}%`,
                  height: '100%',
                  borderRadius: 9999,
                }}
              />
            </View>

            {/* 텍스트 정보 */}
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-gray-500 text-sm">
                {totalPromises - completedPromises}개의 약속이 남았어요!
              </Text>
              <View className="bg-emerald-100 rounded-full px-2 py-1">
                <Text className="text-emerald-700 text-xs font-medium">
                  {Math.round((completedPromises / totalPromises) * 100)}% 완료
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export default CharacterDisplay;