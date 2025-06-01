// src/app/(settings)/help.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: '기본사용법' | '계정관리' | '약속관리' | '알림설정' | '문제해결';
  icon: keyof typeof Ionicons.glyphMap;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: '기본사용법',
    icon: 'help-circle-outline',
    question: '쑥쑥약속은 어떤 앱인가요?',
    answer: '쑥쑥약속은 부모와 아이가 함께 약속을 만들고 지키며 성장하는 앱입니다. 아이가 약속을 지키면 스티커를 모으고 식물을 키우며 성취감을 느낄 수 있어요.'
  },
  {
    id: '2',
    category: '계정관리',
    icon: 'person-outline',
    question: '부모와 자녀 계정을 어떻게 연결하나요?',
    answer: '부모 계정에서 "자녀 계정 연결" 메뉴로 들어가 연결 코드를 생성하고, 자녀가 해당 코드를 입력하면 계정이 연결됩니다. QR 코드 스캔으로도 간편하게 연결할 수 있어요.'
  },
  {
    id: '3',
    category: '약속관리',
    icon: 'calendar-outline',
    question: '약속은 어떻게 만드나요?',
    answer: '부모 계정에서 "약속 만들기"를 선택하고, 약속 내용, 완료 조건, 보상 스티커 등을 설정할 수 있습니다. 매일, 매주 반복되는 약속도 설정 가능해요.'
  },
  {
    id: '4',
    category: '약속관리',
    icon: 'camera-outline',
    question: '약속 인증은 어떻게 하나요?',
    answer: '아이가 약속을 지킨 후 "약속 인증" 버튼을 누르고 사진을 찍어 업로드합니다. 부모가 확인 후 승인하면 스티커를 받을 수 있어요.'
  },
  {
    id: '5',
    category: '알림설정',
    icon: 'notifications-outline',
    question: '알림이 오지 않아요',
    answer: '설정 > 알림에서 알림 권한이 허용되어 있는지 확인해주세요. 기기 설정에서도 쑥쑥약속 알림이 허용되어 있어야 합니다.'
  },
  {
    id: '6',
    category: '문제해결',
    icon: 'refresh-outline',
    question: '앱이 느려지거나 오류가 발생해요',
    answer: '앱을 완전히 종료한 후 다시 실행해보세요. 문제가 계속되면 앱을 재설치하거나 고객센터로 문의해주세요.'
  },
  {
    id: '7',
    category: '약속관리',
    icon: 'trophy-outline',
    question: '스티커와 보상은 어떻게 사용하나요?',
    answer: '모은 스티커로 식물을 키우거나 새로운 테마를 구매할 수 있습니다. 부모가 설정한 목표 달성 시에는 특별한 보상을 받을 수 있어요.'
  },
  {
    id: '8',
    category: '계정관리',
    icon: 'key-outline',
    question: '비밀번호를 잊어버렸어요',
    answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하고 가입 시 등록한 이메일 주소를 입력하세요. 비밀번호 재설정 링크가 전송됩니다.'
  },
  {
    id: '9',
    category: '문제해결',
    icon: 'cloud-offline-outline',
    question: '인터넷 연결이 불안정할 때는 어떻게 하나요?',
    answer: 'Wi-Fi나 모바일 데이터 연결을 확인해주세요. 일시적으로 오프라인 상태에서도 기본적인 기능은 사용 가능하며, 연결되면 자동으로 동기화됩니다.'
  },
  {
    id: '10',
    category: '기본사용법',
    icon: 'leaf-outline',
    question: '식물 키우기는 어떻게 하나요?',
    answer: '약속을 지키고 인증하면 경험치를 얻어 식물이 성장합니다. 다양한 상호작용으로도 경험치를 얻을 수 있으며, 레벨이 올라가면 식물의 모습이 변화해요.'
  }
];

const categories = ['전체', '기본사용법', '계정관리', '약속관리', '알림설정', '문제해결'] as const;

