// src/components/common/ConnectPrompt.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

interface ConnectPromptProps {
  onClose?: () => void;
}

export default function ConnectPrompt({ onClose }: ConnectPromptProps) {
  const { user } = useAuthStore();
  
  const isParent = user?.userType === 'PARENT';
  
  const handleAction = () => {
    if (isParent) {
      // 부모 계정은 코드 생성 화면으로 이동
      router.push('/(parent)/generate-code');
    } else {
      // 자녀 계정은 코드 입력 화면으로 이동
      router.push('/(auth)/connect');
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={isParent ? "account-child" : "account-tie"} 
          size={60} 
          color="#10b981" 
        />
      </View>
      
      <Text style={styles.title}>
        {isParent ? '아이 계정을 연결해 보세요!' : '부모님 계정을 연결해 보세요!'}
      </Text>
      
      <Text style={styles.description}>
        {isParent 
          ? '아이 계정과 연결하면 약속을 만들고 관리할 수 있어요.' 
          : '부모님 계정과 연결하면 약속을 인증하고 스티커를 모을 수 있어요.'}
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleAction}>
        <Text style={styles.buttonText}>
          {isParent ? '연결 코드 생성하기' : '연결 코드 입력하기'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    margin: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});