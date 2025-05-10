import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import promiseApi from '../../api/modules/promise';
import CharacterDisplay from '../../components/common/CharacterDisplay';
import GradientButton from '../../components/common/GradientButton';
import SafeIcon from '../../components/common/SafeIcon';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function TabsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // 기본 캐릭터 데이터
  const [characterData, setCharacterData] = React.useState({
    stage: 1,
    completedPromises: 0,
    totalPromises: 0,
  });

  const [isLoading, setIsLoading] = React.useState(false);

  // 애니메이션 값 설정
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const translateY2 = useRef(new Animated.Value(20)).current;
  const translateY3 = useRef(new Animated.Value(20)).current;

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          // 약속 통계 데이터 로드
          const promiseStats = await promiseApi.getChildPromiseStats();

          setCharacterData({
            stage: promiseStats.characterStage || 1,
            completedPromises: promiseStats.completedPromises || 0,
            totalPromises:
              promiseStats.pendingPromises + promiseStats.completedPromises ||
              3,
          });
        } catch (error) {
          console.error('데이터 로드 오류:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 비인증 사용자용 기본 데이터
        setCharacterData({
          stage: 1,
          completedPromises: 0,
          totalPromises: 3,
        });
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    // 순차적으로 애니메이션 실행
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateY2, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY3, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 비인증 사용자가 기능 사용 시도할 때 로그인 화면으로 안내
  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그인',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate('/(auth)/login');
          },
        },
      ]);
      return true;
    }
    return false;
  };

  // 사용자 유형에 따른 대시보드 진입
  const navigateToDashboard = () => {
    if (handleAuthRequired()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (user?.userType === 'PARENT') {
      router.push('/(parent)');
    } else if (user?.userType === 'CHILD') {
      router.push('/(child)');
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
          {/* 헤더 영역
          <Animated.View
            className="flex-row items-center justify-center my-6"
            style={{ opacity: fadeAnim, transform: [{ translateY }] }}
          >
            <Image
              source={require('../../assets/images/react-logo.png')}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
              className="mr-3"
            />
            <Text className="text-3xl font-bold text-center text-emerald-600">
              쑥쑥약속
            </Text>
          </Animated.View> */}

          {/* 비인증 사용자 알림 배너 */}
          {!isAuthenticated && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY }],
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#fcd34d',
              }}
            >
              <LinearGradient
                colors={['#fef3c7', '#fffbeb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 20, borderRadius: 16 }}
              >
                <View className="flex-row items-start">
                  <View className="bg-amber-200 p-2 rounded-full mr-3">
                    <SafeIcon name="info" size={18} color="#92400e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-amber-800 font-bold text-lg mb-2">
                      미리보기 모드
                    </Text>
                    <Text className="text-amber-700 mb-4 leading-5">
                      전체 기능을 이용하시려면 로그인이 필요합니다.
                    </Text>
                    <GradientButton
                      colors={['#f59e0b', '#d97706']}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.navigate('/(auth)/login');
                      }}
                    >
                      로그인하기
                    </GradientButton>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* 캐릭터 영역 */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY }] }}
          >
            <Pressable
              onPress={navigateToDashboard}
              className="active:opacity-95"
            >
              <CharacterDisplay
                characterStage={characterData.stage}
                completedPromises={characterData.completedPromises}
                totalPromises={characterData.totalPromises}
                userType={user?.userType === 'PARENT' ? 'parent' : 'child'}
              />
            </Pressable>
          </Animated.View>

          {/* 약속 상태 카드 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateY2 }],
              marginTop: 24,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#a7f3d0',
            }}
          >
            <LinearGradient
              colors={['#d1fae5', '#ecfdf5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-emerald-200 p-3 rounded-full mr-3 shadow-sm">
                  <SafeIcon
                    name="clipboard-list"
                    size={18}
                    color={Colors.light.leafGreen}
                  />
                </View>
                <Text className="text-xl font-bold text-emerald-700">
                  오늘의 약속
                </Text>
              </View>

              {characterData.completedPromises < characterData.totalPromises ? (
                <View>
                  <Text className="text-emerald-800 mb-3 text-lg font-medium">
                    {characterData.totalPromises -
                      characterData.completedPromises}
                    개의 약속이 남아있어요!
                  </Text>
                  <GradientButton
                    colors={['#10b981', '#059669']}
                    icon={<SafeIcon name="tasks" size={16} color="white" />}
                    onPress={navigateToDashboard}
                  >
                    약속 확인하기
                  </GradientButton>
                </View>
              ) : (
                <View>
                  <View className="flex-row items-center bg-emerald-200/50 p-4 rounded-xl mb-3">
                    <SafeIcon
                      name="check-circle"
                      size={18}
                      color={Colors.light.leafGreen}
                    />
                    <Text className="text-emerald-800 text-lg font-medium">
                      모든 약속을 완료했어요!
                    </Text>
                  </View>
                  <GradientButton
                    colors={['#10b981', '#059669']}
                    icon={<SafeIcon name="star" size={16} color="white" />}
                    onPress={navigateToDashboard}
                  >
                    보상 확인하기
                  </GradientButton>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* 오늘의 물주기 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateY2 }],
              marginTop: 24,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#bae6fd',
            }}
          >
            <LinearGradient
              colors={['#e0f2fe', '#f0f9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-sky-200 p-3 rounded-full mr-3 shadow-sm">
                  <SafeIcon name="tint" size={18} color="#0ea5e9" />
                </View>
                <Text className="text-xl font-bold text-sky-700">
                  오늘의 물주기
                </Text>
              </View>

              <Text className="text-sky-800 mb-4 text-base">
                식물에게 물을 주면 더 빨리 성장해요!
              </Text>

              <GradientButton
                colors={['#0ea5e9', '#0284c7']}
                icon={
                  <SafeIcon name="hand-holding-water" size={16} color="white" />
                }
                onPress={() => {
                  if (handleAuthRequired()) return;
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  Alert.alert('물주기 성공!', '식물이 쑥쑥 자랄거에요!');
                }}
              >
                물주기
              </GradientButton>
            </LinearGradient>
          </Animated.View>

          {/* 사용 팁 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateY3 }],
              marginTop: 24,
              marginBottom: 32,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#fcd34d',
            }}
          >
            <LinearGradient
              colors={['#fef3c7', '#fffbeb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-amber-200 p-3 rounded-full mr-3 shadow-sm mt-1">
                  <SafeIcon name="lightbulb" size={18} color="#92400e" />
                </View>

                <Text className="text-xl font-bold text-amber-700 mb-2">
                  사용팁
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="">
                  <Text className="text-amber-800 text-base leading-6 mb-2">
                    식물을 터치하면{' '}
                    {user?.userType === 'PARENT' ? '부모' : '아이'} 화면으로
                    이동합니다. 약속을 많이 지킬수록 식물이 쑥쑥 자라요!
                  </Text>
                  <Pressable
                    className="bg-amber-200 py-3 px-4 rounded-xl mt-3 flex-row items-center active:opacity-90"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert(
                        '도움말',
                        '약속을 등록하고 완료하면 캐릭터가 성장합니다! 더 많은 도움말은 설정 탭에서 확인할 수 있어요.',
                      );
                    }}
                  >
                    <Text className="text-amber-800 font-medium">
                      더 알아보기
                    </Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
