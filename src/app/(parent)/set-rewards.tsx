import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import rewardApi, {
  CreateRewardRequest,
  Reward,
} from '../../api/modules/reward';

export default function SetRewardsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stickerGoal, setStickerGoal] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('active'); // 'active', 'achieved', 'all'
  const [stickerPickerVisible, setStickerPickerVisible] = useState(false);

  // 수정 모달 상태
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStickerGoal, setEditStickerGoal] = useState('');

  // FlatList 참조 생성
  const stickerFlatListRef = useRef<FlatList>(null);

  // 가능한 스티커 수 옵션 배열
  const stickerOptions = Array.from({ length: 20 }, (_, i) =>
    (i + 1).toString(),
  );

  // 데이터 쿼리
  const {
    data: rewards = [],
    isLoading: isRewardsLoading,
    error: rewardsError,
    refetch: refetchRewards,
  } = useQuery({
    queryKey: ['parentRewards'],
    queryFn: rewardApi.getParentRewards,
  });

  const {
    data: rewardHistory = [],
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['rewardHistory'],
    queryFn: rewardApi.getRewardHistory,
  });

  // 달성된 보상 ID 목록
  const achievedRewardIds = rewardHistory.map((history) => history.rewardId);

  // 필터링된 보상 목록
  const filteredRewards = rewards.filter((reward) => {
    if (filterType === 'active') {
      return !achievedRewardIds.includes(reward.id);
    } else if (filterType === 'achieved') {
      return achievedRewardIds.includes(reward.id);
    }
    return true; // 'all' 필터
  });

  // 에러 처리
  const error =
    rewardsError || historyError
      ? '보상 정보를 불러오는 중 오류가 발생했습니다.'
      : null;

  // 로딩 상태
  const isLoading = isRewardsLoading || isHistoryLoading;

  // 새로고침 처리
  const handleRefresh = async () => {
    await Promise.all([refetchRewards(), refetchHistory()]);
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
        isActive: true,
      };

      await rewardApi.createReward(createRewardData);

      // 성공 처리
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('성공', '보상이 생성되었습니다.');
      setTitle('');
      setDescription('');
      setStickerGoal('10');

      // 목록 새로고침
      handleRefresh();
    } catch (error) {
      console.error('보상 생성 중 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '보상 생성 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 모달 열기
  const openEditModal = (reward: Reward) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditReward(reward);
    setEditTitle(reward.title);
    setEditDescription(reward.description || '');
    setEditStickerGoal(reward.requiredStickers.toString());
    setIsEditModalVisible(true);
  };

  // 수정 제출 함수
  const handleSubmitEdit = async () => {
    if (!editReward) return;

    if (!editTitle.trim()) {
      Alert.alert('오류', '보상 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: Partial<CreateRewardRequest> = {
        title: editTitle,
        description: editDescription || undefined,
        requiredStickers: parseInt(editStickerGoal, 10),
      };

      await rewardApi.updateReward(editReward.id, updateData);

      // 성공 처리
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('성공', '보상이 수정되었습니다.');

      // 모달 닫기
      setIsEditModalVisible(false);
      setEditReward(null);

      // 목록 새로고침
      handleRefresh();
    } catch (error) {
      console.error('보상 수정 중 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '보상 수정 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 보상 상태 전환 (활성화/비활성화)
  const toggleRewardActive = async (reward: Reward) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const updateData: Partial<CreateRewardRequest> = {
        isActive: !reward.isActive,
      };

      await rewardApi.updateReward(reward.id, updateData);

      // 성공 처리
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 상태에 따른 알림 메시지
      const message = reward.isActive
        ? '보상이 비활성화되었습니다. 자녀의 보상 목록에서 보이지 않습니다.'
        : '보상이 활성화되었습니다. 자녀가 이제 이 보상을 달성할 수 있습니다.';

      Alert.alert('성공', message);

      // 목록 새로고침
      handleRefresh();
    } catch (error) {
      console.error('보상 상태 변경 중 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('오류', '보상 상태 변경 중 문제가 발생했습니다.');
    }
  };

  // 보상 삭제 함수
  const handleDelete = async (rewardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('확인', '이 보상을 삭제하시겠습니까?', [
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
            handleRefresh();
          } catch (error: any) {
            console.error('보상 삭제 중 오류:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            // 연결된 스티커가 있는 경우 삭제 불가 메시지
            if (error.response?.status === 400) {
              Alert.alert(
                '삭제 불가',
                '이 보상에 연결된 스티커가 있습니다. 자녀가 이미 받은 보상은 삭제할 수 없습니다.\n\n대신 보상을 비활성화하여 더 이상 새로운 달성이 불가능하게 할 수 있습니다.',
              );
            } else {
              Alert.alert('오류', '보상 삭제 중 문제가 발생했습니다.');
            }
          }
        },
      },
    ]);
  };

  // 보상 이력 상세 조회
  const viewRewardAchievements = (rewardId: string) => {
    // 특정 보상의 달성 이력 필터링
    const achievements = rewardHistory.filter(
      (history) => history.rewardId === rewardId,
    );

    if (achievements.length === 0) {
      Alert.alert('정보', '이 보상의 달성 이력이 없습니다.');
      return;
    }

    // 가장 최근 달성 이력 가져오기
    const latestAchievement = achievements.sort(
      (a, b) =>
        new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
    )[0];

    // 달성 날짜 포맷팅
    const date = new Date(latestAchievement.achievedAt);
    const formattedDate = `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;

    // 달성 정보 표시
    Alert.alert(
      '보상 달성 정보',
      `이 보상은 "${
        latestAchievement.child?.user.username || '자녀'
      }"님이 ${formattedDate}에 달성했습니다.\n\n사용된 스티커: ${
        latestAchievement.stickerCount
      }개`,
      [
        {
          text: '확인',
          style: 'default',
        },
        {
          text: '전체 이력 보기',
          onPress: () => router.push('/(parent)/reward-history'),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
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
            <Text className="text-2xl font-bold text-emerald-700">
              보상 설정
            </Text>
            <Pressable
              onPress={() => router.push('/(parent)/reward-history')}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="history" size={20} color="#10b981" />
            </Pressable>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
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
              <Pressable
                className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center bg-white"
                onPress={() => setStickerPickerVisible(true)}
              >
                <Text className="text-gray-800 font-medium">
                  {stickerGoal}개
                </Text>
                <FontAwesome5 name="chevron-down" size={14} color="#9ca3af" />
              </Pressable>
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
                  <Text className="text-white font-medium ml-2">
                    처리 중...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-medium">
                  보상 만들기
                </Text>
              )}
            </Pressable>
          </View>

          {/* 스티커 수 선택 모달 - 이 부분은 기존 코드의 return문 끝부분 직전에 추가하세요 */}
          <Modal
            visible={stickerPickerVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setStickerPickerVisible(false)}
          >
            <View className="flex-1 justify-end bg-black/30">
              <BlurView
                intensity={20}
                tint="dark"
                className="absolute inset-0"
              />

              <Pressable
                className="absolute inset-0"
                onPress={() => setStickerPickerVisible(false)}
              />

              <View className="bg-white rounded-t-3xl">
                <View className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

                <View className="px-5 py-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-800">
                      필요한 스티커 수
                    </Text>
                    <Pressable
                      className="p-2"
                      onPress={() => setStickerPickerVisible(false)}
                    >
                      <Text className="text-emerald-600 font-medium">완료</Text>
                    </Pressable>
                  </View>

                  <View className="h-52">
                    <FlatList
                      ref={stickerFlatListRef}
                      data={stickerOptions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <Pressable
                          className={`py-4 px-3 ${
                            stickerGoal === item ? 'bg-emerald-50' : 'bg-white'
                          }`}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            setStickerGoal(item);
                            setStickerPickerVisible(false);
                          }}
                        >
                          <Text
                            className={`text-center text-lg ${
                              stickerGoal === item
                                ? 'text-emerald-600 font-bold'
                                : 'text-gray-700'
                            }`}
                          >
                            {item}개
                          </Text>
                        </Pressable>
                      )}
                      showsVerticalScrollIndicator={false}
                      decelerationRate="fast"
                      snapToInterval={56} // 각 아이템의 높이
                      snapToAlignment="center"
                      contentContainerStyle={{
                        paddingVertical: 88, // 위아래 여백 (화면 중앙 정렬용)
                      }}
                    />

                    {/* 선택 인디케이터 */}
                    <View className="absolute top-1/2 left-0 right-0 h-14 -mt-7 border-t border-b border-gray-200 pointer-events-none" />
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* 보상 목록 필터 */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-medium">보상 목록</Text>
            <View className="flex-row">
              <Pressable
                onPress={() => setFilterType('active')}
                className={`px-3 py-1 rounded-l-lg ${
                  filterType === 'active' ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={
                    filterType === 'active' ? 'text-white' : 'text-gray-700'
                  }
                >
                  활성
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterType('achieved')}
                className={`px-3 py-1 ${
                  filterType === 'achieved' ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={
                    filterType === 'achieved' ? 'text-white' : 'text-gray-700'
                  }
                >
                  달성됨
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterType('all')}
                className={`px-3 py-1 rounded-r-lg ${
                  filterType === 'all' ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={
                    filterType === 'all' ? 'text-white' : 'text-gray-700'
                  }
                >
                  전체
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 로딩 상태 */}
          {isLoading && (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="text-gray-500 mt-2">
                보상 목록을 불러오는 중...
              </Text>
            </View>
          )}

          {/* 에러 상태 */}
          {error && (
            <View className="items-center py-6 bg-red-50 rounded-xl">
              <FontAwesome5
                name="exclamation-circle"
                size={24}
                color="#ef4444"
              />
              <Text className="text-red-500 mt-2">{error}</Text>
              <Pressable
                className="bg-emerald-500 px-4 py-2 rounded-lg mt-4"
                onPress={handleRefresh}
              >
                <Text className="text-white">다시 시도</Text>
              </Pressable>
            </View>
          )}

          {/* 데이터가 없는 경우 */}
          {!isLoading && !error && filteredRewards.length === 0 && (
            <View className="items-center py-8 bg-gray-50 rounded-xl">
              <FontAwesome5 name="gift" size={30} color="#9ca3af" />
              {filterType === 'active' && (
                <>
                  <Text className="text-gray-600 mt-3 font-medium">
                    활성화된 보상이 없습니다
                  </Text>
                  <Text className="text-gray-500 text-center mt-1">
                    위 양식을 통해 새로운 보상을 만들어보세요!
                  </Text>
                </>
              )}
              {filterType === 'achieved' && (
                <>
                  <Text className="text-gray-600 mt-3 font-medium">
                    달성된 보상이 없습니다
                  </Text>
                  <Text className="text-gray-500 text-center mt-1">
                    자녀가 보상을 달성하면 이곳에 표시됩니다.
                  </Text>
                </>
              )}
              {filterType === 'all' && (
                <>
                  <Text className="text-gray-600 mt-3 font-medium">
                    등록된 보상이 없습니다
                  </Text>
                  <Text className="text-gray-500 text-center mt-1">
                    위 양식을 통해 새로운 보상을 만들어보세요!
                  </Text>
                </>
              )}
            </View>
          )}

          {/* 보상 목록 */}
          {!isLoading &&
            !error &&
            filteredRewards.length > 0 &&
            filteredRewards.map((reward) => {
              // 이미 달성된 보상인지 확인
              const isAchieved = achievedRewardIds.includes(reward.id);

              return (
                <View
                  key={reward.id}
                  className={`mb-4 p-4 rounded-xl border ${
                    isAchieved
                      ? 'border-purple-300 bg-purple-50'
                      : reward.isActive
                      ? 'border-emerald-300 bg-white'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <View className="flex-row">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-lg font-medium">
                          {reward.title}
                        </Text>
                        {isAchieved && (
                          <View className="ml-2 bg-purple-200 px-2 py-0.5 rounded-full">
                            <Text className="text-purple-800 text-xs font-medium">
                              달성됨
                            </Text>
                          </View>
                        )}
                        {!isAchieved && !reward.isActive && (
                          <View className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full">
                            <Text className="text-gray-600 text-xs font-medium">
                              비활성
                            </Text>
                          </View>
                        )}
                      </View>

                      {reward.description && (
                        <Text className="text-gray-500 mb-1">
                          {reward.description}
                        </Text>
                      )}
                      <View className="flex-row items-center">
                        <Text
                          className={`py-1 px-2 ${
                            isAchieved
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          } rounded-full text-xs`}
                        >
                          필요 스티커: {reward.requiredStickers}개
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row">
                      {isAchieved ? (
                        // 달성된 보상은 상세 정보 버튼만 표시
                        <Pressable
                          className="p-2 rounded-full"
                          onPress={() => viewRewardAchievements(reward.id)}
                          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        >
                          <FontAwesome5 name="info" size={16} color="#6b46c1" />
                        </Pressable>
                      ) : (
                        // 아직 달성되지 않은 보상은 모든 기능 제공
                        <>
                          <Pressable
                            className="mr-2 p-2 rounded-full justify-center"
                            onPress={() => openEditModal(reward)}
                            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                          >
                            <FontAwesome5
                              name="edit"
                              size={16}
                              color="#4b5563"
                            />
                          </Pressable>
                          <Pressable
                            className="mr-2 p-2 rounded-full justify-center"
                            onPress={() => toggleRewardActive(reward)}
                            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                          >
                            <FontAwesome5
                              name={reward.isActive ? 'eye-slash' : 'eye'}
                              size={16}
                              color="#d97706"
                            />
                          </Pressable>
                          <Pressable
                            className="p-2 rounded-full justify-center"
                            onPress={() => handleDelete(reward.id)}
                            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                          >
                            <FontAwesome5
                              name="trash"
                              size={16}
                              color="#ef4444"
                            />
                          </Pressable>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* 수정 모달 */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-emerald-700">
                보상 수정
              </Text>
              <Pressable
                className="p-2"
                onPress={() => setIsEditModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome5 name="times" size={20} color="#10b981" />
              </Pressable>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 mb-1">보상 이름</Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="보상 이름"
                className="border border-gray-300 rounded-xl p-3"
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 mb-1">보상 설명 (선택사항)</Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="보상에 대한 자세한 설명"
                className="border border-gray-300 rounded-xl p-3"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-1">필요한 스티커 수</Text>
              <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
                <Pressable
                  className={`flex-1 py-3 items-center ${
                    editStickerGoal === '5' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  onPress={() => setEditStickerGoal('5')}
                >
                  <Text
                    className={
                      editStickerGoal === '5' ? 'text-white' : 'text-gray-700'
                    }
                  >
                    5개
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-3 items-center ${
                    editStickerGoal === '10' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  onPress={() => setEditStickerGoal('10')}
                >
                  <Text
                    className={
                      editStickerGoal === '10' ? 'text-white' : 'text-gray-700'
                    }
                  >
                    10개
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-3 items-center ${
                    editStickerGoal === '15' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  onPress={() => setEditStickerGoal('15')}
                >
                  <Text
                    className={
                      editStickerGoal === '15' ? 'text-white' : 'text-gray-700'
                    }
                  >
                    15개
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="flex-row mb-4">
              <Pressable
                className="flex-1 py-3 bg-gray-300 rounded-xl mr-2"
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text className="text-gray-700 text-center font-medium">
                  취소
                </Text>
              </Pressable>

              <Pressable
                className="flex-1 py-3 bg-emerald-500 rounded-xl ml-2"
                onPress={handleSubmitEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-medium ml-2">
                      처리 중...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-medium">
                    저장하기
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
