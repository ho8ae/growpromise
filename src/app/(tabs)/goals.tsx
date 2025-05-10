import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Animated, 
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

// 목표 및 세부 태스크 인터페이스
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  icon: string;
  color: string;
  gradient: string[];
  tasks: Task[];
}

export default function GoalsScreen() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const forestAnim = useRef(new Animated.Value(0)).current;
  const scaleTree = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // 애니메이션 실행
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(forestAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // 주기적인 나무 애니메이션
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(scaleTree, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleTree, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);
    
    // 인증 상태에 따라 목표 데이터 로드
    if (isAuthenticated) {
      loadGoals();
    } else {
      // 비인증 상태일 때는 샘플 데이터 (실제 앱에서는 빈 배열로 설정)
      setDemoGoals();
    }
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  // 데모 목표 설정 (개발 목적)
  const setDemoGoals = () => {
    const demoGoals: Goal[] = [
      {
        id: '1',
        title: '숙제 챌린지',
        description: '일주일 동안 숙제를 끝까지 완료하기',
        totalTasks: 5,
        completedTasks: 3,
        icon: 'book',
        color: '#60a5fa',
        gradient: ['#dbeafe', '#93c5fd'],
        tasks: [
          { id: '1-1', title: '수학 문제 풀기', completed: true },
          { id: '1-2', title: '영어 단어 외우기', completed: true },
          { id: '1-3', title: '과학 보고서 작성', completed: true },
          { id: '1-4', title: '국어 독후감 쓰기', completed: false },
          { id: '1-5', title: '사회 조사 과제', completed: false },
        ],
      },
      {
        id: '2',
        title: '건강한 습관',
        description: '건강을 위한 좋은 습관 만들기',
        totalTasks: 4,
        completedTasks: 2,
        icon: 'heartbeat',
        color: '#f87171',
        gradient: ['#fee2e2', '#fca5a5'],
        tasks: [
          { id: '2-1', title: '매일 아침 물 한 잔 마시기', completed: true },
          { id: '2-2', title: '하루 30분 운동하기', completed: true },
          { id: '2-3', title: '9시 전에 잠자리에 들기', completed: false },
          { id: '2-4', title: '간식 줄이기', completed: false },
        ],
      },
      {
        id: '3',
        title: '방 깨끗이 하기',
        description: '1주일간 내 방을 깨끗하게 유지하기',
        totalTasks: 3,
        completedTasks: 1,
        icon: 'broom',
        color: '#a78bfa',
        gradient: ['#ede9fe', '#c4b5fd'],
        tasks: [
          { id: '3-1', title: '침대 정리하기', completed: true },
          { id: '3-2', title: '옷 정리하기', completed: false },
          { id: '3-3', title: '책상 정리하기', completed: false },
        ],
      },
    ];
    
    setGoals(demoGoals);
  };
  
  // 목표 데이터 로드 (실제 구현 시 API 호출)
  const loadGoals = async () => {
    try {
      // 실제 구현 시 API 호출 부분
      // const response = await goalApi.getGoals();
      // setGoals(response.goals);
      
      // 개발 중 샘플 데이터 사용
      setDemoGoals();
    } catch (error) {
      console.error('목표 데이터 로드 중 오류:', error);
      setGoals([]);
    }
  };
  
  // 목표 달성률에 따른 트리 성장 단계 계산
  const getTreeStage = (completedTasks: number, totalTasks: number) => {
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    if (percentage <= 25) return 1; // 씨앗
    if (percentage <= 50) return 2; // 새싹
    if (percentage <= 75) return 3; // 어린 나무
    return 4; // 열매 맺은 나무
  };
  
  // 트리 아이콘 얻기
  const getTreeIcon = (stage: number) => {
    switch(stage) {
      case 1: return 'seedling';
      case 2: return 'spa'; // 새싹
      case 3: return 'tree'; // 나무
      case 4: return 'apple-alt'; // 열매 맺은 나무
      default: return 'seedling';
    }
  };
  
  // 트리 색상 얻기
  const getTreeColor = (stage: number) => {
    switch(stage) {
      case 1: return Colors.light.stemBrown;
      case 2: return Colors.light.stemBrown;
      case 3: return Colors.light.leafGreen;
      case 4: return Colors.light.leafGreen;
      default: return Colors.light.stemBrown;
    }
  };
  
  // 목표 토글 처리
  const toggleGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedGoal(prevId => prevId === goalId ? null : goalId);
    
    // 나무 애니메이션
    Animated.sequence([
      Animated.timing(scaleTree, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleTree, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 비인증 상태일 때 로그인 화면으로 안내
  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.navigate('/(auth)/login');
      return true;
    }
    return false;
  };
  
  // 목표 단계 이름 가져오기
  const getTreeStageName = (stage: number) => {
    switch(stage) {
      case 1: return '씨앗';
      case 2: return '새싹';
      case 3: return '나무';
      case 4: return '열매 맺은 나무';
      default: return '씨앗';
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4">
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-3xl font-bold text-center my-5 text-emerald-700">
              목표 트리
            </Text>
          </Animated.View>
          
          <Animated.View 
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 mb-6 border border-emerald-200 shadow-sm"
            style={{
              opacity: forestAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-emerald-200 p-3 rounded-full mr-3 shadow-sm">
                <FontAwesome5 name="tree" size={18} color={Colors.light.leafGreen} />
              </View>
              <Text className="text-xl font-bold text-emerald-700">내 숲</Text>
            </View>
            
            <Text className="text-emerald-800 mb-5 text-base">
              작은 약속들이 모여 큰 목표를 이루고, 목표들이 모여 아름다운 숲을 만들어요!
            </Text>
            
            <View className="flex-row flex-wrap justify-evenly py-2">
              {goals.map(goal => {
                const treeStage = getTreeStage(goal.completedTasks, goal.totalTasks);
                const treeIcon = getTreeIcon(treeStage);
                const treeColor = getTreeColor(treeStage);
                
                return (
                  <Pressable 
                    key={goal.id} 
                    className="items-center m-2 w-20"
                    onPress={() => toggleGoal(goal.id)}
                  >
                    <Animated.View 
                      className={`p-4 rounded-full ${treeStage >= 3 ? 'bg-emerald-200/60' : 'bg-amber-100/60'}`}
                      style={{ transform: [{ scale: scaleTree }] }}
                    >
                      <FontAwesome5 
                        name={treeIcon} 
                        size={32} 
                        color={treeColor} 
                      />
                    </Animated.View>
                    <Text className="text-xs text-center mt-2 text-emerald-800 font-medium" numberOfLines={2}>
                      {goal.title}
                    </Text>
                  </Pressable>
                );
              })}
              
              {isAuthenticated && (
                <Pressable 
                  className="items-center m-2 w-20"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // 새 목표 추가 기능 (실제 구현 필요)
                  }}
                >
                  <View className="p-4 rounded-full bg-gray-200/60">
                    <FontAwesome5 name="plus" size={32} color="#9ca3af" />
                  </View>
                  <Text className="text-xs text-center mt-2 text-gray-500 font-medium">
                    새 목표
                  </Text>
                </Pressable>
              )}
              
              {!isAuthenticated && goals.length === 0 && (
                <View className="items-center justify-center p-6 w-full my-4">
                  <Text className="text-center text-gray-500 font-medium">
                    로그인하면 목표를 관리할 수 있어요!
                  </Text>
                  <Pressable
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 px-5 rounded-xl mt-3 shadow-sm active:opacity-90"
                    onPress={handleAuthRequired}
                  >
                    <Text className="text-white font-bold">로그인하기</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Animated.View>
          
          {goals.length > 0 && (
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <Text className="text-xl font-bold my-3 text-emerald-700">내 목표 트리</Text>
            </Animated.View>
          )}
          
          {goals.map(goal => {
            const treeStage = getTreeStage(goal.completedTasks, goal.totalTasks);
            const progress = goal.totalTasks > 0 ? (goal.completedTasks / goal.totalTasks) * 100 : 0;
            const isExpanded = expandedGoal === goal.id;
            
            return (
              <Animated.View 
                key={goal.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }}
              >
                <Pressable 
                  className="mb-4 bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden active:opacity-95"
                  onPress={() => toggleGoal(goal.id)}
                  style={{
                    shadowColor: goal.color,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                >
                  <View className="p-5">
                    <View className="flex-row">
                      <View 
                        className="mr-4 p-3 rounded-xl items-center justify-center"
                        style={{ 
                          backgroundColor: `${goal.color}20`,
                        }}
                      >
                        <FontAwesome5 name={goal.icon} size={24} color={goal.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-emerald-800">{goal.title}</Text>
                        <Text className="text-gray-500 mb-3">{goal.description}</Text>
                        
                        <View className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden mt-1 mb-1">
                          <View 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: goal.color,
                            }}
                          />
                        </View>
                        
                        <View className="flex-row justify-between mt-1">
                          <Text className="text-xs text-emerald-700 font-medium">
                            {goal.completedTasks}/{goal.totalTasks} 완료
                          </Text>
                          <Text className="text-xs" style={{ color: goal.color }}>
                            {getTreeStageName(treeStage)}
                          </Text>
                        </View>
                      </View>
                      <View className="ml-2">
                        <FontAwesome5 
                          name={getTreeIcon(treeStage)} 
                          size={40} 
                          color={getTreeColor(treeStage)} 
                        />
                      </View>
                    </View>
                    
                    <View className={`mt-3 pt-3 border-t border-gray-100 ${isExpanded ? 'block' : 'hidden'}`}>
                      <Text className="font-medium text-emerald-700 mb-3">세부 약속</Text>
                      {goal.tasks.map(task => (
                        <View key={task.id} className="flex-row items-center mb-2.5">
                          <View className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${task.completed ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                            {task.completed && (
                              <FontAwesome5 name="check" size={10} color="white" />
                            )}
                          </View>
                          <Text className={`text-base ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                            {task.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    <View className="items-center mt-3">
                      <FontAwesome5 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={14} 
                        color="#9ca3af" 
                      />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
          
          {isAuthenticated && (
            <Pressable 
              className="mb-8 p-5 border border-dashed border-emerald-300 rounded-2xl items-center bg-white/50 active:bg-emerald-50"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // 새 목표 생성 기능 (실제 구현 필요)
              }}
            >
              <FontAwesome5 name="plus" size={24} color={Colors.light.leafGreen} className="mb-2" />
              <Text className="text-emerald-600 font-bold">새 목표 만들기</Text>
            </Pressable>
          )}
          
          {!isAuthenticated && (
            <View className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="bg-amber-200 p-3 rounded-full mr-3 shadow-sm">
                  <FontAwesome5 name="tree" size={18} color="#92400e" />
                </View>
                <Text className="text-lg font-bold text-amber-800">
                  로그인이 필요해요
                </Text>
              </View>
              <Text className="text-amber-700 text-center mb-4">
                목표를 관리하고 트리를 성장시키려면 로그인해 주세요.
              </Text>
              <Pressable
                className="bg-gradient-to-r from-amber-500 to-amber-400 py-3 rounded-xl shadow-sm active:opacity-90"
                onPress={handleAuthRequired}
              >
                <Text className="text-white text-center font-bold">
                  로그인하기
                </Text>
              </Pressable>
            </View>
          )}
          
          {/* 목표 트리 설명 */}
          <View className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="bg-blue-200 p-3 rounded-full mr-3 shadow-sm">
                <FontAwesome5 name="info-circle" size={18} color="#3b82f6" />
              </View>
              <Text className="text-lg font-bold text-blue-700">
                목표 트리란?
              </Text>
            </View>
            <Text className="text-blue-700 mb-2 leading-5">
              목표 트리는 작은 약속들을 모아 큰 목표를 이룰 수 있도록 도와주는 기능이에요.
            </Text>
            <Text className="text-blue-700 mb-2 leading-5">
              약속을 완료할 때마다 트리가 성장하고, 모든 약속을 완료하면 열매가 열려요!
            </Text>
            <Text className="text-blue-700 leading-5">
              여러 개의 목표 트리를 모아 멋진 숲을 만들어 보세요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}