export default function HelpScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQ = selectedCategory === '전체' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '기본사용법': return 'book-outline';
      case '계정관리': return 'person-outline';
      case '약속관리': return 'calendar-outline';
      case '알림설정': return 'notifications-outline';
      case '문제해결': return 'build-outline';
      default: return 'apps-outline';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 p-2 rounded-full"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </Pressable>
        <Text
          className="text-lg font-bold flex-1"
          style={{ color: Colors.light.text }}
        >
          도움말
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 안내 메시지 */}
        <View 
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{ backgroundColor: `${Colors.light.primary}10` }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name="information-circle" 
              size={20} 
              color={Colors.light.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              className="text-base font-bold"
              style={{ color: Colors.light.primary }}
            >
              자주 묻는 질문
            </Text>
          </View>
          <Text
            className="text-sm leading-5"
            style={{ color: Colors.light.text }}
          >
            쑥쑥약속 사용 중 궁금한 점이 있으시면 아래 자주 묻는 질문을 확인해보세요. 
            원하는 답변을 찾지 못하셨다면 문의하기를 이용해주세요.
          </Text>
        </View>

        {/* 카테고리 필터 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-3 px-4 py-2 rounded-full ${
                selectedCategory === category 
                  ? 'bg-primary' 
                  : 'bg-gray-100'
              }`}
              style={{
                backgroundColor: selectedCategory === category 
                  ? Colors.light.primary 
                  : '#F5F5F5'
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={getCategoryIcon(category) as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={selectedCategory === category ? 'white' : Colors.light.textSecondary}
                  style={{ marginRight: category === '전체' ? 0 : 4 }}
                />
                {category !== '전체' && (
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category ? 'text-white' : 'text-gray-600'
                    }`}
                    style={{
                      color: selectedCategory === category 
                        ? 'white' 
                        : Colors.light.textSecondary
                    }}
                  >
                    {category}
                  </Text>
                )}
                {category === '전체' && (
                  <Text
                    className={`text-sm font-medium ml-1 ${
                      selectedCategory === category ? 'text-white' : 'text-gray-600'
                    }`}
                    style={{
                      color: selectedCategory === category 
                        ? 'white' 
                        : Colors.light.textSecondary
                    }}
                  >
                    전체
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* FAQ 목록 */}
        <View className="mt-4 mx-4 mb-6">
          {filteredFAQ.map((item, index) => (
            <View
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                index < filteredFAQ.length - 1 ? 'mb-3' : ''
              }`}
            >
              <Pressable
                onPress={() => toggleExpand(item.id)}
                className="p-4 active:bg-gray-50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="p-2 rounded-full mr-3"
                      style={{ backgroundColor: `${Colors.light.primary}15` }}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={Colors.light.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-medium leading-5"
                        style={{ color: Colors.light.text }}
                      >
                        {item.question}
                      </Text>
                      <Text
                        className="text-xs mt-1"
                        style={{ color: Colors.light.textSecondary }}
                      >
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: expandedItems.has(item.id) ? '180deg' : '0deg'
                      }]
                    }}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={24}
                      color={Colors.light.textSecondary}
                    />
                  </Animated.View>
                </View>
              </Pressable>

              {expandedItems.has(item.id) && (
                <View className="px-4 pb-4">
                  <View className="h-px bg-gray-100 mb-3" />
                  <Text
                    className="text-sm leading-6"
                    style={{ color: Colors.light.text }}
                  >
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 추가 도움 섹션 */}
        <View className="mx-4 mb-8">
          <Text
            className="text-base font-bold mb-3"
            style={{ color: Colors.light.text }}
          >
            추가 도움이 필요하세요?
          </Text>

          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Pressable
              onPress={() => router.push('/(settings)/contact')}
              className="flex-row items-center p-4 active:bg-gray-50"
            >
              <View
                className="p-3 rounded-full mr-4"
                style={{ backgroundColor: `${Colors.light.info}15` }}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.light.info}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium"
                  style={{ color: Colors.light.text }}
                >
                  문의하기
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: Colors.light.textSecondary }}
                >
                  직접 문의사항을 보내주세요
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.light.textSecondary}
              />
            </Pressable>

            <View className="h-px bg-gray-100 mx-4" />

            <Pressable
              onPress={() => router.push('/(settings)/app-info')}
              className="flex-row items-center p-4 active:bg-gray-50"
            >
              <View
                className="p-3 rounded-full mr-4"
                style={{ backgroundColor: `${Colors.light.accent}15` }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={Colors.light.accent}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium"
                  style={{ color: Colors.light.text }}
                >
                  앱 정보
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: Colors.light.textSecondary }}
                >
                  버전 정보 및 라이센스 확인
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.light.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}