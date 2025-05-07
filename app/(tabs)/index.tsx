// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CharacterDisplay from '../../components/common/CharacterDisplay';

export default function TabsScreen() {
  // 임시 데이터 - 나중에 context나 상태 관리로 대체
  const [userType, setUserType] = useState<'parent' | 'child'>('child');
  const [characterData, setCharacterData] = useState({
    stage: 1,
    completedPromises: 3,
    totalPromises: 7
  });
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">
            KidsPlan
          </Text>
          
          <CharacterDisplay
            characterStage={characterData.stage}
            completedPromises={characterData.completedPromises}
            totalPromises={characterData.totalPromises}
            userType={userType}
          />
          
          <View className="bg-sky-50 rounded-xl p-4 mt-6">
            <Text className="text-lg font-medium mb-2">오늘의 약속</Text>
            {characterData.completedPromises < characterData.totalPromises ? (
              <Text>
                {characterData.totalPromises - characterData.completedPromises}개의 약속이 남아있어요! 
                캐릭터를 클릭해서 확인해보세요.
              </Text>
            ) : (
              <Text>모든 약속을 완료했어요! 정말 잘했어요!</Text>
            )}
          </View>
          
          <View className="mt-6 mb-4">
            <Text className="text-lg font-medium mb-2">사용팁</Text>
            <Text>
              캐릭터를 클릭하면 {userType === 'child' ? '아이' : '부모'} 화면으로 이동합니다.
              약속을 많이 지킬수록 캐릭터가 성장해요!
            </Text>
          </View>
          
          {/* 사용자 타입 전환 버튼 (개발용, 최종 앱에서는 제거) */}
          <Text 
            className="text-blue-500 text-center mt-8"
            onPress={() => setUserType(userType === 'child' ? 'parent' : 'child')}
          >
            개발용: {userType === 'child' ? '부모' : '아이'} 모드로 전환
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}