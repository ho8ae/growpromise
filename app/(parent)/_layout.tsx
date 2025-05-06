import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ParentLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="promise-details" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="rewards-setup" />
        <Stack.Screen name="child-progress" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}