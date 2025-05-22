// src/components/gallery/GalleryItem.tsx
import React, { useState } from 'react';
import { View, Pressable, Text, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// 유틸리티
import { getImageUrl } from '../../utils/imageUrl';
import Colors from '../../constants/Colors';

// 갤러리 아이템 속성 타입
interface GalleryItemProps {
  id: string;
  imageUrl: string;
  promiseTitle: string;
  isFavorite: boolean;
  childName?: string;
  showChildInfo?: boolean; // 부모 화면에서만 자녀 정보 표시
  onToggleFavorite: (imageId: string, isFavorite: boolean) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
}

// 갤러리 아이템 컴포넌트
const GalleryItem: React.FC<GalleryItemProps> = ({
  id,
  imageUrl,
  promiseTitle,
  isFavorite,
  childName,
  showChildInfo = false,
  onToggleFavorite,
  onDelete
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  // 로컬 상태로 즐겨찾기 상태 관리 (UI 반응성 향상)
  const [isLocalFavorite, setIsLocalFavorite] = useState(isFavorite);

  // 즐겨찾기 토글 처리
  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // 로컬 상태 먼저 업데이트 (UI 즉시 반응)
      setIsLocalFavorite(!isLocalFavorite);
      
      // API 호출로 서버에 반영
      await onToggleFavorite(id, !isLocalFavorite);
    } catch (error) {
      console.error('즐겨찾기 토글 중 오류:', error);
      // 오류 발생 시 상태 복원
      setIsLocalFavorite(isLocalFavorite);
      
      Alert.alert(
        '오류',
        '즐겨찾기 변경 중 문제가 발생했습니다.',
        [{ text: '확인' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // 삭제 처리
  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      '갤러리 이미지 삭제',
      '이 이미지를 갤러리에서 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await onDelete(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('이미지 삭제 중 오류:', error);
              Alert.alert(
                '오류',
                '이미지 삭제 중 문제가 발생했습니다.',
                [{ text: '확인' }]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // 이미지 터치 처리
  const handleImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 옵션 표시 상태 토글
    setShowOptions(!showOptions);
  };

  // 이미지 상세 보기로 이동
  const handleViewDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 이미지 상세 보기 화면으로 이동
    router.push({
      pathname: '/gallery-detail',
      params: { id }
    });
    
    // 옵션 닫기
    setShowOptions(false);
  };

  return (
    <View className="relative overflow-hidden rounded-xl mb-2">
      {/* 갤러리 이미지 */}
      <Pressable onPress={handleImagePress} className="relative">
        <Image
          source={getImageUrl(imageUrl)}
          style={{ width: '100%', height: 200 }}
          contentFit="cover"
          transition={150}
          className="bg-gray-100 rounded-xl"
        />
        
        {/* 자녀 정보 (부모 화면에서만 표시) */}
        {showChildInfo && childName && (
          <View className="absolute top-2 left-2 bg-black/30 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">{childName}</Text>
          </View>
        )}
        
        {/* 로딩 인디케이터 */}
        {loading && (
          <View className="absolute inset-0 flex items-center justify-center bg-black/10">
            <ActivityIndicator size="small" color={Colors.light.primary} />
          </View>
        )}
        
        {/* 즐겨찾기 아이콘 */}
        {/* <Pressable 
          onPress={handleToggleFavorite}
          className="absolute top-2 right-2 bg-black/30 w-8 h-8 rounded-full items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome5
            name="heart"
            solid={isLocalFavorite}
            size={16}
            color={isLocalFavorite ? "#FF4B4B" : "white"}
          />
        </Pressable> */}
      </Pressable>
      
      {/* 약속 제목 */}
      <View className="py-2 px-2">
        <Text className="text-sm font-medium text-gray-800 truncate">{promiseTitle}</Text>
      </View>
      
      {/* 옵션 오버레이 (이미지 터치 시 표시) */}
      {showOptions && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="flex-row">
            {/* 상세 보기 버튼 */}
            <Pressable 
              onPress={handleViewDetail}
              className="bg-white/20 mx-2 w-16 h-16 rounded-full items-center justify-center"
            >
              <FontAwesome5 name="search" size={20} color="white" />
              <Text className="text-white text-xs mt-1">상세보기</Text>
            </Pressable>
            
            {/* 삭제 버튼 */}
            <Pressable 
              onPress={handleDelete}
              className="bg-white/20 mx-2 w-16 h-16 rounded-full items-center justify-center"
            >
              <FontAwesome5 name="trash-alt" size={20} color="white" />
              <Text className="text-white text-xs mt-1">삭제</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default GalleryItem;