// components/common/Button.tsx
import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return 'bg-gray-300';
    
    switch (type) {
      case 'primary': return 'bg-blue-500';
      case 'secondary': return 'bg-green-500';
      case 'danger': return 'bg-red-500';
      case 'outline': return 'bg-transparent';
      default: return 'bg-blue-500';
    }
  };
  
  const getTextColor = () => {
    if (disabled) return 'text-gray-500';
    
    switch (type) {
      case 'outline': return 'text-blue-500';
      default: return 'text-white';
    }
  };
  
  const getBorderColor = () => {
    if (type === 'outline') {
      return 'border-blue-500 border';
    }
    return '';
  };
  
  const getPadding = () => {
    switch (size) {
      case 'small': return 'py-1 px-3';
      case 'medium': return 'py-3 px-5';
      case 'large': return 'py-4 px-6';
      default: return 'py-3 px-5';
    }
  };
  
  const getWidth = () => {
    return fullWidth ? 'w-full' : '';
  };
  
  return (
    <Pressable
      className={`rounded-xl ${getBackgroundColor()} ${getPadding()} ${getBorderColor()} ${getWidth()}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`text-center font-medium ${getTextColor()}`}>
        {title}
      </Text>
    </Pressable>
  );
}