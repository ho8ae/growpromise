// src/components/common/PlantDisplay.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface PlantDisplayProps {
  plant: any | null;
  plantType: any | null;
  isLoading: boolean;
  onPress?: () => void;
  onWaterPress?: () => void;
  userType?: 'parent' | 'child';
  showExperienceAnimation?: boolean;
  experienceGained?: number;
}

const PlantDisplay: React.FC<PlantDisplayProps> = ({
  plant,
  plantType,
  isLoading,
  onPress,
  onWaterPress,
  userType = 'child',
  showExperienceAnimation = false,
  experienceGained = 0,
}) => {
  // 경험치 퍼센트 상태
  const [progressPercent, setProgressPercent] = useState(0);
  
  // 경험치 애니메이션 값
  const experienceAnim = useRef(new Animated.Value(0)).current;
  const experienceOpacity = useRef(new Animated.Value(0)).current;

  // 경험치 계산 및 업데이트
  useEffect(() => {
    if (plant) {
      const experience = plant.experience !== undefined ? plant.experience : 0;
      const experienceToGrow = plant.experienceToGrow !== undefined ? plant.experienceToGrow : 100;
      
      // 안전 체크 후 퍼센티지 계산
      if (experienceToGrow > 0) {
        const percent = Math.min((experience / experienceToGrow) * 100, 100);
        console.log('경험치 퍼센트:', percent, '%', '경험치:', experience, '/', experienceToGrow);
        setProgressPercent(percent);
      } else {
        setProgressPercent(0);
      }
    }
  }, [plant]);

  // 경험치 애니메이션 실행
  useEffect(() => {
    if (showExperienceAnimation && experienceGained > 0) {
      // 경험치 애니메이션 표시
      Animated.sequence([
        Animated.timing(experienceOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(experienceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(experienceOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showExperienceAnimation, experienceGained]);

  // 이미지 가져오기
  const getPlantImage = () => {
    if (!plant || !plantType) return null;
    
    try {
      // 식물의 현재 단계에 따른 이미지 반환
      const imageStage = Math.max(1, Math.min(plant.currentStage, plantType.growthStages || 5));
      // 동적 이미지 import가 작동하지 않을 경우 switch문 사용
      switch(imageStage) {
        case 1:
          return require('../../assets/images/character/level_1.png');
        case 2:
          return require('../../assets/images/character/level_2.png');
        case 3:
          return require('../../assets/images/character/level_3.png');
        case 4:
          return require('../../assets/images/character/level_4.png');
        case 5:
          return require('../../assets/images/character/level_5.png');
        default:
          return require('../../assets/images/character/level_1.png');
      }
    } catch (e) {
      console.error('식물 이미지 로드 실패:', e);
      return require('../../assets/images/character/level_1.png'); // 기본 이미지 반환
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <View 
        className="bg-white rounded-xl p-5 items-center justify-center"
        style={{ 
          borderWidth: 1, 
          borderColor: 'rgba(16, 185, 129, 0.2)',
          minHeight: 200,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.leafGreen} />
        <Text className="mt-4 text-emerald-700">식물 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 식물이 없는 경우
  if (!plant) {
    return (
      <Pressable
        className="bg-white rounded-xl border border-gray-200 p-5 items-center shadow-sm"
        onPress={onPress}
      >
        <View className="bg-emerald-50 p-4 rounded-full mb-4">
          <MaterialIcons name="eco" size={40} color={Colors.light.leafGreen} />
        </View>
        <Text className="text-lg font-bold text-emerald-700 mb-2">식물이 없어요</Text>
        <Text className="text-gray-500 text-center mb-4">
          {userType === 'parent' 
            ? '자녀가 아직 식물을 선택하지 않았어요. 자녀에게 식물을 선택하라고 알려주세요.' 
            : '식물을 선택하고 키워보세요!'}
        </Text>
        {userType === 'child' && (
          <View className="bg-emerald-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-medium">식물 선택하기</Text>
          </View>
        )}
      </Pressable>
    );
  }

  // 필요한 값 추출
  const experience = plant.experience !== undefined ? plant.experience : 0;
  const experienceToGrow = plant.experienceToGrow !== undefined ? plant.experienceToGrow : 100;
  const canGrow = plant.canGrow !== undefined ? plant.canGrow : false;

  return (
    <Pressable
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-xl font-bold text-emerald-700">
            {plant.name || (plantType?.name || '나의 식물')}
          </Text>
          <Text className="text-emerald-600">
            {plantType?.category || '식물'} • 단계 {plant.currentStage}/{plantType?.growthStages || 5}
          </Text>
        </View>
        
        {/* 건강 상태 */}
        <View className="bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm flex-row items-center">
          <MaterialIcons 
            name="favorite" 
            size={16} 
            color={plant.health > 70 ? Colors.light.leafGreen : 
                   plant.health > 40 ? Colors.light.amber : '#ef4444'} 
            style={{ marginRight: 4 }} 
          />
          <Text 
            className="font-medium"
            style={{ 
              color: plant.health > 70 ? Colors.light.leafGreen : 
                     plant.health > 40 ? Colors.light.amber : '#ef4444'
            }}
          >
            {plant.health !== undefined ? `${plant.health}%` : '100%'}
          </Text>
        </View>
      </View>
      
      {/* 식물 이미지 */}
      <View className="items-center justify-center py-2">
        <View style={{ position: 'relative' }}>
          {getPlantImage() ? (
            <Image
              source={getPlantImage()}
              style={{ width: 140, height: 140 }}
              contentFit="contain"
            />
          ) : (
            <View className="bg-emerald-100 p-10 rounded-full">
              <MaterialIcons name="eco" size={60} color={Colors.light.leafGreen} />
            </View>
          )}
          
          {/* 경험치 획득 애니메이션 */}
          {showExperienceAnimation && experienceGained > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.light.leafGreen,
                transform: [
                  { translateY: experienceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30]
                  }) }
                ],
                opacity: experienceOpacity
              }}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="auto-fix-high" size={16} color={Colors.light.leafGreen} />
                <Text className="text-emerald-700 font-medium ml-1">+{experienceGained} 경험치!</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
      
      {/* 경험치 및 성장 진행 상태 */}
      <View className="mt-2 mb-1">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-600 text-sm">경험치</Text>
          <Text className="text-emerald-600 text-sm font-medium">
            {experience}/{experienceToGrow}
          </Text>
        </View>
        
        {/* 진행 바 - NativeWind 대신 직접 스타일 적용 */}
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progressPercent}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* 다음 성장까지 필요한 경험치 */}
      <Text className="text-xs text-gray-500 mb-3 text-center">
        {canGrow 
          ? '식물이 성장할 준비가 되었어요! 식물 화면에서 성장시키세요.' 
          : `다음 단계까지 ${experienceToGrow - experience} 경험치 남음`}
      </Text>
      
      {/* 물주기 버튼 - 자녀인 경우만 표시 */}
      {userType === 'child' && onWaterPress && (
        <Pressable
          className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center"
          onPress={onWaterPress}
        >
          <MaterialIcons name="opacity" size={18} color="white" style={{ marginRight: 4 }} />
          <Text className="text-white font-medium">물주기</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

// 직접 스타일 정의 (NativeWind 클래스가 작동하지 않을 경우를 대비)
const styles = StyleSheet.create({
  progressContainer: {
    height: 8,
    backgroundColor: '#f3f4f6', // gray-100 색상
    borderRadius: 9999, // rounded-full
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981', // emerald-500 색상
    borderRadius: 9999, // rounded-full
  },
});

export default PlantDisplay;