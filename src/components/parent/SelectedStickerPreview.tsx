import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { StickerTemplate } from '../../api/modules/sticker';
import Colors from '../../constants/Colors';
import { getStickerImageSource } from '../../services/stickerService';

interface SelectedStickerPreviewProps {
  selectedSticker: StickerTemplate | null;
  onPress: () => void;
  isLoading?: boolean;
  allStickers?: StickerTemplate[];
  onSelectSticker?: (id: string) => void;
}

/**
 * 선택된 스티커 미리보기 컴포넌트 - 더 간단한 캐러셀로 구현
 */
const SelectedStickerPreview = ({
  selectedSticker,
  onPress,
  isLoading = false,
  allStickers = [],
  onSelectSticker,
}: SelectedStickerPreviewProps) => {
  const flatListRef = useRef<FlatList>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const visibleIndexRef = useRef<number>(0);

  
  // 개별 아이템 너비 (메인 스티커는 크게, 옆에 있는 스티커는 작게 보이도록)
  const ITEM_WIDTH = screenWidth * 0.3;
  const ITEM_SPACING = screenWidth * 0.06;

  // 초기 스크롤 위치 설정 (선택된 스티커가 있으면 해당 위치로)
  React.useEffect(() => {
    if (selectedSticker && allStickers.length > 0 && flatListRef.current) {
      const index = allStickers.findIndex(
        (sticker) => sticker.id === selectedSticker.id,
      );
      if (index !== -1) {
        setVisibleIndex(index);
        flatListRef.current.scrollToIndex({
          index: index + allStickers.length, // 중간 섹션으로 이동
          animated: false,
          viewPosition: -0.2,
        });
      }
    }
  }, [selectedSticker, allStickers]);

  // 자동으로 무한루프 구현을 위한 처리
  const getAdjustedData = () => {
    // 스티커가 없거나 1개인 경우
    if (allStickers.length <= 1) return allStickers;

    // 스티커가 2개 이하면 반복 생성
    if (allStickers.length <= 2) {
      return [...allStickers, ...allStickers, ...allStickers, ...allStickers];
    }

    // 충분히 많은 경우 3배로 복제
    return [...allStickers, ...allStickers, ...allStickers];
  };

  const adjustedData = getAdjustedData();

  // 스크롤 이벤트 처리
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;

    // 현재 보이는 인덱스 계산
    const index = Math.round(contentOffsetX / (ITEM_WIDTH + ITEM_SPACING));

    if (index !== visibleIndex) {
      setVisibleIndex(index);

      // 실제 선택된 스티커 인덱스 계산 (무한루프 구현을 위해 모듈로 연산)
      const realIndex = index % allStickers.length;

      // 선택된 스티커 변경
      if (onSelectSticker && allStickers[realIndex]) {
        onSelectSticker(allStickers[realIndex].id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // 무한 스크롤 효과: 끝에 가까워지면 중간으로 점프
      if (index < allStickers.length / 2 || index >= allStickers.length * 2.5) {
        // 스크롤 멈춤 감지 후 중간 섹션으로 점프
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: realIndex + allStickers.length,
              animated: false,
            });
            
          }
        }, 100);
      }
    }
  };

  

  // 아이템 렌더링 (단순화된 버전)
  const renderStickerItem = ({
    item,
    index,
  }: {
    item: StickerTemplate;
    index: number;
  }) => {
    const isSelected = selectedSticker?.id === item.id;
    const isCentered = index === visibleIndex;

    // 선택/비선택에 따른 스타일 설정 (훅을 사용하지 않는 방법)
    const itemStyle = {
      width: ITEM_WIDTH,
      marginHorizontal: ITEM_SPACING / 2,
      opacity: isCentered ? 1 : 0.6,
      transform: [{ scale: isCentered ? 1 : 0.85 }],
    };

    return (
      <View style={itemStyle}>
        <View
          className={`px-2 py-4 items-center rounded-xl bg-white shadow-sm ${
            isSelected
              ? 'border-2 border-emerald-400'
              : 'border border-gray-100'
          }`}
        >
          <Image
            source={getStickerImageSource(item.imageUrl)}
            style={{ width: 80, height: 80 }}
            contentFit="contain"
            transition={150}
          />

          <Text
            className="text-gray-800 font-bold text-base mt-2"
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {item.description ? (
            <Text
              className="text-gray-500 text-xs text-center mt-1"
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
        <View className="p-4 items-center">
          <View className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mb-3" />
          <View className="w-32 h-5 bg-gray-200 rounded mb-2 animate-pulse" />
          <View className="w-40 h-3 bg-gray-100 rounded animate-pulse" />
        </View>
        <View className="bg-gray-50 p-3 border-t border-gray-100 items-center">
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text className="text-gray-500 text-xs mt-1">로딩 중...</Text>
        </View>
      </View>
    );
  }

  // 스티커가 없는 경우 기존 방식 유지
  if (allStickers.length === 0) {
    return (
      <Pressable
        className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 active:opacity-90"
        onPress={onPress}
      >
        <View className="p-4 items-center">
          <View className="w-16 h-16 bg-gray-100 rounded-full mb-3 items-center justify-center">
            <FontAwesome5 name="star" size={24} color="#9ca3af" />
          </View>
          <Text className="text-gray-800 font-bold text-base">
            스티커 선택하기
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            승인 시 자녀에게 지급될 스티커입니다
          </Text>
        </View>

        <View className="bg-gray-50 p-3 border-t border-gray-100 flex-row items-center justify-center">
          <FontAwesome5
            name="exchange-alt"
            size={12}
            color={Colors.light.primary}
            className="mr-2"
          />
          <Text className="text-emerald-600 font-medium">스티커 변경하기</Text>
        </View>
      </Pressable>
    );
  }

  // 간단한 캐러셀 구현
  return (
    <View className="mb-1">
      {/* 간소화된 캐러셀 */}
      <FlatList
        ref={flatListRef}
        data={adjustedData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={(props) => renderStickerItem(props)}
        initialScrollIndex={allStickers.length} // 중간에서 시작
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH + ITEM_SPACING,
          offset: (ITEM_WIDTH + ITEM_SPACING) * index,
          index,
        })}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2 - ITEM_SPACING / 2,
        }}
      />

      {/* 페이지 인디케이터 & 안내 메시지 */}
      <View className="flex-row justify-center items-center mt-2">
        <FontAwesome5
          name="chevron-left"
          size={10}
          color={Colors.light.textSecondary}
        />
        <View className="flex-row mx-2">
          {allStickers.slice(0, 5).map((_, index) => (
            <View
              key={`indicator-${index}`}
              className={`mx-0.5 rounded-full ${
                visibleIndex % allStickers.length === index
                  ? 'bg-emerald-500 w-2 h-2'
                  : 'bg-gray-300 w-1.5 h-1.5'
              }`}
            />
          ))}
          {allStickers.length > 5 && (
            <Text className="text-xs text-gray-400 mx-1">...</Text>
          )}
        </View>
        <FontAwesome5
          name="chevron-right"
          size={10}
          color={Colors.light.textSecondary}
        />
      </View>
    </View>
  );
};

export default SelectedStickerPreview;
