import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

// 임시 데이터
const dummyPromises = [
  {
    id: '1',
    title: '책 읽기',
    time: '오후 7시',
    status: 'pending', // pending, completed, missed
    icon: 'book-outline',
    daysOfWeek: ['월', '수', '금'],
    childName: '민준',
  },
  {
    id: '2',
    title: '숙제하기',
    time: '오후 5시',
    status: 'completed',
    icon: 'pencil-outline',
    daysOfWeek: ['월', '화', '수', '목', '금'],
    childName: '민준',
  },
  {
    id: '3',
    title: '이 닦기',
    time: '오후 9시',
    status: 'pending',
    icon: 'water-outline',
    daysOfWeek: ['매일'],
    childName: '민준',
  },
  {
    id: '4',
    title: '방 정리하기',
    time: '오후 6시',
    status: 'missed',
    icon: 'home-outline',
    daysOfWeek: ['토', '일'],
    childName: '민준',
  },
];

export default function PromisesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // all, pending, completed, missed

  // 필터에 따라 약속 필터링
  const filteredPromises = dummyPromises.filter(promise => {
    if (filter === 'all') return true;
    return promise.status === filter;
  });

  const handlePromisePress = (promise) => {
    router.push({
      pathname: '/(parent)/promise-details',
      params: { id: promise.id }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#A8E6CF]';
      case 'pending': return 'bg-[#FFD166]';
      case 'missed': return 'bg-[#FF7A6D]';
      default: return 'bg-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'missed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderPromiseItem = ({ item, index }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(400)}
    >
      <TouchableOpacity 
        className="flex-row items-center bg-white rounded-xl p-4 mb-4 shadow-sm"
        onPress={() => handlePromisePress(item)}
      >
        <View className={`w-12 h-12 rounded-full bg-[#F5F8FF] items-center justify-center mr-4`}>
          <Ionicons name={item.icon} size={24} color="#70CAF8" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-[#3D5366] mb-1">{item.title}</Text>
          <View className="flex-row">
            <Text className="text-xs text-[#7E8CA3] mr-2">{item.time}</Text>
            <Text className="text-xs text-[#7E8CA3]">{item.daysOfWeek.join(', ')}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-full mr-2 ${getStatusColor(item.status)}`}>
            <Text className="text-xs text-white font-medium">
              {item.status === 'completed' ? '완료' : item.status === 'pending' ? '대기중' : '미완료'}
            </Text>
          </View>
          <Ionicons name={getStatusIcon(item.status)} size={24} color={
            item.status === 'completed' ? '#A8E6CF' : 
            item.status === 'pending' ? '#FFD166' : 
            '#FF7A6D'
          } />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFF] pt-12">
      <View className="px-6 mb-6">
        <Text className="text-2xl font-bold text-[#3D5366] mb-4">약속 목록</Text>
        
        {/* 필터 버튼 */}
        <View className="flex-row mb-4">
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 ${filter === 'all' ? 'bg-[#70CAF8]' : 'bg-white'}`}
            onPress={() => setFilter('all')}
          >
            <Text className={`font-medium ${filter === 'all' ? 'text-white' : 'text-[#3D5366]'}`}>전체</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 ${filter === 'pending' ? 'bg-[#FFD166]' : 'bg-white'}`}
            onPress={() => setFilter('pending')}
          >
            <Text className={`font-medium ${filter === 'pending' ? 'text-white' : 'text-[#3D5366]'}`}>대기중</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 ${filter === 'completed' ? 'bg-[#A8E6CF]' : 'bg-white'}`}
            onPress={() => setFilter('completed')}
          >
            <Text className={`font-medium ${filter === 'completed' ? 'text-white' : 'text-[#3D5366]'}`}>완료</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full ${filter === 'missed' ? 'bg-[#FF7A6D]' : 'bg-white'}`}
            onPress={() => setFilter('missed')}
          >
            <Text className={`font-medium ${filter === 'missed' ? 'text-white' : 'text-[#3D5366]'}`}>미완료</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredPromises}
        renderItem={renderPromiseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 추가 버튼 */}
      <TouchableOpacity
        className="absolute right-6 bottom-6 w-14 h-14 rounded-full bg-[#70CAF8] items-center justify-center shadow-md"
        onPress={() => router.push('/modals/add-promise')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}