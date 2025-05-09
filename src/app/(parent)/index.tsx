// app/(parent)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSlideInAnimation } from '../../utils/animations';
import { useAuthStore } from '../../stores/authStore';

// 인증 요청 인터페이스 정의
interface Verification {
  id: string;
  child?: {
    id: string;
    user: {
      id: string;
      username: string;
      profileImage?: string;
    };
  };
  promise?: {
    id: string;
    title: string;
    description?: string;
  };
  verificationTime?: string;
  verificationImage?: string;
  dueDate: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { animation, startAnimation } = useSlideInAnimation();
  const [pendingVerifications, setPendingVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 애니메이션 시작 및 데이터 로드
  useEffect(() => {
    startAnimation();
    loadPendingVerifications();
  }, []);
  
  // 승인 대기 중인 약속 인증 목록 조회
  const loadPendingVerifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 실제 구현 시 API 호출 부분
      // const response = await promiseApi.getPendingVerifications();
      // setPendingVerifications(response);
      
      // 개발 중에는 빈 데이터 설정
      setPendingVerifications([]);
      
      setIsLoading(false);
    } catch (error) {
      console.error('인증 요청 목록 로드 중 오류:', error);
      setError('인증 요청 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  // 현재 시간 기준으로 상대적 시간 표시
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return '시간 정보 없음';
    
    const now = new Date();
    const date = new Date(dateString);
    
    // 시간 차이 계산 (밀리초 단위)
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  };
  
  // 이미지 URL 변환
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return require('../../assets/images/react-logo.png');
    
    // 서버 URL과 이미지 경로 결합
    if (imagePath.startsWith('http')) {
      return { uri: imagePath };
    } else {
      return { uri: `http://localhost:3000/${imagePath}` };
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          {user?.username || '부모님'} 대시보드
        </Text>
        
        <View className="flex-row justify-between items-center my-3">
          <View className="flex-row items-center">
            <FontAwesome5 name="check-circle" size={18} color="#10b981" style={{ marginRight: 8 }} />
            <Text className="text-lg font-medium text-emerald-700">인증 요청</Text>
          </View>
          {pendingVerifications.length > 0 && (
            <View className="bg-emerald-500 px-2 py-1 rounded-full">
              <Text className="text-white text-sm">{pendingVerifications.length}개 대기 중</Text>
            </View>
          )}
        </View>
        
        {/* 로딩 상태 */}
        {isLoading && (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#10b981" />
            <Text className="text-gray-500 mt-2">인증 요청을 불러오는 중...</Text>
          </View>
        )}
        
        {/* 오류 상태 */}
        {error && (
          <View className="items-center py-6 bg-red-50 rounded-xl">
            <FontAwesome5 name="exclamation-circle" size={24} color="#ef4444" />
            <Text className="text-red-500 mt-2">{error}</Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg mt-4"
              onPress={loadPendingVerifications}
            >
              <Text className="text-white">다시 시도</Text>
            </Pressable>
          </View>
        )}
        
        {/* 데이터가 없는 경우 */}
        {!isLoading && !error && 
          pendingVerifications.length === 0 && (
          <View className="items-center py-8 bg-gray-50 rounded-xl">
            <FontAwesome5 name="clipboard-check" size={30} color="#9ca3af" />
            <Text className="text-gray-600 mt-3 font-medium">현재 대기 중인 인증 요청이 없습니다.</Text>
            <Text className="text-gray-500 text-center mt-1">
              자녀가 약속을 인증하면 여기에 표시됩니다.
            </Text>
          </View>
        )}
        
        {/* 인증 요청 목록 */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {!isLoading && !error && pendingVerifications.length > 0 && 
           pendingVerifications.map((verification: Verification) => (
            <Animated.View 
              key={verification.id}
              style={{
                opacity: animation.interpolate({
                  inputRange: [0, 300],
                  outputRange: [1, 0]
                }),
                transform: [{ translateX: animation }]
              }}
            >
              <Pressable
                className="mb-3 p-4 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm"
                onPress={() => router.push({
                  pathname: '/(parent)/approvals',
                  params: { id: verification.id }
                })}
              >
                <View className="flex-row items-center">
                  <Image
                    source={getImageUrl(verification.child?.user.profileImage)}
                    style={{ width: 50, height: 50 }}
                    contentFit="cover"
                    className="mr-3 rounded-full bg-gray-200"
                  />
                  <View className="flex-1">
                    <Text className="text-lg text-emerald-800">{verification.promise?.title || '제목 없음'}</Text>
                    <Text className="text-gray-500">
                      {verification.child?.user.username || '이름 없음'} • {
                        verification.verificationTime ? 
                        getRelativeTime(verification.verificationTime) : 
                        '시간 정보 없음'
                      }
                    </Text>
                  </View>
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white">확인하기</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
        
        <Animated.View 
          className="my-4"
          style={{
            opacity: animation.interpolate({
              inputRange: [0, 300],
              outputRange: [1, 0]
            }),
            transform: [{ translateY: animation }]
          }}
        >
          <Pressable
            className="bg-emerald-500 py-3 rounded-xl mb-3 shadow-md"
            onPress={() => router.push('/(parent)/create-promise')}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome5 name="plus" size={16} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-medium">
                새 약속 만들기
              </Text>
            </View>
          </Pressable>
          
          <Pressable
            className="bg-emerald-600 py-3 rounded-xl shadow-md"
            onPress={() => router.push('/(parent)/manage-promises')}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome5 name="list" size={16} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-medium">
                약속 관리하기
              </Text>
            </View>
          </Pressable>
          
          <Pressable
            className="bg-emerald-400 py-3 rounded-xl mt-3 shadow-md"
            onPress={() => router.push('/(parent)/set-rewards')}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome5 name="gift" size={16} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-medium">
                보상 설정하기
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}