import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean>(true);  // 기본값을 true로 설정
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // 초기 상태 확인
    const checkInitialConnection = async () => {
      try {
        const state = await NetInfo.fetch();
        // isConnected가 null이면 연결된 것으로 간주 (일부 기기에서 null을 반환할 수 있음)
        setIsConnected(state.isConnected !== false);
        setIsInternetReachable(state.isInternetReachable);
        setConnectionType(state.type);
        
        console.log('현재 네트워크 상태:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type
        });
      } catch (error) {
        console.error('네트워크 상태 확인 오류:', error);
        // 오류가 발생해도 기본적으로 연결된 것으로 간주
        setIsConnected(true);
      }
    };
    
    checkInitialConnection();

    // 상태 변화 구독
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // isConnected가 null이면 연결된 것으로 간주
      setIsConnected(state.isConnected !== false);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      
      console.log('네트워크 상태 변경:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      });
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isInternetReachable,
    connectionType,
  };
}