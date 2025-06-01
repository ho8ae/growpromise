import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, AppState } from 'react-native';

// 알림 기본 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  isEnabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    isEnabled: false,
    permissionStatus: 'undetermined',
    canAskAgain: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 현재 알림 권한 상태 확인
  const checkPermissionStatus = async () => {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      
      const newSettings = {
        isEnabled: status === 'granted',
        permissionStatus: status,
        canAskAgain,
      };
      
      setSettings(newSettings);
      
      return { status, canAskAgain };
    } catch (error) {
      console.error('알림 권한 확인 오류:', error);
      return { status: 'denied' as const, canAskAgain: false };
    }
  };

  // Android 알림 채널 설정
  const setupAndroidNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: '기본 알림',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#58CC02',
          sound: 'default',
          description: '쑥쑥약속 기본 알림',
        });

        // 테스트용 채널 추가
        await Notifications.setNotificationChannelAsync('test', {
          name: '테스트 알림',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#58CC02',
          sound: 'default',
          description: '알림 테스트용 채널',
        });

        console.log('Android 알림 채널 설정 완료');
      } catch (error) {
        console.error('Android 알림 채널 설정 오류:', error);
      }
    }
  };

  // 알림 권한 요청
  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Android 채널 먼저 설정
      await setupAndroidNotificationChannel();
      
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      
      const newSettings = {
        isEnabled: status === 'granted',
        permissionStatus: status,
        canAskAgain,
      };
      
      setSettings(newSettings);
      
      if (status === 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('알림 권한 허용됨');
        return true;
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.log('알림 권한 거부됨:', status);
        return false;
      }
    } catch (error) {
      console.error('알림 권한 요청 오류:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 토글 처리
  const toggleNotifications = async (): Promise<boolean> => {
    const currentStatus = await checkPermissionStatus();
    
    if (currentStatus.status === 'granted') {
      // 이미 권한이 있는 경우 - 설정 앱으로 이동 안내
      showSettingsAlert();
      return false;
    } else if (currentStatus.status === 'denied' && !currentStatus.canAskAgain) {
      // 권한이 거부되었고 다시 요청할 수 없는 경우 - 설정 앱으로 이동 안내
      showSettingsAlert();
      return false;
    } else {
      // 권한 요청 가능한 경우
      return await requestPermission();
    }
  };

  // 설정 앱으로 이동 안내 알럿
  const showSettingsAlert = () => {
    Alert.alert(
      '알림 설정',
      '알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '설정으로 이동',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openSettings();
          },
        },
      ]
    );
  };

  // 테스트 알림 전송 (개선된 버전)
  const sendTestNotification = async () => {
    console.log('테스트 알림 전송 시도...');
    console.log('현재 권한 상태:', settings.permissionStatus);
    
    if (settings.permissionStatus !== 'granted') {
      Alert.alert('알림 권한 필요', '먼저 알림 권한을 허용해주세요.');
      return;
    }

    try {
      // 권한 재확인
      const { status } = await Notifications.getPermissionsAsync();
      console.log('재확인된 권한 상태:', status);
      
      if (status !== 'granted') {
        Alert.alert('알림 권한 필요', '알림 권한이 허용되지 않았습니다.');
        return;
      }

      // 테스트 알림 스케줄링
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 쑥쑥약속',
          body: '알림 테스트가 성공했어요!',
          sound: 'default',
          badge: 1,
          data: {
            type: 'test',
            timestamp: Date.now(),
          },
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          repeats: false,
        },
        identifier: `test-notification-${Date.now()}`,
      });
      
      console.log('알림 스케줄링 완료:', notificationId);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '테스트 알림 전송', 
        '2초 후 테스트 알림이 전송됩니다.\n\n앱을 백그라운드로 보내면 알림을 받을 수 있어요!',
        [
          {
            text: '확인',
            onPress: () => {
              // 개발 중에는 앱을 백그라운드로 보내는 것을 권장
              if (__DEV__) {
                console.log('개발 모드: 앱을 백그라운드로 보내서 알림을 확인해보세요.');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('테스트 알림 전송 오류:', error);
      Alert.alert('오류', `테스트 알림 전송에 실패했습니다.\n\n오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 즉시 테스트 알림 전송 (디버깅용)
  const sendImmediateTestNotification = async () => {
    console.log('즉시 테스트 알림 전송 시도...');
    
    if (settings.permissionStatus !== 'granted') {
      Alert.alert('알림 권한 필요', '먼저 알림 권한을 허용해주세요.');
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ 즉시 테스트',
          body: '즉시 알림 테스트입니다!',
          sound: 'default',
          badge: 1,
        },
        trigger: null, // 즉시 전송
        identifier: `immediate-test-${Date.now()}`,
      });
      
      console.log('즉시 알림 전송 완료:', notificationId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error('즉시 테스트 알림 오류:', error);
      Alert.alert('오류', `즉시 알림 전송 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 모든 예약된 알림 확인 (디버깅용)
  const checkScheduledNotifications = async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('예약된 알림 목록:', scheduled);
      
      if (scheduled.length === 0) {
        Alert.alert('알림 상태', '예약된 알림이 없습니다.');
      } else {
        Alert.alert(
          '예약된 알림', 
          `${scheduled.length}개의 알림이 예약되어 있습니다.\n\n콘솔에서 자세한 내용을 확인하세요.`
        );
      }
      
      return scheduled;
    } catch (error) {
      console.error('예약된 알림 확인 오류:', error);
      return [];
    }
  };

  // 알림 권한 상태 디버깅
  const debugPermissions = async () => {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      console.log('=== 알림 권한 디버깅 ===');
      console.log('전체 권한 정보:', permissions);
      console.log('상태:', permissions.status);
      console.log('다시 요청 가능:', permissions.canAskAgain);
      console.log('iOS 권한:', permissions.ios);
      console.log('Android 권한:', permissions.android);
      console.log('========================');
      
      Alert.alert(
        '권한 디버깅',
        `상태: ${permissions.status}\n다시 요청 가능: ${permissions.canAskAgain ? '예' : '아니오'}\n\n자세한 내용은 콘솔을 확인하세요.`
      );
      
    } catch (error) {
      console.error('권한 디버깅 오류:', error);
    }
  };

  // 초기 설정
  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('알림 시스템 초기화 시작...');
      
      // Android 채널 설정
      await setupAndroidNotificationChannel();
      
      // 권한 상태 확인
      await checkPermissionStatus();
      
      setIsLoading(false);
      console.log('알림 시스템 초기화 완료');
    };

    initializeNotifications();
  }, []);

  // 앱 상태 변화 감지
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // 앱이 포그라운드로 돌아올 때 권한 상태 재확인
        checkPermissionStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // 알림 응답 리스너
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('알림 응답 수신:', response);
        
        const { data } = response.notification.request.content;
        
        // 테스트 알림인 경우
        if (data?.type === 'test') {
          Alert.alert('알림 테스트', '테스트 알림을 성공적으로 받았습니다! 🎉');
        }
        
        // 다른 타입의 알림 처리...
      }
    );

    return () => subscription.remove();
  }, []);

  // 포그라운드 알림 리스너
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('포그라운드 알림 수신:', notification);
        
        // 포그라운드에서도 알림 표시하려면 여기서 처리
        const { data } = notification.request.content;
        
        if (data?.type === 'test') {
          // 테스트 알림은 간단한 알럿으로 표시
          setTimeout(() => {
            Alert.alert('테스트 알림', '포그라운드에서 알림을 받았습니다! 🎉');
          }, 100);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return {
    // 상태
    settings,
    isLoading,
    
    // 기본 함수들
    checkPermissionStatus,
    requestPermission,
    toggleNotifications,
    showSettingsAlert,
    sendTestNotification,
    
    // 디버깅/개발용 함수들
    sendImmediateTestNotification,
    checkScheduledNotifications,
    debugPermissions,
    setupAndroidNotificationChannel,
  };
};

