// 약속 유형별 아이콘과 색상
export const PROMISE_TYPES = {
  study: { icon: 'book', color: '#60a5fa', gradient: ['#dbeafe', '#93c5fd'] }, // blue gradient
  chore: { icon: 'broom', color: '#a78bfa', gradient: ['#ede9fe', '#c4b5fd'] }, // violet gradient
  reading: { icon: 'book-reader', color: '#34d399', gradient: ['#d1fae5', '#6ee7b7'] }, // emerald gradient
  music: { icon: 'music', color: '#f87171', gradient: ['#fee2e2', '#fca5a5'] }, // red gradient
  exercise: { icon: 'running', color: '#fcd34d', gradient: ['#fef3c7', '#fde68a'] }, // amber gradient
  health: { icon: 'tooth', color: '#f472b6', gradient: ['#fce7f3', '#fbcfe8'] }, // pink gradient
  family: { icon: 'home', color: '#fb923c', gradient: ['#ffedd5', '#fdba74'] }, // orange gradient
  default: { icon: 'check', color: '#9ca3af', gradient: ['#f3f4f6', '#d1d5db'] }, // gray gradient
};

// 날짜 관련 유틸리티 함수들
export const DateUtils = {
  // 날짜 형식 변환 함수 (YYYY-MM-DD -> MM월 DD일)
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    } catch (error) {
      console.error('날짜 포맷 변환 오류:', error);
      return '날짜 오류';
    }
  },

  // 현재 날짜 가져오기
  getCurrentYearMonth: () => {
    try {
      const now = new Date();
      if (isNaN(now.getTime())) {
        throw new Error('Invalid current date');
      }
      
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      };
    } catch (error) {
      console.error('현재 날짜 가져오기 오류:', error);
      // 오류 발생 시 고정값 반환
      return { year: 2025, month: 5 };
    }
  },

  // 해당 월의 날짜 수 계산
  getDaysInMonth: (year: number, month: number): number => {
    try {
      if (!year || !month || isNaN(year) || isNaN(month)) {
        throw new Error(`Invalid year or month: ${year}, ${month}`);
      }
      
      const daysInMonth = new Date(year, month, 0).getDate();
      if (isNaN(daysInMonth)) {
        throw new Error('날짜 계산 오류');
      }
      
      return daysInMonth;
    } catch (error) {
      console.error('월별 날짜 수 계산 오류:', error);
      // 오류 발생 시 기본값 반환
      return 31;
    }
  },

  // 해당 월의 첫 날 요일 계산
  getFirstDayOfMonth: (year: number, month: number): number => {
    try {
      if (!year || !month || isNaN(year) || isNaN(month)) {
        throw new Error(`Invalid year or month: ${year}, ${month}`);
      }
      
      const firstDay = new Date(year, month - 1, 1).getDay();
      if (isNaN(firstDay)) {
        throw new Error('요일 계산 오류');
      }
      
      return firstDay;
    } catch (error) {
      console.error('월 첫 날 요일 계산 오류:', error);
      // 오류 발생 시 기본값 반환 (일요일)
      return 0;
    }
  },

  // 날짜 형식 변환 함수 (Date -> YYYY-MM-DD)
  formatDateToString: (date: Date): string => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date object');
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('날짜 문자열 변환 오류:', error);
      
      // 오류 발생 시 현재 날짜 반환
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  },
  
  // 오늘 날짜인지 확인
  isToday: (year: number, month: number, day: number | null): boolean => {
    try {
      if (!day || !year || !month || isNaN(year) || isNaN(month) || isNaN(day)) {
        return false;
      }
      
      const today = new Date();
      return today.getFullYear() === year && 
             today.getMonth() + 1 === month && 
             today.getDate() === day;
    } catch (error) {
      console.error('오늘 날짜 확인 오류:', error);
      return false;
    }
  }
};

// 약속 타입 결정 함수 (제목 기반)
export const getPromiseType = (title: string): keyof typeof PROMISE_TYPES => {
  try {
    if (!title) return 'default';
    
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('공부') || lowerTitle.includes('숙제') || lowerTitle.includes('학습')) {
      return 'study';
    } else if (lowerTitle.includes('청소') || lowerTitle.includes('정리') || lowerTitle.includes('설거지')) {
      return 'chore';
    } else if (lowerTitle.includes('책') || lowerTitle.includes('독서') || lowerTitle.includes('읽')) {
      return 'reading';
    } else if (lowerTitle.includes('음악') || lowerTitle.includes('연주') || lowerTitle.includes('피아노')) {
      return 'music';
    } else if (lowerTitle.includes('운동') || lowerTitle.includes('체육') || lowerTitle.includes('달리기')) {
      return 'exercise';
    } else if (lowerTitle.includes('건강') || lowerTitle.includes('양치') || lowerTitle.includes('병원')) {
      return 'health';
    } else if (lowerTitle.includes('가족') || lowerTitle.includes('부모님') || lowerTitle.includes('집')) {
      return 'family';
    }
    
    return 'default';
  } catch (error) {
    console.error('약속 타입 결정 오류:', error);
    return 'default';
  }
};

// 약속 유형 이름 변환
export const getPromiseTypeName = (type: keyof typeof PROMISE_TYPES): string => {
  try {
    switch (type) {
      case 'study': return '공부';
      case 'chore': return '집안일';
      case 'reading': return '독서';
      case 'music': return '음악';
      case 'exercise': return '운동';
      case 'health': return '건강';
      case 'family': return '가족';
      default: return '기타';
    }
  } catch (error) {
    console.error('약속 유형 이름 변환 오류:', error);
    return '기타';
  }
};