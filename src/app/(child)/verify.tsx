// app/(child)/verify.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

// 약속 인터페이스 정의
interface Promise {
  id: string;
  title: string;
}

export default function VerifyPromise() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assignmentId = params.assignmentId as string;
  const promiseId = params.promiseId as string;
   
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [selectedPromise, setSelectedPromise] = useState<string>(promiseId || '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promises, setPromises] = useState<Promise[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  
  // 약속 데이터 로드
  useEffect(() => {
    loadPromises();
  }, []);
  
  // 약속 데이터 로드 함수
  const loadPromises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 실제 구현 시 API 호출 부분
      // const response = await promiseApi.getPendingPromises();
      // setPromises(response);
      
      // 개발 중에는 빈 데이터 설정
      setPromises([]);
      
      // 만약 assignmentId가 있으면 해당 약속을 선택
      if (assignmentId) {
        // 실제 구현 시 API 호출로 해당 약속 할당 정보 가져오기
        // const assignmentData = await promiseApi.getPromiseAssignment(assignmentId);
        // setSelectedPromise(assignmentData.promise.id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('약속 데이터 로드 중 오류:', error);
      setError('약속 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo?.uri);
        setIsCameraActive(false);
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
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // 실제 구현 시 API 호출 부분
      // await promiseApi.submitVerification({
      //   promiseId: selectedPromise,
      //   assignmentId: assignmentId,
      //   photoUri: photoUri,
      //   message: message
      // });
      
      // 성공 시 알림 및 화면 이동
      alert('부모님께 인증 요청을 보냈어요!');
      router.back();
    } catch (error) {
      console.error('인증 제출 중 오류:', error);
      alert('인증 요청을 보내는 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };
  
  if (!permission) {
    // 카메라 권한이 로딩 중
    return <View className="flex-1 items-center justify-center"><Text>카메라 권한을 확인하는 중...</Text></View>;
  }
  
  if (!permission.granted) {
    // 권한이 없을 때 권한 요청 화면
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-center text-lg mb-4">카메라를 사용하려면 권한이 필요합니다</Text>
        <Pressable 
          className="bg-emerald-500 py-3 px-6 rounded-xl"
          onPress={requestPermission}
        >
          <Text className="text-white font-medium">권한 허용하기</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 pb-8">
          <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
            약속 인증하기
          </Text>
          
          {isLoading ? (
            <View className="items-center justify-center p-10">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="mt-3 text-emerald-700">약속 목록을 불러오는 중...</Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center p-10">
              <FontAwesome name="exclamation-circle" size={40} color="#ef4444" />
              <Text className="mt-3 text-gray-700">{error}</Text>
              <Pressable
                className="bg-emerald-500 py-2 px-4 rounded-lg mt-4"
                onPress={loadPromises}
              >
                <Text className="text-white">다시 시도</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {isCameraActive ? (
                <View className="w-full aspect-square rounded-xl overflow-hidden mb-4">
                  <CameraView
                    ref={cameraRef}
                    facing={cameraType}
                    style={{ flex: 1 }}
                  >
                    <View className="flex-1 justify-between p-4">
                      <View className="self-end">
                        <Pressable
                          className="bg-black/30 p-3 rounded-full"
                          onPress={() => {
                            setCameraType(
                              cameraType === 'back' ? 'front' : 'back'
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
                  </CameraView>
                </View>
              ) : (
                <View className="bg-emerald-50 border-2 border-emerald-200 rounded-xl aspect-square items-center justify-center mb-4 overflow-hidden">
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
                </View>
              )}
              
              {promises.length > 0 ? (
                <>
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
                </>
              ) : (
                <View className="p-4 mb-4 items-center justify-center">
                  <Text className="text-gray-500 text-center">
                    인증할 수 있는 약속이 없습니다. 부모님께 약속을 만들어 달라고 요청해보세요!
                  </Text>
                </View>
              )}
              
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
                  photoUri && (selectedPromise || promises.length === 0) && !isSubmitting
                    ? 'bg-emerald-500' 
                    : 'bg-gray-300'
                }`}
                onPress={handleSubmit}
                disabled={!photoUri || !(selectedPromise || promises.length === 0) || isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white ml-2 font-medium text-lg">
                      제출 중...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-medium text-lg">
                    부모님께 보내기
                  </Text>
                )}
              </Pressable>
              
              {photoUri && (
                <Pressable
                  className="mt-4 py-3"
                  onPress={() => {
                    setPhotoUri(null);
                    setIsCameraActive(false);
                  }}
                  disabled={isSubmitting}
                >
                  <Text className="text-center text-emerald-500">
                    다시 찍기
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}