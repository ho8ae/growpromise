// app/+not-found.tsx
import { Link, useRouter } from 'expo-router';
import { Text, View, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import SafeStatusBar from '../components/common/SafeStatusBar';
import { useAuthStore } from '../stores/authStore';

export default function NotFoundScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  // 자녀 계정인 경우 식물 관련 안내
  const isChildAccount = user?.userType === 'CHILD';
  
  return (
    <>
      <SafeStatusBar style="dark" backgroundColor="#FFFFFF" />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <FontAwesome5 
          name={isChildAccount ? "seedling" : "exclamation-circle"} 
          size={80} 
          color={isChildAccount ? "#58CC02" : "#FF4B4B"}
          className="mb-6"
        />
        
        <Text className="text-2xl font-bold text-center mb-3 text-gray-800">
          {isChildAccount 
            ? "새로운 식물을 키워보세요! 🌱" 
            : "앗! 페이지를 찾을 수 없어요"
          }
        </Text>
        
        <Text className="text-gray-600 text-center mb-8">
          {isChildAccount
            ? "이전 식물이 완성되었어요! 새로운 모험을 시작해보세요."
            : "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다."
          }
        </Text>
        
        {isChildAccount ? (
          <View className="w-full max-w-xs space-y-4">
            <Pressable
              className="bg-[#58CC02] py-4 px-6 rounded-xl"
              onPress={() => router.replace('/(child)/select-plant')}
            >
              <Text className="text-white font-bold text-base text-center">
                🌱 새 식물 선택하기
              </Text>
            </Pressable>
            
            <Pressable
              className="bg-yellow-500 py-4 px-6 rounded-xl"
              onPress={() => router.replace('/(child)/plant-collection')}
            >
              <Text className="text-white font-bold text-base text-center">
                📚 식물 도감 보기
              </Text>
            </Pressable>
            
            <Pressable
              className="bg-gray-400 py-3 px-6 rounded-xl"
              onPress={() => router.replace('/(tabs)')}
            >
              <Text className="text-white font-medium text-base text-center">
                🏠 홈으로 가기
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="bg-[#58CC02] py-3 px-6 rounded-xl"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="text-white font-bold text-base">
              홈으로 돌아가기
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );
}