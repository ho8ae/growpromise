// src/hooks/useMissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import missionApi, { 
  MissionWithProgress, 
  Mission, 
  CreateMissionRequest, 
  UpdateMissionRequest,
  MissionType 
} from '../api/modules/mission';

// 미션 관련 쿼리 키
export const missionKeys = {
  all: ['missions'] as const,
  active: () => [...missionKeys.all, 'active'] as const,
  completed: () => [...missionKeys.all, 'completed'] as const,
  byType: (type: MissionType) => [...missionKeys.all, 'type', type] as const,
};

// 활성 미션 목록 조회 훅
export const useActiveMissions = () => {
  return useQuery({
    queryKey: missionKeys.active(),
    queryFn: missionApi.getActiveMissions,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분 (cacheTime → gcTime으로 변경)
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
    enabled: true,
  });
};

// 완료된 미션 목록 조회 훅
export const useCompletedMissions = () => {
  return useQuery({
    queryKey: missionKeys.completed(),
    queryFn: missionApi.getCompletedMissions,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (cacheTime → gcTime으로 변경)
    enabled: true,
  });
};

// 미션 생성 훅 (관리자용)
export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMissionRequest) => missionApi.createMission(request),
    onSuccess: () => {
      // 활성 미션 목록 갱신
      queryClient.invalidateQueries({ queryKey: missionKeys.active() });
    },
    onError: (error) => {
      console.error('미션 생성 오류:', error);
    },
  });
};

// 미션 수정 훅 (관리자용)
export const useUpdateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateMissionRequest }) => 
      missionApi.updateMission(id, request),
    onSuccess: () => {
      // 모든 미션 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
    onError: (error) => {
      console.error('미션 수정 오류:', error);
    },
  });
};

// 미션 삭제 훅 (관리자용)
export const useDeleteMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => missionApi.deleteMission(id),
    onSuccess: () => {
      // 모든 미션 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
    onError: (error) => {
      console.error('미션 삭제 오류:', error);
    },
  });
};

// 기본 미션 생성 훅 (관리자용)
export const useCreateDefaultMissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: missionApi.createDefaultMissions,
    onSuccess: () => {
      // 활성 미션 목록 갱신
      queryClient.invalidateQueries({ queryKey: missionKeys.active() });
    },
    onError: (error) => {
      console.error('기본 미션 생성 오류:', error);
    },
  });
};

// 만료된 미션 정리 훅 (관리자용)
export const useCleanupExpiredMissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: missionApi.cleanupExpiredMissions,
    onSuccess: () => {
      // 모든 미션 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
    onError: (error) => {
      console.error('만료된 미션 정리 오류:', error);
    },
  });
};

// 미션 진행 상황 분석 훅
export const useMissionAnalysis = () => {
  const { data: activeMissions = [], isLoading: activeLoading } = useActiveMissions();
  const { data: completedMissions = [], isLoading: completedLoading } = useCompletedMissions();

  // 완료 가능한 미션 (90% 이상 진행)
  const nearCompletionMissions = activeMissions?.filter(
    (mission: MissionWithProgress) => mission.progressPercent >= 90
  ) || [];

  // 시급한 미션 (3일 이내 만료)
  const urgentMissions = activeMissions?.filter(
    (mission: MissionWithProgress) => mission.daysLeft !== undefined && mission.daysLeft <= 3
  ) || [];

  // 카테고리별 미션 그룹화
  const missionsByCategory = activeMissions.length > 0 
    ? missionApi.groupMissionsByCategory(activeMissions)
    : {};

  // 총 진행률 계산
  const totalProgress = activeMissions.length > 0 
    ? Math.round(activeMissions.reduce((sum: number, mission: MissionWithProgress) => sum + mission.progressPercent, 0) / activeMissions.length)
    : 0;

  // 이번 주 완료된 미션 수
  const thisWeekCompleted = completedMissions.filter((mission: Mission) => {
    if (!mission.completedAt) return false;
    const completedDate = new Date(mission.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate > weekAgo;
  }).length;

  return {
    activeMissions,
    completedMissions,
    nearCompletionMissions,
    urgentMissions,
    missionsByCategory,
    totalProgress,
    thisWeekCompleted,
    stats: {
      total: activeMissions.length + completedMissions.length,
      active: activeMissions.length,
      completed: completedMissions.length,
      nearCompletion: nearCompletionMissions.length,
      urgent: urgentMissions.length,
    },
    isLoading: activeLoading || completedLoading,
  };
};

// 특정 타입의 미션 진행 상황 훅
export const useMissionProgress = (missionType: MissionType) => {
  const { data: activeMissions = [], isLoading } = useActiveMissions();
  
  const typeMissions = activeMissions.filter((mission: MissionWithProgress) => mission.missionType === missionType);
  const mostAdvanced = typeMissions.length > 0 
    ? typeMissions.reduce((prev: MissionWithProgress, current: MissionWithProgress) => 
        (prev.progressPercent > current.progressPercent) ? prev : current
      )
    : null;

  return {
    missions: typeMissions,
    count: typeMissions.length,
    mostAdvanced,
    averageProgress: typeMissions.length > 0 
      ? Math.round(typeMissions.reduce((sum: number, mission: MissionWithProgress) => sum + mission.progressPercent, 0) / typeMissions.length)
      : 0,
    isLoading,
  };
};

// 미션 알림 훅
export const useMissionNotifications = () => {
  const { nearCompletionMissions, urgentMissions, isLoading } = useMissionAnalysis();

  // 완료 가능한 미션 알림
  const completionNotifications = nearCompletionMissions?.map((mission: MissionWithProgress) => ({
    id: `completion-${mission.id}`,
    type: 'completion' as const,
    title: '미션 완료 가능!',
    message: `"${mission.title}" 미션을 완료할 수 있어요!`,
    mission,
  })) || [];

  // 시급한 미션 알림
  const urgentNotifications = urgentMissions?.map((mission: MissionWithProgress) => ({
    id: `urgent-${mission.id}`,
    type: 'urgent' as const,
    title: '미션 마감 임박!',
    message: `"${mission.title}" 미션이 ${mission.daysLeft}일 후 만료돼요!`,
    mission,
  })) || [];

  return {
    notifications: [...completionNotifications, ...urgentNotifications],
    hasNotifications: completionNotifications.length > 0 || urgentNotifications.length > 0,
    completionCount: completionNotifications.length,
    urgentCount: urgentNotifications.length,
    isLoading,
  };
};