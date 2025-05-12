// src/components/parent/StickerSelector.tsx
import React from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StickerTemplate } from '../../api/modules/sticker';
import StickerItem from './StickerItem';

interface StickerSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  stickers: StickerTemplate[];
  selectedStickerId: string | null;
  onSelectSticker: (id: string) => void;
}

/**
 * 스티커 선택 모달 컴포넌트
 */
const StickerSelector = ({
  isVisible,
  onClose,
  stickers,
  selectedStickerId,
  onSelectSticker
}: StickerSelectorProps) => {
  const handleSelectSticker = (id: string) => {
    onSelectSticker(id);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="flex-row justify-between items-center border-b border-gray-200 p-4">
            <Text className="text-lg font-bold text-emerald-700">스티커 선택</Text>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="times" size={20} color="#10b981" />
            </Pressable>
          </View>
          
          <FlatList
            data={stickers}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={{ padding: 10 }}
            renderItem={({ item }) => (
              <StickerItem
                sticker={item}
                isSelected={selectedStickerId === item.id}
                onSelect={handleSelectSticker}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-8">
                <FontAwesome5 name="sad-tear" size={32} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">
                  사용 가능한 스티커가 없습니다
                </Text>
              </View>
            }
          />
          
          <View className="p-4 border-t border-gray-200">
            <Pressable
              className="bg-emerald-500 p-3 rounded-xl"
              onPress={onClose}
            >
              <Text className="text-white text-center font-medium">닫기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StickerSelector;