// src/app/(parent)/approvals.tsx 수정
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import promiseApi, { PromiseAssignment } from '../../api/modules/promise';
import * as Haptics from 'expo-haptics';
import ExperienceGainAnimation from '../../components/plant/ExperienceGainAnimation';

export default function ApprovalsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [verification, setVerification] = useState<PromiseAssignment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExperienceGain, setShowExperienceGain] = useState(false);
  const [experienceGained, setExperienceGained] = useState(0);
  
  // 인증 요청 상세 정보 로드
  useEffect(() => {
    if (id) {
      loadVerificationDetails();
    }
  }, [id]);
  
  // 인증 요청 상세 정보 로드 함수
  const loadVerificationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 이 API 엔드포인트가 구현되어 있지 않은 경우 getPendingVerifications에서 필터링하여 사용
      const pendingVerifications = await promiseApi.getPendingVerifications();
      const verificationDetails = pendingVerifications.find((v:any) => v.id === id);
      
      if (verificationDetails) {
        setVerification(verificationDetails);
      } else {
        setError('요청한 인증 정보를 찾을 수 없습니다.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('인증 요청 상세 정보 로드 중 오류:', error);
      setError('인증 요청 정보를 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  // 날짜 포맷 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '날짜 정보 없음';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };
  
  // 이미지 URL 변환
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return undefined;
    
    // 서버 URL과 이미지 경로 결합
    if (imagePath.startsWith('http')) {
      return { uri: imagePath };
    } else {
      // 개발 환경에 맞는 기본 URL 설정
      const baseUrl = __DEV__ 
        ? 'http://localhost:3000' 
        : 'https://api.kidsplan.app';
      return { uri: `${baseUrl}/${imagePath}` };
    }
  };
  
  // 인증 승인 처리
  const handleApprove = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '인증 승인',
      '이 약속 인증을 승인하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '승인', 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              
              // API 호출 및 응답 받기
              const response = await promiseApi.respondToVerification(id as string, true);
              
              // 경험치 획득 정보 처리
              const gainedExp = response.experienceGained || 0;
              
              // 성공 처리
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // 경험치 획득 애니메이션 표시
              if (gainedExp > 0) {
                setExperienceGained(gainedExp);
                setShowExperienceGain(true);
                
                // 애니메이션 후 알림 표시
                setTimeout(() => {
                  setShowExperienceGain(false);
                  Alert.alert(
                    '성공',
                    `인증을 승인했습니다. 자녀에게 스티커가 지급되었습니다.\n\n자녀의 식물이 ${gainedExp} 경험치를 획득했습니다!`,
                    [{ text: '확인', onPress: () => router.back() }]
                  );
                }, 2000);
              } else {
                Alert.alert(
                  '성공',
                  '인증을 승인했습니다. 자녀에게 스티커가 지급되었습니다.',
                  [{ text: '확인', onPress: () => router.back() }]
                );
              }
              
              setIsSubmitting(false);
            } catch (error) {
              console.error('인증 승인 중 오류:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('오류', '인증 승인 중 문제가 발생했습니다.');
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
  // 인증 거절 처리
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('알림', '거절 사유를 입력해주세요.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '인증 거절',
      '이 약속 인증을 거절하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '거절', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              
              await promiseApi.respondToVerification(id as string, false, rejectionReason);
              
              // 성공 처리
              Alert.alert(
                '성공',
                '인증을 거절했습니다. 자녀에게 알림이 전송되었습니다.',
                [{ text: '확인', onPress: () => router.back() }]
              );
              
              setIsSubmitting(false);
            } catch (error) {
              console.error('인증 거절 중 오류:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('오류', '인증 거절 중 문제가 발생했습니다.');
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 flex-1">
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
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-2 text-gray-600">인증 정보를 불러오는 중...</Text>
          </View>
        )}
        
        {/* 에러 상태 */}
        {error && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="exclamation-circle" size={40} color="#ef4444" />
            <Text className="mt-2 text-gray-700">불러오기 실패</Text>
            <Text className="text-gray-500 text-center mb-4">{error}</Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium">돌아가기</Text>
            </Pressable>
          </View>
        )}
        
        {/* 데이터가 없는 경우 */}
        {!isLoading && !error && !verification && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="search" size={40} color="#d1d5db" />
            <Text className="mt-2 text-gray-700">인증을 찾을 수 없습니다</Text>
            <Text className="text-gray-500 text-center mb-4">
              요청한 인증 정보를 찾을 수 없습니다. 이미 처리되었거나 삭제되었을 수 있습니다.
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
        {!isLoading && !error && verification && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* 자녀 정보 */}
            <View className="flex-row items-center mb-4">
              <Image
                source={verification.child?.user.profileImage ? 
                  getImageUrl(verification.child.user.profileImage) : 
                  require('../../assets/images/react-logo.png')
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
            <View className="bg-emerald-50 p-4 rounded-xl mb-4">
              <Text className="text-lg font-bold text-emerald-800">
                {verification.promise?.title || '제목 없음'}
              </Text>
              {verification.promise?.description && (
                <Text className="text-gray-700 mt-1">
                  {verification.promise.description}
                </Text>
              )}
              <Text className="text-gray-600 mt-2">
                기한: {formatDate(verification.dueDate)}
              </Text>
            </View>
            
            {/* 인증 이미지 */}
            <View className="mb-4 rounded-xl overflow-hidden">
              {verification.verificationImage ? (
                <Image
                  source={getImageUrl(verification.verificationImage)}
                  style={{ width: '100%', height: 300 }}
                  contentFit="cover"
                />
              ) : (
                <View className="bg-gray-200 h-60 items-center justify-center">
                  <FontAwesome5 name="image" size={40} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">이미지 없음</Text>
                </View>
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
                  className="flex-1 bg-red-500 py-3 rounded-xl mr-2"
                  onPress={handleReject}
                  disabled={isSubmitting}
                >
                  <Text className="text-white text-center font-medium">거절하기</Text>
                </Pressable>
                
                <Pressable
                  className="flex-1 bg-emerald-500 py-3 rounded-xl ml-2"
                  onPress={handleApprove}
                  disabled={isSubmitting}
                >
                  <Text className="text-white text-center font-medium">승인하기</Text>
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
      </View>
    </SafeAreaView>
  );
}