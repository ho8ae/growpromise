import apiClient, { ApiResponse, apiRequest } from '../client';

// 알림 타입
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  PROMISE_CREATED = 'PROMISE_CREATED',
  PROMISE_VERIFIED = 'PROMISE_VERIFIED',
  PROMISE_APPROVED = 'PROMISE_APPROVED',
  PROMISE_REJECTED = 'PROMISE_REJECTED',
  REWARD_EARNED = 'REWARD_EARNED'
}

// 알림 타입
export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  notificationType: NotificationType;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

// 알림 목록 응답 타입
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

// 알림 API 함수들
const notificationApi = {
  // 알림 목록 조회
  getNotifications: async (
    isRead?: boolean,
    limit: number = 20,
    offset: number = 0
  ): Promise<NotificationListResponse> => {
    try {
      let url = `/notifications?limit=${limit}&offset=${offset}`;
      if (isRead !== undefined) {
        url += `&isRead=${isRead}`;
      }
      
      return await apiRequest<NotificationListResponse>('get', url);
    } catch (error) {
      console.error('알림 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // 알림 상세 조회
  getNotificationById: async (id: string): Promise<Notification> => {
    try {
      return await apiRequest<Notification>('get', `/notifications/${id}`);
    } catch (error) {
      console.error('알림 상세 조회 오류:', error);
      throw error;
    }
  },
  
  // 알림 읽음 상태 업데이트
  updateNotificationReadStatus: async (id: string, isRead: boolean): Promise<Notification> => {
    try {
      return await apiRequest<Notification>('put', `/notifications/${id}/read`, { isRead });
    } catch (error) {
      console.error('알림 읽음 상태 업데이트 오류:', error);
      throw error;
    }
  },
  
  // 알림 여러 개 읽음 상태 업데이트
  updateMultipleNotificationsReadStatus: async (
    notificationIds: string[],
    isRead: boolean
  ): Promise<{ updatedCount: number }> => {
    try {
      return await apiRequest<{ updatedCount: number }>(
        'put',
        `/notifications/batch/read`,
        { notificationIds, isRead }
      );
    } catch (error) {
      console.error('알림 일괄 읽음 상태 업데이트 오류:', error);
      throw error;
    }
  },
  
  // 모든 알림 읽음으로 표시
  markAllNotificationsAsRead: async (): Promise<{ updatedCount: number }> => {
    try {
      return await apiRequest<{ updatedCount: number }>('put', `/notifications/all/read`, {});
    } catch (error) {
      console.error('모든 알림 읽음 표시 오류:', error);
      throw error;
    }
  },
  
  // 알림 삭제
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiRequest<void>('delete', `/notifications/${id}`);
    } catch (error) {
      console.error('알림 삭제 오류:', error);
      throw error;
    }
  },
  
  // 모든 알림 삭제
  deleteAllNotifications: async (): Promise<{ deletedCount: number }> => {
    try {
      return await apiRequest<{ deletedCount: number }>('delete', `/notifications/all`);
    } catch (error) {
      console.error('모든 알림 삭제 오류:', error);
      throw error;
    }
  }
};

export default notificationApi;