// app/(child)/verify.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

// 실제 앱에서는 카메라 기능 구현 필요
export default function VerifyPromise() {
  const router = useRouter();
  const [selectedPromise, setSelectedPromise] = useState('1');
  const [photoTaken, setPhotoTaken] = useState(false);
  
  // 임시 데이터
  const promises = [
    { id: '1', title: '숙제하기' },
    { id: '2', title: '장난감 정리하기' },
  ];
  
  const handleTakePhoto = () => {
    // 실제 앱에서는 카메라 기능 구현
    setPhotoTaken(true);
  };
  
  const handleSubmit = () => {
    // 실제 앱에서는 API 요청 등 구현
    alert('부모님께 인증 요청을 보냈어요!');
    router.back();
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4">
          약속 인증하기
        </Text>
        
        <View className="bg-gray-100 rounded-xl aspect-square items-center justify-center mb-4">
          {photoTaken ? (
            <Image
              source={require('../../assets/images/react-logo.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              className="rounded-xl"
            />
          ) : (
            <View className="items-center">
              <Text className="text-gray-500 mb-4">사진을 찍어주세요</Text>
              <Pressable
                className="bg-blue-500 px-6 py-3 rounded-full"
                onPress={handleTakePhoto}
              >
                <Text className="text-white font-medium">사진 찍기</Text>
              </Pressable>
            </View>
          )}
        </View>
        
        <Text className="text-lg font-medium my-2">어떤 약속을 인증할까요?</Text>
        <View className="mb-6">
          {promises.map(promise => (
            <Pressable
              key={promise.id}
              className={`p-4 mb-2 rounded-xl border ${
                selectedPromise === promise.id 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setSelectedPromise(promise.id)}
            >
              <Text className={selectedPromise === promise.id ? 'font-medium' : ''}>
                {promise.title}
              </Text>
            </Pressable>
          ))}
        </View>
        
        <Pressable
          className={`py-3 rounded-xl ${
            photoTaken && selectedPromise 
              ? 'bg-green-500' 
              : 'bg-gray-300'
          }`}
          onPress={handleSubmit}
          disabled={!photoTaken || !selectedPromise}
        >
          <Text className="text-white text-center font-medium">
            부모님께 보내기
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}