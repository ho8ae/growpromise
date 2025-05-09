import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import promiseApi, { PromiseAssignment, PromiseTask,PromiseStatus } from '../../api/modules/promise';

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
  const [pendingPromises, setPendingPromises] = useState<PromiseAssignment[]>([]);
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
      
      // API 호출하여 PENDING 상태의 약속 가져오기
      const response = await promiseApi.getChildPromises(PromiseStatus.PENDING);
      setPendingPromises(response);
      
      // 만약 assignmentId가 있으면 해당 약속을 선택
      if (assignmentId) {
        const foundAssignment = response.find(assignment => assignment.id === assignmentId);
        if (foundAssignment && foundAssignment.promiseId) {
          setSelectedPromise(foundAssignment.promiseId);
        }
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo?.uri);
        setIsCameraActive(false);
      } catch (error) {
        console.error('Failed to take picture:', error);
        Alert.alert('오류', '사진 촬영 중 문제가 발생했습니다.');
      }
    }
  };
  
  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    } catch (error) {
      console.error('이미지 선택 중 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };
  
  const handleSubmit = async () => {
    try {
      if (!photoUri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('알림', '사진을 찍어주세요.');
        return;
      }
      
      // assignmentId가 없고, 선택된 약속이 없으면 에러
      if (!assignmentId && !selectedPromise) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('알림', '인증할 약속을 선택해주세요.');
        return;
      }
      
      setIsSubmitting(true);
      
      // API 호출하여 인증 제출
      await promiseApi.submitVerification(
        assignmentId || selectedPromise, // assignmentId가 없으면 선택된 약속 ID 사용
        photoUri,
        // message.trim() ? message : undefined, 사진 uri를 어떻게 처리하지
      );
      
      // 성공 시 알림 및 화면 이동
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '성공', 
        '부모님께 인증 요청을 보냈어요!',
        [{ text: '확인', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('인증 제출 중 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '인증 요청을 보내는 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              
              {/* 이미 assignmentId가 있으면 약속 선택 UI를 표시하지 않음 */}
              {!assignmentId && pendingPromises.length > 0 && (
                <>
                  <Text className="text-lg font-medium my-3 text-emerald-700">어떤 약속을 인증할까요?</Text>
                  <View className="mb-4">
                    {pendingPromises.map(assignment => (
                      <Pressable
                        key={assignment.id}
                        className={`p-4 mb-2 rounded-xl border ${
                          selectedPromise === assignment.id 
                            ? 'bg-emerald-100 border-emerald-500' 
                            : 'bg-white border-gray-300'
                        }`}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedPromise(assignment.id);
                        }}
                      >
                        <Text className={`${selectedPromise === assignment.id ? 'font-medium text-emerald-800' : 'text-gray-700'}`}>
                          {assignment.promise?.title || '제목 없음'}
                        </Text>
                        {assignment.dueDate && (
                          <Text className="text-gray-500 text-sm mt-1">
                            기한: {new Date(assignment.dueDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
              
              {!assignmentId && pendingPromises.length === 0 && (
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
                  photoUri && (assignmentId || selectedPromise || pendingPromises.length === 0) && !isSubmitting
                    ? 'bg-emerald-500' 
                    : 'bg-gray-300'
                }`}
                onPress={handleSubmit}
                disabled={!photoUri || !(assignmentId || selectedPromise || pendingPromises.length === 0) || isSubmitting}
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
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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