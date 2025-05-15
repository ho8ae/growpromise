import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';

interface AuthBannerProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
}

const AuthBanner = ({ fadeAnim, translateY }: AuthBannerProps) => {
  const router = useRouter();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 20,
      }}
    >
      <View className="bg-white rounded-xl overflow-hidden shadow-md border border-amber-200 mb-4">
        <View className="p-4">
          <View className="flex-row items-start">
            <View className="bg-amber-100 p-2 rounded-full mr-3">
              <MaterialIcons name="info-outline" size={20} color="#92400e" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-800 font-bold text-lg mb-2">
                미리보기 모드
              </Text>
              <Text className="text-amber-700 mb-4 leading-5">
                전체 기능을 이용하시려면 로그인이 필요합니다.
              </Text>
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-lg"
              >
                <Pressable 
                  className="py-2.5 active:opacity-90"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.navigate('/(auth)/login');
                  }}
                >
                  <Text className="text-white font-medium text-center">로그인하기</Text>
                </Pressable>
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AuthBanner;