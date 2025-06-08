// src/app/(settings)/app-info.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const appInfo = {
  name: '쑥쑥약속',
  version: '1.0.0',
  buildNumber: '1',
  description: '부모와 아이를 위한 약속 관리 앱',
  developer: 'GrowPromise Team',
  website: 'https://whoiswhat.vercel.app/',
  supportEmail: 'whoiswhat.team@gmail.com',
  privacyPolicy: 'https://growpromise.com/privacy',
  termsOfService: 'https://growpromise.com/terms',
};

const openSourceLicenses = [
  {
    name: 'React Native',
    version: '0.74.0',
    license: 'MIT',
    url: 'https://github.com/facebook/react-native',
  },
  {
    name: 'Expo',
    version: '~51.0.0',
    license: 'MIT',
    url: 'https://github.com/expo/expo',
  },
  {
    name: 'React Navigation',
    version: '6.x',
    license: 'MIT',
    url: 'https://github.com/react-navigation/react-navigation',
  },
  {
    name: 'Zustand',
    version: '4.x',
    license: 'MIT',
    url: 'https://github.com/pmndrs/zustand',
  },
  {
    name: 'TanStack Query',
    version: '5.x',
    license: 'MIT',
    url: 'https://github.com/TanStack/query',
  },
  {
    name: 'NativeWind',
    version: '4.x',
    license: 'MIT',
    url: 'https://github.com/nativewind/nativewind',
  },
];

