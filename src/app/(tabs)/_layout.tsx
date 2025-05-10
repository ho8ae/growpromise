import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.leafGreen,
        tabBarInactiveTintColor: '#94a3b8', // slate-400
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="light"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="character"
        options={{
          title: '캐릭터',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'transparent',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <FontAwesome5 name="seedling" size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'transparent',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <FontAwesome5 name="calendar-alt" size={18} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'transparent',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <FontAwesome5 name="home" size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: '목표',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'transparent',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <FontAwesome5 name="star" size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'transparent',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <FontAwesome5 name="cog" size={18} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
