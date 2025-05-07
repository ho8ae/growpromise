import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: '로그인',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: '회원가입',
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: '비밀번호 재설정',
        }}
      />
      <Stack.Screen
        name="connect"
        options={{
          title: '계정 연결',
        }}
      />
    </Stack>
  );
}