import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; // FontAwesome5 대신 안전한 아이콘 세트 사용
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import promiseApi from '../../api/modules/promise';
import stickerApi from '../../api/modules/sticker';
import userApi from '../../api/modules/user';

// 캐릭터 단계 타입 정의
interface CharacterStage {
  id: string;
  name: string;
  description: string;
  requirements: string;
  image: any;
  icon: string;
  color: string;
  isUnlocked: boolean;
  isCurrent: boolean;
}

// 아이콘 매핑 설정 - FontAwesome5 대신 MaterialIcons/MaterialCommunityIcons 사용
const ICONS = {
  seedling: { name: "grass", type: "material" },
  spa: { name: "eco", type: "material" },
  tree: { name: "nature", type: "material" },
  "apple-alt": { name: "emoji-food-beverage", type: "material" },
  lock: { name: "lock", type: "material" },
  "chart-line": { name: "trending-up", type: "material" }
};

// 아이콘 렌더링 함수
const renderIcon = (name: string, size: number, color: string) => {
  const iconInfo = ICONS[name as keyof typeof ICONS] || { name: "help", type: "material" };
  
  if (iconInfo.type === "material") {
    return <MaterialIcons name={iconInfo.name as any} size={size} color={color} />;
  } else {
    return <MaterialCommunityIcons name={iconInfo.name as any} size={size} color={color} />;
  }
};

