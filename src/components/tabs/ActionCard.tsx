import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  onPress: () => void;
  disabled?: boolean;
  renderExtra?: () => React.ReactNode; // 추가 콘텐츠를 렌더링하는 함수
}

const ActionCard = ({
  icon,
  title,
  description,
  actionText,
  color = Colors.light.primary,
  bgColor = '#ffffff',
  borderColor,
  onPress,
  disabled = false,
  renderExtra,
}: ActionCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.9}
      onPress={disabled ? undefined : onPress}
      className={`rounded-2xl mb-4 overflow-hidden ${disabled ? 'opacity-70' : 'opacity-100'}`}
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor || `${color}30`,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View 
            className="p-3 rounded-full mr-3" 
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </View>
          <Text 
            className="text-lg font-bold" 
            style={{ color: color }}
          >
            {title}
          </Text>
        </View>
        
        <Text className="text-gray-600 mb-3">
          {description}
        </Text>
        
        {/* 추가 콘텐츠가 있으면 여기에 렌더링 */}
        {renderExtra && renderExtra()}
        
        <View 
          className="py-3 rounded-xl items-center"
          style={{ backgroundColor: disabled ? '#9ca3af' : color }}
        >
          <Text className="text-white font-medium">
            {actionText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ActionCard;