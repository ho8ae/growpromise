// app/(child)/verify-promise.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 임시 데이터
const promises = [
  {
    id: '1',
    title: '책 읽기',
    time: '오후 7시',
    status: 'pending',
    icon: 'book-outline',
    xp: 5,
  },
  {
    id: '3',
    title: '이 닦기',
    time: '오후 9시',
    status: 'pending',
    icon: 'water-outline',
    xp: 3,
  },
  {
    id: '4',
    title: '방 정리하기',
    time: '오후 6시',
    status: 'pending',
    icon: 'home-outline',
    xp: 8,
  },
];

export default function VerifyPromiseScreen() {
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 애니메이션 값
  const buttonScale = useSharedValue(1);
  const photoScale = useSharedValue(1);
  const cameraOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);

  // 버튼 애니메이션 스타일
  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  // 사진 애니메이션 스타일
  const photoAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: photoScale.value }]
    };
  });

  // 카메라 애니메이션 스타일
  const cameraAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: cameraOpacity.value
    };
  });

  // 성공 애니메이션 스타일
  const successAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
      opacity: successScale.value
    };
  });

  const router = useRouter();

  // 약속 선택 시
  const handlePromiseSelect = (promise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPromise(promise);
  };

  // 카메라 버튼 클릭 시
  const handleCameraOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // 실제 앱에서는 카메라 모듈을 열어야 함
    // 여기서는 임시로 상태만 변경
    setIsCameraOpen(true);
    cameraOpacity.value = withTiming(1, { duration: 300 });
    
    // 테스트용: 몇 초 후에 임시 이미지 설정
    setTimeout(() => {
      setCapturedImage(require('../../assets/images/react-logo.png'));
      setIsCameraOpen(false);
      cameraOpacity.value = withTiming(0, { duration: 300 });
      
      // 사진 캡처 애니메이션
      photoScale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }, 2000);
  };

  // 사진 재촬영
  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCapturedImage(null);
  };

  // 인증 제출
  const handleSubmit = () => {
    if (!selectedPromise || !capturedImage) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(true);
    
    // 제출 성공 애니메이션
    successScale.value = withDelay(500, withTiming(1, { duration: 700 }));
    
    // 테스트용: 몇 초 후에 홈으로 이동
    setTimeout(() => {
      router.back();
    }, 2500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#3D5366" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#3D5366]">약속 인증하기</Text>
        <View className="w-6" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 안내 메시지 */}
        <Animated.Text 
          entering={FadeInDown.delay(200).duration(700)}
          className="text-center text-[#5D5E8C] text-base font-medium px-6 mb-6"
        >
          인증할 약속을 선택하고 사진을 찍어주세요!
        </Animated.Text>
        
        {/* 약속 선택 영역 */}
        <View className="px-6">
          {promises.map((promise, index) => (
            <Animated.View 
              key={promise.id}
              entering={FadeInRight.delay(300 + index * 100).duration(700)}
            >
              <TouchableOpacity
                className={`flex-row items-center bg-white rounded-xl p-4 mb-4 shadow-sm ${
                  selectedPromise?.id === promise.id ? 'border-2 border-[#70CAF8]' : ''
                }`}
                onPress={() => handlePromiseSelect(promise)}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  selectedPromise?.id === promise.id ? 'bg-[#70CAF8]' : 'bg-[#A6E1FA]'
                }`}>
                  <Ionicons 
                    name={promise.icon} 
                    size={24} 
                    color={selectedPromise?.id === promise.id ? 'white' : '#70CAF8'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-[#3D5366] font-medium mb-1">{promise.title}</Text>
                  <Text className="text-xs text-[#7E8CA3]">{promise.time}</Text>
                </View>
                <View>
                  {selectedPromise?.id === promise.id ? (
                    <Ionicons name="checkmark-circle" size={24} color="#A8E6CF" />
                  ) : (
                    <View className="w-6 h-6 rounded-full border-2 border-[#E8F0FB]" />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        {/* 사진 영역 */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(700)}
          className="mt-4 mx-6"
        >
          {!capturedImage ? (
            <Animated.View 
              className="bg-[#F5F8FF] rounded-2xl h-64 items-center justify-center overflow-hidden"
              style={[cameraAnimStyle]}
            >
              {isCameraOpen ? (
                <View className="items-center justify-center">
                  <Ionicons name="scan-outline" size={48} color="white" />
                  <Text className="mt-2 text-white font-medium">사진을 찍는 중...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  className="items-center justify-center"
                  onPress={handleCameraOpen}
                  disabled={!selectedPromise}
                >
                  <Animated.View className="items-center" style={buttonAnimStyle}>
                    <Ionicons 
                      name="camera" 
                      size={48} 
                      color={selectedPromise ? '#70CAF8' : '#7E8CA3'} 
                    />
                    <Text 
                      className={`mt-2 text-base font-medium ${
                        !selectedPromise ? 'text-[#7E8CA3]' : 'text-[#3D5366]'
                      }`}
                    >
                      사진 찍기
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            <View>
              <Animated.Image
                source={capturedImage}
                className="w-full h-64 rounded-2xl"
                style={[photoAnimStyle]}
                resizeMode="cover"
              />
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity 
                  className="flex-1 flex-row items-center justify-center py-3 bg-white rounded-xl border border-[#E8F0FB] mr-2 shadow-sm"
                  onPress={handleRetake}
                >
                  <Ionicons name="refresh" size={20} color="#3D5366" />
                  <Text className="ml-2 text-sm text-[#3D5366] font-medium">다시 찍기</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 flex-row items-center justify-center py-3 bg-[#70CAF8] rounded-xl ml-2 shadow-sm"
                  onPress={handleSubmit}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text className="ml-2 text-sm text-white font-bold">인증하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
      
      {/* 인증 제출 성공 오버레이 */}
      {isSubmitting && (
        <View className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Animated.View 
            className="bg-white rounded-2xl p-8 items-center mx-8"
            style={successAnimStyle}
          >
            <View className="w-20 h-20 rounded-full bg-[#A8E6CF] items-center justify-center mb-4">
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
            <Text className="text-2xl text-[#3D5366] font-bold mb-2">인증 완료!</Text>
            <Text className="text-base text-[#5D5E8C] text-center mb-4">
              엄마에게 인증 사진이 전송되었어요.
              곧 스티커를 받을 수 있을 거예요!
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={24} color="#FFEDA3" />
              <Text className="text-xl text-[#3D5366] font-bold ml-2">+{selectedPromise?.xp || 0}</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}