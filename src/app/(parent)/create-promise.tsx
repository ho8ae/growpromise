// app/(parent)/create-promise.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CreatePromiseScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repeatType, setRepeatType] = useState('once');
  
  const handleCreate = () => {
    // 실제 앱에서는 API 요청 등 구현
    alert('약속이 생성되었습니다!');
    router.back();
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">
            새 약속 만들기
          </Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">약속 제목</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예) 숙제하기, 이 닦기"
              className="border border-gray-300 rounded-xl p-3"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">약속 설명 (선택사항)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="약속에 대한 설명을 입력하세요"
              className="border border-gray-300 rounded-xl p-3"
              multiline
            />
          </View>
          
          <Text className="text-gray-700 mb-2">반복 주기</Text>
          <View className="flex-row mb-6">
            <Pressable
              className={`flex-1 py-2 items-center ${
                repeatType === 'once' ? 'bg-blue-500' : 'bg-gray-200'
              } rounded-l-xl`}
              onPress={() => setRepeatType('once')}
            >
              <Text
                className={`${
                  repeatType === 'once' ? 'text-white' : 'text-gray-700'
                }`}
              >
                한 번만
              </Text>
            </Pressable>
            
            <Pressable
              className={`flex-1 py-2 items-center ${
                repeatType === 'daily' ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onPress={() => setRepeatType('daily')}
            >
              <Text
                className={`${
                  repeatType === 'daily' ? 'text-white' : 'text-gray-700'
                }`}
              >
                매일
              </Text>
            </Pressable>
            
            <Pressable
              className={`flex-1 py-2 items-center ${
                repeatType === 'weekly' ? 'bg-blue-500' : 'bg-gray-200'
              } rounded-r-xl`}
              onPress={() => setRepeatType('weekly')}
            >
              <Text
                className={`${
                  repeatType === 'weekly' ? 'text-white' : 'text-gray-700'
                }`}
              >
                매주
              </Text>
            </Pressable>
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">스티커 목표 개수</Text>
            <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
              <Pressable className="flex-1 py-3 items-center bg-blue-500">
                <Text className="text-white">5개</Text>
              </Pressable>
              <Pressable className="flex-1 py-3 items-center bg-gray-200">
                <Text className="text-gray-700">10개</Text>
              </Pressable>
              <Pressable className="flex-1 py-3 items-center bg-gray-200">
                <Text className="text-gray-700">15개</Text>
              </Pressable>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-gray-700 mb-1">보상 설정</Text>
            <TextInput
              placeholder="예) 좋아하는 장난감 사주기, 놀이공원 가기"
              className="border border-gray-300 rounded-xl p-3"
            />
          </View>
          
          <Pressable
            className={`py-3 rounded-xl mb-6 ${
              title.trim() ? 'bg-green-500' : 'bg-gray-300'
            }`}
            onPress={handleCreate}
            disabled={!title.trim()}
          >
            <Text className="text-white text-center font-medium">
              약속 만들기
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}