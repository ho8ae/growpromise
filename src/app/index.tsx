// app/(tabs)/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CharacterDisplay from '../components/common/CharacterDisplay';
import { useSlideInAnimation } from '../utils/animations';

export default function TabsScreen() {
  // 임시 데이터 - 나중에 context나 상태 관리로 대체
  const [userType, setUserType] = useState<'parent' | 'child'>('child');
  const [characterData, setCharacterData] = useState({
    stage: 1,
    completedPromises: 3,
    totalPromises: 7,
  });

  const { animation, startAnimation } = useSlideInAnimation(100, 800);

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-center my-4">
            <FontAwesome
              name="leaf"
              size={24}
              color="#10b981"
              style={{ marginRight: 8 }}
            />
            <Text className="text-2xl font-bold text-center text-emerald-600">
              KidsPlan
            </Text>
          </View>

          <CharacterDisplay
            characterStage={characterData.stage}
            completedPromises={characterData.completedPromises}
            totalPromises={characterData.totalPromises}
            userType={userType}
          />

          <Animated.View
            className="bg-emerald-50 rounded-xl p-5 mt-4 border border-emerald-200 shadow-sm"
            style={{
              opacity: animation.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
              transform: [{ translateY: animation }],
            }}
          >
            <View className="flex-row items-center mb-2">
              <FontAwesome
                name="star"
                size={18}
                color="#10b981"
                style={{ marginRight: 8 }}
              />
              <Text className="text-lg font-medium text-emerald-700">
                오늘의 약속
              </Text>
            </View>

            {characterData.completedPromises < characterData.totalPromises ? (
              <View>
                <Text className="text-emerald-800 mb-2">
                  {characterData.totalPromises -
                    characterData.completedPromises}
                  개의 약속이 남아있어요!
                </Text>
                <View className="flex-row items-center">
                  <FontAwesome
                    name="hand-pointer-o"
                    size={16}
                    color="#10b981"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-emerald-600 italic">
                    캐릭터를 클릭해서 확인해보세요.
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center">
                <FontAwesome
                  name="check-circle"
                  size={18}
                  color="#10b981"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-emerald-800">
                  모든 약속을 완료했어요! 정말 잘했어요!
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View
            className="mt-6 mb-4 bg-emerald-50 rounded-xl p-5 border border-emerald-200 shadow-sm"
            style={{
              opacity: animation.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
              transform: [{ translateY: animation }],
            }}
          >
            <View className="flex-row items-center mb-2">
              <FontAwesome
                name="lightbulb-o"
                size={18}
                color="#10b981"
                style={{ marginRight: 8 }}
              />
              <Text className="text-lg font-medium text-emerald-700">
                사용팁
              </Text>
            </View>
            <Text className="text-emerald-800">
              캐릭터를 클릭하면 {userType === 'child' ? '아이' : '부모'}{' '}
              화면으로 이동합니다. 약속을 많이 지킬수록 캐릭터가 성장해요!
            </Text>
          </Animated.View>

          {/* 사용자 타입 전환 버튼 (개발용, 최종 앱에서는 제거) */}
          <Pressable
            className="bg-emerald-100 rounded-xl py-3 px-4 mt-4 mb-8"
            onPress={() =>
              setUserType(userType === 'child' ? 'parent' : 'child')
            }
          >
            <Text className="text-emerald-700 text-center">
              개발용: {userType === 'child' ? '부모' : '아이'} 모드로 전환
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
