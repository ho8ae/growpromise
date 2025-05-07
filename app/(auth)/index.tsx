// app/(auth)/index.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function AuthIndexScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 flex-1 justify-center">
        <View className="items-center mb-10">
          <Image
            source={require('../../assets/images/react-logo.png')}
            style={{ width: 100, height: 100 }}
            contentFit="contain"
          />
          <Text className="text-3xl font-bold mt-4">KidsPlan</Text>
          <Text className="text-gray-500">
            함께 약속하고 성장하는 즐거움
          </Text>
        </View>
        
        <Pressable
          className="bg-blue-500 py-3 rounded-xl mb-4"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white text-center font-medium">
            로그인
          </Text>
        </Pressable>
        
        <Pressable
          className="bg-green-500 py-3 rounded-xl mb-8"
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text className="text-white text-center font-medium">
            회원가입
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-center text-blue-500">
            로그인 없이 시작하기
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}