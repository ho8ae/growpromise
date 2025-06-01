// src/components/gallery/GalleryItem.tsx - 안전한 날짜 처리 적용
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
  createdAt: string; // 날짜 추가
  isFavorite: boolean;
  childName?: string;
  showChildInfo?: boolean; // 부모 화면에서만 자녀 정보 표시
  onToggleFavorite: (imageId: string, isFavorite: boolean) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
}

// 안전한 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  try {
    // 빈 문자열이나 null/undefined 체크
    if (!dateString || dateString.trim() === '') {
      return '';
    }

    // 날짜 객체 생성
    const date = new Date(dateString);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 날짜 형식:', dateString);
      return '';
    }
    
    const now = new Date();
    
    // 미래 날짜 체크
    if (date.getTime() > now.getTime()) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    }
    
    // 날짜 차이 계산
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 오늘
    if (diffDays === 0) {
      return '오늘';
    }
    // 어제
    else if (diffDays === 1) {
      return '어제';
    }
    // 1주일 이내
    else if (diffDays <= 7) {
      return `${diffDays}일 전`;
    }
    // 1개월 이내
    else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}주 전`;
    }
    // 1년 이내
    else if (diffDays <= 365) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    }
    // 1년 이상
    else {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}년 ${month}월 ${day}일`;
    }
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error, 'Original date string:', dateString);
    return '';
  }
};

// 갤러리 아이템 컴포넌트
const GalleryItem: React.FC<GalleryItemProps> = ({
  id,
  imageUrl,
  promiseTitle,
  createdAt,
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

  // 안전한 날짜 포맷팅 적용
  const formattedDate = formatDate(createdAt);

  return (
    <View className="relative overflow-hidden rounded-xl">
      {/* 갤러리 이미지 */}
      <Pressable onPress={handleImagePress} className="relative">
        <Image
          source={getImageUrl(imageUrl)}
          style={{ width: '100%', aspectRatio: 1 }} // 정사각형 비율로 변경
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
        
        {/* 즐겨찾기 아이콘 */}
        <Pressable 
          onPress={handleToggleFavorite}
          className="absolute top-2 right-2 bg-black/30 w-7 h-7 rounded-full items-center justify-center"
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <FontAwesome5
            name="heart"
            solid={isLocalFavorite}
            size={12}
            color={isLocalFavorite ? "#FF4B4B" : "white"}
          />
        </Pressable>
        
        {/* 로딩 인디케이터 */}
        {loading && (
          <View className="absolute inset-0 flex items-center justify-center bg-black/10">
            <ActivityIndicator size="small" color={Colors.light.primary} />
          </View>
        )}
      </Pressable>
      
      {/* 약속 제목과 날짜 */}
      <View className="py-2 px-1">
        <Text 
          className="text-sm font-medium text-gray-800 leading-4"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {promiseTitle}
        </Text>
        
        {/* 날짜 정보 - 안전한 포맷팅 적용 */}
        {formattedDate && (
          <View className="flex-row items-center mt-1">
            <FontAwesome5 
              name="calendar-alt" 
              size={10} 
              color="#9CA3AF" 
              style={{ marginRight: 4 }}
            />
            <Text className="text-xs text-gray-500">
              {formattedDate}
            </Text>
          </View>
        )}
      </View>
      
      {/* 옵션 오버레이 (이미지 터치 시 표시) */}
      {showOptions && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <View className="flex-row">
            {/* 상세 보기 버튼 */}
            <Pressable 
              onPress={handleViewDetail}
              className="bg-white/20 mx-1 w-12 h-12 rounded-full items-center justify-center"
            >
              <FontAwesome5 name="search" size={16} color="white" />
              <Text className="text-white text-xs mt-1">보기</Text>
            </Pressable>
            
            {/* 삭제 버튼 */}
            <Pressable 
              onPress={handleDelete}
              className="bg-white/20 mx-1 w-12 h-12 rounded-full items-center justify-center"
            >
              <FontAwesome5 name="trash-alt" size={16} color="white" />
              <Text className="text-white text-xs mt-1">삭제</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default GalleryItem;