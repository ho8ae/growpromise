// app/(parent)/approvals.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useBouncyAnimation } from '../../utils/animations';

export default function ApprovalScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('1');
  const { animation, startAnimation } = useBouncyAnimation();
  
  useEffect(() => {
    startAnimation();
  }, [selectedSticker]);
  
  const stickers = [
    { id: '1', image: require('../../assets/images/react-logo.png') },
    { id: '2', image: require('../../assets/images/react-logo.png') },
    { id: '3', image: require('../../assets/images/react-logo.png') },
    { id: '4', image: require('../../assets/images/react-logo.png') },
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
        <View className="px-4 pt-4 pb-8">
          <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
            인증 확인하기
          </Text>
          
          <View className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-200">
            <Text className="text-lg font-medium mb-1 text-emerald-700">약속</Text>
            <Text className="text-emerald-800 text-lg">숙제하기</Text>
            <Text className="text-gray-500 text-sm mt-1">민준 • 방금 전</Text>
            <View className="mt-2 px-3 py-2 bg-white rounded-lg border border-emerald-200 italic">
              <Text className="text-gray-600">
                "숙제를 다 했어요! 칭찬해주세요~"
              </Text>
            </View>
          </View>
          
          <Text className="text-lg font-medium mb-3 text-emerald-700">인증 사진</Text>
          <View className="bg-emerald-50 rounded-xl aspect-square mb-6 border border-emerald-200 overflow-hidden">
            <Image
              source={require('../../assets/images/react-logo.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              className="rounded-xl"
            />
          </View>
          
          <Text className="text-lg font-medium mb-3 text-emerald-700">칭찬 스티커 선택</Text>
          <View className="flex-row flex-wrap mb-6 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            {stickers.map(sticker => (
              <Pressable
                key={sticker.id}
                className={`mr-4 mb-2 p-2 rounded-xl ${
                  selectedSticker === sticker.id ? 'bg-emerald-100 border-2 border-emerald-500' : ''
                }`}
                onPress={() => setSelectedSticker(sticker.id)}
              >
                <Animated.View
                  style={{
                    transform: [
                      { scale: selectedSticker === sticker.id ? animation : 1 }
                    ]
                  }}
                >
                  <Image
                    source={sticker.image}
                    style={{ width: 60, height: 60 }}
                    contentFit="contain"
                  />
                </Animated.View>
              </Pressable>
            ))}
          </View>
          
          <Text className="text-lg font-medium mb-3 text-emerald-700">칭찬 메시지</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="칭찬 메시지를 입력하세요 (예: 정말 잘했어요! 최고예요!)"
            className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 mb-6"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <View className="flex-row mb-4">
            <Pressable
              className="flex-1 py-4 bg-gray-400 rounded-xl mr-2 shadow-md"
              onPress={handleReject}
            >
              <Text className="text-white text-center font-medium">
                거절하기
              </Text>
            </Pressable>
            
            <Pressable
              className="flex-1 py-4 bg-emerald-500 rounded-xl ml-2 shadow-md"
              onPress={handleApprove}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome name="check" size={16} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white text-center font-medium">
                  승인하기
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}