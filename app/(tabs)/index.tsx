// app/(tabs)/index.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  FadeInDown
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// 캐릭터 성장 단계
const characterStages = [
  {
    id: 1,
    name: '아기 나무',
    image: require('../../assets/images/react-logo.png'), // 예시 이미지
    requiredXP: 0,
  },
  {
    id: 2,
    name: '어린 나무',
    image: require('../../assets/images/react-logo.png'), // 예시 이미지
    requiredXP: 100,
  },
  {
    id: 3,
    name: '청년 나무',
    image: require('../../assets/images/react-logo.png'), // 예시 이미지
    requiredXP: 300,
  },
  {
    id: 4,
    name: '큰 나무',
    image: require('../../assets/images/react-logo.png'), // 예시 이미지
    requiredXP: 600,
  },
];

// 가족 활동 데이터
const familyActivities = [
  {
    id: '1',
    title: '오늘의 책 읽기 완료',
    time: '10분 전',
    user: '민준',
    xp: 10,
    icon: 'book',
  },
  {
    id: '2',
    title: '새 약속 추가: 방 정리하기',
    time: '30분 전',
    user: '엄마',
    xp: 5,
    icon: 'home',
  },
  {
    id: '3',
    title: '숙제하기 인증 승인',
    time: '1시간 전',
    user: '엄마',
    xp: 15,
    icon: 'checkmark-circle',
  },
];

export default function TabsHomeScreen() {
  // 현재 경험치 및 단계
  const currentXP = 250;
  const currentStage = characterStages.findIndex(stage => currentXP < stage.requiredXP) - 1;
  const character = characterStages[currentStage >= 0 ? currentStage : 0];
  
  // 다음 단계까지 남은 XP
  const nextStage = characterStages[currentStage + 1];
  const xpToNextStage = nextStage ? nextStage.requiredXP - currentXP : 0;
  const progress = nextStage ? (currentXP - character.requiredXP) / (nextStage.requiredXP - character.requiredXP) : 1;
  
  // 애니메이션 값
  const scaleCharacter = useSharedValue(1);
  const rotateCharacter = useSharedValue(0);
  
  // 캐릭터 애니메이션 스타일
  const characterAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleCharacter.value },
        { rotate: `${rotateCharacter.value}deg` },
      ],
    };
  });
  
  // 컴포넌트 마운트 시 애니메이션 시작
  useEffect(() => {
    // 호흡 애니메이션
    scaleCharacter.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1, // 무한 반복
      true // 왕복
    );
    
    // 살짝 흔들리는 애니메이션
    rotateCharacter.value = withRepeat(
      withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // 무한 반복
      true // 왕복
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>우리 가족 나무</Text>
          <Text style={styles.subtitle}>{character.name} 단계</Text>
        </View>
        
        {/* 캐릭터 섹션 */}
        <View style={styles.characterSection}>
          <View style={styles.environmentTop} />
          
          <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
            <Image
              source={require('../../assets/images/react-logo.png')} // 실제 캐릭터 이미지로 변경 필요
              style={styles.characterImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          <View style={styles.environmentBottom} />
        </View>
        
        {/* 진행 상황 */}
        <View style={styles.progressSection}>
          <View style={styles.xpInfo}>
            <Text style={styles.xpText}>경험치: {currentXP} XP</Text>
            {nextStage && (
              <Text style={styles.nextLevelText}>다음 단계까지 {xpToNextStage} XP 남음</Text>
            )}
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        
        {/* 가족 활동 로그 */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>가족 활동</Text>
          
          {familyActivities.map((activity, index) => (
            <Animated.View
              key={activity.id}
              entering={FadeInDown.delay(300 + index * 100).duration(500)}
              style={styles.activityItem}
            >
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon as any} size={24} color="#70CAF8" />
              </View>
              
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityMeta}>{activity.user} • {activity.time}</Text>
              </View>
              
              <View style={styles.activityXP}>
                <Text style={styles.activityXPText}>+{activity.xp}</Text>
                <Ionicons name="leaf" size={14} color="#A8E6CF" />
              </View>
            </Animated.View>
          ))}
        </View>
        
        {/* 가족 정보 */}
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>가족 구성원</Text>
          
          <View style={styles.familyMembers}>
            <View style={styles.familyMember}>
              <View style={[styles.memberAvatar, { backgroundColor: '#FFAEC0' }]}>
                <Ionicons name="person" size={24} color="white" />
              </View>
              <Text style={styles.memberName}>엄마</Text>
              <Text style={styles.memberContribution}>기여도: 40%</Text>
            </View>
            
            <View style={styles.familyMember}>
              <View style={[styles.memberAvatar, { backgroundColor: '#70CAF8' }]}>
                <Ionicons name="happy" size={24} color="white" />
              </View>
              <Text style={styles.memberName}>민준</Text>
              <Text style={styles.memberContribution}>기여도: 60%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D5366',
  },
  subtitle: {
    fontSize: 16,
    color: '#7E8CA3',
    marginTop: 4,
  },
  characterSection: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  environmentTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#F5F8FF',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  characterContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  characterImage: {
    width: 180,
    height: 180,
  },
  environmentBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#A8E6CF',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D5366',
  },
  nextLevelText: {
    fontSize: 14,
    color: '#7E8CA3',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F5F8FF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A8E6CF',
    borderRadius: 5,
  },
  activitySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D5366',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3D5366',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: '#7E8CA3',
  },
  activityXP: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 230, 207, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activityXPText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3D5366',
    marginRight: 4,
  },
  familySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  familyMembers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  familyMember: {
    alignItems: 'center',
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFAEC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D5366',
    marginBottom: 4,
  },
  memberContribution: {
    fontSize: 12,
    color: '#7E8CA3',
  },
});