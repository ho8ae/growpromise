import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ChildLayout() {
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
        <Stack.Screen name="verify-promise" />
        <Stack.Screen name="my-rewards" />
        <Stack.Screen name="my-stickers" />
        <Stack.Screen name="achievement" />
      </Stack>
    </View>
  );
}