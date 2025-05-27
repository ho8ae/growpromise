// src/components/common/SafeStatusBar.tsx
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeStatusBarProps {
  style?: 'auto' | 'inverted' | 'light' | 'dark';
  backgroundColor?: string;
  translucent?: boolean;
  hidden?: boolean;
}

export default function SafeStatusBar({
  style = 'dark',
  backgroundColor = '#FFFFFF',
  translucent = true,
  hidden = false,
}: SafeStatusBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        style={style}
        translucent={Platform.OS === 'android' ? translucent : false}
        hidden={hidden}
      />

      {/* Android Edge-to-Edge 대응 */}
      {Platform.OS === 'android' && translucent && !hidden && (
        <View
          style={{
            height: insets.top,
            backgroundColor,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        />
      )}
    </>
  );
}
