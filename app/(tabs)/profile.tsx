import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

// 임시 데이터
const userData = {
  name: '김엄마',
  email: 'parent@example.com',
  role: 'parent',
  avatar: null, // 실제 앱에서는 이미지 경로
  children: [
    {
      id: '1',
      name: '민준',
      age: 7,
      avatar: null, // 실제 앱에서는 이미지 경로
      totalStickers: 55,
      completedPromises: 32,
      activePromises: 3,
    }
  ]
};

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#F8FAFF]">
      <View className="pt-12 pb-6 px-6 bg-white rounded-b-3xl shadow-sm">
        <Text className="text-2xl font-bold text-[#3D5366] mb-6">내 프로필</Text>
        
        <View className="flex-row items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-[#E8F0FB] items-center justify-center mr-4">
            {userData.avatar ? (
              <Image 
                source={{ uri: userData.avatar }} 
                className="w-full h-full rounded-full"
              />
            ) : (
              <Ionicons name="person" size={40} color="#70CAF8" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-[#3D5366]">{userData.name}</Text>
            <Text className="text-sm text-[#7E8CA3]">{userData.email}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-[#A6E1FA] px-2 py-1 rounded-full">
                <Text className="text-xs text-white font-medium">
                  {userData.role === 'parent' ? '부모님' : '아이'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="create-outline" size={24} color="#70CAF8" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-between">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 bg-[#F5F8FF] rounded-xl mr-2">
            <Ionicons name="settings-outline" size={20} color="#3D5366" />
            <Text className="text-sm font-medium text-[#3D5366] ml-2">설정</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 bg-[#F5F8FF] rounded-xl ml-2">
            <Ionicons name="help-circle-outline" size={20} color="#3D5366" />
            <Text className="text-sm font-medium text-[#3D5366] ml-2">도움말</Text>
          </TouchableOpacity>
        </View>
      </View>

      {userData.role === 'parent' && userData.children.length > 0 && (
        <View className="mt-6 px-6">
          <Text className="text-lg font-bold text-[#3D5366] mb-4">연결된 아이들</Text>
          
          {userData.children.map((child) => (
            <Animated.View key={child.id} entering={FadeIn.duration(600)}>
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                onPress={() => router.push({
                  pathname: '/(parent)/child-progress',
                  params: { id: child.id }
                })}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-16 h-16 rounded-full bg-[#FFD6E0] items-center justify-center mr-4">
                    {child.avatar ? (
                      <Image 
                        source={{ uri: child.avatar }} 
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Ionicons name="happy" size={32} color="#FFAEC0" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-[#3D5366]">{child.name}</Text>
                    <Text className="text-xs text-[#7E8CA3]">{child.age}세</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#70CAF8" />
                </View>
                
                <View className="flex-row justify-between">
                  <View className="flex-1 items-center p-2 bg-[#F5F8FF] rounded-lg mr-2">
                    <Text className="text-xs text-[#7E8CA3]">총 스티커</Text>
                    <Text className="text-base font-bold text-[#3D5366]">{child.totalStickers}개</Text>
                  </View>
                  <View className="flex-1 items-center p-2 bg-[#F5F8FF] rounded-lg mx-1">
                    <Text className="text-xs text-[#7E8CA3]">완료한 약속</Text>
                    <Text className="text-base font-bold text-[#3D5366]">{child.completedPromises}개</Text>
                  </View>
                  <View className="flex-1 items-center p-2 bg-[#F5F8FF] rounded-lg ml-2">
                    <Text className="text-xs text-[#7E8CA3]">진행중 약속</Text>
                    <Text className="text-base font-bold text-[#3D5366]">{child.activePromises}개</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          <TouchableOpacity 
            className="flex-row items-center justify-center py-4 bg-[#F5F8FF] rounded-xl mb-6"
            onPress={() => router.push('/modals/add-child')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#70CAF8" />
            <Text className="text-base font-medium text-[#70CAF8] ml-2">아이 추가하기</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View className="px-6 py-4 mt-2">
        <TouchableOpacity 
          className="flex-row items-center py-4 border-b border-[#E8F0FB]"
          onPress={() => {/* 계정 정보 수정 */}}
        >
          <Ionicons name="person-outline" size={24} color="#3D5366" className="mr-4" />
          <Text className="flex-1 text-base text-[#3D5366]">계정 정보 수정</Text>
          <Ionicons name="chevron-forward" size={20} color="#7E8CA3" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-4 border-b border-[#E8F0FB]"
          onPress={() => {/* 알림 설정 */}}
        >
          <Ionicons name="notifications-outline" size={24} color="#3D5366" className="mr-4" />
          <Text className="flex-1 text-base text-[#3D5366]">알림 설정</Text>
          <Ionicons name="chevron-forward" size={20} color="#7E8CA3" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-4 border-b border-[#E8F0FB]"
          onPress={() => {/* 앱 정보 */}}
        >
          <Ionicons name="information-circle-outline" size={24} color="#3D5366" className="mr-4" />
          <Text className="flex-1 text-base text-[#3D5366]">앱 정보</Text>
          <Ionicons name="chevron-forward" size={20} color="#7E8CA3" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-4"
          onPress={() => {
            // 로그아웃 처리
            router.replace('/(auth)/login');
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF7A6D" className="mr-4" />
          <Text className="flex-1 text-base text-[#FF7A6D]">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}