// app/(parent)/approvals.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function ApprovalScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('1');
  
  const stickers = [
    { id: '1', image: require('../../assets/images/react-logo.png') },
    { id: '2', image: require('../../assets/images/react-logo.png') },
  ];
  
  const handleApprove = () => {
    // 실제 앱에서는 API 요청 등 구현
    alert('약속 인증을 승인했습니다!');
    router.back();
  };
  
  const handleReject = () => {
    // 실제 앱에서는 API 요청 등 구현
    alert('약속 인증을 거절했습니다.');
    router.back();
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4">
            인증 확인하기
          </Text>
          
          <View className="bg-sky-50 rounded-xl p-4 mb-4">
            <Text className="text-lg font-medium mb-1">약속</Text>
            <Text>숙제하기</Text>
            <Text className="text-gray-500 text-sm">민준 • 방금 전</Text>
          </View>
          
          <Text className="text-lg font-medium mb-2">인증 사진</Text>
          <View className="bg-gray-100 rounded-xl aspect-square mb-6">
            <Image
              source={require('../../assets/images/react-logo.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              className="rounded-xl"
            />
          </View>
          
          <Text className="text-lg font-medium mb-2">칭찬 스티커 선택</Text>
          <View className="flex-row flex-wrap mb-6">
            {stickers.map(sticker => (
              <Pressable
                key={sticker.id}
                className={`mr-4 mb-2 p-2 rounded-xl ${
                  selectedSticker === sticker.id ? 'bg-yellow-100 border border-yellow-500' : ''
                }`}
                onPress={() => setSelectedSticker(sticker.id)}
              >
                <Image
                  source={sticker.image}
                  style={{ width: 50, height: 50 }}
                  contentFit="contain"
                />
              </Pressable>
            ))}
          </View>
          
          <Text className="text-lg font-medium mb-2">칭찬 메시지</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="칭찬 메시지를 입력하세요"
            className="border border-gray-300 rounded-xl p-4 mb-6"
            multiline
          />
          
          <View className="flex-row mb-8">
            <Pressable
              className="flex-1 py-3 bg-red-500 rounded-xl mr-2"
              onPress={handleReject}
            >
              <Text className="text-white text-center font-medium">
                거절하기
              </Text>
            </Pressable>
            
            <Pressable
              className="flex-1 py-3 bg-green-500 rounded-xl ml-2"
              onPress={handleApprove}
            >
              <Text className="text-white text-center font-medium">
                승인하기
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}