import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 스플래시 화면 유지
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // // 폰트 로딩
  // const [fontsLoaded] = useFonts({
  //   'PukiFont': require('../assets/fonts/Poppins-Bold.ttf'), // 실제 폰트로 교체 필요
  //   'PukiFont-Medium': require('../assets/fonts/Poppins-Medium.ttf'), // 실제 폰트로 교체 필요
  //   'PukiFont-Regular': require('../assets/fonts/Poppins-Regular.ttf'), // 실제 폰트로 교체 필요
  // });

  // // 폰트 로딩 완료 시 스플래시 스크린 숨기기
  // useEffect(() => {
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  // // 폰트가 로드되지 않았으면 아무것도 렌더링하지 않음
  // if (!fontsLoaded) {
  //   return null;
  // }

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8FAFF' }, // 앱 배경색을 밝은 파스텔 색상으로 변경
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        <Stack.Screen
          name="(parent)"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="(child)"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
