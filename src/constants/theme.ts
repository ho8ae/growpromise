// constants/theme.ts
// growpromise 앱의 디자인 시스템 정의

import { Platform } from 'react-native';

/**
 * 앱 전체에서 사용할 색상 팔레트
 */
export const Colors = {
  // 주요 색상 (파스텔 톤)
  primary: {
    light: '#A6E1FA', // 하늘색
    main: '#70CAF8', // 메인 하늘색
    dark: '#3AA9F4', // 진한 하늘색
    gradient: ['#A6E1FA', '#70CAF8'], // 그라데이션
  },
  
  // 보조 색상
  secondary: {
    light: '#FFD6E0', // 연한 분홍
    main: '#FFAEC0', // 분홍
    dark: '#FF8AA0', // 진한 분홍
    gradient: ['#FFD6E0', '#FFAEC0'], // 그라데이션
  },
  
  // 강조 색상
  accent: {
    yellow: '#FFEDA3', // 연한 노랑
    orange: '#FF9A5A', // 밝은 오렌지
    green: '#A8E6CF', // 라임 그린
    purple: '#D4A5FF', // 연한 보라
  },
  
  // 텍스트 색상
  text: {
    primary: '#3D5366', // 진한 청록색 (메인 텍스트)
    secondary: '#5D5E8C', // 다크 퍼플 (부제목)
    tertiary: '#7E8CA3', // 연한 슬레이트 (부가 정보)
    light: '#FFFFFF', // 밝은 배경의 텍스트
  },
  
  // 배경 색상
  background: {
    primary: '#FFFFFF', // 기본 배경
    secondary: '#F8FAFF', // 밝은 회색빛 배경
    card: '#FFFFFF', // 카드 배경
    input: '#F5F8FF', // 입력 필드 배경
  },
  
  // 상태 색상
  status: {
    success: '#7ED957', // 성공
    warning: '#FFD166', // 경고
    error: '#FF7A6D', // 오류
    info: '#62C6FF', // 정보
  },
  
  // 테두리 색상
  border: {
    light: '#E8F0FB', // 연한 테두리
    main: '#D0E1F9', // 기본 테두리
    focus: '#70CAF8', // 포커스 테두리
  },
  
  // 그림자 색상
  shadow: {
    light: 'rgba(163, 190, 240, 0.15)', // 연한 그림자
    medium: 'rgba(163, 190, 240, 0.25)', // 중간 그림자
    dark: 'rgba(163, 190, 240, 0.35)', // 진한 그림자
  },
  
  // 투명도
  transparent: 'transparent',
};

/**
 * 공간 크기 (마진, 패딩 등)
 */
export const Spacing = {
  xs: 4, // 아주 작은 간격
  s: 8, // 작은 간격
  m: 16, // 중간 간격
  l: 24, // 큰 간격
  xl: 32, // 더 큰 간격
  xxl: 48, // 아주 큰 간격
};

/**
 * 둥근 모서리 반경
 */
export const BorderRadius = {
  xs: 4, // 아주 작은 둥근 모서리
  s: 8, // 작은 둥근 모서리
  m: 16, // 중간 둥근 모서리
  l: 24, // 큰 둥근 모서리
  xl: 32, // 더 큰 둥근 모서리
  xxl: 40, // 아주 큰 둥근 모서리
  full: 999, // 완전한 원형
};

/**
 * 폰트 크기
 */
export const FontSize = {
  xs: 10, // 아주 작은 텍스트
  s: 12, // 작은 텍스트
  m: 14, // 중간 텍스트
  l: 16, // 큰 텍스트
  xl: 20, // 더 큰 텍스트
  xxl: 24, // 아주 큰 텍스트
  xxxl: 32, // 제목 텍스트
};

/**
 * 폰트 스타일 및 두께
 */
export const FontFamily = {
  regular: Platform.select({
    ios: 'AppleSDGothicNeo-Regular',
    android: 'Roboto',
    default: 'sans-serif',
  }),
  medium: Platform.select({
    ios: 'AppleSDGothicNeo-Medium',
    android: 'Roboto-Medium',
    default: 'sans-serif-medium',
  }),
  bold: Platform.select({
    ios: 'AppleSDGothicNeo-Bold',
    android: 'Roboto-Bold',
    default: 'sans-serif-bold',
  }),
  // 특별한 폰트 (커스텀 폰트 추가 시)
  title: 'PukiFont', // 귀여운 제목용 폰트
};

/**
 * 그림자 스타일
 */
export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: Colors.shadow.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: Colors.shadow.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 6,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: Colors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: Colors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: Colors.shadow.dark,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: Colors.shadow.dark,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },
  }),
};

/**
 * z-index 값
 */
export const ZIndex = {
  base: 0, // 기본 레이어
  card: 10, // 카드 레이어
  header: 20, // 헤더 레이어
  modal: 30, // 모달 레이어
  toast: 40, // 토스트 레이어
  popup: 50, // 팝업 레이어
};

/**
 * 애니메이션 타이밍
 */
export const AnimationTiming = {
  fast: 200, // 빠른 애니메이션 (0.2초)
  medium: 400, // 중간 애니메이션 (0.4초)
  slow: 800, // 느린 애니메이션 (0.8초)
};

/**
 * 스타일 믹스인 - 자주 사용되는 스타일 조합
 */
export const StyleMixins = {
  // 카드 스타일
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadows.small,
  },
  
  // 입력 필드 스타일
  input: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.s,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: Spacing.m,
  },
  
  // 버튼 스타일 - 기본
  button: {
    borderRadius: BorderRadius.m,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 버튼 스타일 - 프라이머리
  buttonPrimary: {
    backgroundColor: Colors.primary.main,
  },
  
  // 버튼 스타일 - 세컨더리
  buttonSecondary: {
    backgroundColor: Colors.secondary.main,
  },
  
  // 행 가운데 정렬
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 아이템 간격
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // 중앙 정렬
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
};