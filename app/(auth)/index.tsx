import { router } from 'expo-router';
import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

export default function Auth() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-6">
            {/* auth로 이동 */}
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text>로그인</Text>
            </TouchableOpacity>
            
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}