// src/app/store-packs.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const SPACING = 10;

interface PackData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // 실제 구현 시 이미지 경로로 대체
  color: string;
  items: number; // 팩에 포함된 아이템 수
}

const packData: PackData[] = [
  {
    id: 'basic_pack',
    name: '기본 팩',
    description: '기본적인 식물과 액세서리가 담긴 팩입니다.',
    price: 100,
    image: 'https://via.placeholder.com/300',
    color: '#58CC02', // 듀오링고 메인 그린
    items: 3,
  },
  {
    id: 'premium_pack',
    name: '프리미엄 팩',
    description: '희귀한 식물과 액세서리가 담긴 팩입니다.',
    price: 300,
    image: 'https://via.placeholder.com/300',
    color: '#1CB0F6', // 듀오링고 정보 파랑
    items: 5,
  },
  {
    id: 'special_pack',
    name: '스페셜 팩',
    description: '한정판 식물과 액세서리가 담긴 팩입니다.',
    price: 500,
    image: 'https://via.placeholder.com/300',
    color: '#CE82FF', // 듀오링고 액센트 퍼플
    items: 7,
  },
  {
    id: 'seasonal_pack',
    name: '시즌 팩',
    description: '시즌 한정 식물과 액세서리가 담긴 팩입니다.',
    price: 400,
    image: 'https://via.placeholder.com/300',
    color: '#FF9600', // 건강 색상
    items: 5,
  },
  {
    id: 'booster_pack',
    name: '부스터 팩',
    description: '성장 부스터와 특별 아이템이 담긴 팩입니다.',
    price: 250,
    image: 'https://via.placeholder.com/300',
    color: '#FF4B4B', // 듀오링고 오류 빨강
    items: 4,
  },
];

// 무한 루프를 위해 데이터 준비
const infinitePackData = [...packData, ...packData, ...packData];

export default function StorePacksScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [coins, setCoins] = useState<number>(650); // 예시 코인 수
  const [selectedPack, setSelectedPack] = useState<PackData | null>(null);
  
  // 슬라이더 위치 초기화
  useEffect(() => {
    // 무한 루프를 위해 중간 위치로 스크롤
    const initialOffset = packData.length * CARD_WIDTH;
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: initialOffset,
          animated: false,
        });
      }
    }, 100);
  }, []);

  const flatListRef = useRef<any>(null);
  
  // 뒤로가기 처리
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  // 팩 구매 처리
  const handlePurchase = (pack: PackData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (coins < pack.price) {
      alert('코인이 부족합니다!');
      return;
    }
    
    // 실제 구현 시 API 호출
    setCoins(coins - pack.price);
    alert(`${pack.name}을(를) 구매했습니다! 인벤토리에서 확인하세요.`);
  };

  // 팩 선택 처리
  const handleSelectPack = (pack: PackData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPack(pack);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={handleBack}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-gray-800">카드팩</Text>
        
        <View className="flex-row items-center bg-yellow-100 px-3 py-2 rounded-full">
          <FontAwesome5 name="coins" size={16} color="#F59E0B" />
          <Text className="ml-2 font-bold text-yellow-700">{coins}</Text>
        </View>
      </View>
      
      {/* 가이드 텍스트 */}
      <View className="px-6 py-4">
        <Text className="text-lg font-bold text-center text-gray-700">
          팩을 열어 특별한 아이템을 모아보세요!
        </Text>
        <Text className="text-sm text-center text-gray-500 mt-1">
          좌우로 스와이프하여 탐색하세요
        </Text>
      </View>
      
      {/* 카드 팩 캐러셀 */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.FlatList
          ref={flatListRef}
          data={infinitePackData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: (width - CARD_WIDTH) / 2,
          }}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast"
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 2) * (CARD_WIDTH + SPACING),
              (index - 1) * (CARD_WIDTH + SPACING),
              index * (CARD_WIDTH + SPACING),
              (index + 1) * (CARD_WIDTH + SPACING),
              (index + 2) * (CARD_WIDTH + SPACING),
            ];
            
            // 애니메이션 값 계산
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [25, 15, 0, 15, 25],
              extrapolate: 'clamp',
            });
            
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 0.9, 1, 0.9, 0.85],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.5, 0.8, 1, 0.8, 0.5],
              extrapolate: 'clamp',
            });
            
            const rotateZ = scrollX.interpolate({
              inputRange,
              outputRange: ['5deg', '3deg', '0deg', '-3deg', '-5deg'],
              extrapolate: 'clamp',
            });
            
            return (
              <TouchableOpacity
                onPress={() => handleSelectPack(item)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [
                        { translateY },
                        { scale },
                        { rotateZ },
                      ],
                      opacity,
                      backgroundColor: item.color,
                      marginRight: SPACING,
                    },
                  ]}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsText}>{item.items}개의 아이템</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <FontAwesome5 name="coins" size={14} color="white" />
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                    <View style={styles.cardOverlay} />
                  </View>
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      
      {/* 선택된 팩 정보 */}
      {selectedPack && (
        <View className="px-6 py-4 bg-white rounded-t-3xl shadow-lg">
          <Text className="text-xl font-bold text-gray-800 mb-2">{selectedPack.name}</Text>
          <Text className="text-gray-600 mb-3">{selectedPack.description}</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <FontAwesome5 name="box" size={16} color="#777" />
              <Text className="text-gray-700 ml-2">{selectedPack.items}개 아이템</Text>
            </View>
            
            <View className="flex-row items-center">
              <FontAwesome5 name="coins" size={16} color="#F59E0B" />
              <Text className="text-yellow-700 font-bold ml-2">{selectedPack.price}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            className={`py-3 rounded-full ${coins >= selectedPack.price ? 'bg-green-500' : 'bg-gray-400'}`}
            onPress={() => handlePurchase(selectedPack)}
            disabled={coins < selectedPack.price}
          >
            <Text className="text-white font-bold text-center">
              {coins >= selectedPack.price ? '구매하기' : '코인 부족'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  itemsText: {
    color: 'white',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
  },
});