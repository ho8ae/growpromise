import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { StickerTemplate } from '../../api/modules/sticker';
import { getStickerImageSource } from '../../services/stickerService';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface StickerItemProps {
  sticker: StickerTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * 스티커 선택 시 사용되는 개별 스티커 아이템 컴포넌트
 * 최신 트렌드에 맞게 현대적인 디자인 적용
 */
const StickerItem = React.memo(({ sticker, isSelected, onSelect }: StickerItemProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(sticker.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`m-1.5 rounded-xl shadow-sm ${
        isSelected
          ? 'bg-emerald-50'
          : 'bg-white'
      }`}
      style={{ width: '30%' }}
    >
      <View className={`p-3 items-center justify-center border ${
        isSelected
          ? 'border-emerald-500'
          : 'border-gray-100'
      } rounded-xl`}>
        {/* 선택된 경우 체크 마크 표시 */}
        {isSelected && (
          <View className="absolute top-1 right-1 z-10 bg-emerald-500 rounded-full w-5 h-5 items-center justify-center">
            <FontAwesome5 name="check" size={10} color="white" />
          </View>
        )}
        
        <Image
          source={getStickerImageSource(sticker.imageUrl)}
          style={{ width: 60, height: 60 }}
          contentFit="contain"
          transition={150}
          className={isSelected ? 'opacity-100 scale-105' : 'opacity-90 scale-100'}
        />
        
        <Text 
          className={`text-xs text-center mt-2 ${isSelected ? 'text-emerald-800 font-medium' : 'text-gray-700'}`} 
          numberOfLines={1}
        >
          {sticker.name}
        </Text>
      </View>
    </Pressable>
  );
});

StickerItem.displayName = 'StickerItem';

export default StickerItem;