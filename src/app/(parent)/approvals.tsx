// src/app/(parent)/approvals.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

// API
import promiseApi from '../../api/modules/promise';
import stickerApi, { StickerTemplate } from '../../api/modules/sticker';

// Components
import SelectedStickerPreview from '../../components/parent/SelectedStickerPreview';
import StickerSelector from '../../components/parent/StickerSelector';
import ExperienceGainAnimation from '../../components/plant/ExperienceGainAnimation';

// Services
import { getFallbackTemplates } from '../../services/stickerService';

export default function ApprovalsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExperienceGain, setShowExperienceGain] = useState(false);
  const [experienceGained, setExperienceGained] = useState(0);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const [showStickerModal, setShowStickerModal] = useState(false);

  // 인증 데이터 쿼리
  const {
    data: verification,
    isLoading: isVerificationLoading,
    error: verificationError,
  } = useQuery({
    queryKey: ['verification', id],
    queryFn: async () => {
      try {
        // 이 API 엔드포인트가 구현되어 있지 않은 경우 getPendingVerifications에서 필터링하여 사용
        const pendingVerifications = await promiseApi.getPendingVerifications();
        const verificationDetails = pendingVerifications.find(
          (v: any) => v.id === id,
        );

        if (!verificationDetails) {
          throw new Error('요청한 인증 정보를 찾을 수 없습니다.');
        }

        return verificationDetails;
      } catch (error) {
        console.error('인증 요청 상세 정보 로드 중 오류:', error);
        throw new Error('인증 요청 정보를 불러오는 중 오류가 발생했습니다.');
      }
    },
    retry: 1,
  });

  // 스티커 템플릿 쿼리
  const {
    data: templates = [] as StickerTemplate[],
    isLoading: isTemplatesLoading,
  } = useQuery<StickerTemplate[]>({
    queryKey: ['stickerTemplates'],
    queryFn: async () => {
      try {
        // 서버에서 스티커 템플릿 가져오기
        const apiTemplates = await stickerApi.getAllStickerTemplates();
        return apiTemplates;
      } catch (error) {
        console.error('스티커 템플릿 로드 오류:', error);
        // API 호출 실패 시 폴백 템플릿 사용
        return getFallbackTemplates();
      }
    },
    retry: 1,
  });

  // 템플릿이 로드되면 첫 번째 스티커 자동 선택
  useEffect(() => {
    if (templates.length > 0 && !selectedStickerId) {
      setSelectedStickerId(templates[0].id);
    }
  }, [templates, selectedStickerId]);

  // 날짜 포맷 함수
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '날짜 정보 없음';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${year}년 ${month}월 ${day}일 ${hours}:${
      minutes < 10 ? '0' + minutes : minutes
    }`;
  }, []);

  // 이미지 URL 변환
  const getImageUrl = useCallback((imagePath?: string) => {
    if (!imagePath) return undefined;

    if (imagePath.startsWith('http')) {
      return { uri: imagePath };
    } else {
      const baseUrl = __DEV__
        ? 'http://localhost:3000'
        : 'https://api.kidsplan.app';
      return { uri: `${baseUrl}/${imagePath}` };
    }
  }, []);

  // 스티커 선택 모달 표시
  const openStickerSelector = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowStickerModal(true);
  }, []);

  // 스티커 선택 처리
  const handleSelectSticker = useCallback((stickerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStickerId(stickerId);
  }, []);

  // 인증 승인 처리
  const handleApprove = useCallback(async () => {
    if (!selectedStickerId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', '스티커를 선택해주세요.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('인증 승인', '이 약속 인증을 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: async () => {
          try {
            setIsSubmitting(true);

            // 인증 승인 API 호출
            const response = await promiseApi.respondToVerification(
              id as string,
              true,
            );

            // 스티커 생성
            if (verification?.childId && selectedStickerId) {
              try {
                const stickerTitle = verification.promise?.title || '약속 완료';

                await stickerApi.createSticker(
                  verification.childId,
                  stickerTitle,
                  selectedStickerId,
                  `${formatDate(
                    new Date().toISOString(),
                  )}에 약속을 완료했어요!`,
                );
              } catch (stickerError) {
                console.error('스티커 생성 오류:', stickerError);
              }
            }

            // 경험치 획득 정보 처리
            const gainedExp = response.experienceGained || 0;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // 경험치 획득 애니메이션 표시
            if (gainedExp > 0) {
              setExperienceGained(gainedExp);
              setShowExperienceGain(true);

              setTimeout(() => {
                setShowExperienceGain(false);
                Alert.alert(
                  '성공',
                  `인증을 승인했습니다. 자녀에게 스티커가 지급되었습니다.\n\n자녀의 식물이 ${gainedExp} 경험치를 획득했습니다!`,
                  [{ text: '확인', onPress: () => router.back() }],
                );
              }, 2000);
            } else {
              Alert.alert(
                '성공',
                '인증을 승인했습니다. 자녀에게 스티커가 지급되었습니다.',
                [{ text: '확인', onPress: () => router.back() }],
              );
            }

            setIsSubmitting(false);
          } catch (error) {
            console.error('인증 승인 중 오류:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('오류', '인증 승인 중 문제가 발생했습니다.');
            setIsSubmitting(false);
          }
        },
      },
    ]);
  }, [selectedStickerId, id, verification, formatDate, router]);

  // 인증 거절 처리
  const handleReject = useCallback(async () => {
    if (!rejectionReason.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', '거절 사유를 입력해주세요.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('인증 거절', '이 약속 인증을 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSubmitting(true);

            await promiseApi.respondToVerification(
              id as string,
              false,
              rejectionReason,
            );

            Alert.alert(
              '성공',
              '인증을 거절했습니다. 자녀에게 알림이 전송되었습니다.',
              [{ text: '확인', onPress: () => router.back() }],
            );

            setIsSubmitting(false);
          } catch (error) {
            console.error('인증 거절 중 오류:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('오류', '인증 거절 중 문제가 발생했습니다.');
            setIsSubmitting(false);
          }
        },
      },
    ]);
  }, [rejectionReason, id, router]);

  // 선택된 스티커 템플릿 찾기
  const selectedStickerTemplate = templates.find(
    (sticker) => sticker.id === selectedStickerId,
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 flex-1">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => router.back()}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">인증 확인</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* 로딩 상태 */}
        {isVerificationLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-2 text-gray-600">
              인증 정보를 불러오는 중...
            </Text>
          </View>
        )}

        {/* 에러 상태 */}
        {verificationError && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="exclamation-circle" size={40} color="#ef4444" />
            <Text className="mt-2 text-gray-700">불러오기 실패</Text>
            <Text className="text-gray-500 text-center mb-4">
              {verificationError instanceof Error
                ? verificationError.message
                : '오류가 발생했습니다.'}
            </Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium">돌아가기</Text>
            </Pressable>
          </View>
        )}

        {/* 데이터가 없는 경우 */}
        {!isVerificationLoading && !verificationError && !verification && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="search" size={40} color="#d1d5db" />
            <Text className="mt-2 text-gray-700">인증을 찾을 수 없습니다</Text>
            <Text className="text-gray-500 text-center mb-4">
              요청한 인증 정보를 찾을 수 없습니다. 이미 처리되었거나 삭제되었을
              수 있습니다.
            </Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium">돌아가기</Text>
            </Pressable>
          </View>
        )}

        {/* 인증 정보 */}
        {!isVerificationLoading && !verificationError && verification && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* 자녀 정보 */}
            <View className="flex-row items-center mb-4">
              <Image
                source={
                  verification.child?.user.profileImage
                    ? getImageUrl(verification.child.user.profileImage)
                    : require('../../assets/images/react-logo.png')
                }
                style={{ width: 60, height: 60 }}
                contentFit="cover"
                className="mr-4 rounded-full bg-gray-200"
              />
              <View>
                <Text className="text-xl font-bold text-gray-800">
                  {verification.child?.user.username || '이름 없음'}
                </Text>
                <Text className="text-gray-500">
                  인증 시간: {formatDate(verification.verificationTime)}
                </Text>
              </View>
            </View>

            {/* 약속 정보 */}
            <View className="mb-4 overflow-hidden rounded-xl">
              <LinearGradient
                colors={['#d1fae5', '#ecfdf5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-4 rounded-xl"
              >
                <Text className="text-lg font-bold text-emerald-800">
                  {verification.promise?.title || '제목 없음'}
                </Text>
                {verification.promise?.description && (
                  <Text className="text-gray-700 mt-1">
                    {verification.promise.description}
                  </Text>
                )}
                <View className="flex-row items-center mt-2">
                  <FontAwesome5
                    name="calendar-alt"
                    size={14}
                    color="#047857"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-gray-600">
                    기한: {formatDate(verification.dueDate)}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* 인증 이미지 */}
            <View className="mb-4 rounded-xl overflow-hidden border border-gray-200">
              {verification.verificationImage ? (
                <Image
                  source={getImageUrl(verification.verificationImage)}
                  style={{ width: '100%', height: 300 }}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View className="bg-gray-200 h-60 items-center justify-center">
                  <FontAwesome5 name="image" size={40} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">이미지 없음</Text>
                </View>
              )}
            </View>

            {/* 스티커 선택 영역 */}
            <View className="bg-emerald-50 p-4 rounded-xl mb-4">
              <Text className="text-lg font-bold text-emerald-800 mb-2">
                스티커 선택
              </Text>
              <Text className="text-gray-600 mb-3">
                승인 시 자녀에게 지급할 스티커를 선택해주세요
              </Text>

              {isTemplatesLoading ? (
                <SelectedStickerPreview
                  selectedSticker={null}
                  onPress={() => {}}
                  isLoading={true}
                />
              ) : (
                <SelectedStickerPreview
                  selectedSticker={selectedStickerTemplate || null}
                  onPress={openStickerSelector}
                />
              )}
            </View>

            {/* 승인/거절 영역 */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                인증 결정
              </Text>

              {/* 거절 사유 입력 필드 */}
              <TextInput
                className="border border-gray-300 rounded-xl p-3 mb-4"
                placeholder="거절 사유를 입력하세요 (거절 시 필수)"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* 버튼 영역 */}
              <View className="flex-row mt-2">
                <Pressable
                  className="flex-1 bg-red-500 py-3 rounded-xl mr-2 active:bg-red-600"
                  onPress={handleReject}
                  disabled={isSubmitting}
                >
                  <Text className="text-white text-center font-medium">
                    거절하기
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-1 bg-emerald-500 py-3 rounded-xl ml-2 active:bg-emerald-600"
                  onPress={handleApprove}
                  disabled={isSubmitting}
                >
                  <Text className="text-white text-center font-medium">
                    승인하기
                  </Text>
                </Pressable>
              </View>

              {/* 로딩 상태 */}
              {isSubmitting && (
                <View className="items-center mt-4">
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text className="text-gray-500 mt-1">처리 중...</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* 경험치 획득 애니메이션 */}
        {showExperienceGain && experienceGained > 0 && (
          <ExperienceGainAnimation amount={experienceGained} />
        )}

        {/* 스티커 선택 모달 */}
        <StickerSelector
          isVisible={showStickerModal}
          onClose={() => setShowStickerModal(false)}
          stickers={templates}
          selectedStickerId={selectedStickerId || ''}
          onSelectSticker={handleSelectSticker}
        />
      </View>
    </SafeAreaView>
  );
}
