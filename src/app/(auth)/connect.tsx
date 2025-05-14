// app/(auth)/connect.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../api';
import { useLoading } from '../../hooks/useLoading';
import Colors from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function Connect() {
  const router = useRouter();
  const [connectionCode, setConnectionCode] = useState('');
  const { isLoading, withLoading } = useLoading();

  // 키보드 숨기기
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // 연결 코드 처리
  const handleConnect = async () => {
    if (connectionCode.length < 6) {
      Alert.alert('입력 오류', '6자리 연결 코드를 입력해주세요');
      return;
    }

    try {
      await withLoading(
        api.auth.connectParent(connectionCode).then(() => {
          Alert.alert('연결 성공', '부모님 계정과 성공적으로 연결되었습니다!', [
            { text: '확인', onPress: () => router.replace('/(child)') },
          ]);
        }),
      );
    } catch (error) {
      let errorMessage = '연결 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('연결 실패', errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        
        {/* 헤더 */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Pressable 
            onPress={() => router.back()}
            className="p-2"
          >
            <FontAwesome5 name="arrow-left" size={20} color="#333" />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-medium text-gray-800">
            부모님 계정 연결
          </Text>
          <View style={{ width: 28 }} />
        </View>
        
        <View className="flex-1 p-6 justify-center items-center">
          {/* 아이콘 */}
          <View className="bg-[#E6F4D7] p-8 rounded-full mb-8">
            <FontAwesome5 
              name="users" 
              size={60} 
              color={Colors.light.primary}
            />
          </View>
          
          {/* 안내 텍스트 */}
          <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
            부모님 계정과 연결하기
          </Text>
          <Text className="text-center text-gray-500 mb-8 px-4">
            부모님이 제공한 6자리 연결 코드를 입력하세요.
            연결이 완료되면 약속과 스티커를 관리할 수 있어요.
          </Text>
          
          {/* 코드 입력 */}
          <TextInput
            className="bg-gray-100 w-3/4 h-20 rounded-2xl px-4 text-center text-3xl tracking-widest mb-8"
            value={connectionCode}
            onChangeText={(text) => setConnectionCode(text.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!isLoading}
          />
          
          {/* 연결 버튼 */}
          <Pressable
            className={`w-full py-4 rounded-xl ${
              connectionCode.length < 6 || isLoading
                ? 'bg-[#AEDBAE]'
                : 'bg-[#58CC02]'
            } shadow-sm`}
            onPress={handleConnect}
            disabled={connectionCode.length < 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                연결하기
              </Text>
            )}
          </Pressable>
          
          {/* 나중에 연결하기 옵션 */}
          <Pressable
            className="mt-4"
            onPress={() => router.replace('/(child)')}
          >
            <Text className="text-[#58CC02] text-center">
              나중에 연결하기
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}