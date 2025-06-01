// src/components/common/PrivacyPolicyModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import Colors from '../../constants/Colors';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <Text
            className="text-lg font-bold"
            style={{ color: Colors.light.text }}
          >
            개인정보처리방침
          </Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full"
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <Ionicons name="close" size={20} color={Colors.light.text} />
          </Pressable>
        </View>

        {/* 내용 */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <Text
              className="text-sm mb-4"
              style={{ color: Colors.light.textSecondary }}
            >
              최종 수정일: 2025년 6월 1일
            </Text>

            {/* 1. 개인정보의 처리 목적 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                1. 개인정보의 처리 목적
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                쑥쑥약속(growpromise)은 다음의 목적을 위하여 개인정보를 처리합니다:
              </Text>
              <View className="ml-4">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 회원 가입 및 관리
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 부모-자녀 계정 연결 서비스 제공
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 약속 관리 및 인증 서비스 제공
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 서비스 개선 및 맞춤형 서비스 제공
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 고객 지원 및 문의 처리
                </Text>
              </View>
            </View>

            {/* 2. 수집하는 개인정보 항목 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                2. 수집하는 개인정보 항목
              </Text>
              
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Colors.light.text }}
              >
                필수 정보:
              </Text>
              <View className="ml-4 mb-3">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 이메일 주소 (로그인 ID)
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 비밀번호 (암호화 저장)
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 사용자명 (닉네임)
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 사용자 유형 (부모/자녀)
                </Text>
              </View>

              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Colors.light.text }}
              >
                선택 정보:
              </Text>
              <View className="ml-4 mb-3">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 프로필 사진
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 약속 인증 사진
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 알림 설정 정보
                </Text>
              </View>

              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Colors.light.text }}
              >
                자동 수집 정보:
              </Text>
              <View className="ml-4">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 기기 정보 (OS, 앱 버전)
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 서비스 이용 기록
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 접속 일시 및 IP 주소
                </Text>
              </View>
            </View>

            {/* 3. 개인정보의 처리 및 보유 기간 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                3. 개인정보의 처리 및 보유 기간
              </Text>
              <View className="ml-4">
                <Text className="text-sm leading-6 mb-2" style={{ color: Colors.light.text }}>
                  • 회원 정보: 회원 탈퇴 시까지
                </Text>
                <Text className="text-sm leading-6 mb-2" style={{ color: Colors.light.text }}>
                  • 약속 및 인증 기록: 회원 탈퇴 후 1년간 보관 (서비스 분쟁 해결)
                </Text>
                <Text className="text-sm leading-6 mb-2" style={{ color: Colors.light.text }}>
                  • 접속 로그: 3개월간 보관
                </Text>
                <Text className="text-sm leading-6" style={{ color: Colors.light.text }}>
                  • 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관
                </Text>
              </View>
            </View>

            {/* 4. 개인정보의 제3자 제공 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                4. 개인정보의 제3자 제공
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                쑥쑥약속은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                다만, 다음의 경우에는 예외로 합니다:
              </Text>
              <View className="ml-4 mt-2">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 이용자가 사전에 동의한 경우
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
                </Text>
              </View>
            </View>

            {/* 5. 개인정보의 안전성 확보 조치 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                5. 개인정보의 안전성 확보 조치
              </Text>
              <View className="ml-4">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 비밀번호 암호화 저장
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 개인정보 접근 권한 제한
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 보안 프로그램 설치 및 운영
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 개인정보 취급자에 대한 교육
                </Text>
              </View>
            </View>

            {/* 6. 이용자의 권리와 행사 방법 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                6. 이용자의 권리와 행사 방법
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                이용자는 언제든지 다음의 권리를 행사할 수 있습니다:
              </Text>
              <View className="ml-4">
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 개인정보 처리 현황에 대한 열람 요구
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 개인정보의 정정·삭제 요구
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 개인정보 처리 정지 요구
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  • 회원 탈퇴
                </Text>
              </View>
            </View>

            {/* 7. 개인정보 보호책임자 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                7. 개인정보 보호책임자
              </Text>
              <View 
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#F8F9FA' }}
              >
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  <Text className="font-medium">담당자:</Text> 개인정보보호팀
                </Text>
                <Text className="text-sm leading-6 mb-1" style={{ color: Colors.light.text }}>
                  <Text className="font-medium">연락처:</Text> whoiswhat.team@gmail.com
                </Text>
                <Text className="text-sm leading-6" style={{ color: Colors.light.text }}>
                  <Text className="font-medium">처리시간:</Text> 영업일 기준 3일 이내
                </Text>
              </View>
            </View>

            {/* 8. 고지의 의무 */}
            <View className="mb-8">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                8. 고지의 의무
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                현 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 
                개정 최소 7일 전부터 앱 내 공지사항을 통하여 고지할 것입니다.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View className="p-4 border-t border-gray-100">
          <Pressable
            onPress={onClose}
            className="py-3 rounded-lg"
            style={{ backgroundColor: Colors.light.primary }}
          >
            <Text className="text-white text-center font-medium">
              확인
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}