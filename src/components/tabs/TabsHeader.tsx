import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Image, Pressable, View } from 'react-native';

interface AppHeaderProps {
  fadeAnim?: Animated.Value;
  translateY?: Animated.Value;
}

interface HeaderProps {
  userType?: string;
}

const AppHeader = ({
  userType,
}: AppHeaderProps & HeaderProps) => {
  return userType === 'CHILD' ? (
    <Animated.View className="flex-row justify-between items-center mb-4">
      <View className="flex-row items-center mb-3">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 28, height: 28 }}
          className="mr-2"
        />
      </View>
      <View className="flex-row items-center">
        <Pressable onPress={() => router.push('/calendar')}>
          <FontAwesome
            name="calendar"
            size={24}
            color="black"
            className="mr-4"
          />
        </Pressable>
        {/* 톱니바퀴 아이콘 tabs/profile 이동 */}
        <Pressable onPress={() => router.push('/profile')}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </Pressable>
      </View>
    </Animated.View>
  ) : (
    <Animated.View className="flex-row justify-between items-center ml-4 mr-4">
      <View className="flex-row items-center mb-3 ml-2">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 30, height: 30 }}
          className="mr-2"
        />
      </View>
      <View className="flex-row items-center mr-2">
        <Pressable onPress={() => router.push('/calendar')}>
          <Image
            source={require('../../assets/images/icon/calendar_icon.png')}
            style={{ width: 30, height: 30 }}
            className='mr-2'
          />
        </Pressable>

        {/* 톱니바퀴 아이콘 tabs/profile 이동 */}
        <Pressable onPress={() => router.push('/profile')}>
          <Image
            source={require('../../assets/images/icon/settings_icon.png')}
            style={{ width: 28, height: 28 }}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default AppHeader;
