import React from 'react';
import { Animated, Image, Text, View } from 'react-native';

interface AppHeaderProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
}

const AppHeader = ({ fadeAnim, translateY }: AppHeaderProps) => {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 8,
      }}
    >
      <View className="flex-row items-center mb-3">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 28, height: 28 }}
          className="mr-2"
        />
        <Text className="text-xl font-bold text-emerald-700">쑥쑥약속</Text>
      </View>
    </Animated.View>
  );
};

export default AppHeader;