// src/api/modules/mission.ts
import { apiRequest } from '../client';
import { TicketType } from './ticket';

// 미션 타입 enum
export enum MissionType {
  DAILY_VERIFICATION = 'DAILY_VERIFICATION',
  WEEKLY_VERIFICATION = 'WEEKLY_VERIFICATION',
  MONTHLY_VERIFICATION = 'MONTHLY_VERIFICATION',
  PLANT_WATER = 'PLANT_WATER',
  PLANT_COMPLETION = 'PLANT_COMPLETION',
  STREAK_MAINTENANCE = 'STREAK_MAINTENANCE',
}

// 미션 타입
export interface Mission {
  id: string;
  childId?: string; // null이면 전체 아이에게 적용
  title: string;
  description: string;
  missionType: MissionType;
  targetCount: number;
  currentCount: number;
  ticketReward: TicketType;
  ticketCount: number;
  startDate: string;
  endDate?: string;
  isCompleted: boolean;
  isActive: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 미션 진행 정보 (UI 표시용)
export interface MissionWithProgress extends Mission {
  progressPercent: number;
  progressText: string;
  isNearCompletion: boolean; // 80% 이상 진행
  daysLeft?: number; // 남은 일수
  statusText: string; // 상태 텍스트
  rewardText: string; // 보상 텍스트
}

// 미션 생성 요청
export interface CreateMissionRequest {
  childId?: string;
  title: string;
  description: string;
  missionType: MissionType;
  targetCount: number;
  ticketReward?: TicketType;
  ticketCount?: number;
  endDate?: string;
}

// 미션 수정 요청
export interface UpdateMissionRequest {
  title?: string;
  description?: string;
  targetCount?: number;
  ticketReward?: TicketType;
  ticketCount?: number;
  endDate?: string;
  isActive?: boolean;
}

// 미션 관련 API 함수들
const missionApi = {
  // 활성 미션 목록 조회
  getActiveMissions: async (): Promise<MissionWithProgress[]> => {
    try {
      const missions = await apiRequest<Mission[]>('get', '/missions/active');
      
      return missions.map(mission => ({
        ...mission,
        progressPercent: Math.round((mission.currentCount / mission.targetCount) * 100),
        progressText: `${mission.currentCount}/${mission.targetCount}`,
        isNearCompletion: mission.currentCount >= mission.targetCount * 0.8,
        daysLeft: mission.endDate ? Math.ceil((new Date(mission.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : undefined,
        statusText: missionApi.getStatusText(mission),
        rewardText: missionApi.getRewardText(mission),
      }));
    } catch (error) {
      console.error('활성 미션 조회 오류:', error);
      throw error;
    }
  },

  // 완료된 미션 목록 조회
  getCompletedMissions: async (): Promise<Mission[]> => {
    try {
      return await apiRequest<Mission[]>('get', '/missions/completed');
    } catch (error) {
      console.error('완료된 미션 조회 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 새 미션 생성
  createMission: async (request: CreateMissionRequest): Promise<Mission> => {
    try {
      return await apiRequest<Mission>('post', '/missions', request);
    } catch (error) {
      console.error('미션 생성 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 미션 수정
  updateMission: async (id: string, request: UpdateMissionRequest): Promise<Mission> => {
    try {
      return await apiRequest<Mission>('put', `/missions/${id}`, request);
    } catch (error) {
      console.error('미션 수정 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 미션 삭제
  deleteMission: async (id: string): Promise<void> => {
    try {
      await apiRequest<void>('delete', `/missions/${id}`);
    } catch (error) {
      console.error('미션 삭제 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 기본 미션 생성
  createDefaultMissions: async (): Promise<void> => {
    try {
      await apiRequest<void>('post', '/missions/admin/create-defaults');
    } catch (error) {
      console.error('기본 미션 생성 오류:', error);
      throw error;
    }
  },

  // 관리자용 - 만료된 미션 정리
  cleanupExpiredMissions: async (): Promise<{ count: number }> => {
    try {
      return await apiRequest<{ count: number }>('post', '/missions/admin/cleanup');
    } catch (error) {
      console.error('만료된 미션 정리 오류:', error);
      throw error;
    }
  },

  // 미션 타입 한국어 변환
  getMissionTypeKorean: (missionType: MissionType): string => {
    const typeMap = {
      [MissionType.DAILY_VERIFICATION]: '매일 약속 인증',
      [MissionType.WEEKLY_VERIFICATION]: '주간 약속 인증',
      [MissionType.MONTHLY_VERIFICATION]: '월간 약속 인증',
      [MissionType.PLANT_WATER]: '식물 물주기',
      [MissionType.PLANT_COMPLETION]: '식물 완료',
      [MissionType.STREAK_MAINTENANCE]: '연속 기록 유지',
    };
    return typeMap[missionType] || missionType;
  },

  // 미션 상태 텍스트
  getStatusText: (mission: Mission): string => {
    if (mission.isCompleted) {
      return '완료됨';
    }
    
    if (!mission.isActive) {
      return '비활성';
    }

    if (mission.endDate) {
      const daysLeft = Math.ceil((new Date(mission.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) {
        return '만료됨';
      }
      if (daysLeft <= 3) {
        return `${daysLeft}일 남음`;
      }
    }

    const progressPercent = Math.round((mission.currentCount / mission.targetCount) * 100);
    if (progressPercent >= 80) {
      return '거의 완료';
    }
    if (progressPercent >= 50) {
      return '진행 중';
    }
    return '시작';
  },

  // 보상 텍스트
  getRewardText: (mission: Mission): string => {
    const ticketKorean = {
      [TicketType.BASIC]: '기본',
      [TicketType.PREMIUM]: '프리미엄',
      [TicketType.SPECIAL]: '스페셜',
    }[mission.ticketReward];

    if (mission.ticketCount === 1) {
      return `${ticketKorean} 티켓`;
    }
    return `${ticketKorean} 티켓 ${mission.ticketCount}개`;
  },

  // 미션 타입별 아이콘
  getMissionIcon: (missionType: MissionType): string => {
    const iconMap = {
      [MissionType.DAILY_VERIFICATION]: '📅',
      [MissionType.WEEKLY_VERIFICATION]: '📊',
      [MissionType.MONTHLY_VERIFICATION]: '🗓️',
      [MissionType.PLANT_WATER]: '💧',
      [MissionType.PLANT_COMPLETION]: '🌱',
      [MissionType.STREAK_MAINTENANCE]: '🔥',
    };
    return iconMap[missionType] || '🎯';
  },

  // 미션 난이도별 색상
  getMissionColor: (mission: Mission): string => {
    // 목표 카운트에 따른 난이도 색상
    if (mission.targetCount >= 30) {
      return '#FF4B4B'; // Danger Red - 어려움
    }
    if (mission.targetCount >= 10) {
      return '#FFC800'; // Child Yellow - 보통
    }
    return '#58CC02'; // Primary Green - 쉬움
  },

  // 미션 진행률에 따른 색상
  getProgressColor: (progressPercent: number): string => {
    if (progressPercent >= 100) {
      return '#58CC02'; // Primary Green - 완료
    }
    if (progressPercent >= 80) {
      return '#FFC800'; // Child Yellow - 거의 완료
    }
    if (progressPercent >= 50) {
      return '#1CB0F6'; // Info Blue - 진행 중
    }
    return '#E5E5E5'; // Disabled - 시작 단계
  },

  // 미션 카테고리별 그룹화
  groupMissionsByCategory: (missions: MissionWithProgress[]): Record<string, MissionWithProgress[]> => {
    const groups: Record<string, MissionWithProgress[]> = {
      '약속 관련': [],
      '식물 관리': [],
      '특별 도전': [],
    };

    missions.forEach(mission => {
      if ([MissionType.DAILY_VERIFICATION, MissionType.WEEKLY_VERIFICATION, MissionType.MONTHLY_VERIFICATION].includes(mission.missionType)) {
        groups['약속 관련'].push(mission);
      } else if ([MissionType.PLANT_WATER, MissionType.PLANT_COMPLETION].includes(mission.missionType)) {
        groups['식물 관리'].push(mission);
      } else {
        groups['특별 도전'].push(mission);
      }
    });

    // 빈 그룹 제거
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  },
};

export default missionApi;