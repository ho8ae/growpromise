// app/+not-found.tsx
import { Link } from 'expo-router';
import { Text, View, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import SafeStatusBar from '../components/common/SafeStatusBar';

export default function NotFoundScreen() {
  return (
    <>
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <FontAwesome5 
          name="exclamation-circle" 
          size={80} 
          color="#FF4B4B" 
          className="mb-6"
        />
        
        <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
          앗! 페이지를 찾을 수 없어요
        </Text>
        
        <Text className="text-gray-600 text-center mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </Text>
        
        <Pressable
          className="bg-[#58CC02] py-3 px-6 rounded-xl"
        >
          <Link href="/(tabs)" className="no-underline">
            <Text className="text-white font-bold text-base">
              홈으로 돌아가기
            </Text>
          </Link>
        </Pressable>
        
        <Pressable className="mt-4">
          <Link href="/(auth)/login" className="no-underline">
            <Text className="text-[#58CC02]">
              로그인 화면으로 이동
            </Text>
          </Link>
        </Pressable>
      </View>
    </>
  );
}