// src/app/(settings)/contact.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as MailComposer from 'expo-mail-composer';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

const contactMethods = [
  {
    id: 'email',
    title: '이메일 문의',
    description: '이메일로 상세한 문의를 보내주세요',
    icon: 'mail-outline' as keyof typeof Ionicons.glyphMap,
    color: Colors.light.info,
    action: 'email',
    contact: 'support@growpromise.com',
  },
  {
    id: 'feedback',
    title: '앱 내 피드백',
    description: '앱을 통해 직접 피드백을 보내주세요',
    icon: 'chatbubble-outline' as keyof typeof Ionicons.glyphMap,
    color: Colors.light.primary,
    action: 'feedback',
  },
  {
    id: 'review',
    title: '앱스토어 리뷰',
    description: '앱스토어에서 리뷰를 남겨주세요',
    icon: 'star-outline' as keyof typeof Ionicons.glyphMap,
    color: Colors.light.secondary,
    action: 'review',
  },
];

const commonQuestions = [
  {
    id: '1',
    title: '기능 개선 제안',
    description: '새로운 기능이나 개선사항을 제안해주세요',
  },
  {
    id: '2',
    title: '버그 신고',
    description: '앱 사용 중 발생한 오류를 신고해주세요',
  },
  {
    id: '3',
    title: '계정 문제',
    description: '로그인이나 계정 연결 관련 문제',
  },
  {
    id: '4',
    title: '알림 문제',
    description: '알림이 오지 않거나 관련 문제',
  },
  {
    id: '5',
    title: '기타 문의',
    description: '위에 해당하지 않는 기타 문의사항',
  },
];

