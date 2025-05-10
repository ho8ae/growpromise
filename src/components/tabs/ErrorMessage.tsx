import React from 'react';
import { Animated, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorMessageProps {
  error: string | null;
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
}

const ErrorMessage = ({ error, fadeAnim, translateY }: ErrorMessageProps) => {
  if (!error) return null;
  
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 10,
      }}
    >
      <View className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4 mb-2">
        <View className="flex-row items-center">
          <MaterialIcons name="error-outline" size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-600">{error}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default ErrorMessage;