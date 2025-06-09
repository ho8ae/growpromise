// src/hooks/useNotifications.ts - React Query 완전 버전
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import api from '../api';
import { NotificationType } from '../api/modules/notification';
import { useAuthStore } from '../stores/authStore';
import {
  NotificationSettings,
  PushTokenInfo,
  notificationUtils,
} from '../utils/notificationUtils';

// 알림 기본 설정
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🔔 포그라운드 알림 처리:', notification.request.content);

    const { data } = notification.request.content;

    const shouldShow = true;

    const result = {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: shouldShow,
      shouldShowBanner: shouldShow,
      shouldShowList: shouldShow,
    };

    console.log('🔔 알림 표시 설정:', result);
    return result;
  },
});

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<NotificationSettings>({
    isEnabled: false,
    permissionStatus: 'undetermined',
    canAskAgain: true,
  });

  const [pushTokenInfo, setPushTokenInfo] = useState<PushTokenInfo>({
    token: null,
    isRegistered: false,
    lastUpdated: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  // 푸시 토큰 등록 시도 횟수 제한
  const tokenRegistrationAttempts = useRef(0);
  const maxRegistrationAttempts = 3;

  //  React Query로 읽지 않은 알림 수 관리
  const {
    data: unreadCount = 0,
    isLoading: isLoadingUnreadCount,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      if (!isAuthenticated) return 0;

      try {
        const response = await api.notification.getNotifications(false, 1, 0);

        // 앱 뱃지도 함께 업데이트
        await Notifications.setBadgeCountAsync(response.unreadCount);

        return response.unreadCount;
      } catch (error) {
        console.error('읽지 않은 알림 수 조회 오류:', error);
        return 0;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // 30초마다 자동 새로고침
    staleTime: 10000, // 10초간 데이터를 신선하다고 간주
  });

  //  알림 읽음 처리 Mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await api.notification.updateNotificationReadStatus(
        notificationId,
        true,
      );
    },
    onSuccess: () => {
      // 알림 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unreadCount'],
      });
    },
    onError: (error) => {
      console.error('알림 읽음 처리 오류:', error);
    },
  });

  //  모든 알림 읽음 처리 Mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await api.notification.markAllNotificationsAsRead();
    },
    onSuccess: async () => {
      // 배지 즉시 제거
      await Notifications.setBadgeCountAsync(0);

      // 알림 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unreadCount'],
      });
    },
    onError: (error) => {
      console.error('모든 알림 읽음 처리 오류:', error);
    },
  });

  // 현재 알림 권한 상태 확인
  const checkPermissionStatus = async () => {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();

      const newSettings = {
        isEnabled: status === 'granted',
        permissionStatus: status as 'granted' | 'denied' | 'undetermined',
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
        console.log('🤖 Android 알림 채널 설정 시작...');

        await Notifications.setNotificationChannelAsync('default', {
          name: '기본 알림',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#58CC02',
          sound: 'default',
          description: '쑥쑥약속 기본 알림',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('promise', {
          name: '약속 알림',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#58CC02',
          sound: 'default',
          description: '약속 생성, 인증, 승인 알림',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('reward', {
          name: '보상 알림',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFC800',
          sound: 'default',
          description: '스티커 및 보상 알림',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });

        console.log('✅ Android 알림 채널 설정 완료');
      } catch (error) {
        console.error('❌ Android 알림 채널 설정 오류:', error);
      }
    }
  };

  // 푸시 토큰 가져오기 및 서버 등록
  const registerPushToken = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.log('인증되지 않은 사용자 - 푸시 토큰 등록 건너뜀');
      return false;
    }

    if (tokenRegistrationAttempts.current >= maxRegistrationAttempts) {
      console.log('푸시 토큰 등록 최대 시도 횟수 초과');
      return false;
    }

    try {
      tokenRegistrationAttempts.current += 1;
      console.log(
        `푸시 토큰 등록 시도 ${tokenRegistrationAttempts.current}/${maxRegistrationAttempts}`,
      );

      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
        {
          projectId: 'f7541177-1d8c-456d-8f63-3d3fbcf26f31',
        },
      );

      console.log('Expo 푸시 토큰 획득:', expoPushToken);

      if (!notificationUtils.isValidExpoPushToken(expoPushToken)) {
        console.error('유효하지 않은 푸시 토큰 형식:', expoPushToken);
        return false;
      }

      await api.user.updatePushToken({ expoPushToken });

      setPushTokenInfo({
        token: expoPushToken,
        isRegistered: true,
        lastUpdated: new Date().toISOString(),
      });

      console.log('푸시 토큰 서버 등록 완료');
      return true;
    } catch (error) {
      console.error(
        `푸시 토큰 등록 오류 (시도 ${tokenRegistrationAttempts.current}):`,
        error,
      );

      setPushTokenInfo((prev) => ({
        ...prev,
        isRegistered: false,
      }));

      if (tokenRegistrationAttempts.current >= maxRegistrationAttempts) {
        console.error('푸시 토큰 등록 최종 실패');
      }

      return false;
    }
  }, [isAuthenticated, user]);

  // 알림 권한 요청
  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      await setupAndroidNotificationChannel();

      const { status, canAskAgain } =
        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

      const newSettings = {
        isEnabled: status === 'granted',
        permissionStatus: status as 'granted' | 'denied' | 'undetermined',
        canAskAgain,
      };

      setSettings(newSettings);

      if (status === 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('알림 권한 허용됨');

        await registerPushToken();

        //  권한 획득 후 즉시 읽지 않은 알림 수 조회
        refetchUnreadCount();

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
      showSettingsAlert();
      return false;
    } else if (
      currentStatus.status === 'denied' &&
      !currentStatus.canAskAgain
    ) {
      showSettingsAlert();
      return false;
    } else {
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
      ],
    );
  };

  //  개선된 읽지 않은 알림 수 업데이트 함수
  const updateUnreadCount = useCallback(async () => {
    await refetchUnreadCount();
  }, [refetchUnreadCount]);

  //  개선된 알림 읽음 처리
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation],
  );

  //  개선된 모든 알림 읽음 처리
  const markAllNotificationsAsRead = useCallback(async () => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  // 테스트 알림 전송
  const sendTestNotification = async () => {
    console.log('=== 서버 푸시 테스트 시작 ===');
    console.log('권한 상태:', settings.permissionStatus);
    console.log('토큰 등록 상태:', pushTokenInfo.isRegistered);

    if (settings.permissionStatus !== 'granted') {
      Alert.alert('알림 권한 필요', '먼저 알림 권한을 허용해주세요.');
      return;
    }

    if (!pushTokenInfo.isRegistered) {
      Alert.alert(
        '푸시 토큰 미등록',
        '푸시 토큰이 서버에 등록되지 않았습니다. 잠시 후 다시 시도해주세요.',
      );
      return;
    }

    try {
      console.log('API 호출 시작...');
      await api.user.sendTestPushNotification();

      console.log('API 호출 성공!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '테스트 알림 전송',
        '서버에서 푸시 알림을 전송했습니다!\n\n앱을 백그라운드로 보내면 알림을 받을 수 있어요.',
      );

      //  테스트 알림 후 읽지 않은 수 새로고침
      setTimeout(() => {
        refetchUnreadCount();
      }, 2000);
    } catch (error) {
      console.error('API 호출 실패:', error);
      Alert.alert(
        '오류',
        `테스트 알림 전송에 실패했습니다.\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      );
    }
  };

  // 로컬 테스트 알림
  const sendLocalTestNotification = async () => {
    if (settings.permissionStatus !== 'granted') {
      Alert.alert('알림 권한 필요', '먼저 알림 권한을 허용해주세요.');
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 로컬 테스트',
          body: '로컬에서 전송된 테스트 알림입니다.',
          sound: 'default',
          badge: 1,
          data: {
            type: 'local_test',
            timestamp: Date.now(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          repeats: false,
        },
        identifier: `local-test-${Date.now()}`,
      });

      console.log('로컬 테스트 알림 스케줄링 완료:', notificationId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        '로컬 테스트 알림',
        '2초 후 로컬 테스트 알림이 전송됩니다!\n\n앱을 백그라운드로 보내면 알림을 받을 수 있어요.',
      );
    } catch (error) {
      console.error('로컬 테스트 알림 오류:', error);
    }
  };

  // 즉시 테스트 알림
  const sendImmediateTestNotification = async () => {
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
          data: {
            type: 'immediate_test',
            timestamp: Date.now(),
          },
        },
        trigger: null,
        identifier: `immediate-test-${Date.now()}`,
      });

      console.log('즉시 알림 전송 완료:', notificationId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('즉시 테스트 알림 오류:', error);
    }
  };

  // 단계별 알림 테스트
  const runDiagnosticTest = async () => {
    console.log('🔍 === 알림 진단 테스트 시작 ===');

    try {
      const permissions = await Notifications.getPermissionsAsync();
      console.log('1️⃣ 권한 상태:', permissions);

      if (permissions.status !== 'granted') {
        Alert.alert(
          '진단 결과',
          '❌ 알림 권한이 허용되지 않았습니다.\n설정에서 알림 권한을 허용해주세요.',
        );
        return;
      }

      console.log('2️⃣ 푸시 토큰 상태:', pushTokenInfo);

      console.log('3️⃣ 즉시 로컬 알림 전송...');
      const immediateId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 즉시 테스트',
          body: '즉시 알림이 정상적으로 작동합니다!',
          sound: 'default',
          badge: 1,
          data: { type: 'diagnostic_immediate' },
        },
        trigger: null,
      });
      console.log('✅ 즉시 알림 ID:', immediateId);

      console.log('4️⃣ 3초 후 로컬 알림 전송...');
      const delayedId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ 지연 테스트',
          body: '3초 지연 알림이 정상적으로 작동합니다!',
          sound: 'default',
          badge: 2,
          data: { type: 'diagnostic_delayed' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
          repeats: false,
        },
      });
      console.log('✅ 지연 알림 ID:', delayedId);

      if (pushTokenInfo.isRegistered) {
        console.log('5️⃣ 서버 푸시 테스트...');
        try {
          await api.user.sendTestPushNotification();
          console.log('✅ 서버 푸시 요청 전송 완료');
        } catch (error) {
          console.error('❌ 서버 푸시 테스트 실패:', error);
        }
      }

      Alert.alert(
        '진단 테스트 완료',
        `✅ 즉시 알림: 전송됨\n⏰ 3초 후 알림: 예약됨\n${pushTokenInfo.isRegistered ? '🚀 서버 푸시: 요청됨' : '⚠️ 서버 푸시: 토큰 미등록'}\n\n앱을 백그라운드로 보내면 배너 알림을 확인할 수 있습니다.`,
      );
    } catch (error) {
      console.error('❌ 진단 테스트 오류:', error);
      Alert.alert(
        '진단 실패',
        `테스트 중 오류가 발생했습니다:\n${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      );
    }

    console.log('🔍 === 알림 진단 테스트 완료 ===');
  };

  // 채널별 테스트 (Android용)
  const testNotificationChannels = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        '안드로이드 전용',
        'Android에서만 사용할 수 있는 기능입니다.',
      );
      return;
    }

    try {
      console.log('📱 Android 채널별 알림 테스트 시작...');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📱 기본 채널 테스트',
          body: '기본 채널로 전송된 알림입니다.',
          sound: 'default',
          data: { type: 'channel_test_default' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
        identifier: `channel-test-default-${Date.now()}`,
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📝 약속 채널 테스트',
          body: '약속 채널로 전송된 알림입니다.',
          sound: 'default',
          data: { type: 'channel_test_promise' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
          repeats: false,
        },
        identifier: `channel-test-promise-${Date.now()}`,
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎁 보상 채널 테스트',
          body: '보상 채널로 전송된 알림입니다.',
          sound: 'default',
          data: { type: 'channel_test_reward' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        },
        identifier: `channel-test-reward-${Date.now()}`,
      });

      Alert.alert(
        '채널 테스트 시작',
        '1초, 3초, 5초 간격으로 각 채널의 알림이 전송됩니다.\n\n앱을 백그라운드로 보내서 확인해보세요!',
      );
    } catch (error) {
      console.error('채널 테스트 오류:', error);
      Alert.alert('테스트 실패', '채널 테스트 중 오류가 발생했습니다.');
    }
  };

  // 예약된 알림 확인
  const checkScheduledNotifications = async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('예약된 알림 목록:', scheduled);

      if (scheduled.length === 0) {
        Alert.alert('알림 상태', '예약된 알림이 없습니다.');
      } else {
        Alert.alert(
          '예약된 알림',
          `${scheduled.length}개의 알림이 예약되어 있습니다.\n\n콘솔에서 자세한 내용을 확인하세요.`,
        );
      }

      return scheduled;
    } catch (error) {
      console.error('예약된 알림 확인 오류:', error);
      return [];
    }
  };

  // 푸시 토큰 상태 디버깅
  const debugPushToken = async () => {
    try {
      console.log('=== 푸시 토큰 디버깅 ===');
      console.log('현재 토큰 정보:', pushTokenInfo);
      console.log('인증 상태:', isAuthenticated);
      console.log('사용자 정보:', user?.username);
      console.log('등록 시도 횟수:', tokenRegistrationAttempts.current);

      if (pushTokenInfo.token) {
        console.log('토큰 길이:', pushTokenInfo.token.length);
        console.log(
          '토큰 앞부분:',
          pushTokenInfo.token.substring(0, 50) + '...',
        );
        console.log(
          '토큰 유효성:',
          notificationUtils.isValidExpoPushToken(pushTokenInfo.token),
        );
      }

      if (isAuthenticated) {
        try {
          const serverSettings = await api.user.getNotificationSettings();
          console.log('서버 알림 설정:', serverSettings);

          Alert.alert(
            '푸시 토큰 디버깅',
            `로컬 등록: ${pushTokenInfo.isRegistered ? '완료' : '미완료'}\n서버 토큰: ${serverSettings.hasToken ? '있음' : '없음'}\n서버 활성화: ${serverSettings.isEnabled ? '예' : '아니오'}\n토큰 유효성: ${pushTokenInfo.token ? (notificationUtils.isValidExpoPushToken(pushTokenInfo.token) ? '유효' : '무효') : '없음'}\n\n자세한 내용은 콘솔을 확인하세요.`,
          );
        } catch (error) {
          console.error('서버 알림 설정 확인 오류:', error);
          Alert.alert(
            '디버깅',
            '로컬 정보만 확인됨\n\n자세한 내용은 콘솔을 확인하세요.',
          );
        }
      }

      console.log('========================');
    } catch (error) {
      console.error('푸시 토큰 디버깅 오류:', error);
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
        `상태: ${permissions.status}\n다시 요청 가능: ${permissions.canAskAgain ? '예' : '아니오'}\n\n자세한 내용은 콘솔을 확인하세요.`,
      );
    } catch (error) {
      console.error('권한 디버깅 오류:', error);
    }
  };

  // 초기 설정
  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('알림 시스템 초기화 시작...');

      await setupAndroidNotificationChannel();

      const { status } = await checkPermissionStatus();

      if (status === 'granted' && isAuthenticated && user) {
        await registerPushToken();
        // React Query가 자동으로 데이터를 가져오므로 별도 호출 불필요
      }

      setIsLoading(false);
      console.log('알림 시스템 초기화 완료');
    };

    initializeNotifications();
  }, [isAuthenticated, user]);

  // 앱 상태 변화 감지
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        checkPermissionStatus();

        //  앱이 활성화될 때 읽지 않은 알림 수 새로고침
        refetchUnreadCount();

        if (
          isAuthenticated &&
          settings.permissionStatus === 'granted' &&
          !pushTokenInfo.isRegistered
        ) {
          registerPushToken();
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [
    isAuthenticated,
    settings.permissionStatus,
    pushTokenInfo.isRegistered,
    refetchUnreadCount,
  ]);

  //  알림 응답 리스너 (사용자가 알림을 탭했을 때) - 끊어진 부분부터 완성
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('📱 알림 응답 수신:', response);

        const { data } = response.notification.request.content;

        // 햅틱 피드백
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        //  서버 알림인 경우 읽음 처리 (React Query 활용)
        if (data?.notificationId) {
          await markNotificationAsRead(data.notificationId as string);
        }

        //  즉시 읽지 않은 알림 수 업데이트
        refetchUnreadCount();

        // 알림 타입에 따른 라우팅 처리
        switch (data?.type as NotificationType) {
          case NotificationType.PROMISE_CREATED:
            console.log('📝 약속 생성 알림 - 약속 상세 화면으로 이동');
            // router.push(`/(tabs)/`);
            break;

          case NotificationType.PROMISE_VERIFIED:
            console.log('✅ 약속 인증 알림 - 인증 확인 화면으로 이동');
            // TODO: router.push(`/promise/${data.promiseId}/verification`);
            break;

          case NotificationType.PROMISE_APPROVED:
            console.log('👏 약속 승인 알림 - 보상 화면으로 이동');
            // TODO: router.push(`/promise/${data.promiseId}/reward`);
            break;

          case NotificationType.REWARD_EARNED:
            console.log('🎁 보상 획득 알림 - 보상 화면으로 이동');
            // TODO: router.push('/rewards');
            break;

          case NotificationType.PROMISE_REJECTED:
            console.log('약속 승인 거절');
            // TODO: router.push('/promises');
            break;

          case NotificationType.SYSTEM:
            console.log('시스템 알림 !');
            // TODO: router.push('/promises');
            break;

          default:
            console.log('🔔 기타 알림 수신:', data);
            if (data?.redirectUrl) {
              console.log('🔗 리다이렉트 URL:', data.redirectUrl);
              // TODO: 딥링크 처리
            }
        }
      },
    );

    return () => subscription.remove();
  }, [markNotificationAsRead, refetchUnreadCount]);

  //  포그라운드 알림 리스너 (앱이 열려있을 때 알림 수신)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('🔔 포그라운드 알림 수신:', notification);

        const { data } = notification.request.content;

        //  서버 알림인 경우 즉시 읽지 않은 수 업데이트
        if (
          data?.type !== 'test' &&
          data?.type !== 'local_test' &&
          data?.type !== 'immediate_test'
        ) {
          // 잠시 대기 후 업데이트 (서버 처리 시간 고려)
          setTimeout(() => {
            refetchUnreadCount();
          }, 1000);
        }

        //  테스트 알림의 경우 포그라운드에서도 시각적 피드백 제공
        if (
          data?.type === 'test' ||
          data?.type === 'local_test' ||
          data?.type === 'immediate_test'
        ) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          setTimeout(() => {
            Alert.alert(
              '🧪 포그라운드 테스트',
              '앱이 열려있는 상태에서 알림을 받았습니다!\n\n백그라운드 알림도 정상적으로 작동할 거예요.',
              [
                {
                  text: '좋아요!',
                  onPress: () => console.log('포그라운드 테스트 알림 확인됨'),
                },
              ],
            );
          }, 100);
        }

        //  중요한 알림의 경우 추가 햅틱 피드백
        if (
          data?.type === 'promise_approved' ||
          data?.type === 'reward_earned'
        ) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
    );

    return () => subscription.remove();
  }, [refetchUnreadCount]);

  //  인증 상태 변화 감지 및 자동 설정
  useEffect(() => {
    if (isAuthenticated && settings.permissionStatus === 'granted') {
      // 로그인 후 권한이 있으면 푸시 토큰 등록 및 알림 수 조회
      registerPushToken();
      refetchUnreadCount();
    } else if (!isAuthenticated) {
      // 로그아웃 시 상태 초기화
      setPushTokenInfo({
        token: null,
        isRegistered: false,
        lastUpdated: null,
      });
      tokenRegistrationAttempts.current = 0;

      //  배지 및 쿼리 상태 초기화
      Notifications.setBadgeCountAsync(0);
      queryClient.setQueryData(['notifications', 'unreadCount'], 0);
    }
  }, [
    isAuthenticated,
    settings.permissionStatus,
    registerPushToken,
    refetchUnreadCount,
    queryClient,
  ]);

  return {
    //  상태 (React Query 데이터 포함)
    settings,
    pushTokenInfo,
    unreadCount,
    isLoading,
    isLoadingUnreadCount,

    //  기본 함수들
    checkPermissionStatus,
    requestPermission,
    toggleNotifications,
    showSettingsAlert,
    registerPushToken,

    //  알림 관리 (React Query 기반)
    updateUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refetchUnreadCount,

    //  테스트 함수들 (개발/디버깅용)
    sendTestNotification,
    sendLocalTestNotification,
    sendImmediateTestNotification,
    checkScheduledNotifications,
    runDiagnosticTest,
    testNotificationChannels,

    //  디버깅 함수들
    debugPermissions,
    debugPushToken,
    setupAndroidNotificationChannel,

    //  React Query mutation 상태
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

//  타입과 유틸리티 함수들을 함께 export
export { NotificationSettings, PushTokenInfo, notificationUtils };
