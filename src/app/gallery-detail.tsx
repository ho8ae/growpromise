// src/app/gallery-detail.tsx - 개선된 버전
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeStatusBar from '../components/common/SafeStatusBar';

// API
import api from '../api';

// Stores
import { useAuthStore } from '../stores/authStore';

// Utils
import Colors from '../constants/Colors';
import { getImageUrl } from '../utils/imageUrl';

// 화면 크기 가져오기
const { width, height } = Dimensions.get('window');

// 안전한 날짜 포맷팅 함수
const formatDate = (dateString?: string, includeTime: boolean = false) => {
  if (!dateString) return '날짜 정보 없음';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '날짜 정보 없음';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (includeTime) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    } else {
      return `${month}월 ${day}일`;
    }
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '날짜 정보 없음';
  }
};

// 갤러리 상세 화면
export default function GalleryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 상태
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 이미지 상세 정보 조회
  const {
    data: galleryDetail,
    isLoading: isLoadingDetail,
    error,
  } = useQuery({
    queryKey: ['galleryDetail', id],
    queryFn: async () => {
      try {
        return await api.gallery.getImageById(id as string);
      } catch (error) {
        console.error('갤러리 이미지 상세 조회 실패:', error);
        throw error;
      }
    },
    enabled: !!id,
  });

  // 이미지 다운로드 및 갤러리 저장
  const downloadImage = async () => {
    if (!galleryDetail?.imageUrl) {
      Alert.alert('오류', '이미지 URL을 찾을 수 없습니다.');
      return;
    }

    try {
      // 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '이미지를 저장하려면 미디어 라이브러리 접근 권한이 필요합니다.',
        );
        return;
      }

      setDownloading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // 이미지 URL 준비
      const imageUrl = getImageUrl(galleryDetail.imageUrl)?.uri;
      if (!imageUrl) throw new Error('유효한 이미지 URL이 아닙니다.');

      // 임시 파일로 다운로드
      const fileUri =
        FileSystem.documentDirectory + `temp_image_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error('이미지 다운로드 실패');
      }

      // 미디어 라이브러리에 저장
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync('쑥쑥약속');

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('쑥쑥약속', asset, false);
      }

      // 임시 파일 삭제
      await FileSystem.deleteAsync(fileUri);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('성공', '이미지가 갤러리에 저장되었습니다.');
    } catch (error) {
      console.error('이미지 다운로드 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '이미지 저장 중 문제가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  // 이미지 공유
  const shareImage = async () => {
    if (!galleryDetail?.imageUrl) {
      Alert.alert('오류', '이미지 URL을 찾을 수 없습니다.');
      return;
    }

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // 이미지 URL 준비
      const imageUrl = getImageUrl(galleryDetail.imageUrl)?.uri;
      if (!imageUrl) throw new Error('유효한 이미지 URL이 아닙니다.');

      // 임시 파일로 다운로드
      const fileUri =
        FileSystem.documentDirectory + `temp_share_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error('이미지 다운로드 실패');
      }

      // 공유 시작
      await Share.share({
        url: fileUri,
        title: galleryDetail.promiseTitle,
        message: `약속 "${galleryDetail.promiseTitle}" 인증 사진`,
      });

      // 임시 파일 삭제
      await FileSystem.deleteAsync(fileUri);
    } catch (error) {
      console.error('이미지 공유 오류:', error);
      Alert.alert('오류', '이미지 공유 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async () => {
    if (!galleryDetail) return;

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newFavoriteStatus = !galleryDetail.isFavorite;

      // API 호출
      await api.gallery.toggleImageFavorite(
        galleryDetail.id,
        newFavoriteStatus,
      );

      // 상세 정보 캐시 업데이트
      queryClient.setQueryData(['galleryDetail', id], {
        ...galleryDetail,
        isFavorite: newFavoriteStatus,
      });

      // 갤러리 목록 캐시 업데이트
      queryClient.setQueriesData({ queryKey: ['gallery'] }, (oldData: any) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.map((img) =>
            img.id === galleryDetail.id
              ? { ...img, isFavorite: newFavoriteStatus }
              : img,
          );
        }
        return oldData;
      });
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error);
      Alert.alert('오류', '즐겨찾기 상태 변경 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 확대/축소 토글
  const toggleImageZoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 현재 상태의 반대로 변경
    const newZoomState = !isImageZoomed;
    setIsImageZoomed(newZoomState);

    // 확대/축소 애니메이션
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: newZoomState ? 1.5 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: newZoomState ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 로딩 상태 표시
  if (isLoadingDetail) {
    return (
      <View
        className="flex-1 justify-center items-center bg-gray-50"
        style={{ paddingTop: insets.top }}
      >
        <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text className="mt-4 text-gray-500">이미지 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태 표시
  if (error || !galleryDetail) {
    return (
      <View
        className="flex-1 justify-center items-center bg-gray-50 p-4"
        style={{ paddingTop: insets.top }}
      >
        <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
        <FontAwesome5 name="exclamation-circle" size={40} color="#ef4444" />
        <Text className="mt-4 text-lg font-bold text-gray-800">
          이미지를 찾을 수 없습니다
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          요청하신 이미지를 찾을 수 없거나 액세스 권한이 없습니다.
        </Text>
        <Pressable
          className="mt-6 px-6 py-3 bg-gray-800 rounded-xl active:bg-gray-700"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">뒤로 가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <SafeStatusBar style="light" backgroundColor="#000000" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 이미지 영역 */}
      <Pressable
        onPress={toggleImageZoom}
        className="flex-1 justify-center items-center"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Image
            source={getImageUrl(galleryDetail.imageUrl)}
            style={{ width, height: height / 1.8 }}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </Pressable>

      {/* 상단 헤더 바 - 사진 정보로 변경 */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10"
        style={{ opacity: fadeAnim, paddingTop: insets.top }}
      >
        <BlurView
          intensity={80}
          tint="dark"
          className="flex-row justify-between items-center p-4"
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className="bg-black/30 rounded-full w-9 h-9 items-center justify-center">
              <FontAwesome5 name="arrow-left" size={16} color="white" />
            </View>
          </Pressable>

          {/* 사진 정보를 헤더에 표시 */}
          <View className="flex-1 items-center mx-3">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {galleryDetail.promiseTitle}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-300 text-sm">
                {formatDate(galleryDetail.verificationTime, true)}
              </Text>
              {/* 자녀 정보 (부모 계정일 때만) */}
              {user?.userType === 'PARENT' && galleryDetail.childName && (
                <>
                  <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                  <FontAwesome5 name="user" size={12} color="#CCCCCC" />
                  <Text className="text-gray-300 text-sm ml-1">
                    {galleryDetail.childName}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* 즐겨찾기 상태 표시 */}
          <View className="w-10 h-10 items-center justify-center">
            {galleryDetail.isFavorite && (
              <FontAwesome5 name="heart" size={16} color="#FF4B4B" solid />
            )}
          </View>
        </BlurView>
      </Animated.View>

      {/* 하단 정보 및 액션 바 */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ opacity: fadeAnim }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          className="p-4 pb-8"
          style={{ paddingBottom: insets.bottom ? insets.bottom + 10 : 20 }}
        >
          {/* 상세 정보 */}
          <View className="mb-4">
            {/* 인증 설명이 있는 경우 표시 */}
            {galleryDetail.verificationDescription && (
              <View className="p-3 bg-white/10 rounded-lg">
                <Text className="text-gray-200 text-sm">
                  {galleryDetail.verificationDescription}
                </Text>
              </View>
            )}
          </View>

          {/* 액션 버튼 영역 */}
          <View className="flex-row justify-around">
            {/* 즐겨찾기 버튼 */}
            <Pressable
              onPress={toggleFavorite}
              className="items-center"
              disabled={isLoading}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-1">
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome5
                    name="heart"
                    size={22}
                    color={galleryDetail.isFavorite ? '#FF4B4B' : 'white'}
                    solid={galleryDetail.isFavorite}
                  />
                )}
              </View>
              <Text className="text-white text-xs">
                {galleryDetail.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
              </Text>
            </Pressable>

            {/* 저장 버튼 */}
            <Pressable
              onPress={downloadImage}
              className="items-center"
              disabled={downloading}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-1">
                {downloading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome5 name="download" size={22} color="white" />
                )}
              </View>
              <Text className="text-white text-xs">저장</Text>
            </Pressable>

            {/* 공유 버튼 */}
            <Pressable
              onPress={shareImage}
              className="items-center"
              disabled={isLoading}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-1">
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome5 name="share-alt" size={22} color="white" />
                )}
              </View>
              <Text className="text-white text-xs">공유</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
