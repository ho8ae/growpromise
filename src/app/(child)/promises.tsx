import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../api';
import { PromiseAssignment, PromiseStatus } from '../../api/modules/promise';
import * as Haptics from 'expo-haptics';
import Colors from '../../constants/Colors';

export default function ChildPromisesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | PromiseStatus>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promises, setPromises] = useState<PromiseAssignment[]>([]);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // 약속 데이터 로드
  useEffect(() => {
    loadPromises();
  }, [filter]);
  
  // 애니메이션 효과
  useEffect(() => {
    if (!isLoading && !error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, error]);
  
  // 약속 데이터 로드 함수
  const loadPromises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 애니메이션 초기화
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      let response;
      if (filter === 'ALL') {
        response = await api.promise.getChildPromises();
      } else {
        response = await api.promise.getChildPromises(filter);
      }
      setPromises(response);
      
      setIsLoading(false);
    } catch (error) {
      console.error('약속 데이터 로드 중 오류:', error);
      setError('약속 목록을 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPromises();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${month}월 ${day}일 (${weekday})`;
  };
  
  // 남은 일수 계산
  const getDaysLeft = (dueDateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // 약속 상태에 따른 배지 컴포넌트
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';
    let statusText = '';
    let iconName = '';
    
    switch (status) {
      case 'PENDING':
        bgColor = 'rgba(255, 200, 0, 0.15)';
        textColor = Colors.light.secondary;
        statusText = '대기 중';
        iconName = 'hourglass-empty';
        break;
      case 'SUBMITTED':
        bgColor = 'rgba(28, 176, 246, 0.15)';
        textColor = Colors.light.info;
        statusText = '인증 요청됨';
        iconName = 'check-circle-outline';
        break;
      case 'APPROVED':
        bgColor = 'rgba(88, 204, 2, 0.15)';
        textColor = Colors.light.primary;
        statusText = '완료';
        iconName = 'check-circle';
        break;
      case 'REJECTED':
        bgColor = 'rgba(255, 75, 75, 0.15)';
        textColor = Colors.light.error;
        statusText = '거절됨';
        iconName = 'highlight-off';
        break;
      case 'EXPIRED':
        bgColor = 'rgba(119, 119, 119, 0.15)';
        textColor = Colors.light.textSecondary;
        statusText = '만료됨';
        iconName = 'event-busy';
        break;
      default:
        bgColor = 'rgba(119, 119, 119, 0.15)';
        textColor = Colors.light.textSecondary;
        statusText = '알 수 없음';
        iconName = 'help-outline';
    }
    
    return (
      <View 
        className="px-2.5 py-1 rounded-full flex-row items-center"
        style={{ backgroundColor: bgColor }}
      >
        <MaterialIcons name={iconName} size={14} color={textColor} style={{ marginRight: 4 }} />
        <Text 
          className="text-xs font-medium"
          style={{ color: textColor }}
        >
          {statusText}
        </Text>
      </View>
    );
  };
  
  // 필터 버튼 컴포넌트
  const FilterButton = ({ 
    title, 
    value,
    icon
  }: { 
    title: string; 
    value: 'ALL' | PromiseStatus;
    icon: string;
  }) => (
    <Pressable
      className={`px-4 py-2.5 rounded-xl mr-3 border active:opacity-90 ${
        filter === value 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(value);
      }}
    >
      <View className="flex-row items-center">
        <MaterialIcons 
          name={icon} 
          size={16} 
          color={filter === value ? Colors.light.primary : Colors.light.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text 
          className={`font-medium ${
            filter === value 
              ? 'text-green-600' 
              : 'text-gray-600'
          }`}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );

  // 인증 화면으로 이동
  const navigateToVerify = (assignmentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ 
      pathname: '/(child)/verify', 
      params: { assignmentId } 
    });
  };
  
  // 약속 유형별 아이콘 및 색상
  const getPromiseIconAndColor = (type: string = '') => {
    // 약속 ID의 마지막 글자를 기준으로 색상 결정 (실제로는 약속 유형 등에 따라 달라질 수 있음)
    // 더미 유형 (실제 앱에서는 실제 약속 유형으로 대체)
    const types = ['study', 'chore', 'exercise', 'health', 'music', 'family', 'other'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const typeToUse = type || randomType;
    
    const iconMap: Record<string, string> = {
      // study: 'menu-book',
      // chore: 'cleaning-services',
      // exercise: 'directions-run',
      // health: 'healing',
      // music: 'music-note',
      // family: 'people',
      other: 'sticky-note-2'
    };
    
    const colorMap: Record<string, string> = {
      study: Colors.light.promise.study,
      chore: Colors.light.promise.chore,
      exercise: Colors.light.primary,
      health: Colors.light.promise.health,
      music: Colors.light.promise.music,
      family: Colors.light.promise.family,
      other: Colors.light.textSecondary
    };
    
    return {
      icon: iconMap[typeToUse] || 'sticky-note-2',
      color: colorMap[typeToUse] || Colors.light.textSecondary
    };
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1">
        {/* 커스텀 헤더 */}
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
          <Pressable 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-50"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.light.text} />
          </Pressable>
          
          <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
            나의 약속 목록
          </Text>
          
          <Pressable 
            onPress={() => loadPromises()}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-50"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="refresh" size={20} color={Colors.light.text} />
          </Pressable>
        </View>
        
        {/* 필터 목록 */}
        <View className="px-5 pt-3 pb-1">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <FilterButton title="전체" value="ALL" icon="format-list-bulleted" />
            <FilterButton title="대기 중" value={PromiseStatus.PENDING} icon="hourglass-empty" />
            <FilterButton title="인증 완료" value={PromiseStatus.SUBMITTED} icon="check-circle-outline" />
            <FilterButton title="승인됨" value={PromiseStatus.APPROVED} icon="check-circle" />
            <FilterButton title="거절됨" value={PromiseStatus.REJECTED} icon="highlight-off" />
          </ScrollView>
        </View>
        
        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text className="mt-3" style={{ color: Colors.light.textSecondary }}>
              약속 목록을 불러오는 중...
            </Text>
          </View>
        )}
        
        {/* 에러 상태 */}
        {error && (
          <View className="flex-1 justify-center items-center px-5">
            <View 
              className="w-16 h-16 rounded-full mb-4 items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 75, 75, 0.1)' }}
            >
              <MaterialIcons name="error-outline" size={32} color={Colors.light.error} />
            </View>
            <Text 
              className="text-lg font-bold text-center mb-2"
              style={{ color: Colors.light.text }}
            >
              불러오기 실패
            </Text>
            <Text 
              className="text-center mb-6"
              style={{ color: Colors.light.textSecondary }}
            >
              {error}
            </Text>
            <Pressable
              className="py-3 px-6 rounded-xl active:opacity-90"
              style={{ backgroundColor: Colors.light.primary }}
              onPress={() => loadPromises()}
            >
              <Text className="text-white font-bold">다시 시도</Text>
            </Pressable>
          </View>
        )}
        
        {/* 데이터가 없는 경우 */}
        {!isLoading && !error && (!promises || promises.length === 0) && (
          <View className="flex-1 justify-center items-center px-5">
            <View 
              className="w-16 h-16 rounded-full mb-4 items-center justify-center"
              style={{ backgroundColor: 'rgba(88, 204, 2, 0.1)' }}
            >
              <MaterialIcons name="event-note" size={32} color={Colors.light.primary} />
            </View>
            <Text 
              className="text-lg font-bold text-center mb-2"
              style={{ color: Colors.light.text }}
            >
              아직 약속이 없어요
            </Text>
            <Text 
              className="text-center mb-6"
              style={{ color: Colors.light.textSecondary }}
            >
              부모님께 약속을 만들어 달라고 요청해보세요!
            </Text>
            <Pressable
              className="py-3 px-6 rounded-xl active:opacity-90"
              style={{ backgroundColor: Colors.light.primary }}
              onPress={() => router.back()}
            >
              <Text className="text-white font-bold">홈으로 돌아가기</Text>
            </Pressable>
          </View>
        )}
        
        {/* 약속 목록 */}
        {!isLoading && !error && promises && promises.length > 0 && (
          <Animated.View 
            className="flex-1"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <ScrollView 
              className="flex-1 px-5" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.light.primary}
                  colors={[Colors.light.primary]}
                />
              }
            >
              {promises.map((assignment: PromiseAssignment) => {
                const { icon, color } = getPromiseIconAndColor();
                const daysLeft = getDaysLeft(assignment.dueDate);
                
                return (
                  <Pressable
                    key={assignment.id}
                    className="mb-4 rounded-xl overflow-hidden active:opacity-95 border border-gray-100"
                    style={{ backgroundColor: 'white' }}
                    onPress={() => 
                      (assignment.status === 'PENDING' || assignment.status === 'REJECTED') 
                        ? navigateToVerify(assignment.id) 
                        : null
                    }
                  >
                    <View className="p-4">
                      <View className="flex-row justify-between items-start mb-3">
                        {/* 아이콘과 타이틀 */}
                        <View className="flex-row items-center flex-1 mr-3">
                          <View 
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <MaterialIcons name={icon} size={20} color={color} />
                          </View>
                          
                          <View className="flex-1">
                            <Text 
                              className="text-base font-bold mb-0.5"
                              style={{ color: Colors.light.text }}
                              numberOfLines={1}
                            >
                              {assignment.promise?.title}
                            </Text>
                            
                            <View className="flex-row items-center">
                              <MaterialIcons 
                                name="event" 
                                size={12} 
                                color={Colors.light.textSecondary} 
                                style={{ marginRight: 4 }}
                              />
                              <Text 
                                className="text-xs mr-2"
                                style={{ color: Colors.light.textSecondary }}
                              >
                                {formatDate(assignment.dueDate)}
                              </Text>
                              
                              {daysLeft > 0 && assignment.status === 'PENDING' && (
                                <View 
                                  className="px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: 'rgba(255, 200, 0, 0.15)' }}
                                >
                                  <Text 
                                    className="text-xs font-medium"
                                    style={{ color: Colors.light.secondary }}
                                  >
                                    D-{daysLeft}
                                  </Text>
                                </View>
                              )}
                              
                              {daysLeft <= 0 && assignment.status === 'PENDING' && (
                                <View 
                                  className="px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: 'rgba(255, 75, 75, 0.15)' }}
                                >
                                  <Text 
                                    className="text-xs font-medium"
                                    style={{ color: Colors.light.error }}
                                  >
                                    오늘 마감
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        
                        {/* 상태 배지 */}
                        <StatusBadge status={assignment.status} />
                      </View>
                      
                      {/* 상태별 추가 내용 */}
                      {assignment.status === 'PENDING' && (
                        <Pressable
                          className="py-3 rounded-xl active:opacity-90"
                          style={{ backgroundColor: Colors.light.primary }}
                          onPress={() => navigateToVerify(assignment.id)}
                        >
                          <View className="flex-row items-center justify-center">
                            <MaterialIcons 
                              name="camera-alt" 
                              size={16} 
                              color="white" 
                              style={{ marginRight: 6 }}
                            />
                            <Text className="text-white font-bold">인증하기</Text>
                          </View>
                        </Pressable>
                      )}
                      
                      {assignment.status === 'SUBMITTED' && (
                        <View 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(28, 176, 246, 0.1)' }}
                        >
                          <View className="flex-row items-center">
                            <MaterialIcons 
                              name="info" 
                              size={16} 
                              color={Colors.light.info} 
                              style={{ marginRight: 8 }}
                            />
                            <Text 
                              style={{ color: Colors.light.info, flex: 1 }}
                            >
                              인증이 완료되었습니다. 부모님의 승인을 기다리고 있어요.
                            </Text>
                          </View>
                        </View>
                      )}
                      
                      {assignment.status === 'APPROVED' && (
                        <View 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(88, 204, 2, 0.1)' }}
                        >
                          <View className="flex-row items-center">
                            <MaterialIcons 
                              name="check-circle" 
                              size={16} 
                              color={Colors.light.primary} 
                              style={{ marginRight: 8 }}
                            />
                            <Text 
                              style={{ color: Colors.light.primary, flex: 1 }}
                            >
                              부모님이 인증을 승인했습니다. 스티커를 획득했어요!
                            </Text>
                          </View>
                        </View>
                      )}
                      
                      {assignment.status === 'REJECTED' && (
                        <View>
                          <View 
                            className="p-3 rounded-xl mb-3"
                            style={{ backgroundColor: 'rgba(255, 75, 75, 0.1)' }}
                          >
                            <View className="flex-row items-start">
                              <MaterialIcons 
                                name="error" 
                                size={16} 
                                color={Colors.light.error} 
                                style={{ marginRight: 8, marginTop: 2 }}
                              />
                              <Text 
                                style={{ color: Colors.light.error, flex: 1 }}
                              >
                                인증이 거절되었습니다.
                                {assignment.rejectionReason && (
                                  <Text>
                                    {'\n'}사유: {assignment.rejectionReason}
                                  </Text>
                                )}
                              </Text>
                            </View>
                          </View>
                          
                          <Pressable
                            className="py-3 rounded-xl active:opacity-90"
                            style={{ backgroundColor: Colors.light.primary }}
                            onPress={() => navigateToVerify(assignment.id)}
                          >
                            <View className="flex-row items-center justify-center">
                              <MaterialIcons 
                                name="refresh" 
                                size={16} 
                                color="white" 
                                style={{ marginRight: 6 }}
                              />
                              <Text className="text-white font-bold">다시 인증하기</Text>
                            </View>
                          </Pressable>
                        </View>
                      )}
                      
                      {assignment.status === 'EXPIRED' && (
                        <View 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(119, 119, 119, 0.1)' }}
                        >
                          <View className="flex-row items-center">
                            <MaterialIcons 
                              name="event-busy" 
                              size={16} 
                              color={Colors.light.textSecondary} 
                              style={{ marginRight: 8 }}
                            />
                            <Text 
                              style={{ color: Colors.light.textSecondary, flex: 1 }}
                            >
                              기한이 지나 만료된 약속입니다.
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}