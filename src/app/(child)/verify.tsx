// app/(child)/verify.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useBouncyAnimation } from '../../utils/animations';

export default function VerifyPromise() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [selectedPromise, setSelectedPromise] = useState('1');
  const [photoUri, setPhotoUri] = useState(null);
  const [message, setMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef(null);
  const { animation, startAnimation } = useBouncyAnimation();
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // 임시 데이터
  const promises = [
    { id: '1', title: '숙제하기' },
    { id: '2', title: '장난감 정리하기' },
  ];
  
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo.uri);
        setIsCameraActive(false);
        startAnimation();
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };
  
  const pickImage = async () => {
    // 갤러리에서 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.cancelled) {
      setPhotoUri(result.uri);
      startAnimation();
    }
  };
  
  const handleSubmit = () => {
    // 실제 앱에서는 API 요청 등 구현
    alert('부모님께 인증 요청을 보냈어요!');
    router.back();
  };
  
  if (hasPermission === null) {
    return <View className="flex-1 items-center justify-center"><Text>카메라 권한을 확인하는 중...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View className="flex-1 items-center justify-center"><Text>카메라 접근 권한이 없습니다.</Text></View>;
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 pb-8">
          <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
            약속 인증하기
          </Text>
          
          {isCameraActive ? (
            <View className="w-full aspect-square rounded-xl overflow-hidden mb-4">
              <Camera
                ref={cameraRef}
                type={cameraType}
                style={{ flex: 1 }}
              >
                <View className="flex-1 justify-between p-4">
                  <View className="self-end">
                    <Pressable
                      className="bg-black/30 p-3 rounded-full"
                      onPress={() => {
                        setCameraType(
                          cameraType === Camera.Constants.Type.back
                            ? Camera.Constants.Type.front
                            : Camera.Constants.Type.back
                        );
                      }}
                    >
                      <FontAwesome name="refresh" size={24} color="white" />
                    </Pressable>
                  </View>
                  
                  <View className="flex-row justify-center">
                    <Pressable
                      className="bg-white w-[70] h-[70] rounded-full items-center justify-center mb-8"
                      onPress={takePicture}
                    >
                      <View className="w-[60] h-[60] rounded-full border-4 border-emerald-500" />
                    </Pressable>
                  </View>
                </View>
              </Camera>
            </View>
          ) : (
            <Animated.View 
              className="bg-emerald-50 border-2 border-emerald-200 rounded-xl aspect-square items-center justify-center mb-4 overflow-hidden"
              style={{
                transform: [
                  { scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.05]
                  }) }
                ]
              }}
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  className="rounded-xl"
                />
              ) : (
                <View className="items-center">
                  <FontAwesome name="camera" size={50} color="#10b981" className="mb-4" />
                  <Text className="text-emerald-700 mb-6 text-lg">사진을 찍어주세요</Text>
                  <View className="flex-row">
                    <Pressable
                      className="bg-emerald-500 px-6 py-3 rounded-full mr-3 shadow-sm"
                      onPress={() => setIsCameraActive(true)}
                    >
                      <Text className="text-white font-medium">사진 찍기</Text>
                    </Pressable>
                    <Pressable
                      className="bg-emerald-400 px-6 py-3 rounded-full shadow-sm"
                      onPress={pickImage}
                    >
                      <Text className="text-white font-medium">앨범에서 선택</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
          
          <Text className="text-lg font-medium my-3 text-emerald-700">어떤 약속을 인증할까요?</Text>
          <View className="mb-4">
            {promises.map(promise => (
              <Pressable
                key={promise.id}
                className={`p-4 mb-2 rounded-xl border ${
                  selectedPromise === promise.id 
                    ? 'bg-emerald-100 border-emerald-500' 
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setSelectedPromise(promise.id)}
              >
                <Text className={`${selectedPromise === promise.id ? 'font-medium text-emerald-800' : 'text-gray-700'}`}>
                  {promise.title}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Text className="text-lg font-medium my-3 text-emerald-700">인증 메시지 (선택사항)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 mb-5"
            placeholder="부모님께 보낼 메시지를 적어보세요! (예: 숙제를 다 했어요!)"
            multiline
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
          
          <Pressable
            className={`py-4 rounded-xl shadow-md ${
              photoUri && selectedPromise 
                ? 'bg-emerald-500' 
                : 'bg-gray-300'
            }`}
            onPress={handleSubmit}
            disabled={!photoUri || !selectedPromise}
          >
            <Text className="text-white text-center font-medium text-lg">
              부모님께 보내기
            </Text>
          </Pressable>
          
          {photoUri && (
            <Pressable
              className="mt-4 py-3"
              onPress={() => {
                setPhotoUri(null);
                setIsCameraActive(false);
              }}
            >
              <Text className="text-center text-emerald-500">
                다시 찍기
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}