import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect to login screen when accessing the auth directory directly
  return <Redirect href="/(auth)/login" />;
}