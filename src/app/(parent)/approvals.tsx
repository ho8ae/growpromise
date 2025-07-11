import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API
import promiseApi from '../../api/modules/promise';
import stickerApi, { StickerTemplate } from '../../api/modules/sticker';

// useQuery
import { usePromiseRealtime } from '../../hooks/usePromiseRealtime';

// Components
import SelectedStickerPreview from '../../components/parent/SelectedStickerPreview';
import StickerSelector from '../../components/parent/StickerSelector';
import ExperienceGainAnimation from '../../components/plant/ExperienceGainAnimation';

// Services
import SafeStatusBar from '@/src/components/common/SafeStatusBar';
import Colors from '../../constants/Colors';
import { getFallbackTemplates } from '../../services/stickerService';

const { height: screenHeight } = Dimensions.get('window');

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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalResult, setApprovalResult] = useState<{
    approved: boolean;
    childName: string;
    promiseTitle: string;
    experienceGained: number;
  }>({
    approved: false,
    childName: '',
    promiseTitle: '',
    experienceGained: 0,
  });
  const { onPromiseVerificationResponded } = usePromiseRealtime();

  // 애니메이션 값
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // 헤더 애니메이션 값들
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0.95, 1],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 타이틀 섹션 애니메이션
  const titleSectionOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleSectionTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  // 인증 데이터 쿼리
  const {
    data: verification,
    isLoading: isVerificationLoading,
    error: verificationError,
  } = useQuery({
    queryKey: ['verification', id],
    queryFn: async () => {
      try {
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
        const apiTemplates = await stickerApi.getAllStickerTemplates();
        return apiTemplates;
      } catch (error) {
        console.error('스티커 템플릿 로드 오류:', error);
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

            // 실시간 업데이트 트리거
            onPromiseVerificationResponded(id as string, true);

            setIsSubmitting(false);

            // 성공 알림 및 뒤로가기
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              '승인 완료',
              `${verification?.child?.user.username || '자녀'}의 약속 인증이 승인되었습니다!`,
              [
                {
                  text: '확인',
                  onPress: () => {
                    router.back();
                  }
                }
              ]
            );

          } catch (error) {
            console.error('인증 승인 중 오류:', error);
            setIsSubmitting(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('오류', '인증 승인 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  }, [
    selectedStickerId,
    id,
    verification,
    formatDate,
    onPromiseVerificationResponded,
    router,
  ]);

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

            // 실시간 업데이트 트리거
            onPromiseVerificationResponded(id as string, false);

            setIsSubmitting(false);

            // 거절 완료 알림 및 뒤로가기
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              '거절 완료',
              `${verification?.child?.user.username || '자녀'}의 약속 인증이 거절되었습니다.`,
              [
                {
                  text: '확인',
                  onPress: () => {
                    router.back();
                  }
                }
              ]
            );

          } catch (error) {
            console.error('인증 거절 중 오류:', error);
            setIsSubmitting(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('오류', '인증 거절 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  }, [rejectionReason, id, verification, onPromiseVerificationResponded, router]);

  // 선택된 스티커 템플릿 찾기
  const selectedStickerTemplate = templates.find(
    (sticker) => sticker.id === selectedStickerId,
  );

  return (
    <View className="flex-1 bg-gray-50">
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 고정 헤더 */}
      <Animated.View
        className="absolute left-0 right-0 top-0 z-20"
        style={{
          opacity: headerOpacity,
          transform: [{ scale: headerScale }],
        }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
          className="border-b border-gray-200 shadow-sm"
        >
          <SafeAreaView edges={['top']}>
            <View className="flex-row items-center justify-between px-4 h-14">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="w-10 h-10 items-center justify-center rounded-full"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View className="bg-white shadow-sm rounded-full w-9 h-9 items-center justify-center">
                  <FontAwesome5
                    name="arrow-left"
                    size={16}
                    color={Colors.light.textSecondary}
                  />
                </View>
              </Pressable>

              <Animated.Text
                className="text-lg font-bold text-gray-800"
                style={{ opacity: titleOpacity }}
              >
                인증 확인
              </Animated.Text>

              <View className="w-10" />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* 로딩 상태 */}
      {isVerificationLoading && (
        <SafeAreaView className="flex-1 justify-center items-center" edges={['top']}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text className="mt-3 text-gray-600">인증 정보를 불러오는 중...</Text>
        </SafeAreaView>
      )}

      {/* 에러 상태 */}
      {verificationError && (
        <SafeAreaView className="flex-1 justify-center items-center p-6" edges={['top']}>
          <FontAwesome5 name="exclamation-circle" size={40} color="#ef4444" />
          <Text className="mt-4 text-lg font-bold text-gray-800">
            불러오기 실패
          </Text>
          <Text className="text-gray-500 text-center my-2">
            {verificationError instanceof Error
              ? verificationError.message
              : '오류가 발생했습니다.'}
          </Text>
          <Pressable
            className="mt-5 bg-gray-800 px-6 py-3 rounded-xl active:bg-gray-700"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">돌아가기</Text>
          </Pressable>
        </SafeAreaView>
      )}

      {/* 데이터가 없는 경우 */}
      {!isVerificationLoading && !verificationError && !verification && (
        <SafeAreaView className="flex-1 justify-center items-center p-6" edges={['top']}>
          <FontAwesome5 name="search" size={40} color="#d1d5db" />
          <Text className="mt-4 text-lg font-bold text-gray-800">
            인증을 찾을 수 없습니다
          </Text>
          <Text className="text-gray-500 text-center my-2">
            요청한 인증 정보를 찾을 수 없습니다. 이미 처리되었거나 삭제되었을 수
            있습니다.
          </Text>
          <Pressable
            className="mt-5 bg-gray-800 px-6 py-3 rounded-xl active:bg-gray-700"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">돌아가기</Text>
          </Pressable>
        </SafeAreaView>
      )}

      {/* 메인 콘텐츠 */}
      {!isVerificationLoading && !verificationError && verification && (
        <SafeAreaView className="flex-1" edges={['top']}>
          {/* 상단 타이틀 섹션 */}
          <Animated.View
            className="px-5 pt-4 pb-2 bg-gray-50"
            style={{
              opacity: titleSectionOpacity,
              transform: [{ translateY: titleSectionTranslateY }],
            }}
          >
            <Text className="text-2xl font-bold text-gray-800">인증 확인</Text>
            <Text className="text-gray-500 mt-1">
              자녀의 약속 인증을 확인하고 응답해 주세요
            </Text>
          </Animated.View>

          {/* 스크롤 가능한 콘텐츠 */}
          <Animated.ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            contentContainerStyle={{ 
              paddingBottom: 40, // 하단 여백 추가
              minHeight: screenHeight - 100, // 최소 높이 보장
            }}
          >
            <View className="px-5">
              {/* 인증 이미지 및 정보 카드 */}
              <View className="mb-6 rounded-2xl shadow-sm overflow-hidden bg-white">
                {/* 인증 이미지 */}
                {verification.verificationImage ? (
                  <Image
                    source={getImageUrl(verification.verificationImage)}
                    style={{ width: '100%', height: 280 }}
                    contentFit="cover"
                    transition={300}
                  />
                ) : (
                  <View className="bg-gray-200 h-64 items-center justify-center">
                    <FontAwesome5 name="image" size={40} color="#9ca3af" />
                    <Text className="text-gray-500 mt-2">이미지 없음</Text>
                  </View>
                )}

                {/* 약속 및 자녀 정보 */}
                <View className="p-5">
                  {/* 약속 제목 및 설명 */}
                  <Text className="text-xl font-bold text-gray-800 mb-1">
                    {verification.promise?.title || '제목 없음'}
                  </Text>
                  {verification.promise?.description && (
                    <Text className="text-gray-600 mt-1 mb-4">
                      {verification.promise.description}
                    </Text>
                  )}

                  {/* 인증 메시지 */}
                  {verification.verificationDescription && (
                    <View className="bg-blue-50 p-3 rounded-lg mb-4">
                      <View className="flex-row items-center mb-1">
                        <FontAwesome5
                          name="comment"
                          size={12}
                          color={Colors.light.primary}
                          solid
                        />
                        <Text className="ml-2 text-sm font-medium text-gray-700">
                          자녀의 메시지
                        </Text>
                      </View>
                      <Text className="text-gray-600">
                        {verification.verificationDescription}
                      </Text>
                    </View>
                  )}

                  {/* 구분선 */}
                  <View className="border-t border-gray-100 my-4" />

                  {/* 자녀 정보 및 시간 정보 */}
                  <View className="flex-row items-center">
                    <Image
                      source={
                        verification.child?.user.profileImage
                          ? getImageUrl(verification.child.user.profileImage)
                          : require('../../assets/images/icon/basicPeople_icon.png')
                      }
                      style={{ width: 40, height: 40 }}
                      contentFit="contain"
                      className="rounded-full bg-gray-200"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-800 font-medium">
                        {verification.child?.user.username || '이름 없음'}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        인증 시간: {formatDate(verification.verificationTime)}
                      </Text>
                    </View>

                    {/* 기한 정보 */}
                    <View className="bg-gray-100 px-3 py-2 rounded-lg">
                      <View className="flex-row items-center">
                        <FontAwesome5
                          name="calendar-alt"
                          size={12}
                          color="#4b5563"
                          className="mr-1"
                        />
                        <Text className="text-xs text-gray-600 font-medium">
                          기한
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-700 mt-1">
                        {formatDate(verification.dueDate)
                          .split(' ')
                          .slice(0, 3)
                          .join(' ')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 스티커 선택 영역 */}
              <View className="bg-white p-5 rounded-2xl mb-5 shadow-sm">
                <View className="flex-row items-center mb-2">
                  <FontAwesome5
                    name="star"
                    size={16}
                    color={Colors.light.primary}
                    className="mr-2"
                  />
                  <Text className="text-lg font-bold text-gray-800">
                    스티커 선택
                  </Text>
                </View>

                <Text className="text-gray-600 mb-4">
                  승인 시 자녀에게 지급할 스티커를 선택해주세요
                </Text>

                <SelectedStickerPreview
                  selectedSticker={selectedStickerTemplate || null}
                  onPress={openStickerSelector}
                  allStickers={templates}
                  onSelectSticker={handleSelectSticker}
                />
              </View>

              {/* 거절 사유 및 버튼 영역 */}
              <View className="bg-white p-5 rounded-2xl shadow-sm">
                <View className="flex-row items-center mb-2">
                  <FontAwesome5
                    name="clipboard-check"
                    size={16}
                    color="#4b5563"
                    className="mr-2"
                  />
                  <Text className="text-lg font-bold text-gray-800">
                    거절 사유
                  </Text>
                </View>

                {/* 거절 사유 입력 필드 */}
                <TextInput
                  className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50"
                  placeholder="거절 사유를 입력하세요 (거절 시 필수)"
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ minHeight: 80 }}
                />

                {/* 버튼 영역 */}
                <View className="flex-row mt-2">
                  <Pressable
                    className="flex-1 bg-gray-100 py-3.5 rounded-xl mr-2 active:bg-gray-200 border border-gray-200"
                    onPress={handleReject}
                    disabled={isSubmitting}
                  >
                    <View className="flex-row items-center justify-center">
                      <FontAwesome5
                        name="times"
                        size={15}
                        color="#ef4444"
                        className="mr-2"
                      />
                      <Text className="text-gray-800 text-center font-medium">
                        거절하기
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    className="flex-1 bg-emerald-500 py-3.5 rounded-xl ml-2 active:bg-emerald-600"
                    onPress={handleApprove}
                    disabled={isSubmitting}
                  >
                    <View className="flex-row items-center justify-center">
                      <FontAwesome5
                        name="check"
                        size={15}
                        color="white"
                        className="mr-2"
                      />
                      <Text className="text-white text-center font-medium">
                        승인하기
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* 로딩 상태 */}
                {isSubmitting && (
                  <View className="items-center mt-4">
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.primary}
                    />
                    <Text className="text-gray-500 mt-1">처리 중...</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.ScrollView>
        </SafeAreaView>
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
        onConfirm={handleApprove}
      />
    </View>
  );
}