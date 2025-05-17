import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, ActivityIndicator, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { StickerTemplate } from '../../api/modules/sticker';
import StickerItem from './StickerItem';
import Colors from '../../constants/Colors';

interface StickerSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  stickers: StickerTemplate[];
  selectedStickerId: string;
  onSelectSticker: (id: string) => void;
  onConfirm?: () => void;
  isLoading?: boolean;
}

/**
 * 스티커 선택 모달 컴포넌트
 * 최신 트렌드에 맞게 애니메이션, 블러 효과 등 적용
 */
const StickerSelector = ({
  isVisible,
  onClose,
  stickers,
  selectedStickerId,
  onSelectSticker,
  onConfirm,
  isLoading = false
}: StickerSelectorProps) => {
  // 애니메이션 값
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  
  // 모달이 보여질 때 애니메이션 실행
  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [isVisible, fadeAnim, slideAnim]);
  
  // 선택 스티커 필터링 처리
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // 카테고리 배열 추출
  const categories = React.useMemo(() => {
    if (!stickers || stickers.length === 0) return [];
    return Array.from(new Set(stickers.map(sticker => sticker.category)))
      .filter(Boolean) as string[];
  }, [stickers]);
  
  // 필터링된 스티커 목록
  const filteredStickers = React.useMemo(() => {
    let filtered = stickers;
    
    // 카테고리 필터 적용
    if (categoryFilter) {
      filtered = filtered.filter(sticker => sticker.category === categoryFilter);
    }
    
    // 검색어 필터 적용
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sticker => 
        sticker.name.toLowerCase().includes(query) ||
        (sticker.description && sticker.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [stickers, categoryFilter, searchQuery]);

  // 스티커 선택 처리
  const handleSelectSticker = (id: string) => {
    onSelectSticker(id);
    // 선택 시 모달을 닫지 않고 선택 상태만 변경
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // 카테고리 필터링 토글
  const toggleCategoryFilter = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryFilter(prev => prev === category ? null : category);
  };
  
  // 선택 확인 처리
  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  // 모달 내용 렌더링
  if (!isVisible) return null;
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* 배경 블러 및 오버레이 */}
        <Animated.View 
          className="absolute inset-0 bg-black/30"
          style={{ opacity: fadeAnim }}
        >
          <BlurView intensity={10} tint="dark" className="flex-1" />
          <Pressable 
            className="absolute inset-0" 
            onPress={onClose}
          />
        </Animated.View>
        
        {/* 모달 컨텐츠 */}
        <Animated.View 
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ 
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* 헤더 */}
          <View className="px-5 pt-5 pb-3">
            {/* 드래그 핸들 */}
            <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-gray-800">스티커 선택</Text>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              >
                <FontAwesome5 name="times" size={16} color="#64748b" />
              </Pressable>
            </View>
            
            <Text className="text-gray-500 mb-3">
              승인 시 자녀에게 지급할 스티커를 선택해주세요
            </Text>
          </View>
          
          {/* 카테고리 필터 */}
          {categories.length > 0 && (
            <View className="px-4 mb-2">
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="pb-2"
                renderItem={({ item }) => (
                  <Pressable
                    className={`mr-2 px-3 py-2 rounded-lg ${
                      categoryFilter === item 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-100'
                    }`}
                    onPress={() => toggleCategoryFilter(item)}
                  >
                    <Text className={`${
                      categoryFilter === item 
                        ? 'text-white font-medium' 
                        : 'text-gray-700'
                    }`}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}
          
          {/* 스티커 목록 */}
          <FlatList
            data={filteredStickers}
            keyExtractor={(item) => item.id}
            numColumns={3}
            className="max-h-72"
            contentContainerClassName="p-2"
            renderItem={({ item }) => (
              <StickerItem
                sticker={item}
                isSelected={selectedStickerId === item.id}
                onSelect={handleSelectSticker}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <FontAwesome5 name="sticky-note" size={32} color="#d1d5db" />
                <Text className="text-gray-500 mt-3 text-center">
                  {stickers.length === 0 
                    ? '사용 가능한 스티커가 없습니다' 
                    : '검색 결과가 없습니다'}
                </Text>
              </View>
            }
          />
          
          {/* 하단 버튼 영역 */}
          <View className="p-4 border-t border-gray-200">
            <Pressable
              className={`py-3.5 rounded-xl flex-row items-center justify-center ${
                isLoading ? 'bg-gray-300' : 'bg-emerald-500 active:bg-emerald-600'
              }`}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold ml-2">처리 중...</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="check" size={15} color="white" className="mr-2" />
                  <Text className="text-white font-bold">
                    {onConfirm ? '스티커 선택 완료' : '선택 완료'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default StickerSelector;