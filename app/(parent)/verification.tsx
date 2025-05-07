// app/(parent)/verification.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// 임시 데이터
const pendingVerifications = [
  {
    id: '1',
    childName: '민준',
    promiseTitle: '책 읽기',
    time: '오늘 오후 3:25',
    image: require('../../assets/images/react-logo.png'),
    icon: 'book-outline',
  },
  {
    id: '2',
    childName: '민준',
    promiseTitle: '방 정리하기',
    time: '어제 오후 7:10',
    image: require('../../assets/images/react-logo.png'),
    icon: 'home-outline',
  },
];

export default function VerificationScreen() {
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [praiseInput, setPraiseInput] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showPraiseInput, setShowPraiseInput] = useState(false);

  const router = useRouter();

  const handleVerificationSelect = (verification) => {
    setSelectedVerification(verification);
    setShowPraiseInput(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleApprove = () => {
    if (!selectedVerification) return;

    setShowPraiseInput(true);
    // 기본 보상 설정
    setRewardAmount(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleReject = () => {
    if (!selectedVerification) return;

    // 실제로는 거절 처리 로직 구현
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // 목록에서 제거
    // 실제 앱에서는 API 호출 후 상태 업데이트
    setTimeout(() => {
      setSelectedVerification(null);
    }, 500);
  };

  const handleConfirmPraise = () => {
    if (!selectedVerification) return;

    // 실제로는 승인 및 칭찬 메시지 저장 로직 구현
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 목록에서 제거 및 화면 리셋
    setTimeout(() => {
      setSelectedVerification(null);
      setShowPraiseInput(false);
      setPraiseInput('');
      setRewardAmount(0);
    }, 500);
  };

  const adjustReward = (amount) => {
    const newAmount = rewardAmount + amount;
    if (newAmount >= 0) {
      setRewardAmount(newAmount);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#3D5366" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#3D5366]">인증 확인</Text>
        <View className="w-6" />
      </View>

      <View className="flex-row h-full">
        {/* 인증 목록 */}
        <View className="w-1/3 border-r border-[#E8F0FB]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="px-4 py-2 text-xs font-bold text-[#7E8CA3] bg-[#F8FAFF]">
              대기 중인 인증 ({pendingVerifications.length})
            </Text>

            {pendingVerifications.map((verification, index) => (
              <Animated.View
                key={verification.id}
                entering={FadeInDown.delay(200 + index * 100).duration(500)}
              >
                <TouchableOpacity
                  className={`p-4 border-b border-[#E8F0FB] ${
                    selectedVerification?.id === verification.id
                      ? 'bg-[#F5F8FF]'
                      : ''
                  }`}
                  onPress={() => handleVerificationSelect(verification)}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 rounded-full bg-[#A6E1FA] items-center justify-center mr-2">
                      <Ionicons
                        name={verification.icon}
                        size={16}
                        color="#70CAF8"
                      />
                    </View>
                    <Text
                      className="text-sm font-bold text-[#3D5366]"
                      numberOfLines={1}
                    >
                      {verification.promiseTitle}
                    </Text>
                  </View>
                  <Text className="text-xs text-[#7E8CA3]">
                    {verification.childName}
                  </Text>
                  <Text className="text-xs text-[#7E8CA3]">
                    {verification.time}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {pendingVerifications.length === 0 && (
              <View className="p-6 items-center justify-center">
                <Ionicons name="checkmark-circle" size={40} color="#A8E6CF" />
                <Text className="text-sm text-[#5D5E8C] text-center mt-2">
                  모든 인증을 확인했어요!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* 인증 상세 */}
        <View className="flex-1">
          {selectedVerification ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
            >
              <Animated.View entering={FadeIn.duration(300)}>
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-[#A6E1FA] items-center justify-center mr-3">
                    <Ionicons
                      name={selectedVerification.icon}
                      size={20}
                      color="#70CAF8"
                    />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-[#3D5366]">
                      {selectedVerification.promiseTitle}
                    </Text>
                    <Text className="text-xs text-[#7E8CA3]">
                      {selectedVerification.childName} •{' '}
                      {selectedVerification.time}
                    </Text>
                  </View>
                </View>

                <View className="rounded-xl overflow-hidden mb-4">
                  <Image
                    source={selectedVerification.image}
                    className="w-full h-64"
                    resizeMode="cover"
                  />
                </View>

                {!showPraiseInput ? (
                  <View className="flex-row">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3 bg-white rounded-xl border border-[#E8F0FB] mr-2"
                      onPress={handleReject}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF7A6D" />
                      <Text className="ml-2 text-sm text-[#FF7A6D] font-medium">
                        거절하기
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3 bg-[#A8E6CF] rounded-xl ml-2"
                      onPress={handleApprove}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="white"
                      />
                      <Text className="ml-2 text-sm text-white font-bold">
                        승인하기
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Animated.View entering={FadeInDown.duration(300)}>
                    <Text className="text-sm font-medium text-[#5D5E8C] mb-2">
                      칭찬 메시지
                    </Text>
                    <View className="bg-[#F5F8FF] rounded-xl p-4 mb-4">
                      <TextInput
                        className="h-24 text-base text-[#3D5366]"
                        placeholder="아이에게 전할 칭찬 메시지를 입력하세요"
                        value={praiseInput}
                        onChangeText={setPraiseInput}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>

                    <Text className="text-sm font-medium text-[#5D5E8C] mb-2">
                      스티커 보상
                    </Text>
                    <View className="flex-row items-center justify-between bg-[#F5F8FF] rounded-xl p-4 mb-6">
                      <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white items-center justify-center"
                        onPress={() => adjustReward(-1)}
                      >
                        <Ionicons name="remove" size={24} color="#7E8CA3" />
                      </TouchableOpacity>

                      <View className="flex-row items-center">
                        <Text className="text-2xl font-bold text-[#3D5366] mr-2">
                          {rewardAmount}
                        </Text>
                        <Ionicons name="star" size={24} color="#FFEDA3" />
                      </View>

                      <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white items-center justify-center"
                        onPress={() => adjustReward(1)}
                      >
                        <Ionicons name="add" size={24} color="#7E8CA3" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      className="flex-row items-center justify-center py-4 bg-[#70CAF8] rounded-xl"
                      onPress={handleConfirmPraise}
                    >
                      <Text className="text-base text-white font-bold">
                        칭찬 메시지 보내기
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </Animated.View>
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center p-6">
              <Ionicons name="images-outline" size={64} color="#E8F0FB" />
              <Text className="text-base text-[#7E8CA3] text-center mt-4">
                왼쪽에서 확인할 인증을 선택해주세요
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
