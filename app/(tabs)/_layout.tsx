import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';

// 탭 아이콘 설정
const getTabIcon = (iconName: string, focused: boolean, color: string) => {
  return (
    <Animated.View
      className={`items-center justify-center w-[50px] h-[50px]`}
      style={{
        transform: [{ scale: focused ? 1.1 : 0.9 }],
      }}
    >
      <Ionicons
        name={iconName as any}
        size={24}
        color={focused ? color : "#7E8CA3"}
      />
    </Animated.View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom ? insets.bottom : 16,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 25,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : 'white',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: 'rgba(163, 190, 240, 0.25)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? 
            <BlurView 
              tint="light" 
              intensity={80} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                borderRadius: 25,
              }}
            /> : 
            <View 
              className="absolute inset-0 rounded-3xl bg-white"
            />
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#70CAF8",
        tabBarInactiveTintColor: "#7E8CA3",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => 
            getTabIcon('home', focused, "#70CAF8"),
        }}
      />
      <Tabs.Screen
        name="promises"
        options={{
          title: '약속',
          tabBarIcon: ({ color, focused }) => 
            getTabIcon('calendar', focused, "#FFAEC0"),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '추가',
          tabBarIcon: ({ color, focused }) => (
            <View className="w-[60px] h-[60px] rounded-full bg-[#A8E6CF] justify-center items-center -mb-5 shadow-md">
              <Ionicons name="add" size={32} color="white" />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/');
          },
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: '보상',
          tabBarIcon: ({ color, focused }) => 
            getTabIcon('star', focused, "#FFEDA3"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, focused }) => 
            getTabIcon('person', focused, "#D4A5FF"),
        }}
      />
    </Tabs>
  );
}