import { MaterialIcons } from '@expo/vector-icons';

// 약속 유형 상수 정의
export const PROMISE_TYPES = {
  study: {
    icon: 'school',
    color: '#8b5cf6',
    name: '공부'
  },
  homework: {
    icon: 'edit',
    color: '#3b82f6',
    name: '숙제'
  },
  chore: {
    icon: 'home',
    color: '#f97316',
    name: '집안일'
  },
  health: {
    icon: 'fitness-center',
    color: '#22c55e',
    name: '건강/운동'
  },
  habit: {
    icon: 'repeat',
    color: '#0ea5e9',
    name: '좋은 습관'
  },
  social: {
    icon: 'people',
    color: '#ec4899',
    name: '사회성'
  },
  default: {
    icon: 'event-note',
    color: '#6b7280',
    name: '기타'
  }
};

// 약속 제목에서 유형 추출
export const getPromiseType = (title: string): keyof typeof PROMISE_TYPES => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('공부') || lowerTitle.includes('학습') || lowerTitle.includes('읽기') || lowerTitle.includes('책')) {
    return 'study';
  } else if (lowerTitle.includes('숙제') || lowerTitle.includes('과제')) {
    return 'homework';
  } else if (lowerTitle.includes('청소') || lowerTitle.includes('정리') || lowerTitle.includes('설거지') || lowerTitle.includes('집안일')) {
    return 'chore';
  } else if (lowerTitle.includes('운동') || lowerTitle.includes('건강') || lowerTitle.includes('양치') || lowerTitle.includes('식사')) {
    return 'health';
  } else if (lowerTitle.includes('습관') || lowerTitle.includes('일찍') || lowerTitle.includes('규칙')) {
    return 'habit';
  } else if (lowerTitle.includes('친구') || lowerTitle.includes('인사') || lowerTitle.includes('도움') || lowerTitle.includes('함께')) {
    return 'social';
  }
  
  return 'default';
};

// 약속 유형 이름 반환
export const getPromiseTypeName = (type: keyof typeof PROMISE_TYPES): string => {
  return PROMISE_TYPES[type].name;
};

// 날짜 관련 유틸리티
export const DateUtils = {
  // 현재 연월 반환
  getCurrentYearMonth: () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  },
  
  // 날짜 포맷팅 (YYYY-MM-DD -> 2025년 5월 20일)
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString; // 오류 시 원본 반환
    }
  },
  
  // 요일 문자열 반환
  getDayOfWeek: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return days[date.getDay()];
    } catch (error) {
      console.error('요일 계산 오류:', error);
      return '';
    }
  },
  
  // 오늘 날짜인지 확인
  isToday: (dateString: string): boolean => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      
      return date.getFullYear() === today.getFullYear() &&
             date.getMonth() === today.getMonth() &&
             date.getDate() === today.getDate();
    } catch (error) {
      console.error('날짜 비교 오류:', error);
      return false;
    }
  }
};