export default function AppInfoScreen() {
  const router = useRouter();
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  React.useEffect(() => {
    const getDeviceInfo = async () => {
      const info = {
        deviceName: Device.deviceName || 'Unknown',
        brand: Device.brand || 'Unknown',
        modelName: Device.modelName || 'Unknown',
        osName: Device.osName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
        platformApiLevel: Device.platformApiLevel || 'Unknown',
        totalMemory: Device.totalMemory
          ? `${Math.round(Device.totalMemory / 1024 / 1024 / 1024)}GB`
          : 'Unknown',
        appVersion: Application.nativeApplicationVersion || 'Unknown',
        buildVersion: Application.nativeBuildVersion || 'Unknown',
      };
      setDeviceInfo(info);
    };

    getDeviceInfo();
  }, []);

  const handleLinkPress = async (url: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('링크 열기 오류:', error);
      Alert.alert('오류', '링크를 열 수 없습니다.');
    }
  };

  const handleShareApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const storeUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/id[APP_ID]' // 실제 App Store ID로 변경 필요
          : 'https://play.google.com/store/apps/details?id=com.low_k.growpromise';

      await Share.share({
        message: `쑥쑥약속 - 부모와 아이를 위한 약속 관리 앱\n\n${storeUrl}`,
        title: '쑥쑥약속 앱 공유',
        url: storeUrl,
      });
    } catch (error) {
      console.error('앱 공유 오류:', error);
    }
  };

  const handleRateApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const storeUrl =
        Platform.OS === 'ios'
          ? 'itms-apps://itunes.apple.com/app/id[APP_ID]?action=write-review'
          : 'market://details?id=com.low_k.growpromise';

      const canOpen = await Linking.canOpenURL(storeUrl);

      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        const webUrl =
          Platform.OS === 'ios'
            ? 'https://apps.apple.com/app/id[APP_ID]'
            : 'https://play.google.com/store/apps/details?id=com.low_k.growpromise';
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('평점 주기 오류:', error);
      Alert.alert('오류', '앱스토어로 이동할 수 없습니다.');
    }
  };

  const handleLicensePress = (license: (typeof openSourceLicenses)[0]) => {
    Alert.alert(
      license.name,
      `버전: ${license.version}\n라이센스: ${license.license}\n\n오픈소스 라이브러리 페이지를 열까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '열기',
          onPress: () => handleLinkPress(license.url),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 p-2 rounded-full"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </Pressable>
        <Text
          className="text-lg font-bold flex-1"
          style={{ color: Colors.light.text }}
        >
          앱 정보
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 앱 기본 정보 */}
        <View className="items-center pt-6 pb-4">
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ width: 80, height: 80 }}
            className="rounded-2xl mb-4"
          />
          <Text
            className="text-2xl font-bold"
            style={{ color: Colors.light.text }}
          >
            {appInfo.name}
          </Text>
          <Text
            className="text-base mt-1"
            style={{ color: Colors.light.textSecondary }}
          >
            버전 {appInfo.version} ({appInfo.buildNumber})
          </Text>
          <Text
            className="text-sm mt-2 text-center px-6"
            style={{ color: Colors.light.textSecondary }}
          >
            {appInfo.description}
          </Text>
        </View>

        {/* 앱 액션 */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Pressable
              onPress={handleRateApp}
              className="flex-row items-center p-4 active:bg-gray-50"
            >
              <View
                className="p-3 rounded-full mr-4"
                style={{ backgroundColor: `${Colors.light.secondary}15` }}
              >
                <Ionicons
                  name="star-outline"
                  size={20}
                  color={Colors.light.secondary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium"
                  style={{ color: Colors.light.text }}
                >
                  앱 평가하기
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: Colors.light.textSecondary }}
                >
                  앱스토어에서 별점과 리뷰를 남겨주세요
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.light.textSecondary}
              />
            </Pressable>

            <View className="h-px bg-gray-100 mx-4" />

            <Pressable
              onPress={handleShareApp}
              className="flex-row items-center p-4 active:bg-gray-50"
            >
              <View
                className="p-3 rounded-full mr-4"
                style={{ backgroundColor: `${Colors.light.primary}15` }}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium"
                  style={{ color: Colors.light.text }}
                >
                  앱 공유하기
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: Colors.light.textSecondary }}
                >
                  친구들에게 쑥쑥약속을 추천해주세요
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.light.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* 개발자 정보 */}
        <View className="mx-4 mb-6">
          <Text
            className="text-base font-bold mb-3"
            style={{ color: Colors.light.text }}
          >
            개발자 정보
          </Text>
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.light.text }}
              >
                개발팀
              </Text>
              <Text
                className="text-sm"
                style={{ color: Colors.light.textSecondary }}
              >
                {appInfo.developer}
              </Text>
            </View>

            <Pressable
              onPress={() => handleLinkPress(`mailto:${appInfo.supportEmail}`)}
              className="flex-row items-center justify-between mb-3 active:opacity-70"
            >
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.light.text }}
              >
                지원 이메일
              </Text>
              <Text className="text-sm" style={{ color: Colors.light.info }}>
                {appInfo.supportEmail}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleLinkPress(appInfo.website)}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.light.text }}
              >
                웹사이트
              </Text>
              <Text className="text-sm" style={{ color: Colors.light.info }}>
                {appInfo.website}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 기기 정보
        {deviceInfo && (
          <View className="mx-4 mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: Colors.light.text }}
            >
              기기 정보
            </Text>
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.light.textSecondary }}
                >
                  기기명
                </Text>
                <Text className="text-sm" style={{ color: Colors.light.text }}>
                  {deviceInfo.deviceName}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.light.textSecondary }}
                >
                  제조사
                </Text>
                <Text className="text-sm" style={{ color: Colors.light.text }}>
                  {deviceInfo.brand}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.light.textSecondary }}
                >
                  모델
                </Text>
                <Text className="text-sm" style={{ color: Colors.light.text }}>
                  {deviceInfo.modelName}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.light.textSecondary }}
                >
                  OS
                </Text>
                <Text className="text-sm" style={{ color: Colors.light.text }}>
                  {deviceInfo.osName} {deviceInfo.osVersion}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.light.textSecondary }}
                >
                  메모리
                </Text>
                <Text className="text-sm" style={{ color: Colors.light.text }}>
                  {deviceInfo.totalMemory}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-sm"
                  style={{ color: Colors.light.textSecondary }}
                >
                  앱 버전
                </Text>
                <Text className="text-sm" style={{ color: Colors.light.text }}>
                  {deviceInfo.appVersion} ({deviceInfo.buildVersion})
                </Text>
              </View>
            </View>
          </View>
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
}
