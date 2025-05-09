// app/(tabs)/goals.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSlideInAnimation } from '../../utils/animations';
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
  tasks: Task[];
}

export default function GoalsScreen() {
  const { isAuthenticated } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const { animation, startAnimation } = useSlideInAnimation();
  
  useEffect(() => {
    startAnimation();
    
    // 인증 상태에 따라 목표 데이터 로드
    if (isAuthenticated) {
      loadGoals();
    } else {
      // 비인증 상태일 때는 빈 데이터
      setGoals([]);
    }
  }, [isAuthenticated]);
  
  // 목표 데이터 로드 (실제 구현 시 API 호출)
  const loadGoals = async () => {
    try {
      // 실제 구현 시 API 호출 부분
      // const response = await goalApi.getGoals();
      // setGoals(response.goals);
      
      // 개발 중 임시 데이터 (실제 앱에서는 빈 배열로 설정)
      const tempGoals: Goal[] = [];
      setGoals(tempGoals);
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
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-center my-4 text-emerald-700">
            목표 트리
          </Text>
          
          <Animated.View 
            className="bg-emerald-50 rounded-2xl p-5 mb-6 border border-emerald-200 shadow-sm"
            style={{
              opacity: animation.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0]
              }),
              transform: [{ translateY: animation }]
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-amber-200 p-2 rounded-full mr-3">
                <FontAwesome5 name="tree" size={18} color={Colors.light.leafGreen} />
              </View>
              <Text className="text-lg font-medium text-emerald-700">내 숲</Text>
            </View>
            
            <Text className="text-emerald-800 mb-4">
              작은 약속들이 모여 큰 목표를 이루고, 목표들이 모여 아름다운 숲을 만들어요!
            </Text>
            
            <View className="flex-row flex-wrap justify-center py-2">
              {goals.map(goal => {
                const treeStage = getTreeStage(goal.completedTasks, goal.totalTasks);
                return (
                  <View key={goal.id} className="items-center m-2 w-[80]">
                    <View className={`p-3 rounded-full bg-opacity-30 ${treeStage >= 3 ? 'bg-emerald-200' : 'bg-amber-100'}`}>
                      <FontAwesome5 
                        name={getTreeIcon(treeStage)} 
                        size={36} 
                        color={treeStage >= 3 ? Colors.light.leafGreen : Colors.light.stemBrown} 
                      />
                    </View>
                    <Text className="text-xs text-center mt-2 text-emerald-800 font-medium" numberOfLines={2}>
                      {goal.title}
                    </Text>
                  </View>
                );
              })}
              
              {isAuthenticated && (
                <Pressable className="items-center m-2 w-[80]">
                  <View className="p-3 rounded-full bg-gray-200 bg-opacity-30">
                    <FontAwesome5 name="plus" size={36} color="#9ca3af" />
                  </View>
                  <Text className="text-xs text-center mt-2 text-gray-500 font-medium">
                    새 목표
                  </Text>
                </Pressable>
              )}
              
              {!isAuthenticated && goals.length === 0 && (
                <View className="items-center justify-center p-6 w-full">
                  <Text className="text-center text-gray-500">
                    로그인하면 목표를 관리할 수 있어요!
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
          
          {goals.length > 0 && (
            <Text className="text-lg font-medium my-2 text-emerald-700">내 목표 트리</Text>
          )}
          
          {goals.map(goal => {
            const treeStage = getTreeStage(goal.completedTasks, goal.totalTasks);
            const progress = goal.totalTasks > 0 ? (goal.completedTasks / goal.totalTasks) * 100 : 0;
            
            return (
              <Animated.View 
                key={goal.id}
                style={{
                  opacity: animation.interpolate({
                    inputRange: [0, 100],
                    outputRange: [1, 0]
                  }),
                  transform: [{ translateY: animation }]
                }}
              >
                <Pressable className="mb-4 bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                  <View className="p-4">
                    <View className="flex-row">
                      <View className="mr-3 p-3 bg-amber-100 rounded-xl">
                        <FontAwesome5 name={goal.icon} size={24} color={goal.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-medium text-emerald-800">{goal.title}</Text>
                        <Text className="text-gray-500 mb-2">{goal.description}</Text>
                        
                        <View className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden mt-1 mb-1">
                          <View 
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                        
                        <View className="flex-row justify-between">
                          <Text className="text-xs text-emerald-700">
                            {goal.completedTasks}/{goal.totalTasks} 완료
                          </Text>
                          <Text className="text-xs text-emerald-700">
                            {treeStage === 1 ? '씨앗' : 
                             treeStage === 2 ? '새싹' : 
                             treeStage === 3 ? '나무' : '열매 맺은 나무'}
                          </Text>
                        </View>
                      </View>
                      <View className="ml-2">
                        <FontAwesome5 
                          name={getTreeIcon(treeStage)} 
                          size={40} 
                          color={treeStage >= 3 ? Colors.light.leafGreen : Colors.light.stemBrown} 
                        />
                      </View>
                    </View>
                    
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Text className="font-medium text-emerald-700 mb-2">세부 약속</Text>
                      {goal.tasks.slice(0, 3).map(task => (
                        <View key={task.id} className="flex-row items-center mb-1">
                          <View className={`w-4 h-4 rounded-full mr-2 ${task.completed ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                            {task.completed && (
                              <FontAwesome5 name="check" size={8} color="white" style={{ alignSelf: 'center', marginTop: 3 }} />
                            )}
                          </View>
                          <Text className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                            {task.title}
                          </Text>
                        </View>
                      ))}
                      {goal.tasks.length > 3 && (
                        <Text className="text-emerald-500 text-sm mt-1">
                          +{goal.tasks.length - 3}개 더보기
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
          
          {isAuthenticated && (
            <Pressable className="mb-8 p-4 border border-dashed border-emerald-300 rounded-xl items-center">
              <FontAwesome5 name="plus" size={24} color={Colors.light.leafGreen} className="mb-2" />
              <Text className="text-emerald-600 font-medium">새 목표 만들기</Text>
            </Pressable>
          )}
          
          {!isAuthenticated && (
            <View className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
              <Text className="text-amber-800 text-center font-medium mb-2">
                로그인이 필요해요
              </Text>
              <Text className="text-amber-700 text-center mb-3">
                목표를 관리하고 트리를 성장시키려면 로그인해 주세요.
              </Text>
              <Pressable
                className="bg-amber-500 py-3 rounded-xl"
                onPress={() => {/* 로그인 화면으로 이동 */}}
              >
                <Text className="text-white text-center font-medium">
                  로그인하기
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}