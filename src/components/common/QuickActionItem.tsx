import React, { useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';

interface QuickActionItemProps {
  icon: React.ReactNode;
  title: string;
  color?: string;
  onPress: () => void;
}

const QuickActionItem = ({ 
  icon, 
  title, 
  color = Colors.light.leafGreen,
  onPress 
}: QuickActionItemProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      className="active:opacity-90"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: '48%' }}
    >
      <Animated.View 
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <View className="items-center">
          <View 
            className="p-3 rounded-full mb-2"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </View>
          <Text className="text-center font-medium" style={{ color }}>
            {title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default QuickActionItem;