export default function ContactScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleContactMethod = async (method: typeof contactMethods[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (method.action) {
      case 'email':
        await handleEmailContact();
        break;
      case 'feedback':
        // 피드백 섹션으로 스크롤
        break;
      case 'review':
        await handleReviewRedirect();
        break;
    }
  };

  const handleEmailContact = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        const result = await MailComposer.composeAsync({
          recipients: ['support@growpromise.com'],
          subject: '쑥쑥약속 문의',
          body: `
안녕하세요. 쑥쑥약속 관련 문의드립니다.

[문의 내용]


[사용자 정보]
- 사용자 ID: ${user?.id || '비로그인'}
- 사용자 유형: ${user?.userType || '알 수 없음'}
- 앱 버전: 1.0.0
- 기기: ${Platform.OS} ${Platform.Version}

감사합니다.
          `,
        });
        
        if (result.status === 'sent') {
          Alert.alert('전송 완료', '문의사항이 성공적으로 전송되었습니다.');
        }
      } else {
        // 메일 앱이 없는 경우 외부 링크로 이동
        const emailUrl = `mailto:support@growpromise.com?subject=쑥쑥약속 문의&body=안녕하세요. 쑥쑥약속 관련 문의드립니다.`;
        const canOpen = await Linking.canOpenURL(emailUrl);
        
        if (canOpen) {
          await Linking.openURL(emailUrl);
        } else {
          Alert.alert('이메일 앱 필요', '이메일 앱이 설치되어 있지 않습니다.');
        }
      }
    } catch (error) {
      console.error('이메일 전송 오류:', error);
      Alert.alert('오류', '이메일 전송 중 오류가 발생했습니다.');
    }
  };

  const handleReviewRedirect = async () => {
    try {
      const storeUrl = Platform.OS === 'ios' 
        ? 'itms-apps://itunes.apple.com/app/id[APP_ID]' // 실제 App Store ID로 변경 필요
        : 'market://details?id=com.low_k.growpromise';
      
      const canOpen = await Linking.canOpenURL(storeUrl);
      
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        // 스토어 앱이 없는 경우 웹 버전으로 이동
        const webUrl = Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/id[APP_ID]'
          : 'https://play.google.com/store/apps/details?id=com.low_k.growpromise';
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('스토어 이동 오류:', error);
      Alert.alert('오류', '앱스토어로 이동할 수 없습니다.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedQuestion) {
      Alert.alert('문의 유형 선택', '문의 유형을 선택해주세요.');
      return;
    }

    if (!feedbackText.trim()) {
      Alert.alert('문의 내용 입력', '문의 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: API 호출로 피드백 전송
      // await api.feedback.submit({
      //   type: selectedQuestion,
      //   content: feedbackText,
      //   userId: user?.id,
      //   userType: user?.userType,
      //   deviceInfo: {
      //     platform: Platform.OS,
      //     version: Platform.Version,
      //   }
      // });

      // 임시로 이메일로 전송
      const selectedQuestionTitle = commonQuestions.find(q => q.id === selectedQuestion)?.title || '기타 문의';
      
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['support@growpromise.com'],
          subject: `쑥쑥약속 ${selectedQuestionTitle}`,
          body: `
[문의 유형] ${selectedQuestionTitle}

[문의 내용]
${feedbackText}

[사용자 정보]
- 사용자 ID: ${user?.id || '비로그인'}
- 사용자 유형: ${user?.userType || '알 수 없음'}
- 앱 버전: 1.0.0
- 기기: ${Platform.OS} ${Platform.Version}
- 전송 시간: ${new Date().toLocaleString()}
          `,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '전송 완료', 
        '피드백이 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setSelectedQuestion('');
              setFeedbackText('');
            }
          }
        ]
      );

    } catch (error) {
      console.error('피드백 전송 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('전송 실패', '피드백 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
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
          문의하기
        </Text>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 안내 메시지 */}
          <View 
            className="mx-4 mt-4 p-4 rounded-xl"
            style={{ backgroundColor: `${Colors.light.primary}10` }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name="chatbubble-ellipses" 
                size={20} 
                color={Colors.light.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-base font-bold"
                style={{ color: Colors.light.primary }}
              >
                언제든 연락주세요!
              </Text>
            </View>
            <Text
              className="text-sm leading-5"
              style={{ color: Colors.light.text }}
            >
              쑥쑥약속을 더 좋은 앱으로 만들기 위해 여러분의 소중한 의견을 기다리고 있습니다. 
              불편한 점이나 개선사항이 있으시면 언제든 말씀해주세요.
            </Text>
          </View>

          {/* 문의 방법 선택 */}
          <View className="mt-6 mx-4">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              문의 방법 선택
            </Text>

            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {contactMethods.map((method, index) => (
                <React.Fragment key={method.id}>
                  <Pressable
                    onPress={() => handleContactMethod(method)}
                    className="flex-row items-center p-4 active:bg-gray-50"
                  >
                    <View
                      className="p-3 rounded-full mr-4"
                      style={{ backgroundColor: `${method.color}15` }}
                    >
                      <Ionicons
                        name={method.icon}
                        size={20}
                        color={method.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base font-medium"
                        style={{ color: Colors.light.text }}
                      >
                        {method.title}
                      </Text>
                      <Text
                        className="text-sm mt-1"
                        style={{ color: Colors.light.textSecondary }}
                      >
                        {method.description}
                      </Text>
                      {method.contact && (
                        <Text
                          className="text-xs mt-1"
                          style={{ color: method.color }}
                        >
                          {method.contact}
                        </Text>
                      )}
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                  {index < contactMethods.length - 1 && (
                    <View className="h-px bg-gray-100 mx-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* 앱 내 피드백 폼 */}
          <View className="mt-6 mx-4">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              앱 내 피드백 보내기
            </Text>

            {/* 문의 유형 선택 */}
            <View className="mb-4">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Colors.light.text }}
              >
                문의 유형
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {commonQuestions.map((question, index) => (
                  <React.Fragment key={question.id}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedQuestion(question.id);
                      }}
                      className="flex-row items-center p-3 active:bg-gray-50"
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                          selectedQuestion === question.id 
                            ? 'border-primary' 
                            : 'border-gray-300'
                        }`}
                        style={{
                          borderColor: selectedQuestion === question.id 
                            ? Colors.light.primary 
                            : '#D1D5DB'
                        }}
                      >
                        {selectedQuestion === question.id && (
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: Colors.light.primary }}
                          />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-sm font-medium"
                          style={{ color: Colors.light.text }}
                        >
                          {question.title}
                        </Text>
                        <Text
                          className="text-xs mt-0.5"
                          style={{ color: Colors.light.textSecondary }}
                        >
                          {question.description}
                        </Text>
                      </View>
                    </Pressable>
                    {index < commonQuestions.length - 1 && (
                      <View className="h-px bg-gray-100 mx-4" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* 문의 내용 입력 */}
            <View className="mb-4">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Colors.light.text }}
              >
                문의 내용
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <TextInput
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder="문의하실 내용을 자세히 적어주세요..."
                  placeholderTextColor={Colors.light.textSecondary}
                  multiline
                  numberOfLines={6}
                  className="text-sm leading-5"
                  style={{ 
                    color: Colors.light.text,
                    textAlignVertical: 'top',
                    minHeight: 120,
                  }}
                />
              </View>
              <Text
                className="text-xs mt-1 text-right"
                style={{ color: Colors.light.textSecondary }}
              >
                {feedbackText.length}/1000
              </Text>
            </View>

            {/* 전송 버튼 */}
            <Pressable
              onPress={handleFeedbackSubmit}
              disabled={isSubmitting}
              className={`py-3 rounded-xl ${
                isSubmitting ? 'opacity-50' : 'active:opacity-90'
              }`}
              style={{ backgroundColor: Colors.light.primary }}
            >
              <Text className="text-white text-center font-medium">
                {isSubmitting ? '전송 중...' : '피드백 보내기'}
              </Text>
            </Pressable>
          </View>

          {/* 응답 시간 안내 */}
          <View 
            className="mx-4 mt-6 mb-8 p-4 rounded-xl"
            style={{ backgroundColor: '#F8F9FA' }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name="time-outline" 
                size={16} 
                color={Colors.light.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.light.text }}
              >
                응답 시간 안내
              </Text>
            </View>
            <Text
              className="text-xs leading-4"
              style={{ color: Colors.light.textSecondary }}
            >
              • 이메일 문의: 영업일 기준 1-2일 내 답변
              {'\n'}• 앱 내 피드백: 영업일 기준 3-5일 내 답변
              {'\n'}• 긴급한 문의는 이메일로 연락주세요
              {'\n'}• 운영시간: 평일 09:00 - 18:00 (주말, 공휴일 제외)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}