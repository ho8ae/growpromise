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
        projectId: '프로젝트ID', // 실제 Expo 프로젝트 ID로 대체해야 함
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
        sound: true,
      },
      trigger,
    });
  }

  // 오늘 특정 시간에 알림 설정
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
        type: 'calendar',
        hour,
        minute,
      },
    });
  }

  // 매일 특정 시간에 반복되는 알림 설정
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
        type: 'calendar',
        hour,
        minute,
        repeats: true,
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

  // 알림 설정
  static async setupNotifications(): Promise<void> {
    // 앱이 전면에 있을 때 알림 처리 방법 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
}