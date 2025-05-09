import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import rewardApi, { Reward, CreateRewardRequest } from '../../api/modules/reward';
import * as Haptics from 'expo-haptics';

export default function SetRewardsScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stickerGoal, setStickerGoal] = useState('10');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 보상 목록 로드
  useEffect(() => {
    loadRewards();
  }, []);
  
  // 보상 목록 로드 함수
  const loadRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await rewardApi.getParentRewards();
      setRewards(response);
      
      setIsLoading(false);
    } catch (error) {
      console.error('보상 목록 로드 중 오류:', error);
      setError('보상 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadRewards();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // 보상 생성 함수
  const handleCreate = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('오류', '보상 이름을 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const createRewardData: CreateRewardRequest = {
        title,
        description: description || undefined,
        requiredStickers: parseInt(stickerGoal, 10),
        isActive: true
      };
      
      await rewardApi.createReward(createRewardData);
      
      // 성공 처리
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('성공', '보상이 생성되었습니다.');
      setTitle('');
      setDescription('');
      setStickerGoal('10');
      
      // 목록 새로고침
      loadRewards();
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('보상 생성 중 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '보상 생성 중 문제가 발생했습니다.');
      setIsSubmitting(false);
    }
  };
  
  // 보상 수정 함수
  const handleEdit = (reward: Reward) => {
    // 수정 모달 띄우기 또는 수정 화면으로 이동하는 로직
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      '보상 수정',
      `"${reward.title}" 보상을 수정하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '수정',
          onPress: async () => {
            try {
              // 간단한 수정 로직 (실제 앱에서는 모달이나 별도 페이지로 처리)
              const newTitle = prompt('보상 제목을 입력하세요:', reward.title);
              if (newTitle && newTitle.trim()) {
                const updateData: Partial<CreateRewardRequest> = {
                  title: newTitle,
                  requiredStickers: reward.requiredStickers
                };
                
                await rewardApi.updateReward(reward.id, updateData);
                
                // 성공 처리
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('성공', '보상이 수정되었습니다.');
                
                // 목록 새로고침
                loadRewards();
              }
            } catch (error) {
              console.error('보상 수정 중 오류:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('오류', '보상 수정 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };
  
  // 보상 삭제 함수
  const handleDelete = async (rewardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '확인',
      '이 보상을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await rewardApi.deleteReward(rewardId);
              
              // 성공 처리 및 목록 새로고침
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('성공', '보상이 삭제되었습니다.');
              loadRewards();
            } catch (error) {
              console.error('보상 삭제 중 오류:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('오류', '보상 삭제 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 이미지 소스 처리
  const getImageSource = (stickers?: any[]) => {
    if (stickers && stickers.length > 0 && stickers[0].imageUrl) {
      return { uri: stickers[0].imageUrl };
    }
    return require('../../assets/images/react-logo.png');
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
      >
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable 
              onPress={() => router.back()} 
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
            </Pressable>
            <Text className="text-2xl font-bold text-emerald-700">보상 설정</Text>
            <View style={{ width: 30 }} />
          </View>
          
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-2">새 보상 만들기</Text>
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">보상 이름</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="예) 장난감 자동차, 놀이공원 가기"
                className="border border-gray-300 rounded-xl p-3"
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 mb-1">보상 설명 (선택사항)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="보상에 대한 자세한 설명"
                className="border border-gray-300 rounded-xl p-3"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">필요한 스티커 수</Text>
              <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
                <Pressable 
                  className={`flex-1 py-3 items-center ${stickerGoal === '5' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStickerGoal('5');
                  }}
                >
                  <Text className={stickerGoal === '5' ? 'text-white' : 'text-gray-700'}>5개</Text>
                </Pressable>
                <Pressable 
                  className={`flex-1 py-3 items-center ${stickerGoal === '10' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStickerGoal('10');
                  }}
                >
                  <Text className={stickerGoal === '10' ? 'text-white' : 'text-gray-700'}>10개</Text>
                </Pressable>
                <Pressable 
                  className={`flex-1 py-3 items-center ${stickerGoal === '15' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStickerGoal('15');
                  }}
                >
                  <Text className={stickerGoal === '15' ? 'text-white' : 'text-gray-700'}>15개</Text>
                </Pressable>
              </View>
            </View>
            
            <Pressable
              className={`py-3 rounded-xl ${
                title.trim() && !isSubmitting ? 'bg-green-500' : 'bg-gray-300'
              }`}
              onPress={() => {
                if (title.trim() && !isSubmitting) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleCreate();
                }
              }}
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">처리 중...</Text>
                </View>
              ) : (
                <Text className="text-white text-center font-medium">
                  보상 만들기
                </Text>
              )}
            </Pressable>
          </View>
          
          <Text className="text-lg font-medium mb-2">현재 보상 목록</Text>
          
          {/* 로딩 상태 */}
          {isLoading && (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="text-gray-500 mt-2">보상 목록을 불러오는 중...</Text>
            </View>
          )}
          
          {/* 에러 상태 */}
          {error && (
            <View className="items-center py-6 bg-red-50 rounded-xl">
              <FontAwesome5 name="exclamation-circle" size={24} color="#ef4444" />
              <Text className="text-red-500 mt-2">{error}</Text>
              <Pressable
                className="bg-emerald-500 px-4 py-2 rounded-lg mt-4"
                onPress={loadRewards}
              >
                <Text className="text-white">다시 시도</Text>
              </Pressable>
            </View>
          )}
          
          {/* 데이터가 없는 경우 */}
          {!isLoading && !error && rewards.length === 0 && (
            <View className="items-center py-8 bg-gray-50 rounded-xl">
              <FontAwesome5 name="gift" size={30} color="#9ca3af" />
              <Text className="text-gray-600 mt-3 font-medium">
                등록된 보상이 없습니다
              </Text>
              <Text className="text-gray-500 text-center mt-1">
                위 양식을 통해 새로운 보상을 만들어보세요!
              </Text>
            </View>
          )}
          
          {/* 보상 목록 */}
          {!isLoading && !error && rewards.length > 0 && rewards.map(reward => {
            return (
              <View 
                key={reward.id} 
                className="mb-4 p-4 rounded-xl border border-purple-300 bg-white"
              >
                <View className="flex-row">
                  <Image
                    source={getImageSource(reward.stickers)}
                    style={{ width: 60, height: 60 }}
                    contentFit="contain"
                    className="mr-3 rounded-lg"
                  />
                  <View className="flex-1">
                    <Text className="text-lg font-medium">{reward.title}</Text>
                    {reward.description && (
                      <Text className="text-gray-500 mb-1">{reward.description}</Text>
                    )}
                    <View className="flex-row items-center">
                      <Text className="text-gray-500 py-1 px-2 bg-purple-100 rounded-full text-xs">
                        필요 스티커: {reward.requiredStickers}개
                      </Text>
                      {!reward.isActive && (
                        <Text className="text-gray-500 py-1 px-2 bg-gray-200 rounded-full text-xs ml-2">
                          비활성
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row">
                    <Pressable 
                      className="mr-2 p-2 bg-gray-200 rounded-full"
                      onPress={() => handleEdit(reward)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <FontAwesome5 name="edit" size={16} color="#4b5563" />
                    </Pressable>
                    <Pressable 
                      className="p-2 bg-red-100 rounded-full"
                      onPress={() => handleDelete(reward.id)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <FontAwesome5 name="trash" size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}