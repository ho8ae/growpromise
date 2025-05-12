import React, { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  onPress: () => void;
  colors: string[];
  children: ReactNode;
  startColor?: string;
  endColor?: string;
  icon?: ReactNode;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  colors = ['#10b981', '#059669'], // 기본 emerald 그라디언트
  children,
  icon,
  textColor = 'white',
  style,
  textStyle,
  disabled = false,
}) => {
  return (
    <Pressable 
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={['#9ca3af', '#6b7280']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text 
            style={[
              styles.text, 
              { color: disabled ? '#e5e7eb' : textColor },
              textStyle
            ]}
          >
            {children}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16, 
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.7,
  },
});

export default GradientButton;