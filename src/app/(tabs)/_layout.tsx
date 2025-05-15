// src/app/(tabs)/_layout.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="light"
            className="absolute inset-0 rounded-t-3xl"
          />
        ),
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color,focused }) => (
            <View className="p-2">
              <Image
                source={require('../../assets/images/icon/home_icon.png')}
                className="w-9 h-9"
                style={{
                  opacity: focused ? 1 : 0.4,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: '도움말',
          tabBarIcon: ({ color,focused }) => (
            <View className="p-2">
              <Image
                source={require('../../assets/images/icon/help_icon.png')}
                className="w-7 h-7"
                style={{
                  opacity: focused ? 1 : 0.4,
                  
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store-tab"
        options={{
          title: '상점',
          tabBarIcon: ({ color,focused }) => (
            <View className="p-2">
              <Image
                source={require('../../assets/images/icon/shop_icon.png')}
                className="w-8 h-8"
                style={{
                  opacity: focused ? 1 : 0.4,
                  
                }}
              />
            </View>
          ),
        }}
      />

      {/* 기존 탭들을 숨깁니다 */}
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}