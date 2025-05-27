// src/api/modules/ticket.ts
import { apiRequest } from '../client';

// 티켓 타입 enum
export enum TicketType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  SPECIAL = 'SPECIAL',
}

// 보상 타입 enum
export enum RewardType {
  VERIFICATION_MILESTONE = 'VERIFICATION_MILESTONE',
  PLANT_COMPLETION = 'PLANT_COMPLETION',
  DAILY_STREAK = 'DAILY_STREAK',
  WEEKLY_MISSION = 'WEEKLY_MISSION',
  MONTHLY_MISSION = 'MONTHLY_MISSION',
}

// 뽑기 티켓 타입
export interface DrawTicket {
  id: string;
  childId: string;
  ticketType: TicketType;
  isUsed: boolean;
  earnedFrom: string;
  earnedAt: string;
  usedAt?: string;
}

// 티켓 개수 정보
export interface TicketCounts {
  BASIC: number;
  PREMIUM: number;
  SPECIAL: number;
}

// 티켓 보유 정보 응답
export interface TicketResponse {
  tickets: DrawTicket[];
  counts: TicketCounts;
  total: number;
}

// 티켓 사용 결과 (식물 뽑기 결과와 동일)
export interface TicketDrawResult {
  plantType: {
    id: string;
    name: string;
    description?: string;
    growthStages: number;
    difficulty: string;
    category: string;
    unlockRequirement?: number;
    imagePrefix: string;
    rarity: string;
    isBasic: boolean;
    createdAt: string;
  };
  isDuplicate: boolean;
  experienceGained?: number;
}

// 아이 통계 정보 (티켓 정보 포함)
export interface ChildStatsWithTickets {
  verificationCount: number;
  plantCompletionCount: number;
  wateringStreak: number;
  totalCompletedPlants: number;
  characterStage: number;
  tickets: {
    counts: TicketCounts;
    total: number;
  };
  activeMissions: MissionProgress[];
}

// 미션 진행 정보
export interface MissionProgress {
  id: string;
  title: string;
  description: string;
  progress: string; // "5/10" 형태
  progressPercent: number;
  reward: TicketType;
  endDate?: string;
}

// 티켓 지급 요청 (관리자용)
export interface GrantTicketRequest {
  childId: string;
  ticketType: TicketType;
  count: number;
  reason?: string;
}

// 코인으로 뽑기 요청
export interface DrawWithCoinRequest {
  packType: TicketType;
}

// 티켓 관련 API 함수들
const ticketApi = {
  // 보유 티켓 조회
  getMyTickets: async (): Promise<TicketResponse> => {
    try {
      return await apiRequest<TicketResponse>('get', '/tickets');
    } catch (error) {
      console.error('티켓 조회 오류:', error);
      throw error;
    }
  },

  // 티켓으로 뽑기 실행
  useTicket: async (ticketId: string): Promise<TicketDrawResult> => {
    try {
      return await apiRequest<TicketDrawResult>('post', `/tickets/${ticketId}/use`);
    } catch (error) {
      console.error('티켓 사용 오류:', error);
      throw error;
    }
  },

  // 코인으로 뽑기 (기존 기능)
  drawWithCoin: async (packType: TicketType): Promise<TicketDrawResult> => {
    try {
      return await apiRequest<TicketDrawResult>('post', '/tickets/draw', { packType });
    } catch (error) {
      console.error('코인 뽑기 오류:', error);
      throw error;
    }
  },

  // 아이 통계 조회 (티켓 정보 포함)
  getChildStats: async (): Promise<ChildStatsWithTickets> => {
    try {
      return await apiRequest<ChildStatsWithTickets>('get', '/tickets/stats');
    } catch (error) {
      console.error('아이 통계 조회 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 기본 마일스톤 생성
  createDefaultMilestones: async (): Promise<void> => {
    try {
      await apiRequest<void>('post', '/tickets/admin/create-milestones');
    } catch (error) {
      console.error('기본 마일스톤 생성 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 티켓 지급
  grantTickets: async (request: GrantTicketRequest): Promise<void> => {
    try {
      await apiRequest<void>('post', '/tickets/admin/grant', request);
    } catch (error) {
      console.error('티켓 지급 오류:', error);
      throw error;
    }
  },

  // 티켓 타입 한국어 변환
  getTicketTypeKorean: (ticketType: TicketType): string => {
    const typeMap = {
      [TicketType.BASIC]: '기본',
      [TicketType.PREMIUM]: '프리미엄',
      [TicketType.SPECIAL]: '스페셜',
    };
    return typeMap[ticketType] || ticketType;
  },

  // 티켓 획득 경로 한국어 변환
  getEarnedFromKorean: (earnedFrom: string): string => {
    if (earnedFrom.includes('VERIFICATION_MILESTONE')) {
      const count = earnedFrom.split('_')[2];
      return `약속 인증 ${count}회 달성`;
    }
    if (earnedFrom.includes('PLANT_COMPLETION')) {
      const count = earnedFrom.split('_')[2];
      return `식물 완료 ${count}개 달성`;
    }
    if (earnedFrom.includes('STREAK')) {
      const days = earnedFrom.split('_')[1];
      return `연속 물주기 ${days}일 달성`;
    }
    if (earnedFrom.includes('MISSION')) {
      return '미션 완료 보상';
    }
    if (earnedFrom === 'ADMIN_GRANT') {
      return '관리자 지급';
    }
    return earnedFrom;
  },

  // 티켓 타입별 색상 가져오기
  getTicketColor: (ticketType: TicketType): string => {
    const colorMap = {
      [TicketType.BASIC]: '#58CC02', // Primary Green
      [TicketType.PREMIUM]: '#CE82FF', // Accent Purple
      [TicketType.SPECIAL]: '#FFD700', // Gold
    };
    return colorMap[ticketType] || '#E5E5E5';
  },

  // 티켓 타입별 아이콘 가져오기
  getTicketIcon: (ticketType: TicketType): string => {
    const iconMap = {
      [TicketType.BASIC]: '🎫',
      [TicketType.PREMIUM]: '🎟️',
      [TicketType.SPECIAL]: '🏷️',
    };
    return iconMap[ticketType] || '🎫';
  },
};

export default ticketApi;