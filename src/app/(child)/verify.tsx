import { FontAwesome } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import promiseApi, {
  PromiseAssignment,
  PromiseStatus,
} from '../../api/modules/promise';
import PromiseSuccessModal from '../../components/common/modal/PromiseSuccessModal';
import { usePromiseRealtime } from '../../hooks/usePromiseRealtime';

// 🆕 이미지 압축 유틸리티 import
import {
  compressCameraImage,
  compressGalleryImage,
  bytesToMB,
  getImageSize
} from '../../utils/imageCompression';

export default function VerifyPromise() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assignmentId = params.assignmentId as string;
  const promiseId = params.promiseId as string;

  // 실시간 업데이트 훅
  const { onPromiseVerificationSubmitted } = usePromiseRealtime();

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [selectedPromise, setSelectedPromise] = useState<string>(
    promiseId || '',
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPromises, setPendingPromises] = useState<PromiseAssignment[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  // 🆕 이미지 압축 관련 상태
  const [isCompressing, setIsCompressing] = useState(false);

  // 성공 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        const foundAssignment = response.find(
          (assignment) => assignment.id === assignmentId,
        );
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

  // 🆕 이미지 크기 확인 및 로깅 함수
  const logImageInfo = async (uri: string, label: string) => {
    const size = await getImageSize(uri);
    const sizeMB = bytesToMB(size);
    console.log(`📸 ${label} 크기: ${sizeMB.toFixed(2)}MB`);
  };

  // 🔄 카메라 촬영 함수 (이미지 압축 적용)
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // 카메라로 사진 촬영
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8, // 초기 품질 설정
        });
        
        if (photo?.uri) {
          setIsCompressing(true);
          
          // 원본 이미지 크기 로깅
          await logImageInfo(photo.uri, '원본 카메라 이미지');
          
          // 🆕 이미지 압축 적용
          const compressedUri = await compressCameraImage(photo.uri);
          
          // 압축된 이미지 크기 로깅
          await logImageInfo(compressedUri, '압축된 카메라 이미지');
          
          setPhotoUri(compressedUri);
          setIsCompressing(false);
        }
        
        setIsCameraActive(false);
      } catch (error) {
        console.error('Failed to take picture:', error);
        setIsCompressing(false);
        Alert.alert('오류', '사진 촬영 중 문제가 발생했습니다.');
      }
    }
  };

  // 🔄 갤러리 이미지 선택 함수 (이미지 압축 적용)
  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // 갤러리에서 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // 초기 품질 설정
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsCompressing(true);
        
        const originalUri = result.assets[0].uri;
        
        // 원본 이미지 크기 로깅
        await logImageInfo(originalUri, '원본 갤러리 이미지');
        
        // 🆕 이미지 압축 적용
        const compressedUri = await compressGalleryImage(originalUri);
        
        // 압축된 이미지 크기 로깅
        await logImageInfo(compressedUri, '압축된 갤러리 이미지');
        
        setPhotoUri(compressedUri);
        setIsCompressing(false);
      }
    } catch (error) {
      console.error('이미지 선택 중 오류:', error);
      setIsCompressing(false);
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

      const currentAssignmentId = assignmentId || selectedPromise;

      // 🆕 제출 전 최종 이미지 크기 확인
      await logImageInfo(photoUri, '제출할 이미지');

      // API 호출하여 인증 제출
      await promiseApi.submitVerification(
        currentAssignmentId,
        photoUri,
        message.trim() ? message : undefined,
      );

      // ✨ 핵심: 실시간 업데이트 트리거
      onPromiseVerificationSubmitted(currentAssignmentId);

      // 성공 시 모달 표시
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('인증 제출 중 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // 🆕 413 오류 특별 처리
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('파일이 너무 큽니다') || errorMessage.includes('413')) {
        Alert.alert(
          '파일 크기 오류',
          '이미지 파일이 여전히 너무 큽니다. 다른 이미지를 선택해보세요.',
        );
      } else {
        Alert.alert(
          '오류',
          '인증 요청을 보내는 중 오류가 발생했습니다. 다시 시도해주세요.',
        );
      }
      setIsSubmitting(false);
    }
  };

  // 성공 모달 닫기 핸들러
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);

    // ✨ 모달 닫을 때도 한 번 더 업데이트 (확실히 하기 위해)
    setTimeout(() => {
      onPromiseVerificationSubmitted(assignmentId || selectedPromise);
    }, 300);

    router.back();
  };

  if (!permission) {
    // 카메라 권한이 로딩 중
    return (
      <View className="flex-1 items-center justify-center">
        <Text>카메라 권한을 확인하는 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // 권한이 없을 때 권한 요청 화면
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-center text-lg mb-4">
          카메라를 사용하려면 권한이 필요합니다
        </Text>
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
        <View className="pt-4 pb-8 px-4">
          <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
            약속 인증하기
          </Text>

          {isLoading ? (
            <View className="items-center justify-center p-10">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="mt-3 text-emerald-700">
                약속 목록을 불러오는 중...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center p-10">
              <FontAwesome
                name="exclamation-circle"
                size={40}
                color="#ef4444"
              />
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
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            setCameraType(
                              cameraType === 'back' ? 'front' : 'back',
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
                <View className="bg-emerald-50 border-2 border-emerald-200 rounded-xl aspect-square items-center justify-center mb-4 overflow-hidden mx-auto">
                  {/* 🆕 이미지 압축 중 로딩 표시 */}
                  {isCompressing ? (
                    <View className="items-center">
                      <ActivityIndicator size="large" color="#10b981" />
                      <Text className="text-emerald-700 mt-3 text-lg">
                        이미지 최적화 중...
                      </Text>
                      <Text className="text-emerald-600 mt-1 text-sm">
                        잠시만 기다려주세요
                      </Text>
                    </View>
                  ) : photoUri ? (
                    <Image
                      source={{ uri: photoUri }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      className="rounded-xl"
                    />
                  ) : (
                    <View className="items-center">
                      <FontAwesome
                        name="camera"
                        size={50}
                        color="#10b981"
                        className="mb-4"
                      />
                      <Text className="text-emerald-700 mb-6 text-lg">
                        사진을 찍어주세요
                      </Text>
                      <View className="flex-row">
                        <Pressable
                          className="bg-emerald-500 px-6 py-3 rounded-full mr-3 shadow-sm"
                          onPress={() => setIsCameraActive(true)}
                          disabled={isCompressing}
                        >
                          <Text className="text-white font-medium">
                            사진 찍기
                          </Text>
                        </Pressable>
                        <Pressable
                          className="bg-emerald-400 px-6 py-3 rounded-full shadow-sm"
                          onPress={pickImage}
                          disabled={isCompressing}
                        >
                          <Text className="text-white font-medium">
                            앨범에서 선택
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* 이미 assignmentId가 있으면 약속 선택 UI를 표시하지 않음 */}
              {!assignmentId && pendingPromises.length > 0 && (
                <>
                  <Text className="text-lg font-medium my-3 text-emerald-700">
                    어떤 약속을 인증할까요?
                  </Text>
                  <View className="mb-4">
                    {pendingPromises.map((assignment) => (
                      <Pressable
                        key={assignment.id}
                        className={`p-4 mb-2 rounded-xl border ${
                          selectedPromise === assignment.id
                            ? 'bg-emerald-100 border-emerald-500'
                            : 'bg-white border-gray-300'
                        }`}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          setSelectedPromise(assignment.id);
                        }}
                      >
                        <Text
                          className={`${
                            selectedPromise === assignment.id
                              ? 'font-medium text-emerald-800'
                              : 'text-gray-700'
                          }`}
                        >
                          {assignment.promise?.title || '제목 없음'}
                        </Text>
                        {assignment.dueDate && (
                          <Text className="text-gray-500 text-sm mt-1">
                            기한:{' '}
                            {new Date(assignment.dueDate).toLocaleDateString(
                              'ko-KR',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )}
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
                    인증할 수 있는 약속이 없습니다. 부모님께 약속을 만들어
                    달라고 요청해보세요!
                  </Text>
                </View>
              )}

              <Text className="text-lg font-bold my-3 text-emerald-700">
                부모님께 한 마디! (선택사항)
              </Text>
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
                className={`py-4 rounded-xl shadow-sm ${
                  photoUri &&
                  (assignmentId ||
                    selectedPromise ||
                    pendingPromises.length === 0) &&
                  !isSubmitting &&
                  !isCompressing
                    ? 'bg-emerald-500'
                    : 'bg-gray-300'
                }`}
                onPress={handleSubmit}
                disabled={
                  !photoUri ||
                  !(
                    assignmentId ||
                    selectedPromise ||
                    pendingPromises.length === 0
                  ) ||
                  isSubmitting ||
                  isCompressing
                }
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
                  disabled={isSubmitting || isCompressing}
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

      {/* 성공 모달 */}
      <PromiseSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        message="부모님께 인증 요청을 보냈어요! 승인되면 식물이 경험치를 얻게 됩니다."
      />
    </SafeAreaView>
  );
}