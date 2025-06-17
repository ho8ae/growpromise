// utils/wateringUtils.ts
/**
 * 물주기 관련 유틸리티 함수들
 */

/**
 * 에러 메시지에서 남은 시간을 파싱하는 함수
 * @param errorMessage API에서 받은 에러 메시지
 * @returns 포맷된 시간 문자열 (예: "6시간 30분", "45분", "2시간")
 */
export const parseRemainingTimeFromError = (errorMessage: string): string => {
    // 다양한 패턴의 시간 표현을 처리
    const patterns = [
      // "6시간 30분 후에"
      /(\d+)시간\s*(\d+)분/,
      // "6시간 후에"
      /(\d+)시간/,
      // "30분 후에"
      /(\d+)분/,
      // "1.5시간 후에" (소수점 포함)
      /(\d+\.?\d*)시간/,
    ];
  
    for (const pattern of patterns) {
      const match = errorMessage.match(pattern);
      if (match) {
        if (pattern.source.includes('시간\\s*\\d+분')) {
          // "6시간 30분" 패턴
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          return `${hours}시간 ${minutes}분`;
        } else if (pattern.source.includes('시간')) {
          // "6시간" 또는 "1.5시간" 패턴
          const timeValue = parseFloat(match[1]);
          if (timeValue % 1 === 0) {
            // 정수인 경우
            return `${Math.floor(timeValue)}시간`;
          } else {
            // 소수점이 있는 경우 (예: 1.5시간 = 1시간 30분)
            const hours = Math.floor(timeValue);
            const minutes = Math.round((timeValue - hours) * 60);
            if (hours === 0) {
              return `${minutes}분`;
            }
            return `${hours}시간 ${minutes}분`;
          }
        } else if (pattern.source.includes('분')) {
          // "30분" 패턴
          const minutes = parseInt(match[1]);
          return `${minutes}분`;
        }
      }
    }
  
    // 패턴이 매치되지 않으면 기본값 반환
    return '잠시';
  };
  
  /**
   * 밀리초를 사용자 친화적인 시간 문자열로 변환
   * @param milliseconds 밀리초
   * @returns 포맷된 시간 문자열
   */
  export const formatTimeFromMilliseconds = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
  
    if (hours === 0) {
      return `${remainingMinutes}분`;
    } else if (remainingMinutes === 0) {
      return `${hours}시간`;
    } else {
      return `${hours}시간 ${remainingMinutes}분`;
    }
  };
  
  /**
   * 물주기 가능 여부를 확인하는 함수
   * @param lastWatered 마지막 물주기 시간 (ISO 문자열 또는 Date)
   * @param cooldownHours 쿨다운 시간 (기본 24시간)
   * @returns 물주기 가능 여부와 남은 시간
   */
  export const checkWateringAvailability = (
    lastWatered: string | Date | null,
    cooldownHours: number = 24
  ): {
    canWater: boolean;
    remainingTime?: string;
    remainingMilliseconds?: number;
  } => {
    if (!lastWatered) {
      return { canWater: true };
    }
  
    const lastWateredTime = new Date(lastWatered);
    const now = new Date();
    const cooldownMilliseconds = cooldownHours * 60 * 60 * 1000;
    const timeSinceLastWatering = now.getTime() - lastWateredTime.getTime();
  
    if (timeSinceLastWatering >= cooldownMilliseconds) {
      return { canWater: true };
    }
  
    const remainingMilliseconds = cooldownMilliseconds - timeSinceLastWatering;
    const remainingTime = formatTimeFromMilliseconds(remainingMilliseconds);
  
    return {
      canWater: false,
      remainingTime,
      remainingMilliseconds,
    };
  };
  
  /**
   * 물주기 쿨다운 진동 패턴
   */
  export const triggerWateringCooldownHaptic = async () => {
    const { notificationAsync, impactAsync, NotificationFeedbackType, ImpactFeedbackStyle } = await import('expo-haptics');
    
    // 짧은 경고 진동 패턴
    await notificationAsync(NotificationFeedbackType.Warning);
    
    // 추가로 약간의 지연 후 한 번 더 (선택적)
    setTimeout(async () => {
      await impactAsync(ImpactFeedbackStyle.Light);
    }, 100);
  };
  
  /**
   * 물주기 성공 진동 패턴
   */
  export const triggerWateringSuccessHaptic = async () => {
    const { notificationAsync, impactAsync, NotificationFeedbackType, ImpactFeedbackStyle } = await import('expo-haptics');
    
    // 성공적인 중간 강도 진동
    await impactAsync(ImpactFeedbackStyle.Medium);
    
    // 약간의 지연 후 성공 알림
    setTimeout(async () => {
      await notificationAsync(NotificationFeedbackType.Success);
    }, 150);
  };