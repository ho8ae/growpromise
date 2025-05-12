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
}

const ActionCard = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  color = Colors.light.leafGreen, 
  bgColor = '#ffffff',
  borderColor,
  onPress,
  disabled = false,
}: ActionCardProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={disabled ? 1 : 0.9}
      onPress={disabled ? undefined : onPress}
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor || `${color}30`,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <View style={{ padding: 16 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 12 
        }}>
          <View style={{ 
            padding: 12, 
            borderRadius: 9999, 
            marginRight: 12, 
            backgroundColor: `${color}15` 
          }}>
            {icon}
          </View>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: color 
          }}>
            {title}
          </Text>
        </View>
        
        <Text style={{ 
          marginBottom: 12, 
          color: '#4B5563' 
        }}>
          {description}
        </Text>
        
        <View style={{ 
          backgroundColor: disabled ? '#9ca3af' : color, 
          paddingVertical: 12, 
          borderRadius: 12, 
          alignItems: 'center' 
        }}>
          <Text style={{ 
            color: 'white', 
            fontWeight: '500' 
          }}>
            {actionText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ActionCard;