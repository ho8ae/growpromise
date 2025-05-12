// src/components/parent/SelectedStickerPreview.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StickerTemplate } from '../../api/modules/sticker';
import { getStickerImageSource } from '../../services/stickerService';

interface SelectedStickerPreviewProps {
  selectedSticker: StickerTemplate | null;
  onPress: () => void;
  isLoading?: boolean;
}

/**
 * 선택된 스티커 미리보기 컴포넌트
 */
const SelectedStickerPreview = ({ 
  selectedSticker, 
  onPress, 
  isLoading = false 
}: SelectedStickerPreviewProps) => {
  if (isLoading) {
    return (
      <View className="flex-row items-center p-3 bg-white rounded-lg border border-emerald-200">
        <View className="w-[50px] h-[50px] bg-gray-200 rounded-full mr-3 animate-pulse" />
        <View className="flex-1">
          <View className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
          <View className="w-36 h-3 bg-gray-100 rounded animate-pulse" />
        </View>
        <FontAwesome5 name="chevron-down" size={16} color="#d1d5db" />
      </View>
    );
  }

  return (
    <Pressable 
      className="flex-row items-center p-3 bg-white rounded-lg border border-emerald-200 active:bg-emerald-50"
      onPress={onPress}
    >
      {selectedSticker ? (
        <Image
          source={getStickerImageSource(selectedSticker.imageUrl)}
          style={{ width: 50, height: 50 }}
          contentFit="contain"
          className="mr-3"
        />
      ) : (
        <View className="w-[50px] h-[50px] bg-gray-200 rounded-full mr-3 items-center justify-center">
          <FontAwesome5 name="star" size={24} color="#9ca3af" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-emerald-900 font-medium">
          {selectedSticker?.name || '스티커 선택하기'}
        </Text>
        {selectedSticker?.description ? (
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            {selectedSticker.description}
          </Text>
        ) : (
          <Text className="text-gray-500 text-sm">
            클릭하여 스티커를 선택해주세요
          </Text>
        )}
      </View>
      <FontAwesome5 name="chevron-down" size={16} color="#10b981" />
    </Pressable>
  );
};

export default SelectedStickerPreview;