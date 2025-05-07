// app/(parent)/index.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// 임시 데이터
const childData = {
  name: '민준',
  avatar: require('../../assets/images/react-logo.png'),
  stickers: 12,
  nextRewardAt: 20,
  pendingVerifications: 2,
};

const todayPromises = [
  {
    id: '1',
    title: '책 읽기',
    time: '오후 7시',
    status: 'pending', // pending, completed, missed
    icon: 'book-outline',
  },
  {
    id: '2',
    title: '숙제하기',
    time: '오후 5시',
    status: 'completed',
    icon: 'pencil-outline',
  },
  {
    id: '3',
    title: '이 닦기',
    time: '오후 9시',
    status: 'pending',
    icon: 'water-outline',
  },
];

const recentActivities = [
  {
    id: '1',
    type: 'verification',
    title: '책 읽기 완료',
    time: '10분 전',
    image: require('../../assets/images/react-logo.png'),
  },
  {
    id: '2',
    type: 'reward',
    title: '스티커 2개 획득',
    time: '어제',
    icon: 'star',
  },
  {
    id: '3',
    type: 'promise',
    title: '새 약속: 방 정리하기',
    time: '어제',
    icon: 'home-outline',
  },
];

export default function ParentHomeScreen() {
  const router = useRouter();

  const handleVerificationPress = () => {
    router.push('/(parent)/verification');
  };

  const handleAddPromisePress = () => {
    router.push('/modals/add-promise');
  };

  const handleChildProgressPress = () => {
    router.push('/(parent)/child-progress');
  };
  
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="flex-1">
          <Text className="text-sm text-[#7E8CA3]">안녕하세요!</Text>
          <Text className="text-xl font-bold text-[#3D5366]">김엄마님</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePress} className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
          <Image
            source={require('../../assets/images/react-logo.png')}
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        {/* 아이 프로필 카드 */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(700)} 
          className="mx-6 my-6 p-6 rounded-2xl bg-white shadow-md"
        >
          <View className="flex-row items-center mb-4">
            <Image source={childData.avatar} className="w-[60px] h-[60px] rounded-full mr-4 border-2 border-[#A6E1FA]" />
            <View>
              <Text className="text-xl text-[#3D5366] font-bold mb-1">{childData.name}</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#FFEDA3" />
                <Text className="text-xs text-[#5D5E8C] ml-1">
                  스티커 {childData.stickers}개 / {childData.nextRewardAt}개
                </Text>
              </View>
            </View>
          </View>
          
          <View className="h-2 bg-[#F8FAFF] rounded-full mb-6 overflow-hidden">
            <View 
              className="h-full bg-[#FFEDA3] rounded-full"
              style={{ width: `${(childData.stickers / childData.nextRewardAt) * 100}%` }}
            />
          </View>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center py-4 rounded-md bg-[#70CAF8] mr-2 shadow-sm relative"
              onPress={handleVerificationPress}
            >
              <View className="absolute top-[-8px] right-[-8px] bg-[#FF7A6D] rounded-full w-6 h-6 items-center justify-center shadow-sm">
                <Text className="text-[10px] text-white font-bold">{childData.pendingVerifications}</Text>
              </View>
              <Text className="text-sm text-white font-bold">인증 확인</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center py-4 rounded-md bg-[#A8E6CF] ml-2 shadow-sm"
              onPress={handleChildProgressPress}
            >
              <Text className="text-sm text-white font-bold">진행 상황</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 오늘의 약속 */}
        <View className="flex-row justify-between items-center px-6 mt-6 mb-4">
          <Text className="text-base text-[#3D5366] font-bold">오늘의 약속</Text>
          <TouchableOpacity onPress={handleAddPromisePress}>
            <Text className="text-sm text-[#70CAF8] font-medium">+ 추가하기</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {todayPromises.map((promise, index) => (
            <Animated.View 
              key={promise.id}
              entering={FadeInRight.delay(300 + index * 100).duration(700)}
              className="flex-row items-center bg-white rounded-md p-4 mb-4 shadow-sm"
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                promise.status === 'completed' ? 'bg-[rgba(126,217,87,0.2)]' : 'bg-[#A6E1FA]'
              }`}>
                <Ionicons 
                  name={promise.icon} 
                  size={24} 
                  color={promise.status === 'completed' ? '#7ED957' : '#70CAF8'} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-[#3D5366] font-medium mb-1">{promise.title}</Text>
                <Text className="text-xs text-[#7E8CA3]">{promise.time}</Text>
              </View>
              <View className="ml-4">
                {promise.status === 'completed' ? (
                  <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
                ) : (
                  <Ionicons name="time-outline" size={24} color="#7E8CA3" />
                )}
              </View>
            </Animated.View>
          ))}
        </View>

        {/* 최근 활동 */}
        <View className="flex-row justify-between items-center px-6 mt-6 mb-4">
          <Text className="text-base text-[#3D5366] font-bold">최근 활동</Text>
          <TouchableOpacity>
            <Text className="text-sm text-[#70CAF8] font-medium">전체보기</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {recentActivities.map((activity, index) => (
            <Animated.View 
              key={activity.id}
              entering={FadeInRight.delay(400 + index * 100).duration(700)}
              className="flex-row items-center bg-white rounded-md p-4 mb-4 shadow-sm"
            >
              {activity.type === 'verification' && activity.image ? (
                <Image source={activity.image} className="w-[50px] h-[50px] rounded-md mr-4" />
              ) : (
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                  activity.type === 'reward' ? 'bg-[rgba(255,237,163,0.3)]' : 'bg-[rgba(166,225,250,0.3)]'
                }`}>
                  <Ionicons 
                    name={activity.icon} 
                    size={24} 
                    color={
                      activity.type === 'reward' 
                        ? '#FFEDA3' 
                        : '#70CAF8'
                    } 
                  />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm text-[#3D5366] font-medium mb-1">{activity.title}</Text>
                <Text className="text-xs text-[#7E8CA3]">{activity.time}</Text>
              </View>
              <TouchableOpacity className="p-1">
                <Ionicons name="chevron-forward" size={20} color="#7E8CA3" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      
      {/* 플로팅 버튼 */}
      <TouchableOpacity 
        className="absolute right-6 bottom-12 w-[60px] h-[60px] rounded-full bg-[#A8E6CF] items-center justify-center shadow-md"
        onPress={handleAddPromisePress}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}