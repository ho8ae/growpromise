// app/_layout.tsx
import { Slot, Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </GestureHandlerRootView>
  );
}