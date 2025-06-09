// src/utils/notificationHelper.ts - 타입 오류 수정 버전
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface ScheduleNotificationProps {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
}

export class NotificationHelper {
  // 알림 권한 요청
  static async requestPermissionsAsync(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  }

  // 푸시 토큰 가져오기
  static async getPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissionsAsync();
      if (!hasPermission) return null;

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'f7541177-1d8c-456d-8f63-3d3fbcf26f31', // 실제 프로젝트 ID
      })).data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Getting push token failed:', error);
      return null;
    }
  }

  // 로컬 알림 설정
  static async scheduleNotification({
    title,
    body,
    data = {},
    trigger,
  }: ScheduleNotificationProps): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger,
    });
  }

  // 오늘 특정 시간에 알림 설정 (수정됨)
  static async scheduleNotificationToday(
    hour: number,
    minute: number,
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute
    );

    // 이미 지난 시간이면 다음 날로 설정
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return await this.scheduleNotification({
      title,
      body,
      data,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: false,
      },
    });
  }

  // 매일 특정 시간에 반복되는 알림 설정 (수정됨)
  static async scheduleDailyNotification(
    hour: number,
    minute: number,
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    return await this.scheduleNotification({
      title,
      body,
      data,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  }

  // 몇 초 후 알림 설정
  static async scheduleNotificationAfterSeconds(
    seconds: number,
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    return await this.scheduleNotification({
      title,
      body,
      data,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
  }

  // 특정 날짜와 시간에 알림 설정
  static async scheduleNotificationAtDate(
    date: Date,
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    return await this.scheduleNotification({
      title,
      body,
      data,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        
      },
    });
  }

  // 알림 취소
  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // 모든 알림 취소
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // 예약된 알림 목록 가져오기
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // 알림 설정
  static async setupNotifications(): Promise<void> {
    // 앱이 전면에 있을 때 알림 처리 방법 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,  // deprecated 경고 방지
        shouldShowList: true,
      }),
    });
  }

  // Android 알림 채널 설정
  static async setupAndroidChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본 알림',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#58CC02',
        sound: 'default',
        description: '기본 알림 채널',
      });

      await Notifications.setNotificationChannelAsync('promise', {
        name: '약속 알림',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#58CC02',
        sound: 'default',
        description: '약속 관련 알림',
      });

      await Notifications.setNotificationChannelAsync('reward', {
        name: '보상 알림',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFC800',
        sound: 'default',
        description: '보상 관련 알림',
      });
    }
  }

  // 알림 권한 상태 확인
  static async getPermissionStatus(): Promise<{
    status: string;
    canAskAgain: boolean;
  }> {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return { status, canAskAgain };
  }

  // 배지 숫자 설정
  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // 배지 숫자 지우기
  static async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // 즉시 알림 전송 (로컬)
  static async sendImmediateNotification(
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // 즉시 전송
    });
  }

  // 편의 메서드들
  static async schedulePromiseReminder(
    promiseTitle: string,
    reminderTime: Date,
    promiseId: string
  ): Promise<string> {
    return await this.scheduleNotificationAtDate(
      reminderTime,
      '약속 알림 📝',
      `"${promiseTitle}" 약속 시간이에요!`,
      {
        type: 'promise_reminder',
        promiseId,
      }
    );
  }

  static async scheduleRewardNotification(
    rewardTitle: string,
    childName: string
  ): Promise<string> {
    return await this.sendImmediateNotification(
      '보상 획득! 🎁',
      `${childName}님이 "${rewardTitle}" 보상을 받았어요!`,
      {
        type: 'reward_earned',
        rewardTitle,
        childName,
      }
    );
  }
}