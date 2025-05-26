// src/components/store/MysticBackground.tsx (신전 배경)
import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Canvas, Rect, Group, LinearGradient, vec } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const MysticBackground: React.FC = () => {
  // 회전 애니메이션
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);

  useEffect(() => {
    // 각각 다른 속도로 회전
    rotation1.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 20000, // 20초
        easing: Easing.linear,
      }),
      -1
    );

    rotation2.value = withRepeat(
      withTiming(-2 * Math.PI, {
        duration: 15000, // 15초 (반대 방향)
        easing: Easing.linear,
      }),
      -1
    );

    rotation3.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 25000, // 25초
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  // 회전 변환 계산
  const transform1 = useDerivedValue(() => [
    { rotate: rotation1.value }
  ]);

  const transform2 = useDerivedValue(() => [
    { rotate: rotation2.value }
  ]);

  const transform3 = useDerivedValue(() => [
    { rotate: rotation3.value }
  ]);

  return (
    <Canvas style={{ position: 'absolute', width, height }}>
      {/* 기본 배경 그라데이션 */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={['#f4f8fa', '#a1c0d1', '#ffffff']} // 어두운 신전 느낌
        />
      </Rect>

      {/* 첫 번째 회전하는 사각형 레이어
      <Group 
        origin={{ x: width / 2, y: height / 2 }}
        transform={transform1}
        opacity={0.3}
      >
        <Rect 
          x={width / 4} 
          y={height / 4} 
          width={width / 2} 
          height={height / 2}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width / 2, height / 2)}
            colors={['#ff6b6b', '#4ecdc4', '#45b7d1']} // 아크릴 느낌
          />
        </Rect>
      </Group> */}

      {/* 두 번째 회전하는 사각형 레이어 */}
      {/* <Group 
        origin={{ x: width / 2, y: height / 2 }}
        transform={transform2}
        opacity={0.25}
      >
        <Rect 
          x={width / 6} 
          y={height / 6} 
          width={width * 2 / 3} 
          height={height * 2 / 3}
        >
          <LinearGradient
            start={vec(0, height * 2 / 3)}
            end={vec(width * 2 / 3, 0)}
            colors={['#a8e6cf', '#ffd3a5', '#fd9853']} // 따뜻한 아크릴
          />
        </Rect>
      </Group> */}

      {/* 세 번째 회전하는 사각형 레이어 */}
      {/* <Group 
        origin={{ x: width / 2, y: height / 2 }}
        transform={transform3}
        opacity={0.2}
      >
        <Rect 
          x={width / 8} 
          y={height / 8} 
          width={width * 3 / 4} 
          height={height * 3 / 4}
        >
          <LinearGradient
            start={vec(width * 3 / 4, 0)}
            end={vec(0, height * 3 / 4)}
            colors={['#667eea', '#764ba2', '#f093fb']} // 보라-핑크 아크릴
          />
        </Rect>
      </Group> */}

      {/* 신비로운 오버레이 */}
      {/* <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(width / 2, 0)}
          end={vec(width / 2, height)}
          colors={['transparent', '#b3dde7', 'transparent']}
          positions={[0, 0.5, 1]}
        />
      </Rect> */}

      {/* 중앙 빛 효과 */}
      <Group opacity={0.4}>
        <Rect 
          x={width / 3} 
          y={height / 3} 
          width={width / 3} 
          height={height / 3}
        >
          <LinearGradient
            start={vec(width / 6, height / 6)}
            end={vec(width / 6, height / 6)}
            colors={['#ffffff', 'transparent']}
          />
        </Rect>
      </Group>
    </Canvas>
  );
};

export default MysticBackground;