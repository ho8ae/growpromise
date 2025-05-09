import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api'; // 수정된 import
import { useLoading } from '../../hooks/useLoading';

export default function Connect() {
  const [connectionCode, setConnectionCode] = useState('');
  const { isLoading, withLoading } = useLoading();

  // 연결 코드 처리
  const handleConnect = async () => {
    if (connectionCode.length < 6) {
      Alert.alert('입력 오류', '유효한 연결 코드를 입력해주세요');
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#10b981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>부모님 계정 연결</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="account-tie"
              size={80}
              color="#10b981"
            />
          </View>

          <Text style={styles.title}>부모님 계정과 연결</Text>
          <Text style={styles.description}>
            부모님이 제공한 연결 코드를 입력하세요. 연결이 완료되면 약속과
            스티커를 관리할 수 있어요.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={connectionCode}
              onChangeText={(text) =>
                setConnectionCode(text.replace(/[^0-9]/g, ''))
              }
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (connectionCode.length < 6 || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleConnect}
            disabled={connectionCode.length < 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>연결하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#10b981',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    letterSpacing: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
