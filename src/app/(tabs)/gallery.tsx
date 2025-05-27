// src/app/(tabs)/gallery.tsx
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

// API & Types
import api from '../../api';
import { GalleryImage } from '../../api/modules/gallery';

// Components
import GalleryItem from '../../components/gallery/GalleryItem';

// Stores
import { useAuthStore } from '../../stores/authStore';

// 유틸
import { getImageUrl } from '../../utils/imageUrl';
import Colors from '../../constants/Colors';
import SafeStatusBar from '@/src/components/common/SafeStatusBar';

// 화면 너비 구하기
const { width } = Dimensions.get('window');
const columnWidth = width / 2 - 16; // 2열 그리드, 패딩 고려

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  
  // 필터 상태 (자녀 선택만 유지)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // 연결된 자녀 목록 조회 (부모 계정용)
  const { 
    data: connectedChildren = [],
    isLoading: isLoadingChildren
  } = useQuery({
    queryKey: ['connectedChildren'],
    queryFn: async () => {
      if (!isAuthenticated || user?.userType !== 'PARENT') return [];
      
      try {
        return await api.user.getParentChildren();
      } catch (error) {
        console.error('자녀 목록 조회 실패:', error);
        return [];
      }
    },
    enabled: isAuthenticated && user?.userType === 'PARENT',
  });
  
  // 갤러리 이미지 조회
  const {
    data: galleryImages = [],
    isLoading: isLoadingGallery,
    refetch,
  } = useQuery({
    queryKey: ['gallery', user?.userType, selectedChildId],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        if (user?.userType === 'PARENT') {
          // 부모 계정: 선택된 자녀 또는 모든 자녀의 갤러리 조회
          return await api.gallery.getParentGalleryImages(
            selectedChildId || undefined
          );
        } else {
          // 자녀 계정: 자신의 갤러리 조회
          return await api.gallery.getChildGalleryImages();
        }
      } catch (error) {
        console.error('갤러리 이미지 조회 실패:', error);
        return [];
      }
    },
    enabled: isAuthenticated,
  });
  
  // 자녀 필터 변경
  const handleChildFilter = (childId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChildId(childId);
  };
  
  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async (imageId: string, isFavorite: boolean) => {
    try {
      await api.gallery.toggleImageFavorite(imageId, isFavorite);
      
      // 쿼리 캐시 무효화 없이 캐시 데이터 업데이트
      queryClient.setQueryData(
        ['gallery', user?.userType, selectedChildId],
        (oldData: GalleryImage[] | undefined) => {
          if (!oldData) return [];
          
          return oldData.map(img => 
            img.id === imageId 
              ? { ...img, isFavorite } 
              : img
          );
        }
      );
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      throw error;
    }
  };
  
  // 이미지 삭제 핸들러
  const handleDeleteImage = async (imageId: string) => {
    try {
      await api.gallery.deleteImage(imageId);
      
      // 쿼리 캐시 업데이트로 삭제된 이미지 제거
      queryClient.setQueryData(
        ['gallery', user?.userType, selectedChildId],
        (oldData: GalleryImage[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(img => img.id !== imageId);
        }
      );
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      throw error;
    }
  };
  
  // 새로고침 처리
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    
    try {
      await refetch();
    } catch (error) {
      console.error('갤러리 새로고침 실패:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  }, [isAuthenticated, refetch]);
  
  // 연결된 자녀가 있는지 확인
  const hasConnectedChildren = connectedChildren && connectedChildren.length > 0;
  
  // 이미지가 없는 경우 메시지
  const renderEmptyState = () => {
    if (isLoadingGallery || isLoadingChildren) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text className="mt-4 text-gray-500">갤러리를 불러오는 중...</Text>
        </View>
      );
    }
    
    return (
      <View className="flex-1 items-center justify-center py-20">
        <FontAwesome5 name="images" size={48} color="#d1d5db" />
        <Text className="mt-4 text-lg font-bold text-gray-700">
          갤러리 이미지가 없습니다
        </Text>
        <Text className="mt-2 text-center text-gray-500 mx-6">
          {user?.userType === 'PARENT' 
            ? '자녀가 인증한 약속 사진이 이곳에 표시됩니다.'
            : '완료한 약속 인증 사진이 이곳에 표시됩니다.'}
        </Text>
      </View>
    );
  };
  
  // 자녀 필터 렌더링 (부모 계정용)
  const renderChildFilters = () => {
    if (user?.userType !== 'PARENT' || !hasConnectedChildren) {
      return null;
    }
    
    return (
      <View className="py-3">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {/* 전체 자녀 필터 */}
          <Pressable
            className={`mr-2 px-4 py-2 rounded-full border ${
              selectedChildId === null
                ? 'bg-emerald-500 border-emerald-600'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => handleChildFilter(null)}
          >
            <Text
              className={`text-sm font-medium ${
                selectedChildId === null ? 'text-white' : 'text-gray-700'
              }`}
            >
              전체
            </Text>
          </Pressable>
          
          {/* 개별 자녀 필터 */}
          {connectedChildren.map((child) => (
            <Pressable
              key={child.childId}
              className={`mr-2 px-4 py-2 rounded-full border flex-row items-center ${
                selectedChildId === child.childId
                  ? 'bg-blue-500 border-blue-600'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => handleChildFilter(child.childId)}
            >
              {child.child?.user.profileImage && (
                <Image
                  source={getImageUrl(child.child.user.profileImage)}
                  style={{ width: 20, height: 20 }}
                  className="rounded-full mr-2"
                />
              )}
              <Text
                className={`text-sm font-medium ${
                  selectedChildId === child.childId ? 'text-white' : 'text-gray-700'
                }`}
              >
                {child.child?.user.username || '자녀'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
     <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* 헤더 */}
      <View className="pt-2 pb-1 px-4 border-b border-gray-200 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">약속 갤러리</Text>
        </View>
        
        {/* 설명 */}
        <Text className="text-gray-500 text-sm my-1">
          {user?.userType === 'PARENT'
            ? '자녀가 인증한 약속 사진을 모아볼 수 있습니다.'
            : '완료한 약속 인증 사진을 모아볼 수 있습니다.'}
        </Text>
      </View>
      
      {/* 자녀 필터 (부모 계정만) */}
      {renderChildFilters()}
      
      {/* 갤러리 목록 */}
      <FlatList
        data={galleryImages}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={{ width: columnWidth, marginBottom: 12 }}>
            <GalleryItem
              id={item.id}
              imageUrl={item.imageUrl}
              promiseTitle={item.promiseTitle}
              isFavorite={item.isFavorite}
              childName={item.childName}
              showChildInfo={user?.userType === 'PARENT'}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteImage}
            />
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      />
    </View>
  );
}