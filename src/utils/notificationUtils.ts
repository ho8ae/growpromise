// src/utils/notificationUtils.ts
import { NotificationType } from '../api/modules/notification';

export interface NotificationSettings {
  isEnabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

export interface PushTokenInfo {
  token: string | null;
  isRegistered: boolean;
  lastUpdated: string | null;
}

// 알림 관련 유틸리티 함수들
export const notificationUtils = {
  // 권한 상태에 따른 텍스트 반환
  getStatusText: (status: 'granted' | 'denied' | 'undetermined'): string => {
    switch (status) {
      case 'granted': return '허용됨';
      case 'denied': return '거부됨';
      case 'undetermined': return '미설정';
      default: return '알 수 없음';
    }
  },
  
  // 권한 상태에 따른 색상 반환
  getStatusColor: (status: 'granted' | 'denied' | 'undetermined'): string => {
    switch (status) {
      case 'granted': return '#58CC02';
      case 'denied': return '#FF4B4B';
      case 'undetermined': return '#FFC800';
      default: return '#E5E5E5';
    }
  },
  
  // 알림 타입에 따른 아이콘 반환
  getNotificationIcon: (type: NotificationType): string => {
    switch (type) {
      case NotificationType.PROMISE_CREATED: return '📝';
      case NotificationType.PROMISE_VERIFIED: return '📸';
      case NotificationType.PROMISE_APPROVED: return '✅';
      case NotificationType.PROMISE_REJECTED: return '❌';
      case NotificationType.REWARD_EARNED: return '🎁';
      case NotificationType.SYSTEM: return '🔔';
      default: return '📱';
    }
  },
  
  // 알림 타입에 따른 색상 반환
  getNotificationColor: (type: NotificationType): string => {
    switch (type) {
      case NotificationType.PROMISE_CREATED: return '#58CC02';
      case NotificationType.PROMISE_VERIFIED: return '#1CB0F6';
      case NotificationType.PROMISE_APPROVED: return '#58CC02';
      case NotificationType.PROMISE_REJECTED: return '#FF4B4B';
      case NotificationType.REWARD_EARNED: return '#FFC800';
      case NotificationType.SYSTEM: return '#CE82FF';
      default: return '#E5E5E5';
    }
  },
  
  // 알림 스케줄링을 위한 시간 계산
  getNotificationTrigger: (date: Date): { seconds?: number; date?: Date } => {
    const now = new Date();
    const triggerTime = date.getTime() - now.getTime();
    
    if (triggerTime <= 0) {
      return { seconds: 1 };
    } else {
      return { date };
    }
  },
  
  // 상대적 시간 표시 (예: "5분 전", "2시간 전")
  getRelativeTime: (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    // 7일 이상인 경우 날짜 표시
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  },
  
  // 알림 중요도에 따른 우선순위 반환
  getNotificationPriority: (type: NotificationType): 'high' | 'normal' | 'low' => {
    switch (type) {
      case NotificationType.PROMISE_VERIFIED:
      case NotificationType.PROMISE_CREATED:
        return 'high';
      case NotificationType.PROMISE_APPROVED:
      case NotificationType.REWARD_EARNED:
        return 'normal';
      case NotificationType.PROMISE_REJECTED:
      case NotificationType.SYSTEM:
        return 'low';
      default:
        return 'normal';
    }
  },
  
  // 알림 타입별 제목 생성
  getNotificationTitle: (type: NotificationType, data?: any): string => {
    switch (type) {
      case NotificationType.PROMISE_CREATED:
        return '새로운 약속이 생성되었어요! 📝';
      case NotificationType.PROMISE_VERIFIED:
        return '약속 인증이 완료되었어요! 📸';
      case NotificationType.PROMISE_APPROVED:
        return '약속이 승인되었어요! ✅';
      case NotificationType.PROMISE_REJECTED:
        return '약속이 거절되었어요 😔';
      case NotificationType.REWARD_EARNED:
        return '보상을 받았어요! 🎁';
      case NotificationType.SYSTEM:
        return '쑥쑥약속 알림 🔔';
      default:
        return '새로운 알림이 있어요!';
    }
  },
  
  // 디버깅용 - 현재 시간 정보
  getCurrentTimeInfo: (): { timestamp: number; iso: string; local: string } => {
    const now = new Date();
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      local: now.toLocaleString(),
    };
  },
  
  // 알림 배지 숫자 포맷팅 (99+ 형태)
  formatBadgeCount: (count: number): string => {
    if (count <= 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  },
  
  // 알림 그룹핑을 위한 키 생성
  getNotificationGroupKey: (type: NotificationType, relatedId?: string): string => {
    if (relatedId) {
      return `${type}_${relatedId}`;
    }
    return type;
  },
  
  // 알림 내용 요약 (긴 내용을 줄여서 표시)
  truncateContent: (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  },
  
  // 푸시 토큰 유효성 검사
  isValidExpoPushToken: (token: string): boolean => {
    // Expo 푸시 토큰 형식: ExponentPushToken[xxxxxx]
    const expoTokenRegex = /^ExponentPushToken\[[A-Za-z0-9_-]+\]$/;
    return expoTokenRegex.test(token);
  },
  
  // 알림 설정 상태 요약 텍스트
  getSettingsSummary: (settings: NotificationSettings, pushInfo: PushTokenInfo): string => {
    if (!settings.isEnabled) {
      return '알림이 비활성화되어 있습니다';
    }
    
    if (!pushInfo.isRegistered) {
      return '푸시 토큰 등록 중입니다';
    }
    
    return '모든 알림이 활성화되어 있습니다';
  },
  
  // 알림 채널 ID 생성 (Android용)
  getNotificationChannelId: (type: NotificationType): string => {
    switch (type) {
      case NotificationType.PROMISE_CREATED:
      case NotificationType.PROMISE_VERIFIED:
      case NotificationType.PROMISE_APPROVED:
      case NotificationType.PROMISE_REJECTED:
        return 'promise';
      case NotificationType.REWARD_EARNED:
        return 'reward';
      case NotificationType.SYSTEM:
      default:
        return 'default';
    }
  },
  

  
  // 알림 진동 패턴 반환 (Android용)
  getVibrationPattern: (type: NotificationType): number[] => {
    switch (type) {
      case NotificationType.PROMISE_APPROVED:
      case NotificationType.REWARD_EARNED:
        return [0, 200, 100, 200]; // 짧은 진동 2번
      case NotificationType.PROMISE_REJECTED:
        return [0, 500, 200, 500, 200, 500]; // 긴 진동 3번
      case NotificationType.PROMISE_CREATED:
      case NotificationType.PROMISE_VERIFIED:
        return [0, 250, 250, 250]; // 중간 진동 1번
      default:
        return [0, 250]; // 기본 진동
    }
  },
};