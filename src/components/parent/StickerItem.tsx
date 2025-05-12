// src/components/parent/StickerItem.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { StickerTemplate } from '../../api/modules/sticker';
import { getStickerImageSource } from '../../services/stickerService';

interface StickerItemProps {
  sticker: StickerTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * 스티커 선택 시 사용되는 개별 스티커 아이템 컴포넌트
 */
const StickerItem = React.memo(({ sticker, isSelected, onSelect }: StickerItemProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(sticker.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`p-2 m-1 items-center rounded-lg ${
        isSelected
          ? 'bg-emerald-50 border-2 border-emerald-500'
          : 'border border-gray-200'
      }`}
      style={{ width: '31%' }}
    >
      <Image
        source={getStickerImageSource(sticker.imageUrl)}
        style={{ width: 60, height: 60 }}
        contentFit="contain"
        transition={100}
      />
      <Text className="text-xs text-center mt-1" numberOfLines={1}>
        {sticker.name}
      </Text>
    </Pressable>
  );
});

StickerItem.displayName = 'StickerItem';

export default StickerItem;