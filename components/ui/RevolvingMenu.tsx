// components/ui/SimpleRevolvingMenu.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// 화면 크기
const { width } = Dimensions.get('window');

// 메뉴 아이템 타입
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  color: string;
}

// 메뉴 프롭스
interface SimpleRevolvingMenuProps {
  items: MenuItem[];
  role: 'parent' | 'child';
}

const SimpleRevolvingMenu: React.FC<SimpleRevolvingMenuProps> = ({ items, role }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const startX = useRef(0);
  
  // 현재 선택된 메뉴 아이템 찾기
  const currentItemIndex = items.findIndex(item => pathname.includes(item.route)) || 0;
  const currentItem = items[currentItemIndex >= 0 ? currentItemIndex : 0];
  
  // 메뉴 열기/닫기 토글
  const toggleMenu = () => {
    if (isOpen) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setActiveIndex(currentItemIndex >= 0 ? currentItemIndex : 0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsOpen(!isOpen);
  };
  
  // 메뉴 아이템 선택
  const handleItemSelect = (item: MenuItem, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(item.route);
    setIsOpen(false);
  };
  
  // 메뉴 회전 (왼쪽)
  const rotateLeft = () => {
    if (!isOpen) return;
    const newIndex = (activeIndex - 1 + items.length) % items.length;
    setActiveIndex(newIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // 메뉴 회전 (오른쪽)
  const rotateRight = () => {
    if (!isOpen) return;
    const newIndex = (activeIndex + 1) % items.length;
    setActiveIndex(newIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // 드래그 처리를 위한 PanResponder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isOpen,
    onMoveShouldSetPanResponder: () => isOpen,
    onPanResponderGrant: (evt, gestureState) => {
      startX.current = gestureState.x0;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!isOpen) return;
      
      const dx = gestureState.moveX - startX.current;
      if (Math.abs(dx) > 30) {
        if (dx > 0) {
          rotateLeft();
        } else {
          rotateRight();
        }
        startX.current = gestureState.moveX;
      }
    },
    onPanResponderRelease: () => {},
  });
  
  // 보이는 아이템 계산 (현재 인덱스 기준 좌우 2개씩)
  const getVisibleItems = () => {
    const visibleItems = [];
    
    for (let i = -2; i <= 2; i++) {
      const index = (activeIndex + i + items.length) % items.length;
      visibleItems.push({
        item: items[index],
        position: i,
        index,
      });
    }
    
    return visibleItems;
  };
  
  return (
    <View className="absolute bottom-8 left-0 right-0 items-center justify-center z-50">
      {/* 메뉴 열릴 때 보이는 반투명 오버레이 */}
      {isOpen && (
        <TouchableOpacity 
          activeOpacity={1}
          className="absolute top-[-200px] left-0 right-0 bottom-0 bg-black/30"
          onPress={toggleMenu}
        />
      )}
      
      {/* 메뉴 컨테이너 */}
      {isOpen && (
        <View 
          className="w-full h-32 flex flex-row justify-center items-center"
          {...panResponder.panHandlers}
        >
          {/* 좌측 회전 버튼 */}
          <TouchableOpacity 
            className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/80 items-center justify-center"
            onPress={rotateLeft}
          >
            <Ionicons name="chevron-back" size={24} color="#3D5366" />
          </TouchableOpacity>
          
          {/* 아이템 표시 영역 */}
          <View className="flex-row items-center justify-center">
            {getVisibleItems().map(({ item, position, index }) => {
              // 위치에 따른 스타일 계산
              const isCenter = position === 0;
              const scale = isCenter ? 1.2 : position === -1 || position === 1 ? 0.9 : 0.7;
              const opacity = isCenter ? 1 : position === -1 || position === 1 ? 0.8 : 0.5;
              const translateX = position * 60; // 아이템 간격
              
              return (
                <View 
                  key={item.id}
                  style={{
                    opacity,
                    transform: [
                      { translateX },
                      { scale },
                    ],
                    zIndex: isCenter ? 10 : 0,
                  }}
                  className="absolute"
                >
                  <TouchableOpacity
                    className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
                      isCenter ? 'border-2 border-white' : ''
                    }`}
                    style={{ backgroundColor: item.color }}
                    onPress={() => handleItemSelect(item, index)}
                  >
                    <Ionicons name={item.icon as any} size={isCenter ? 28 : 20} color="white" />
                  </TouchableOpacity>
                  {isCenter && (
                    <Text className="mt-1 text-xs bg-white/80 px-2 py-0.5 rounded-md text-center text-[#3D5366] font-medium">
                      {item.label}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* 우측 회전 버튼 */}
          <TouchableOpacity 
            className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/80 items-center justify-center"
            onPress={rotateRight}
          >
            <Ionicons name="chevron-forward" size={24} color="#3D5366" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* 중앙 메인 버튼 */}
      <TouchableOpacity
        className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: isOpen ? '#333' : currentItem.color }}
        onPress={toggleMenu}
      >
        <Ionicons
          name={isOpen ? 'close' : currentItem.icon as any}
          size={28}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

export default SimpleRevolvingMenu;