import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 임시 데이터 - 실제 앱에서는 상태 관리 도구 또는 API에서 가져와야 함
const childData = {
  name: '민준',
  avatar: require('../../assets/images/react-logo.png'),
  stickers: 12,
  nextRewardAt: 20,
  pendingPromises: 3,
};

const todayPromises = [
  {
    id: '1',
    title: '책 읽기',
    time: '오후 7시',
    status: 'pending', // pending, completed, missed
    icon: 'book-outline',
    xp: 5,
  },
  {
    id: '2',
    title: '숙제하기',
    time: '오후 5시',
    status: 'completed',
    icon: 'pencil-outline',
    xp: 10,
  },
  {
    id: '3',
    title: '이 닦기',
    time: '오후 9시',
    status: 'pending',
    icon: 'water-outline',
    xp: 3,
  },
];

export default function ChildHomeScreen() {
  // 애니메이션 값
  const scaleCharacter = useSharedValue(1);
  const rotateSticker = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 캐릭터 애니메이션 스타일
  const characterAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleCharacter.value },
        { translateY: translateY.value }
      ],
    };
  });

  // 스티커 애니메이션 스타일
  const stickerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateZ: `${rotateSticker.value}deg` }
      ],
    };
  });

  // 컴포넌트 마운트 시 애니메이션 시작
  useEffect(() => {
    // 캐릭터 호흡 애니메이션
    scaleCharacter.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1, // 무한 반복
      true // 왕복
    );

    // 캐릭터 상하 움직임 애니메이션
    translateY.value = withRepeat(
      withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // 무한 반복
      true // 왕복
    );

    // 스티커 회전 애니메이션
    rotateSticker.value = withRepeat(
      withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1, // 무한 반복
      true // 왕복
    );
  }, []);

  const handleVerifyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/');
  };

  const handlePromisePress = (promise:any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/promise-details', params: { id: promise.id } });
  };

  const handleRewardsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/my-rewards');
  };

  const handleStickersPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/my-stickers');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-xl text-[#3D5366] font-bold">안녕, {childData.name}! 👋</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
          <Image
            source={childData.avatar}
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        {/* 메인 캐릭터 및 진행 상황 */}
        <View className="items-center pt-4 pb-6">
          <Animated.View style={characterAnimatedStyle}>
            <Image
              source={require('../../assets/images/react-logo.png')}
              className="w-[150px] h-[150px]"
              resizeMode="contain"
            />
          </Animated.View>

          <View className="w-4/5 items-center">
            <View className="flex-row items-center mb-2">
              <Animated.View style={stickerAnimatedStyle}>
                <Ionicons name="star" size={32} color="#FFEDA3" />
              </Animated.View>
              <Text className="text-2xl text-[#3D5366] font-bold mx-1">{childData.stickers}</Text>
              <Text className="text-base text-[#7E8CA3] font-medium">/ {childData.nextRewardAt}</Text>
            </View>

            <View className="w-full h-3 bg-[#F8FAFF] rounded-full mb-2 overflow-hidden">
              <View 
                className="h-full bg-[#FFEDA3] rounded-full"
                style={{ width: `${(childData.stickers / childData.nextRewardAt) * 100}%` }}
              />
            </View>

            <Text className="text-sm text-[#5D5E8C] font-medium text-center">
              다음 보상까지 {childData.nextRewardAt - childData.stickers}개 남았어요!
            </Text>
          </View>
        </View>

        {/* 주요 액션 버튼 */}
        <View className="flex-row justify-between px-6 mb-6">
          <TouchableOpacity 
            className="flex-1 items-center justify-center py-4 rounded-xl bg-[#70CAF8] mx-1 shadow-md"
            onPress={handleVerifyPress}
          >
            <Ionicons name="camera" size={32} color="white" />
            <Text className="text-xs text-white font-bold mt-1">인증하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 items-center justify-center py-4 rounded-xl bg-[#FFAEC0] mx-1 shadow-md"
            onPress={handleRewardsPress}
          >
            <Ionicons name="gift" size={32} color="white" />
            <Text className="text-xs text-white font-bold mt-1">보상 보기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 items-center justify-center py-4 rounded-xl bg-[#A8E6CF] mx-1 shadow-md"
            onPress={handleStickersPress}
          >
            <Ionicons name="star" size={32} color="white" />
            <Text className="text-xs text-white font-bold mt-1">내 스티커</Text>
          </TouchableOpacity>
        </View>

        {/* 오늘의 약속 */}
        <View className="flex-row items-center px-6 mt-6 mb-4">
          <Text className="text-base text-[#3D5366] font-bold">오늘의 약속</Text>
          <View className="bg-[#70CAF8] rounded-full w-6 h-6 items-center justify-center ml-2">
            <Text className="text-[10px] text-white font-bold">{childData.pendingPromises}</Text>
          </View>
        </View>

        <View className="px-6">
          {todayPromises.map((promise, index) => (
            <Animated.View 
              key={promise.id}
              entering={FadeInRight.delay(300 + index * 100).duration(700)}
            >
              <TouchableOpacity 
                className={`flex-row items-center rounded-xl p-4 mb-4 shadow-sm ${
                  promise.status === 'completed' ? 'bg-[rgba(126,217,87,0.1)]' : 'bg-white'
                }`}
                onPress={() => handlePromisePress(promise)}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  promise.status === 'completed' ? 'bg-[rgba(126,217,87,0.2)]' : 'bg-[#A6E1FA]'
                }`}>
                  <Ionicons 
                    name={promise.icon as any} 
                    size={24} 
                    color={promise.status === 'completed' ? '#7ED957' : '#70CAF8'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-[#3D5366] font-medium mb-1">{promise.title}</Text>
                  <Text className="text-xs text-[#7E8CA3]">{promise.time}</Text>
                </View>
                <View>
                  {promise.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={32} color="#7ED957" />
                  ) : (
                    <View className="flex-row items-center bg-[rgba(255,237,163,0.3)] px-2 py-1 rounded-md">
                      <Text className="text-sm text-[#3D5366] font-bold mr-1">+{promise.xp}</Text>
                      <Ionicons name="star" size={16} color="#FFEDA3" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* 달성 정보 */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(700)}
          className="mx-6 my-6 p-6 rounded-xl bg-[rgba(212,165,255,0.1)] shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-[#3D5366] font-medium">이번 주 달성률</Text>
            <Text className="text-xl text-[#D4A5FF] font-bold">75%</Text>
          </View>
          <View className="items-center">
            <View className="w-full h-2 bg-[#F8FAFF] rounded-full mb-2 overflow-hidden">
              <View className="h-full bg-[#D4A5FF] rounded-full w-3/4" />
            </View>
            <Text className="text-xs text-[#5D5E8C] font-medium text-center">잘 하고 있어요!</Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* 플로팅 카메라 버튼 */}
      <TouchableOpacity 
        className="absolute right-6 bottom-12 w-[60px] h-[60px] rounded-full bg-[#70CAF8] items-center justify-center shadow-md"
        onPress={handleVerifyPress}
      >
        <Ionicons name="camera" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}