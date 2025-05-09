// app/(parent)/location-tracking.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function LocationTrackingScreen() {
  const [childLocation, setChildLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // 위치 정보 불러오기 (실제 구현에서는 서버/Firebase에서 가져옴)
  const fetchChildLocation = async () => {
    try {
      setLoading(true);
      
      // 이 부분은 실제로는 서버나 Firebase에서 가져와야 함
      // 여기서는 예시로 가상의 위치 데이터를 사용
      const mockLocation = {
        latitude: 37.5326, // 예시 위치 (서울)
        longitude: 127.0246,
        accuracy: 15,
      };
      
      setChildLocation(mockLocation);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError('위치 정보를 가져오는데 실패했습니다.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChildLocation();
    
    // 실시간 업데이트를 위한 타이머 (10초마다 업데이트)
    const interval = setInterval(() => {
      fetchChildLocation();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 현재 시간 포맷팅 함수
  const formatLastUpdated = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  // 초기 지도 영역 설정
  const initialRegion = {
    latitude: childLocation?.latitude || 37.5326,
    longitude: childLocation?.longitude || 127.0246,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 flex-1">
        <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
          우리 아이 위치
        </Text>
        
        {/* 위치 정보 상단 카드 */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-emerald-200 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-emerald-100 p-2 rounded-full mr-3">
                <FontAwesome5 name="child" size={20} color={Colors.light.leafGreen} />
              </View>
              <View>
                <Text className="text-lg font-medium text-emerald-800">민준이</Text>
                {loading ? (
                  <Text className="text-gray-500">위치 정보 로딩 중...</Text>
                ) : error ? (
                  <Text className="text-red-500">{error}</Text>
                ) : (
                  <Text className="text-gray-500">
                    최근 업데이트: {formatLastUpdated(lastUpdated)}
                  </Text>
                )}
              </View>
            </View>
            
            <Pressable
              className="bg-emerald-500 px-3 py-2 rounded-lg"
              onPress={fetchChildLocation}
            >
              <Text className="text-white font-medium">새로고침</Text>
            </Pressable>
          </View>
        </View>
        
        {/* 지도 영역 */}
        {childLocation ? (
          <View className="flex-1 rounded-xl overflow-hidden border border-emerald-200">
            <MapView
              provider={PROVIDER_GOOGLE}
              className="flex-1"
              initialRegion={initialRegion}
            >
              <Marker
                coordinate={{
                  latitude: childLocation.latitude,
                  longitude: childLocation.longitude,
                }}
                title="민준이"
                description="마지막 위치"
              >
                <View className="bg-emerald-100 p-2 rounded-full">
                  <FontAwesome5 name="child" size={20} color={Colors.light.leafGreen} />
                </View>
              </Marker>
            </MapView>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-100 rounded-xl">
            <FontAwesome5 name="map-marker-alt" size={50} color="#d1d5db" className="mb-4" />
            <Text className="text-gray-500">위치 정보가 없습니다.</Text>
          </View>
        )}
        
        {/* 위치 정보 설정 및 히스토리 카드 */}
        <View className="bg-white rounded-xl p-4 mt-4 mb-4 border border-emerald-200">
          <Text className="font-medium text-emerald-700 mb-3">위치 추적 설정</Text>
          
          <Pressable
            className="flex-row items-center justify-between py-2 border-b border-gray-100"
            onPress={() => Alert.alert('알림 설정', '아이가 특정 장소에 도착하면 알림을 받을 수 있습니다.')}
          >
            <Text className="text-gray-700">위치 기반 알림</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#9ca3af" />
          </Pressable>
          
          <Pressable
            className="flex-row items-center justify-between py-2 border-b border-gray-100"
            onPress={() => Alert.alert('안전 구역 설정', '아이가 머무를 수 있는 안전한 구역을 설정할 수 있습니다.')}
          >
            <Text className="text-gray-700">안전 구역 설정</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#9ca3af" />
          </Pressable>
          
          <Pressable
            className="flex-row items-center justify-between py-2"
            onPress={() => Alert.alert('위치 기록', '아이의 이동 경로를 확인할 수 있습니다.')}
          >
            <Text className="text-gray-700">위치 기록 확인</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#9ca3af" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}