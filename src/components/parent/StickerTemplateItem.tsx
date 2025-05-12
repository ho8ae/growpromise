// src/components/parent/StickerTemplateItem.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { StickerTemplate } from '../../api/modules/sticker';
import { getStickerImageSource } from '../../services/stickerService';

interface StickerTemplateItemProps {
  template: StickerTemplate;
  onPress: (template: StickerTemplate) => void;
}

/**
 * 스티커 템플릿 관리 화면에서 사용하는 스티커 아이템 컴포넌트
 */
const StickerTemplateItem = React.memo(({ template, onPress }: StickerTemplateItemProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(template);
  };

  return (
    <Pressable
      className="flex-1 p-2"
      onPress={handlePress}
    >
      <View className="bg-white rounded-xl border border-gray-200 p-3 items-center shadow-sm">
        <Image
          source={getStickerImageSource(template.imageUrl)}
          style={{ width: 70, height: 70 }}
          contentFit="contain"
          className="mb-2"
          transition={200}
          cachePolicy="memory-disk"
        />
        <Text className="text-sm text-center text-gray-800" numberOfLines={1}>
          {template.name}
        </Text>
        <Text className="text-xs text-center text-gray-500" numberOfLines={1}>
          {template.category}
        </Text>
      </View>
    </Pressable>
  );
});

StickerTemplateItem.displayName = 'StickerTemplateItem';

export default StickerTemplateItem;