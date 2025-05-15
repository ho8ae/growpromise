import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';

interface HelpItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const helpItems: HelpItem[] = [
  {
    id: 'promises',
    icon: 'handshake',
    title: '약속 관리하기',
    description: '약속을 만들고, 인증하고, 완료하는 방법을 알아보세요.'
  },
  {
    id: 'plants',
    icon: 'seedling',
    title: '식물 키우기',
    description: '식물에 물주기, 성장 단계, 식물 도감에 대해 알아보세요.'
  },
  {
    id: 'rewards',
    icon: 'award',
    title: '보상 시스템',
    description: '칭찬 스티커와 보상 설정 방법을 알아보세요.'
  },
  {
    id: 'connection',
    icon: 'link',
    title: '계정 연결하기',
    description: '부모와 자녀 계정을 연결하는 방법을 알아보세요.'
  },
  {
    id: 'faq',
    icon: 'question-circle',
    title: '자주 묻는 질문',
    description: '쑥쑥약속 사용 중 자주 묻는 질문과 답변을 확인하세요.'
  },
  {
    id: 'contact',
    icon: 'headset',
    title: '고객센터',
    description: '도움이 필요하시면 언제든지 문의해주세요.'
  }
];

export default function HelpScreen() {
  const handleHelpItemPress = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // 추후 각 도움말 상세 페이지로 이동하는 로직 구현
    console.log(`Help item pressed: ${itemId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-4 pt-8 pb-20">
          <View className="flex-row items-center mb-6">
            <FontAwesome5 name="question-circle" size={24} color={Colors.light.primary} />
            <Text className="text-2xl font-bold ml-2 text-gray-800">도움말</Text>
          </View>
          
          <Text className="text-gray-600 mb-6">
            쑥쑥약속 앱 사용에 도움이 필요하신가요? 아래 항목에서 필요한 정보를 찾아보세요.
          </Text>
          
          {helpItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
              onPress={() => handleHelpItemPress(item.id)}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="bg-green-50 p-3 rounded-full mr-3">
                  <FontAwesome5 name={item.icon} size={20} color={Colors.light.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
                  <Text className="text-gray-600 mt-1">{item.description}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          ))}
          
          <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <View className="flex-row items-center mb-2">
              <FontAwesome5 name="info-circle" size={18} color={Colors.light.info} />
              <Text className="text-lg font-semibold ml-2 text-gray-800">도움말 팁</Text>
            </View>
            <Text className="text-gray-600">
              도움말에서 찾으시는 정보가 없으신가요? 홈 화면의 TIP 카드에서도 유용한 정보를 확인하실 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}