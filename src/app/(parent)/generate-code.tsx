import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Share,
  Clipboard
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import api from '../../api'; // 수정된 import
import { useLoading } from '../../hooks/useLoading';

export default function GenerateCodeScreen() {
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5분 = 300초
  const { isLoading, withLoading } = useLoading();
  
  // 연결 코드 생성
  const generateCode = async () => {
    try {
      await withLoading(api.auth.getParentConnectionCode().then(result => {
        setConnectionCode(result.code);
        setCountdown(300);
      }));
    } catch (error) {
      let errorMessage = '연결 코드 생성 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('오류', errorMessage);
    }
  };
  
  // 컴포넌트 마운트 시 코드 생성
  useEffect(() => {
    generateCode();
  }, []);
  
  // 카운트다운 타이머
  useEffect(() => {
    if (!connectionCode || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [connectionCode, countdown]);
  
  // 연결 코드 공유
  const shareCode = async () => {
    if (!connectionCode) return;
    
    try {
      await Share.share({
        message: `쑥쑥약속 앱 연결 코드: ${connectionCode}\n이 코드를 입력하여 계정을 연결해 주세요.`,
      });
    } catch (error) {
      console.error('공유 오류:', error);
    }
  };
  
  // 연결 코드 복사
  const copyCode = async () => {
    if (!connectionCode) return;
    
    try {
      await Clipboard.setString(connectionCode);
      Alert.alert('복사 완료', '연결 코드가 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('복사 오류:', error);
    }
  };
  
  // 분:초 형식으로 변환
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#10b981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>연결 코드 생성</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-child" size={80} color="#10b981" />
        </View>
        
        <Text style={styles.title}>아이 계정 연결</Text>
        <Text style={styles.description}>
          아이에게 아래 연결 코드를 알려주세요. 아이가 이 코드를 입력하면 계정이 연결됩니다.
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>연결 코드 생성 중...</Text>
          </View>
        ) : connectionCode ? (
          <>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>{connectionCode}</Text>
              <Text style={[
                styles.expiry,
                countdown <= 60 && styles.expiryWarning
              ]}>
                {countdown > 0 
                  ? `${formatTime(countdown)} 후 만료` 
                  : '만료됨 - 새 코드를 생성하세요'}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={copyCode}>
                <MaterialIcons name="content-copy" size={24} color="#10b981" />
                <Text style={styles.actionButtonText}>복사</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={shareCode}>
                <MaterialIcons name="share" size={24} color="#10b981" />
                <Text style={styles.actionButtonText}>공유</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>연결 코드를 생성할 수 없습니다.</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={generateCode}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>새 코드 생성</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          참고: 연결 코드는 5분 동안만 유효합니다.
        </Text>
      </View>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  code: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 8,
    marginBottom: 12,
  },
  expiry: {
    color: '#6b7280',
    fontSize: 14,
  },
  expiryWarning: {
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#10b981',
    marginLeft: 8,
  },
  errorContainer: {
    marginVertical: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
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
  note: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
  },
});