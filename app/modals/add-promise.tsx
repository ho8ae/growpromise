import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 아이콘 목록
const promiseIcons = [
  { name: 'book-outline', label: '책 읽기' },
  { name: 'pencil-outline', label: '공부' },
  { name: 'water-outline', label: '이 닦기' },
  { name: 'home-outline', label: '방 정리' },
  { name: 'basketball-outline', label: '운동' },
  { name: 'musical-notes-outline', label: '피아노' },
  { name: 'bed-outline', label: '일찍 자기' },
  { name: 'nutrition-outline', label: '밥 먹기' },
];

// 스티커 보상 옵션
const rewardOptions = [
  { value: 1, label: '1개' },
  { value: 2, label: '2개' },
  { value: 3, label: '3개' },
  { value: 5, label: '5개' },
  { value: 10, label: '10개' }
];

// 반복 요일 옵션
const weekdays = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' },
];

export default function AddPromiseModal() {
  // 상태 관리
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedReward, setSelectedReward] = useState(1);
  const [reminderTime, setReminderTime] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [description, setDescription] = useState('');
  const [selectedChild, setSelectedChild] = useState('민준'); // 실제 앱에서는 다중 아이 지원

  // 요일 선택 토글
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 아이콘 선택
  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 보상 선택
  const handleRewardSelect = (value) => {
    setSelectedReward(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 약속 저장
  const handleSavePromise = () => {
    // if (!title || !selectedIcon) {
    //   // 필수 입력 항목 검증
    //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    //   return;
    // }

    // // 약속 데이터 구성
    // const newPromise = {
    //   title,
    //   icon: selectedIcon,
    //   reward: selectedReward,
    //   reminderTime,
    //   isRepeating,
    //   repeatingDays: isRepeating ? selectedDays : [],
    //   description,
    //   childName: selectedChild,
    // };

    // console.log('새 약속 저장:', newPromise);
    
    // // 저장 성공 피드백
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // // 모달 닫기
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E8F0FB]">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 -ml-2"
        >
          <Ionicons name="close" size={24} color="#3D5366" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#3D5366]">새 약속 추가</Text>
        <TouchableOpacity 
          onPress={handleSavePromise}
          className="p-2 -mr-2"
        >
          <Ionicons name="checkmark" size={24} color="#70CAF8" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 약속 제목 */}
        <View className="px-6 py-4">
          <Text className="text-sm text-[#5D5E8C] font-medium mb-2">약속 제목</Text>
          <TextInput
            className="bg-[#F5F8FF] rounded-md px-4 py-3 text-base text-[#3D5366]"
            placeholder="예: 책 읽기, 방 정리하기, 숙제하기"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 아이 선택 (다중 아이 지원 시) */}
        <View className="px-6 py-4">
          <Text className="text-sm text-[#5D5E8C] font-medium mb-2">누구의 약속인가요?</Text>
          <View className="flex-row">
            <TouchableOpacity 
              className="flex-row items-center bg-[rgba(166,225,250,0.3)] rounded-full px-4 py-2"
              onPress={() => {}}
            >
              <Text className="text-sm text-[#3D5366] font-medium mr-2">민준</Text>
              <Ionicons name="checkmark-circle" size={16} color="#70CAF8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 아이콘 선택 */}
        <View className="px-6 py-4">
          <Text className="text-sm text-[#5D5E8C] font-medium mb-2">약속 아이콘</Text>
          <View className="flex-row flex-wrap">
            {promiseIcons.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                className={`w-1/4 items-center p-3 ${
                  selectedIcon === icon.name ? 'bg-[rgba(166,225,250,0.3)] rounded-md' : ''
                }`}
                onPress={() => handleIconSelect(icon.name)}
              >
                <Ionicons 
                  name={icon.name} 
                  size={32} 
                  color={selectedIcon === icon.name ? '#70CAF8' : '#7E8CA3'} 
                />
                <Text className={`text-xs mt-1 ${
                  selectedIcon === icon.name ? 'text-[#3D5366] font-medium' : 'text-[#7E8CA3]'
                }`}>
                  {icon.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 스티커 보상 */}
        <View className="px-6 py-4">
          <Text className="text-sm text-[#5D5E8C] font-medium mb-2">스티커 보상</Text>
          <View className="flex-row">
            {rewardOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-1 items-center justify-center p-3 rounded-md mr-2 last:mr-0 ${
                  selectedReward === option.value 
                    ? 'bg-[rgba(255,237,163,0.3)] border border-[#FFEDA3]' 
                    : 'bg-[#F5F8FF]'
                }`}
                onPress={() => handleRewardSelect(option.value)}
              >
                <View className="flex-row items-center">
                  <Text className={`text-base mr-1 ${
                    selectedReward === option.value ? 'text-[#3D5366] font-bold' : 'text-[#7E8CA3]'
                  }`}>{option.label}</Text>
                  <Ionicons 
                    name="star" 
                    size={16} 
                    color={selectedReward === option.value ? '#FFEDA3' : '#7E8CA3'} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 알림 시간 */}
        <View className="px-6 py-4">
          <Text className="text-sm text-[#5D5E8C] font-medium mb-2">알림 시간</Text>
          <View className="flex-row items-center bg-[#F5F8FF] rounded-md px-4 py-3">
            <Ionicons name="time-outline" size={20} color="#7E8CA3" />
            <TextInput
              className="flex-1 ml-3 text-base text-[#3D5366]"
              placeholder="예: 오후 7시, 저녁 식사 후"
              value={reminderTime}
              onChangeText={setReminderTime}
            />
          </View>
        </View>

        {/* 반복 설정 */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-[#5D5E8C] font-medium">반복 여부</Text>
            <Switch
              value={isRepeating}
              onValueChange={setIsRepeating}
              trackColor={{ false: '#E8F0FB', true: '#A6E1FA' }}
              thumbColor={isRepeating ? '#70CAF8' : '#F5F8FF'}
              ios_backgroundColor="#E8F0FB"
            />
          </View>
          
          {isRepeating && (
            <View className="flex-row justify-between">
              {weekdays.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    selectedDays.includes(day.value) 
                      ? 'bg-[#70CAF8]' 
                      : 'bg-[#F5F8FF]'
                  }`}
                  onPress={() => toggleDay(day.value)}
                >
                  <Text className={
                    selectedDays.includes(day.value) 
                      ? 'text-white font-bold' 
                      : 'text-[#7E8CA3]'
                  }>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 약속 설명 */}
        <View className="px-6 py-4">
          <Text className="text-sm text-[#5D5E8C] font-medium mb-2">약속 설명 (선택)</Text>
          <TextInput
            className="bg-[#F5F8FF] rounded-md px-4 py-3 text-base text-[#3D5366] h-24"
            placeholder="약속에 대한 자세한 설명을 입력하세요"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 저장 버튼 */}
        <View className="px-6 py-4 mt-4">
          <TouchableOpacity 
            className="bg-[#70CAF8] rounded-md py-4 items-center justify-center shadow-md"
            onPress={handleSavePromise}
          >
            <Text className="text-base text-white font-bold">약속 저장하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}