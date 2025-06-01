import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import Colors from '../../constants/Colors';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
  showArrow?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export default function SettingItem({
  icon,
  title,
  subtitle,
  badge,
  showArrow = true,
  switchValue,
  onSwitchChange,
  onPress,
  disabled = false,
  destructive = false,
}: SettingItemProps) {
  const handlePress = () => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleSwitchChange = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwitchChange?.(value);
  };

  const isSwitch = switchValue !== undefined && onSwitchChange;

  return (
    <Pressable
      className={`flex-row items-center justify-between p-4 ${
        disabled ? 'opacity-50' : 'active:bg-gray-50'
      }`}
      onPress={isSwitch ? undefined : handlePress}
      disabled={disabled}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? Colors.light.error : Colors.light.text}
          style={{ marginRight: 12 }}
        />
        <View className="flex-1">
          <Text
            className="text-base"
            style={{ 
              color: destructive ? Colors.light.error : Colors.light.text 
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-sm mt-0.5"
              style={{ color: Colors.light.textSecondary }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {badge && (
          <View
            className="ml-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${Colors.light.primary}15` }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: Colors.light.primary }}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={handleSwitchChange}
          trackColor={{
            false: Colors.light.disabled,
            true: `${Colors.light.primary}80`,
          }}
          thumbColor={switchValue ? Colors.light.primary : '#FFFFFF'}
          ios_backgroundColor={Colors.light.disabled}
        />
      ) : (
        showArrow && (
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={Colors.light.textSecondary}
          />
        )
      )}
    </Pressable>
  );
}

// 사용 예시:
/*
<SettingItem
  icon="person-outline"
  title="프로필 정보 변경"
  onPress={() => handleSettingPress('프로필 정보')}
/>

<SettingItem
  icon="notifications-outline"
  title="알림"
  switchValue={notifications}
  onSwitchChange={(value) => setNotifications(value)}
/>

<SettingItem
  icon="link-outline"
  title="자녀 계정 연결"
  badge="연결됨"
  onPress={() => handleSettingPress('연결된 계정')}
/>
*/