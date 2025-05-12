// src/app/(parent)/sticker-templates.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

// API
import stickerApi, { StickerTemplate } from '../../api/modules/sticker';

// Components
import StickerTemplateItem from '../../components/parent/StickerTemplateItem';

// Services
import { getFallbackTemplates } from '../../services/stickerService';

// 카테고리 필터 아이템 컴포넌트
const CategoryItem = React.memo(({ 
  category, 
  isSelected, 
  onSelect 
}: { 
  category: string; 
  isSelected: boolean; 
  onSelect: (category: string) => void;
}) => {
  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category);
  };

  return (
    <Pressable
      className={`px-4 py-2 rounded-full mr-2 ${
        isSelected ? 'bg-emerald-500' : 'bg-gray-200'
      }`}
      onPress={handleSelect}
    >
      <Text
        className={`font-medium ${
          isSelected ? 'text-white' : 'text-gray-700'
        }`}
      >
        {category}
      </Text>
    </Pressable>
  );
});

// displayName 설정
CategoryItem.displayName = 'CategoryItem';

export default function StickerTemplatesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // React Query를 사용한 스티커 템플릿 데이터 조회
  const {
    data: templates = [] as StickerTemplate[],
    isLoading,
    error,
    refetch
  } = useQuery<StickerTemplate[]>({
    queryKey: ['stickerTemplates'],
    queryFn: async () => {
      try {
        // 서버에서 스티커 템플릿 가져오기
        const apiTemplates = await stickerApi.getAllStickerTemplates();
        return apiTemplates;
      } catch (error) {
        console.error('스티커 템플릿 로드 오류:', error);
        // API 호출 실패 시 폴백 템플릿 사용
        return getFallbackTemplates();
      }
    },
    retry: 1
  });
  
  // 카테고리 목록 추출
  const categories = React.useMemo(() => {
    if (!templates || templates.length === 0) return [];
    
    return Array.from(
      new Set(templates.map(template => template.category))
    );
  }, [templates]);
  
  // 초기 카테고리 선택
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);
  
  // 카테고리 선택 처리
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);
  
  // 새로고침 처리
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  
  // 스티커 상세 정보 표시
  const handleStickerPress = useCallback((template: StickerTemplate) => {
    Alert.alert(
      template.name,
      template.description || '설명이 없습니다.',
      [
        { text: '닫기', style: 'cancel' },
        { 
          text: '자녀에게 부여', 
          onPress: () => {
            Alert.alert(
              '준비 중',
              '해당 스티커를 자녀에게 부여하는 기능은 준비 중입니다.'
            );
          }
        }
      ]
    );
  }, []);
  
  // 필터링된 템플릿 목록
  const filteredTemplates = React.useMemo(() => {
    if (!selectedCategory) return templates;
    return templates.filter(template => template.category === selectedCategory);
  }, [templates, selectedCategory]);
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-2">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable 
            onPress={() => router.back()} 
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">스티커 템플릿</Text>
          <View style={{ width: 30 }} />
        </View>
        
        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-2 text-gray-600">스티커 템플릿을 불러오는 중...</Text>
          </View>
        )}
        
        {/* 에러 상태 */}
        {error && templates.length === 0 && (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="exclamation-circle" size={40} color="#ef4444" />
            <Text className="mt-2 text-gray-700">불러오기 실패</Text>
            <Text className="text-gray-500 text-center mb-4">스티커 템플릿을 불러오는 중 오류가 발생했습니다.</Text>
            <Pressable
              className="bg-emerald-500 px-4 py-2 rounded-lg"
              onPress={handleRefresh}
            >
              <Text className="text-white font-medium">다시 시도</Text>
            </Pressable>
          </View>
        )}
        
        {/* 데이터 표시 */}
        {!isLoading && templates.length > 0 && (
          <View className="flex-1">
            {/* 카테고리 필터 */}
            {categories.length > 0 && (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">카테고리</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="flex-row pb-2"
                >
                  {categories.map((category) => (
                    <CategoryItem
                      key={category}
                      category={category}
                      isSelected={selectedCategory === category}
                      onSelect={handleCategorySelect}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* 스티커 템플릿 목록 */}
            <FlatList
              data={filteredTemplates}
              numColumns={3}
              keyExtractor={item => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#10b981"
                  colors={["#10b981"]}
                />
              }
              renderItem={({ item }) => (
                <StickerTemplateItem 
                  template={item}
                  onPress={handleStickerPress}
                />
              )}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center p-8">
                  <FontAwesome5 name="star" size={40} color="#d1d5db" />
                  <Text className="text-gray-500 mt-4 text-center">
                    이 카테고리에 스티커가 없습니다
                  </Text>
                </View>
              }
              contentContainerStyle={{
                paddingBottom: 20,
                flexGrow: filteredTemplates.length === 0 ? 1 : undefined,
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}