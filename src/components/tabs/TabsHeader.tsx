import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Animated, Image, Pressable, View, Text } from 'react-native';

interface AppHeaderProps {
  fadeAnim?: Animated.Value;
  translateY?: Animated.Value;
}

interface HeaderProps {
  userType?: string;
}

const AppHeader = ({
  userType,
}: AppHeaderProps & HeaderProps) => {
  // 현재 시간 상태 추가
  const [currentTime, setCurrentTime] = useState('');
  
  // 시간 업데이트 함수
  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 12시간제로 변환
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12; // 12시간제 (0은 12로 표시)
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    // 시간 포맷 (예: 오전 11:30)
    setCurrentTime(`${ampm} ${formattedHours}:${formattedMinutes}`);
  };
  
  // 컴포넌트 마운트 시 시간 초기화 및 1분마다 업데이트
  useEffect(() => {
    // 초기 시간 설정
    updateTime();
    
    // 1분마다 시간 업데이트
    const intervalId = setInterval(() => {
      updateTime();
    }, 60000); // 60000ms = 1분
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <Animated.View className="flex-row justify-between items-center mx-4 mb-2">
      <View className="flex-row items-center ml-2">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 30, height: 30 }}
          className="mr-2"
        />
      </View>
      
      {/* 중앙에 현재 시간 표시 */}
      <View className="absolute left-0 right-0 items-center">
        <Text className="text-base font-medium text-gray-700">
          {currentTime}
        </Text>
      </View>
      
      <View className="flex-row items-center mr-2">
        <Pressable onPress={() => router.push('/calendar')}>
          <Image
            source={require('../../assets/images/icon/calendar_icon.png')}
            style={{ width: 30, height: 30 }}
            className='mr-2'
          />
        </Pressable>

        {/* 톱니바퀴 아이콘 tabs/profile 이동 */}
        <Pressable onPress={() => router.push('/profile')}>
          <Image
            source={require('../../assets/images/icon/settings_icon.png')}
            style={{ width: 28, height: 28 }}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default AppHeader;