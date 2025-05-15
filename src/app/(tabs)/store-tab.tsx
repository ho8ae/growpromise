// src/app/(tabs)/store-tab.tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function StoreTabScreen() {
  const router = useRouter();
  const [coins, setCoins] = React.useState(650); // 가상의 코인 데이터
  
  const handleOpenPacks = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/store-packs');
  };
  
  // 상점 카테고리 데이터
  const storeCategories = [
    {
      id: 'packs',
      title: '카드팩',
      description: '다양한 아이템이 담긴 랜덤 팩',
      icon: 'box-open',
      color: Colors.light.promise.reading,
      onPress: handleOpenPacks,
      badge: '인기',
    },
    {
      id: 'plants',
      title: '식물',
      description: '특별한 식물 구매',
      icon: 'seedling',
      color: Colors.light.promise.family,
      onPress: () => {},
    },
    {
      id: 'accessories',
      title: '액세서리',
      description: '화분, 물뿌리개 등',
      icon: 'umbrella-beach',
      color: Colors.light.promise.music,
      onPress: () => {},
    },
    {
      id: 'boosters',
      title: '부스터',
      description: '식물 성장 가속',
      icon: 'rocket',
      color: Colors.light.promise.exercise,
      onPress: () => {},
    },
  ];
  
  // 추천 상품 데이터
  const featuredItems = [
    {
      id: 'premium_plant',
      title: '무지개 식물',
      description: '희귀 식물',
      price: 500,
      image: 'https://via.placeholder.com/100',
      category: 'plants',
    },
    {
      id: 'golden_pot',
      title: '골드 화분',
      description: '고급 화분',
      price: 350,
      image: 'https://via.placeholder.com/100',
      category: 'accessories',
    },
    {
      id: 'premium_pack',
      title: '프리미엄 팩',
      description: '5개 아이템',
      price: 300,
      image: 'https://via.placeholder.com/100',
      category: 'packs',
      onPress: handleOpenPacks,
    },
  ];
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-4 pt-8 pb-20">
          {/* 헤더 */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">상점</Text>
            
            <View className="flex-row items-center bg-yellow-100 px-3 py-2 rounded-full">
              <FontAwesome5 name="coins" size={16} color="#F59E0B" />
              <Text className="ml-2 font-bold text-yellow-700">{coins} 코인</Text>
            </View>
          </View>
          
          {/* 메인 배너 - 카드팩 */}
          <TouchableOpacity 
            className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 mb-6 shadow-sm"
            onPress={handleOpenPacks}
            activeOpacity={0.9}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white font-bold text-xl mb-2">카드팩 오픈</Text>
                <Text className="text-white opacity-90 mb-3">
                  특별한 아이템이 담긴 카드팩을 열어보세요!
                </Text>
                <View className="bg-white/30 self-start px-3 py-1 rounded-full">
                  <Text className="text-white font-medium">지금 열기</Text>
                </View>
              </View>
              
              <View className="bg-white/20 p-4 rounded-full">
                <FontAwesome5 name="box-open" size={30} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          
          {/* 상점 카테고리 */}
          <Text className="text-lg font-bold text-gray-800 mb-3">카테고리</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            {storeCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                style={{ width: '48%' }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  category.onPress();
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-start">
                  <View 
                    className="p-3 rounded-full mb-3" 
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <FontAwesome5 name={category.icon} size={20} color={category.color} />
                  </View>
                  
                  {category.badge && (
                    <View className="bg-red-500 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">{category.badge}</Text>
                    </View>
                  )}
                </View>
                
                <Text className="text-gray-800 font-bold text-lg mb-1">{category.title}</Text>
                <Text className="text-gray-500 text-sm">{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* 추천 상품 */}
          <Text className="text-lg font-bold text-gray-800 mb-3">추천 상품</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {featuredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-white rounded-xl mr-3 shadow-sm border border-gray-100 overflow-hidden"
                style={{ width: 150 }}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (item.category === 'packs') {
                    handleOpenPacks();
                  }
                }}
              >
                <View className="h-24 bg-gray-100 items-center justify-center">
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                
                <View className="p-3">
                  <Text className="text-gray-800 font-bold mb-1">{item.title}</Text>
                  <Text className="text-gray-500 text-xs mb-2">{item.description}</Text>
                  
                  <View className="flex-row items-center">
                    <FontAwesome5 name="coins" size={12} color="#F59E0B" />
                    <Text className="ml-1 font-bold text-yellow-700">{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* 코인 획득 안내 */}
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <View className="flex-row items-center mb-2">
              <FontAwesome5 name="info-circle" size={18} color={Colors.light.info} />
              <Text className="text-lg font-semibold ml-2 text-gray-800">코인 획득 방법</Text>
            </View>
            <Text className="text-gray-600 mb-2">
              약속을 완료하면 코인을 획득할 수 있어요! 또한 다음과 같은 방법으로도 코인을 모을 수 있습니다:
            </Text>
            <View className="pl-2">
              <Text className="text-gray-600 mb-1">• 매일 출석 체크: 5코인</Text>
              <Text className="text-gray-600 mb-1">• 연속 7일 물주기: 20코인</Text>
              <Text className="text-gray-600">• 식물 성장 완료: 50코인</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}