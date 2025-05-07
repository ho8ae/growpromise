// components/common/Card.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps {
  children: ReactNode;
  type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  padding?: 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  type = 'default',
  padding = 'medium',
}: CardProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'primary': return 'bg-blue-50';
      case 'secondary': return 'bg-purple-50';
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'danger': return 'bg-red-50';
      default: return 'bg-white';
    }
  };
  
  const getBorderColor = () => {
    switch (type) {
      case 'primary': return 'border-blue-300';
      case 'secondary': return 'border-purple-300';
      case 'success': return 'border-green-300';
      case 'warning': return 'border-yellow-300';
      case 'danger': return 'border-red-300';
      default: return 'border-gray-300';
    }
  };
  
  const getPadding = () => {
    switch (padding) {
      case 'small': return 'p-2';
      case 'medium': return 'p-4';
      case 'large': return 'p-6';
      default: return 'p-4';
    }
  };
  
  return (
    <View 
      className={`rounded-xl border ${getBackgroundColor()} ${getBorderColor()} ${getPadding()}`}
    >
      {children}
    </View>
  );
}