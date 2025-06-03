// src/components/common/TermsOfServiceModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Colors from '../../../constants/Colors';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({
  visible,
  onClose,
}: TermsOfServiceModalProps) {
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
            서비스 이용약관
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

            {/* 제1조 목적 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                제1조 (목적)
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                이 약관은 쑥쑥약속(growpromise) 서비스(이하
                &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리,
                의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </Text>
            </View>

            {/* 제2조 정의 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                제2조 (정의)
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
              </Text>
              <View className="ml-4">
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  1. &quot;서비스&quot;란 쑥쑥약속 모바일 애플리케이션을 통해
                  제공되는 부모-자녀 약속 관리 서비스를 의미합니다.
                </Text>
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  2. &quot;이용자&quot;란 이 약관에 따라 회사가 제공하는
                  서비스를 받는 부모 및 자녀 회원을 말합니다.
                </Text>
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  3. &quot;약속&quot;이란 부모와 자녀 간에 설정한 이행 목표를
                  의미합니다.
                </Text>
                <Text
                  className="text-sm leading-6"
                  style={{ color: Colors.light.text }}
                >
                  4. &quot;스티커&quot;란 약속 이행 시 제공되는 디지털 보상을
                  의미합니다.
                </Text>
              </View>
            </View>

            {/* 제3조 약관의 명시와 설명 및 개정 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                제3조 (약관의 명시와 설명 및 개정)
              </Text>
              <View className="ml-4">
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  1. 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스
                  초기 화면에 게시하거나 기타의 방법으로 이용자에게 공지합니다.
                </Text>
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  2. 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할
                  수 있습니다.
                </Text>
                <Text
                  className="text-sm leading-6"
                  style={{ color: Colors.light.text }}
                >
                  3. 약관이 개정되는 경우 회사는 개정일자 및 개정사유를 명시하여
                  개정약관의 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
                </Text>
              </View>
            </View>

            {/* 제4조 서비스의 제공 및 변경 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                제4조 (서비스의 제공 및 변경)
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                회사가 제공하는 서비스는 다음과 같습니다:
              </Text>
              <View className="ml-4">
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 부모-자녀 계정 연결 서비스
                </Text>
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 약속 설정 및 관리 서비스
                </Text>
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 약속 인증 및 승인 서비스
                </Text>
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 디지털 스티커 보상 시스템
                </Text>
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 식물 키우기 게임 서비스
                </Text>
                <Text
                  className="text-sm leading-6"
                  style={{ color: Colors.light.text }}
                >
                  • 기타 회사가 정하는 서비스
                </Text>
              </View>
            </View>

            {/* 제5조 서비스 이용계약의 성립 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                제5조 (서비스 이용계약의 성립)
              </Text>
              <View className="ml-4">
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  1. 서비스 이용계약은 이용자가 이 약관에 동의하고 회원가입
                  신청을 한 후, 회사가 이를 승낙함으로써 성립됩니다.
                </Text>
                <Text
                  className="text-sm leading-6 mb-2"
                  style={{ color: Colors.light.text }}
                >
                  2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지
                  않을 수 있습니다:
                </Text>
                <View className="ml-4">
                  <Text
                    className="text-sm leading-6 mb-1"
                    style={{ color: Colors.light.text }}
                  >
                    • 실명이 아니거나 타인의 명의를 이용한 경우
                  </Text>
                  <Text
                    className="text-sm leading-6 mb-1"
                    style={{ color: Colors.light.text }}
                  >
                    • 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지
                    않은 경우
                  </Text>
                  <Text
                    className="text-sm leading-6"
                    style={{ color: Colors.light.text }}
                  >
                    • 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이
                    있다고 판단되는 경우
                  </Text>
                </View>
              </View>
            </View>

            {/* 제6조 회원정보의 변경 */}
            <View className="mb-6">
              <Text
                className="text-base font-bold mb-3"
                style={{ color: Colors.light.text }}
              >
                제6조 (회원정보의 변경)
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를
                열람하고 수정할 수 있습니다. 다만, 서비스 관리를 위해 필요한
                실명, 아이디 등은 수정이 불가능합니다.
              </Text>
            </View>
          </View>

          {/* 제7조 이용자의 의무 */}
          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              제7조 (이용자의 의무)
            </Text>
            <Text
              className="text-sm leading-6 mb-2"
              style={{ color: Colors.light.text }}
            >
              이용자는 다음 행위를 하여서는 안 됩니다:
            </Text>
            <View className="ml-4">
              <Text
                className="text-sm leading-6 mb-1"
                style={{ color: Colors.light.text }}
              >
                • 신청 또는 변경 시 허위 내용의 등록
              </Text>
              <Text
                className="text-sm leading-6 mb-1"
                style={{ color: Colors.light.text }}
              >
                • 타인의 정보 도용
              </Text>
              <Text
                className="text-sm leading-6 mb-1"
                style={{ color: Colors.light.text }}
              >
                • 회사가 게시한 정보의 변경
              </Text>
              <Text
                className="text-sm leading-6 mb-1"
                style={{ color: Colors.light.text }}
              >
                • 회사가 금지한 정보(컴퓨터 프로그램 등)의 송신 또는 게시
              </Text>
              <Text
                className="text-sm leading-6 mb-1"
                style={{ color: Colors.light.text }}
              >
                • 회사의 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이
                복제하거나 유통시키는 행위
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                • 기타 불법적이거나 부당한 행위
              </Text>
            </View>
          </View>

          {/* 제8조 저작권의 귀속 및 이용제한 */}
          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              제8조 (저작권의 귀속 및 이용제한)
            </Text>
            <View className="ml-4">
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에
                귀속합니다.
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게
                지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신,
                출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나
                제3자에게 이용하게 하여서는 안됩니다.
              </Text>
            </View>
          </View>

          {/* 제9조 계약해지 및 이용제한 */}
          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              제9조 (계약해지 및 이용제한)
            </Text>
            <View className="ml-4">
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                1. 회원은 언제든지 서비스 내 탈퇴 신청을 통해 이용계약 해지를
                요청할 수 있으며, 회사는 관련 법령 등이 정하는 바에 따라 이를
                즉시 처리하여야 합니다.
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                2. 회원이 계약을 해지할 경우, 관련 법령 및 개인정보처리방침에
                따라 회사가 회원정보를 보유하는 경우를 제외하고는 해지 즉시
                회원정보가 삭제됩니다.
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                3. 회사는 회원이 다음 각호의 사유에 해당하는 경우, 사전통지 없이
                이용계약을 해지하거나 기간을 정하여 서비스 이용을 정지할 수
                있습니다:
              </Text>
              <View className="ml-4 mt-1">
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 제7조(이용자의 의무)를 위반한 경우
                </Text>
                <Text
                  className="text-sm leading-6 mb-1"
                  style={{ color: Colors.light.text }}
                >
                  • 서비스의 정상적인 운영을 방해한 경우
                </Text>
                <Text
                  className="text-sm leading-6"
                  style={{ color: Colors.light.text }}
                >
                  • 기타 이 약관을 위반한 경우
                </Text>
              </View>
            </View>
          </View>

          {/* 제10조 손해배상 및 면책조항 */}
          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              제10조 (손해배상 및 면책조항)
            </Text>
            <View className="ml-4">
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                1. 회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한
                손해가 발생하더라도 회사가 고의 또는 중과실로 인한 손해의 경우를
                제외하고 이에 대하여 책임을 부담하지 아니합니다.
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                2. 회사는 회원이 서비스에 게재한 정보, 자료, 사실의 신뢰도,
                정확성 등의 내용에 관하여는 책임을 지지 않습니다.
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: Colors.light.text }}
              >
                3. 회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로
                하여 거래 등을 한 경우에는 책임을 부담하지 아니합니다.
              </Text>
            </View>
          </View>

          {/* 제11조 분쟁해결 */}
          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              제11조 (분쟁해결)
            </Text>
            <View className="ml-4">
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그
                피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
              </Text>
              <Text
                className="text-sm leading-6 mb-2"
                style={{ color: Colors.light.text }}
              >
                2. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은
                서울중앙지방법원을 관할 법원으로 합니다.
              </Text>
            </View>
          </View>

          {/* 부칙 */}
          <View className="mb-8">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              부칙
            </Text>
            <Text
              className="text-sm leading-6"
              style={{ color: Colors.light.text }}
            >
              이 약관은 2025년 6월 1일부터 적용됩니다.
            </Text>
          </View>

          {/* 문의 정보 */}
          <View
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: '#F8F9FA' }}
          >
            <Text
              className="text-sm font-bold mb-2"
              style={{ color: Colors.light.text }}
            >
              📞 서비스 이용 관련 문의
            </Text>
            <Text
              className="text-sm leading-6 mb-1"
              style={{ color: Colors.light.text }}
            >
              <Text className="font-medium">이메일:</Text>{' '}
              whoiswhat.team@gmail.com
            </Text>
            <Text
              className="text-sm leading-6"
              style={{ color: Colors.light.text }}
            >
              <Text className="font-medium">운영시간:</Text> 평일 09:00 - 18:00
              (주말, 공휴일 제외)
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
