import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Colors from '../../../constants/Colors';

interface MenuItem {
  title: string;
  icon: string;
  color: string;
  action: () => void;
}

const RevolveFAB = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useSharedValue(0);
  const rotation = useSharedValue(0);

  // 메뉴 아이템들 정의
  const menuItems: MenuItem[] = [
    {
        title: '홈으로 돌아가기',
        icon: 'home',
        color: '#10b981', // emerald-500
        action: () => {
          router.dismissAll();
          router.replace('/(tabs)');
        },
      },
    {
      title: '약속 관리하기',
      icon: 'list',
      color: '#3b82f6', // blue-500
      action: () => router.push('/(parent)/manage-promises'),
    },
    {
      title: '보상 설정하기',
      icon: 'gift',
      color: '#f59e0b', // amber-500
      action: () => router.push('/(parent)/set-rewards'),
    },
    
  ];

  const toggleMenu = () => {
    const newValue = isExpanded ? 0 : 1;
    const newRotation = isExpanded ? 0 : 45;

    animation.value = withSpring(newValue, {
      damping: 15,
      stiffness: 200,
    });

    rotation.value = withTiming(newRotation, {
      duration: 200,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    runOnJS(setIsExpanded)(!isExpanded);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    // 메뉴 닫기
    animation.value = withSpring(0, {
      damping: 15,
      stiffness: 200,
    });
    rotation.value = withTiming(0, {
      duration: 200,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(setIsExpanded)(false);
    
    // 액션 실행
    setTimeout(() => {
      item.action();
    }, 100);
  };

  // 메인 FAB 애니메이션
  const mainButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  // 오버레이 애니메이션 (배경 흐리게)
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.value, [0, 1], [0, 0.3]),
      pointerEvents: animation.value > 0 ? 'auto' : 'none',
    };
  });

  // 각 메뉴 아이템별 애니메이션 스타일
  const menuItem0Style = useAnimatedStyle(() => {
    const angle = (0 * 60) + 170; 
    const radius = 100;

    const translateX = interpolate(
      animation.value,
      [0, 1],
      [0, Math.cos((angle * Math.PI) / 180) * radius]
    );

    const translateY = interpolate(
      animation.value,
      [0, 1],
      [0, Math.sin((angle * Math.PI) / 180) * radius]
    );

    const scale = interpolate(
      animation.value,
      [0, 0.5, 1],
      [0, 0.8, 1]
    );

    const opacity = interpolate(
      animation.value,
      [0, 0.3, 1],
      [0, 0.8, 1]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    };
  });

  const menuItem1Style = useAnimatedStyle(() => {
    const angle = (1 * 60) + 165;
    const radius = 100;

    const translateX = interpolate(
      animation.value,
      [0, 1],
      [0, Math.cos((angle * Math.PI) / 180) * radius]
    );

    const translateY = interpolate(
      animation.value,
      [0, 1],
      [0, Math.sin((angle * Math.PI) / 180) * radius]
    );

    const scale = interpolate(
      animation.value,
      [0, 0.5, 1],
      [0, 0.8, 1]
    );

    const opacity = interpolate(
      animation.value,
      [0, 0.3, 1],
      [0, 0.8, 1]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    };
  });

  const menuItem2Style = useAnimatedStyle(() => {
    const angle = (2 * 60) + 160;
    const radius = 100;

    const translateX = interpolate(
      animation.value,
      [0, 1],
      [0, Math.cos((angle * Math.PI) / 180) * radius]
    );

    const translateY = interpolate(
      animation.value,
      [0, 1],
      [0, Math.sin((angle * Math.PI) / 180) * radius]
    );

    const scale = interpolate(
      animation.value,
      [0, 0.5, 1],
      [0, 0.8, 1]
    );

    const opacity = interpolate(
      animation.value,
      [0, 0.3, 1],
      [0, 0.8, 1]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    };
  });

  // 스타일 배열
  const menuItemStyles = [menuItem0Style, menuItem1Style, menuItem2Style];

  return (
    <>
      {/* 배경 오버레이 */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            zIndex: 998,
          },
          overlayStyle,
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={toggleMenu}
        />
      </Animated.View>

      {/* FAB 컨테이너 */}
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          zIndex: 999,
        }}
      >
        {/* 메뉴 아이템들 */}
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.title}
            style={[
              {
                position: 'absolute',
                bottom: 0,
                right: 0,
              },
              menuItemStyles[index],
            ]}
          >
            <View style={{ alignItems: 'center' }}>
              {/* 메뉴 라벨 */}
              {/* <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginBottom: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {item.title}
                </Text>
              </View> */}

              {/* 메뉴 버튼 */}
              <Pressable
                onPress={() => handleMenuItemPress(item)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: item.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <FontAwesome5
                  name={item.icon}
                  size={18}
                  color="white"
                />
              </Pressable>
            </View>
          </Animated.View>
        ))}

        {/* 메인 FAB 버튼 */}
        <Animated.View style={mainButtonStyle}>
          <Pressable
            onPress={toggleMenu}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: Colors.light.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <FontAwesome5
              name="plus"
              size={24}
              color="white"
            />
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
};

export default RevolveFAB;