export default function CharacterScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const [selectedStage, setSelectedStage] = useState('1');
  const [characterStages, setCharacterStages] = useState<CharacterStage[]>([]);
  const [progress, setProgress] = useState({
    completed: 0,
    nextGoal: 0,
    percentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleCharacter = useRef(new Animated.Value(1)).current;
  
  // 캐릭터 데이터 로드 (API 호출)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (isAuthenticated) {
          await loadCharacterData();
        } else {
          // 비인증 상태일 때 기본 데이터
          setDefaultCharacterData();
        }
        
        // 애니메이션 실행
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start();
        
        // 바운스 애니메이션
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        
        // 주기적인 캐릭터 "팝" 효과
        const interval = setInterval(() => {
          Animated.sequence([
            Animated.timing(scaleCharacter, {
              toValue: 1.1,
              duration: 200,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease),
            }),
            Animated.timing(scaleCharacter, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
              easing: Easing.in(Easing.ease),
            }),
          ]).start();
        }, 5000); // 5초마다 실행
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setError('캐릭터 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated]);
  
  // 기본 캐릭터 데이터 설정
  const setDefaultCharacterData = () => {
    const defaultStages: CharacterStage[] = [
      {
        id: '1',
        name: '아기 꼬마',
        description: '이제 막 성장을 시작했어요.',
        requirements: '5개의 약속을 완료하세요.',
        image: require('../../assets/images/react-logo.png'),
        icon: 'seedling',
        color: '#fbbf24', // amber-400
        isUnlocked: true,
        isCurrent: true,
      },
      {
        id: '2',
        name: '튼튼한 어린이',
        description: '약속을 꾸준히 지키는 멋진 어린이에요.',
        requirements: '20개의 약속을 완료하세요.',
        image: require('../../assets/images/react-logo.png'),
        icon: 'spa',
        color: '#34d399', // emerald-400
        isUnlocked: false,
        isCurrent: false,
      },
      {
        id: '3',
        name: '책임감 있는 꼬맹이',
        description: '매우 책임감 있고 믿음직한 아이로 성장했어요!',
        requirements: '50개의 약속을 완료하세요.',
        image: require('../../assets/images/react-logo.png'),
        icon: 'tree',
        color: '#60a5fa', // blue-400
        isUnlocked: false,
        isCurrent: false,
      },
      {
        id: '4',
        name: '당당한 챔피언',
        description: '모든 약속을 지키는 훌륭한 아이가 되었어요!',
        requirements: '100개의 약속을 완료하세요.',
        image: require('../../assets/images/react-logo.png'),
        icon: 'apple-alt',
        color: '#f472b6', // pink-400
        isUnlocked: false,
        isCurrent: false,
      },
    ];
    
    setCharacterStages(defaultStages);
    setProgress({
      completed: 3,
      nextGoal: 5,
      percentage: 60
    });
  };
  
  // 캐릭터 데이터 로드 (실제 API 호출)
  const loadCharacterData = async () => {
    try {
      // 1. 사용자 프로필 정보 가져오기
      const userProfile = await userApi.getUserProfile();
      
      // 2. 캐릭터 단계 (characterStage) 가져오기
      const characterStage = userProfile.childProfile?.characterStage || 1; // 기본값 1
      
      // 3. 약속 통계 가져오기
      const promiseStats = await promiseApi.getChildPromiseStats();
      
      // 4. 스티커 통계 가져오기
      const stickerStats = await stickerApi.getChildStickerStats();
      
      // 캐릭터 단계 정보 설정
      const stages: CharacterStage[] = [
        {
          id: '1',
          name: '아기 꼬마',
          description: '이제 막 성장을 시작했어요.',
          requirements: '5개의 약속을 완료하세요.',
          image: require('../../assets/images/react-logo.png'),
          icon: 'seedling',
          color: '#fbbf24', // amber-400
          isUnlocked: characterStage >= 1,
          isCurrent: characterStage === 1,
        },
        {
          id: '2',
          name: '튼튼한 어린이',
          description: '약속을 꾸준히 지키는 멋진 어린이에요.',
          requirements: '20개의 약속을 완료하세요.',
          image: require('../../assets/images/react-logo.png'),
          icon: 'spa',
          color: '#34d399', // emerald-400
          isUnlocked: characterStage >= 2,
          isCurrent: characterStage === 2,
        },
        {
          id: '3',
          name: '책임감 있는 꼬맹이',
          description: '매우 책임감 있고 믿음직한 아이로 성장했어요!',
          requirements: '50개의 약속을 완료하세요.',
          image: require('../../assets/images/react-logo.png'),
          icon: 'tree',
          color: '#60a5fa', // blue-400
          isUnlocked: characterStage >= 3,
          isCurrent: characterStage === 3,
        },
        {
          id: '4',
          name: '당당한 챔피언',
          description: '모든 약속을 지키는 훌륭한 아이가 되었어요!',
          requirements: '100개의 약속을 완료하세요.',
          image: require('../../assets/images/react-logo.png'),
          icon: 'apple-alt',
          color: '#f472b6', // pink-400
          isUnlocked: characterStage >= 4,
          isCurrent: characterStage === 4,
        },
      ];
      
      // 다음 단계의 목표 설정
      const nextGoals = [5, 20, 50, 100];
      const completedPromises = promiseStats.completedPromises;
      let nextGoal = nextGoals[0]; // 기본값 5
      
      if (characterStage <= nextGoals.length) {
        nextGoal = nextGoals[characterStage - 1];
      }
      
      // 진행률 계산
      const nextCharacterStage = characterStage <= nextGoals.length ? characterStage : nextGoals.length;
      const percentage = Math.min(Math.round((completedPromises / nextGoal) * 100), 100);
      
      setCharacterStages(stages);
      setProgress({
        completed: completedPromises,
        nextGoal,
        percentage
      });
      
      // 현재 단계를 선택
      const currentStage = stages.find(s => s.isCurrent);
      if (currentStage) {
        setSelectedStage(currentStage.id);
      }
      
    } catch (error) {
      console.error('캐릭터 데이터 로드 중 오류:', error);
      // 에러 발생 시 기본 데이터 사용
      setDefaultCharacterData();
      throw error;
    }
  };
  
  const handleStageSelect = (stageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStage(stageId);
    
    // 캐릭터 애니메이션 효과
    Animated.sequence([
      Animated.timing(scaleCharacter, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleCharacter, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleCharacter, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const selectedStageData = characterStages.find(s => s.id === selectedStage);
  
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.light.leafGreen} />
        <Text className="mt-4 text-emerald-700">캐릭터 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <View className="bg-red-100 p-4 rounded-xl items-center mb-4">
          <MaterialIcons name="error" size={40} color="#ef4444" />
        </View>
        <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
        <Pressable
          className="bg-emerald-500 py-3 px-6 rounded-xl"
          onPress={() => isAuthenticated ? loadCharacterData() : setDefaultCharacterData()}
        >
          <Text className="text-white font-bold">다시 시도</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="px-5 pt-4"
        >
          <Text className="text-3xl font-bold text-center my-5 text-emerald-700">
            내 캐릭터
          </Text>
          
          {/* 캐릭터 디스플레이 */}
          <View className="items-center mb-8">
            <View className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 rounded-3xl p-6 shadow-md mb-2 w-full">
              <Animated.View
                style={{
                  transform: [
                    { translateY: bounceAnim },
                    { scale: scaleCharacter }
                  ]
                }}
                className="items-center"
              >
                <View className="mb-4">
                  {/* 캐릭터 이미지 또는 아이콘 */}
                  <View 
                    className="bg-gradient-to-br from-emerald-400/20 to-emerald-500/10 rounded-full mb-2 items-center justify-center p-6 shadow-inner"
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {selectedStageData?.image ? (
                      <Image
                        source={selectedStageData.image}
                        style={{ width: 120, height: 120 }}
                        contentFit="contain"
                      />
                    ) : (
                      renderIcon(
                        selectedStageData?.icon || 'seedling', 
                        100, 
                        selectedStageData?.color || Colors.light.leafGreen
                      )
                    )}
                  </View>
                </View>
              </Animated.View>
              
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-700 mb-1">
                  {selectedStageData?.name || ''}
                </Text>
                <Text className="text-gray-600 text-center mb-4 text-base">
                  {selectedStageData?.description || ''}
                </Text>
                
                {/* 진행 정보 */}
                <View className="w-full mt-2">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600 font-medium">진행률</Text>
                    <Text className="text-emerald-600 font-bold">
                      {progress.completed}/{progress.nextGoal}
                    </Text>
                  </View>
                  
                  {/* 프로그레스 바 */}
                  <View className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          <Text className="text-xl font-bold mb-4 text-emerald-700">성장 단계</Text>
          
          {/* 성장 단계 리스트 */}
          {characterStages.map((stage) => (
            <Pressable
              key={stage.id}
              className={`mb-4 p-5 rounded-2xl border shadow-sm ${
                stage.isUnlocked 
                  ? stage.isCurrent
                    ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100/70'
                    : 'border-blue-300 bg-white'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onPress={() => stage.isUnlocked && handleStageSelect(stage.id)}
              disabled={!stage.isUnlocked}
              style={{
                shadowColor: stage.isCurrent ? Colors.light.leafGreen : '#64748b',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <View className="flex-row items-center">
                <View 
                  className={`w-16 h-16 rounded-full items-center justify-center mr-4 ${
                    stage.isUnlocked 
                      ? 'bg-gradient-to-br from-emerald-200/60 to-emerald-100/40' 
                      : 'bg-gray-200'
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor: stage.isUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)',
                  }}
                >
                  {stage.image ? (
                    <Image
                      source={stage.image}
                      style={{ width: 40, height: 40 }}
                      contentFit="contain"
                    />
                  ) : (
                    renderIcon(
                      stage.icon,
                      30, 
                      stage.isUnlocked ? stage.color : '#94a3b8'
                    )
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className={`text-xl ${
                    stage.isUnlocked ? 'font-bold text-emerald-700' : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </Text>
                  <Text className={`${stage.isUnlocked ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
                    {stage.isUnlocked ? stage.description : stage.requirements}
                  </Text>
                </View>
                
                {stage.isCurrent && (
                  <View className="bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 py-1 rounded-full shadow-sm">
                    <Text className="text-white font-bold">현재</Text>
                  </View>
                )}
                
                {!stage.isUnlocked && (
                  <View className="bg-gray-300 p-2.5 rounded-full shadow-sm">
                    <MaterialIcons name="lock" size={14} color="white" />
                  </View>
                )}
              </View>
            </Pressable>
          ))}
          
          {/* 성장 진행도 */}
          <View className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 my-4 border border-amber-200 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="bg-amber-200 p-3 rounded-full mr-3 shadow-sm">
                <MaterialIcons name="trending-up" size={18} color="#92400e" />
              </View>
              <Text className="text-xl font-bold text-amber-700">성장 진행도</Text>
            </View>
            
            <Text className="text-amber-800 mb-1 text-base">
              지금까지 {progress.completed}개의 약속을 완료했어요!
            </Text>
            <Text className="text-amber-700 mb-4 text-base">
              다음 단계까지 {progress.nextGoal - progress.completed}개의 약속이 더 필요해요.
            </Text>
            
            <View className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner">
              <View 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </View>
            
            {/* 캐릭터 팁 */}
            <View className="bg-white p-4 rounded-xl mt-4 border border-amber-100">
              <Text className="text-amber-800 font-medium text-center">
                약속을 더 많이 지킬수록 캐릭터가 더 빨리 성장해요! 🌱
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}