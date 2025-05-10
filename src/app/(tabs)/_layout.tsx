import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // 안전한 아이콘 맵핑
  const getIcon = (name: string, color: string, size: number) => {
    switch (name) {
      case 'home':
        return <MaterialIcons name="home" size={size} color={color} />;
      case 'calendar':
        return <MaterialIcons name="calendar-today" size={size} color={color} />;
      case 'character':
        return <MaterialIcons name="eco" size={size} color={color} />;
      case 'goals':
        return <MaterialIcons name="star" size={size} color={color} />;
      case 'settings':
        return <MaterialIcons name="settings" size={size} color={color} />;
      default:
        return <MaterialIcons name="help" size={size} color={color} />;
    }
  };
  
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
          height: 54 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarBackground: () => (
          <BlurView intensity={40} tint="light" style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }} />
        ),
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              backgroundColor: focused ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderRadius: 12,
              padding: 4,
            }}>
              {getIcon('home', color, 22)}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              backgroundColor: focused ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderRadius: 12,
              padding: 4,
            }}>
              {getIcon('calendar', color, 22)}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: '캐릭터',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              backgroundColor: focused ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderRadius: 12,
              padding: 4,
            }}>
              {getIcon('character', color, 22)}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: '목표',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              backgroundColor: focused ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderRadius: 12,
              padding: 4,
            }}>
              {getIcon('goals', color, 22)}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              backgroundColor: focused ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderRadius: 12,
              padding: 4,
            }}>
              {getIcon('settings', color, 22)}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}