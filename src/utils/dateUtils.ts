// src/utils/dateUtils.ts - 안전한 날짜 처리 유틸리티
import { format, isToday, isYesterday, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 안전한 날짜 파싱
 * @param dateInput - 날짜 문자열 또는 Date 객체
 * @returns 유효한 Date 객체 또는 null
 */
export const safeParseDate = (dateInput: string | Date | null | undefined): Date | null => {
  try {
    if (!dateInput) return null;
    
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // 빈 문자열 체크
      if (dateInput.trim() === '') return null;
      
      // ISO 8601 형식 우선 시도
      if (dateInput.includes('T') || dateInput.includes('Z') || dateInput.includes('+')) {
        date = parseISO(dateInput);
      } else {
        // 다른 형식 시도
        date = new Date(dateInput);
      }
    } else {
      return null;
    }
    
    // 유효성 검사
    if (!isValid(date)) {
      console.warn('유효하지 않은 날짜:', dateInput);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('날짜 파싱 오류:', error, 'Input:', dateInput);
    return null;
  }
};

/**
 * 상대적 날짜 포맷팅 (오늘, 어제, N일 전 등)
 * @param dateInput - 날짜 입력
 * @returns 포맷된 날짜 문자열
 */
export const formatRelativeDate = (dateInput: string | Date | null | undefined): string => {
  const date = safeParseDate(dateInput);
  if (!date) return '';
  
  try {
    const now = new Date();
    
    // 미래 날짜 체크
    if (date.getTime() > now.getTime()) {
      return format(date, 'M월 d일', { locale: ko });
    }
    
    if (isToday(date)) {
      return '오늘';
    } else if (isYesterday(date)) {
      return '어제';
    } else {
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7 && daysDiff >= 0) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ko });
      } else if (daysDiff < 365) {
        return format(date, 'M월 d일', { locale: ko });
      } else {
        return format(date, 'yyyy년 M월 d일', { locale: ko });
      }
    }
  } catch (error) {
    console.error('상대 날짜 포맷팅 오류:', error);
    return '';
  }
};

/**
 * 절대적 날짜 포맷팅
 * @param dateInput - 날짜 입력
 * @param formatString - 포맷 문자열 (기본: 'yyyy-MM-dd')
 * @returns 포맷된 날짜 문자열
 */
export const formatAbsoluteDate = (
  dateInput: string | Date | null | undefined, 
  formatString: string = 'yyyy-MM-dd'
): string => {
  const date = safeParseDate(dateInput);
  if (!date) return '';
  
  try {
    return format(date, formatString, { locale: ko });
  } catch (error) {
    console.error('절대 날짜 포맷팅 오류:', error);
    return '';
  }
};

/**
 * 시간 포함 날짜 포맷팅
 * @param dateInput - 날짜 입력
 * @returns 포맷된 날짜+시간 문자열
 */
export const formatDateTime = (dateInput: string | Date | null | undefined): string => {
  const date = safeParseDate(dateInput);
  if (!date) return '';
  
  try {
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (isToday(date)) {
      return `오늘 ${format(date, 'HH:mm', { locale: ko })}`;
    } else if (isYesterday(date)) {
      return `어제 ${format(date, 'HH:mm', { locale: ko })}`;
    } else if (daysDiff < 7) {
      return format(date, 'EEEE HH:mm', { locale: ko });
    } else {
      return format(date, 'M월 d일 HH:mm', { locale: ko });
    }
  } catch (error) {
    console.error('날짜+시간 포맷팅 오류:', error);
    return '';
  }
};

/**
 * 날짜 범위 검증
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 유효한 범위인지 여부
 */
export const isValidDateRange = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): boolean => {
  const start = safeParseDate(startDate);
  const end = safeParseDate(endDate);
  
  if (!start || !end) return false;
  
  return start.getTime() <= end.getTime();
};

/**
 * 날짜 차이 계산 (일 단위)
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 * @returns 날짜 차이 (일)
 */
export const getDaysDifference = (
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): number => {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  
  if (!d1 || !d2) return 0;
  
  return Math.floor(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * 날짜가 오늘인지 확인
 * @param dateInput - 날짜 입력
 * @returns 오늘인지 여부
 */
export const isDateToday = (dateInput: string | Date | null | undefined): boolean => {
  const date = safeParseDate(dateInput);
  if (!date) return false;
  
  try {
    return isToday(date);
  } catch (error) {
    console.error('오늘 날짜 확인 오류:', error);
    return false;
  }
};

/**
 * 주어진 날짜가 특정 기간 내에 있는지 확인
 * @param dateInput - 확인할 날짜
 * @param daysAgo - 몇 일 전까지
 * @returns 기간 내에 있는지 여부
 */
export const isWithinDays = (
  dateInput: string | Date | null | undefined,
  daysAgo: number
): boolean => {
  const date = safeParseDate(dateInput);
  if (!date) return false;
  
  const now = new Date();
  const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  
  return diffInDays >= 0 && diffInDays <= daysAgo;
};

// 기본 내보내기
export default {
  safeParseDate,
  formatRelativeDate,
  formatAbsoluteDate,
  formatDateTime,
  isValidDateRange,
  getDaysDifference,
  isDateToday,
  isWithinDays,
};