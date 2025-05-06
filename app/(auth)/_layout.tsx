import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="reset-password" />
      </Stack>
    </View>
  );
}