import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // flower 아이콘을 사용할 수 있는 아이콘 세트로 변경

export default function Connect() {
  const [connectionCode, setConnectionCode] = useState('');
  
  const handleConnect = () => {
    // 연결 코드 처리 로직
    console.log('연결 코드:', connectionCode);
    
    // 성공 시 적절한 화면으로 이동
    // 예: 아이 계정이면 아이 메인 화면으로, 부모 계정이면 부모 메인 화면으로
    router.replace('/(tabs)');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="flower" size={80} color="#4f46e5" />
      </View>
      
      <Text style={styles.title}>계정 연결</Text>
      <Text style={styles.description}>
        부모님 또는 아이의 계정과 연결하려면 상대방이 제공한 연결 코드를 입력하세요.
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={connectionCode}
          onChangeText={setConnectionCode}
          placeholder="연결 코드 입력"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
      </View>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          connectionCode.length < 6 && styles.buttonDisabled
        ]} 
        onPress={handleConnect}
        disabled={connectionCode.length < 6}
      >
        <Text style={styles.buttonText}>연결하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
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
    color: '#4f46e5',
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
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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