// 알림 관련 유틸리티 함수들
export const notificationUtils = {
  // 권한 상태에 따른 텍스트 반환
  getStatusText: (status: 'granted' | 'denied' | 'undetermined') => {
    switch (status) {
      case 'granted': return '허용됨';
      case 'denied': return '거부됨';
      case 'undetermined': return '미설정';
      default: return '알 수 없음';
    }
  },
  
  // 권한 상태에 따른 색상 반환
  getStatusColor: (status: 'granted' | 'denied' | 'undetermined') => {
    switch (status) {
      case 'granted': return '#58CC02';
      case 'denied': return '#FF4B4B';
      case 'undetermined': return '#FFC800';
      default: return '#E5E5E5';
    }
  },
  
  // 알림 스케줄링을 위한 시간 계산
  getNotificationTrigger: (date: Date) => {
    const now = new Date();
    const triggerTime = date.getTime() - now.getTime();
    
    if (triggerTime <= 0) {
      // 과거 시간인 경우 1초 후 전송
      return { seconds: 1 };
    } else {
      // 미래 시간인 경우 해당 시간에 전송
      return { date };
    }
  },
  
  // 디버깅용 - 현재 시간 정보
  getCurrentTimeInfo: () => {
    const now = new Date();
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      local: now.toLocaleString(),
    };
  },
};