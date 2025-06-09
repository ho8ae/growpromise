// src/hooks/useAlarmAutoRead.ts
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../api';
import { useNotifications } from './useNotifications';

/**
 * 알림 화면에 진입할 때 모든 읽지 않은 알림을 자동으로 읽음 처리하는 훅
 */
export const useAlarmAutoRead = () => {
  const { updateUnreadCount } = useNotifications();

  const markAllAsRead = useCallback(async () => {
    try {
      console.log('🔔 알림 화면 진입 - 모든 알림 읽음 처리 시작');
      
      // 서버에서 모든 알림을 읽음으로 표시
      const result = await api.notification.markAllNotificationsAsRead();
      
      console.log(`✅ ${result.updatedCount}개의 알림을 읽음 처리했습니다.`);
      
      // 배지 업데이트
      await updateUnreadCount();
      
    } catch (error) {
      console.error('❌ 알림 자동 읽음 처리 오류:', error);
    }
  }, [updateUnreadCount]);

  // 화면에 포커스될 때마다 실행
  useFocusEffect(
    useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead])
  );

  return { markAllAsRead };
};