import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import promiseApi, { CreatePromiseRequest } from '../../api/promiseApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CreatePromiseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // 약속 생성 폼 상태
  const [formData, setFormData] = useState<Partial<CreatePromiseRequest>>({
    title: '',
    description: '',
    repeatType: 'ONCE',
    startDate: new Date().toISOString(),
    childIds: []
  });
  
  // 날짜 선택 UI 관련 상태
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // 자녀 목록 조회
  const { 
    data: children, 
    isLoading: isChildrenLoading, 
    error: childrenError 
  } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: () => promiseApi.getParentChildren(),
  });
  
  // 약속 생성 뮤테이션
  const createPromiseMutation = useMutation({
    mutationFn: (data: CreatePromiseRequest) => promiseApi.createPromise(data),
    onSuccess: () => {
      // 관련 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['parentPromises'] });
      
      // 성공 메시지 및 화면 이동
      Alert.alert(
        '성공',
        '약속이 성공적으로 생성되었습니다.',
        [{ text: '확인', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        '오류',
        error.response?.data?.message || '약속 생성 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    },
  });
  
  // 입력 필드 핸들러
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // 날짜 선택 핸들러
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDate(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      handleInputChange('startDate', selectedDate.toISOString());
    }
  };
  
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDate(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      handleInputChange('endDate', selectedDate.toISOString());
    } else {
      setEndDate(null);
      handleInputChange('endDate', undefined);
    }
  };
  
  // 자녀 선택 핸들러
  const handleChildSelection = (childId: string) => {
    setFormData(prev => {
      const currentChildIds = prev.childIds || [];
      
      // 이미 선택된 자녀인 경우 선택 해제
      if (currentChildIds.includes(childId)) {
        return {
          ...prev,
          childIds: currentChildIds.filter(id => id !== childId)
        };
      }
      
      // 선택되지 않은 자녀인 경우 선택 추가
      return {
        ...prev,
        childIds: [...currentChildIds, childId]
      };
    });
  };
  
  // 날짜 포맷 함수
  const formatDate = (date: Date) => {
    return format(date, 'yyyy년 MM월 dd일', { locale: ko });
  };
  
  // 약속 생성 제출 핸들러
  const handleSubmit = () => {
    // 필수 필드 검증
    if (!formData.title || !formData.startDate || !formData.childIds?.length) {
      Alert.alert('입력 오류', '제목, 시작일, 자녀 선택은 필수입니다.');
      return;
    }
    
    // 반복 약속인데 종료일이 없는 경우
    if (formData.repeatType !== 'ONCE' && !formData.endDate) {
      Alert.alert('입력 오류', '반복 약속인 경우 종료일은 필수입니다.');
      return;
    }
    
    // 약속 생성 요청
    createPromiseMutation.mutate(formData as CreatePromiseRequest);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome5 name="arrow-left" size={20} color="#10b981" />
          </Pressable>
          <Text className="text-2xl font-bold text-emerald-700">새 약속 만들기</Text>
          <View style={{ width: 30 }} />
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 제목 입력 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">약속 제목</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3"
              placeholder="예: 숙제하기, 이를 닦기, 방 청소하기"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>
          
          {/* 설명 입력 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">설명 (선택사항)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3"
              placeholder="약속에 대한 자세한 설명을 입력하세요."
              value={formData.description || ''}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          {/* 반복 유형 선택 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">반복 유형</Text>
            <View className="flex-row flex-wrap">
              {[
                { value: 'ONCE', label: '한 번만' },
                { value: 'DAILY', label: '매일' },
                { value: 'WEEKLY', label: '매주' },
                { value: 'MONTHLY', label: '매월' }
              ].map((option) => (
                <Pressable
                  key={option.value}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                    formData.repeatType === option.value
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => handleInputChange('repeatType', option.value)}
                >
                  <Text
                    className={`${
                      formData.repeatType === option.value
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          {/* 시작일 선택 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">시작일</Text>
            <Pressable
              className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
              onPress={() => setShowStartDate(true)}
            >
              <Text>{formatDate(startDate)}</Text>
              <FontAwesome5 name="calendar-alt" size={18} color="#10b981" />
            </Pressable>
            
            {showStartDate && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
              />
            )}
          </View>
          
          {/* 종료일 선택 (반복 약속인 경우) */}
          {formData.repeatType !== 'ONCE' && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">종료일</Text>
              <Pressable
                className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                onPress={() => setShowEndDate(true)}
              >
                <Text>{endDate ? formatDate(endDate) : '종료일 선택'}</Text>
                <FontAwesome5 name="calendar-alt" size={18} color="#10b981" />
              </Pressable>
              
              {showEndDate && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                />
              )}
            </View>
          )}
          
          {/* 자녀 선택 */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-1">자녀 선택</Text>
            
            {/* 로딩 상태 */}
            {isChildrenLoading && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#10b981" />
                <Text className="text-gray-500 mt-2">자녀 목록을 불러오는 중...</Text>
              </View>
            )}
            
            {/* 에러 상태 */}
            {childrenError && (
              <View className="items-center py-4 bg-red-50 rounded-xl">
                <FontAwesome5 name="exclamation-circle" size={24} color="#ef4444" />
                <Text className="text-red-500 mt-2">자녀 목록을 불러올 수 없습니다.</Text>
              </View>
            )}
            
            {/* 자녀가 없는 경우 */}
            {!isChildrenLoading && !childrenError && 
              (!children || children.length === 0) && (
              <View className="items-center py-4 bg-yellow-50 rounded-xl">
                <FontAwesome5 name="child" size={24} color="#f59e0b" />
                <Text className="text-yellow-700 mt-2 font-medium">자녀가 없습니다</Text>
                <Text className="text-gray-600 text-center mt-1">
                  약속을 만들기 전에 먼저 자녀를 연결해주세요.
                </Text>
              </View>
            )}
            
            {/* 자녀 목록 */}
            {!isChildrenLoading && !childrenError && children && children.length > 0 && (
              <View className="mt-2">
                {children.map((connection: any) => (
                  <Pressable
                    key={connection.child.id}
                    className={`flex-row items-center p-3 mb-2 rounded-xl border ${
                      formData.childIds?.includes(connection.child.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => handleChildSelection(connection.child.id)}
                  >
                    <FontAwesome5
                      name={formData.childIds?.includes(connection.child.id) ? 'check-circle' : 'circle'}
                      size={20}
                      color={formData.childIds?.includes(connection.child.id) ? '#10b981' : '#d1d5db'}
                      style={{ marginRight: 10 }}
                    />
                    <Text className="text-gray-700 font-medium">
                      {connection.child.user.username}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          
          {/* 제출 버튼 */}
          <Pressable
            className="bg-emerald-500 py-3 rounded-xl mb-6"
            onPress={handleSubmit}
            disabled={createPromiseMutation.isPending}
          >
            {createPromiseMutation.isPending ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-medium ml-2">처리 중...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-medium">약속 만들기</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}