// // src/hooks/useChildRewards.ts
// import { useState } from 'react';
// import { useQuery, useQueryClient } from '@tanstack/react-query';

// // API
// import stickerApi, { Sticker } from '../api/modules/sticker';
// import rewardApi, { Reward } from '../api/modules/reward';
// import userApi, { ChildParentConnection } from '../api/modules/user';

// // 자녀 정보 인터페이스
// export interface ChildInfo {
//   id: string;
//   username: string;
//   profileImage: string | null;
//   stickerCount: {
//     total: number;
//     available: number;
//   };
// }

// // 통합 데이터 인터페이스
// export interface ChildRewardsData {
//   childInfo: ChildInfo | null;
//   stickers: Sticker[];
//   rewards: Reward[];
//   isLoading: boolean;
//   isRefreshing: boolean;
//   errorMessage: string | null;
//   refresh: () => Promise<void>;
// }

// export default function useChildRewards(childId: string): ChildRewardsData {
//   const queryClient = useQueryClient();
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   // 1. 부모-자녀 연결 정보 가져오기
//   const {
//     data: connection,
//     isLoading: isConnectionLoading,
//     error: connectionError
//   } = useQuery({
//     queryKey: ['childConnection', childId],
//     queryFn: async () => {
//       try {
//         // 부모의 연결된 자녀 목록 조회
//         const connections = await userApi.getParentChildren();
//         // childId와 일치하는 연결 정보 찾기
//         const connection = connections.find(conn => conn.childId === childId);
        
//         if (!connection) {
//           throw new Error('연결된 자녀 정보를 찾을 수 없습니다.');
//         }
        
//         return connection;
//       } catch (error) {
//         console.error('자녀 연결 정보 로드 실패:', error);
//         throw error;
//       }
//     },
//     retry: 1,
//     enabled: !!childId
//   });

//   // 2. 자녀 정보 조회 (userId 사용)
//   const {
//     data: childInfo,
//     isLoading: isChildLoading,
//     error: childError
//   } = useQuery({
//     queryKey: ['childInfo', connection?.child?.userId],
//     queryFn: async (): Promise<ChildInfo> => {
//       try {
//         // connection에서 자녀의 userId 사용
//         const userId = connection?.child?.userId;
        
//         if (!userId) {
//           throw new Error('자녀 사용자 ID를 찾을 수 없습니다.');
//         }
        
//         const userInfo = await userApi.getUserById(userId);
//         const stickerCountInfo = await stickerApi.getChildStickerCount(childId);
        
//         return {
//           id: userInfo.id,
//           username: userInfo.username,
//           profileImage: userInfo.profileImage || null,
//           stickerCount: stickerCountInfo
//         };
//       } catch (error) {
//         console.error('자녀 정보 로드 실패:', error);
//         // 기본 정보 반환 (connection 정보에서 가져올 수 있는 데이터 활용)
//         return {
//           id: connection?.child?.userId || childId,
//           username: connection?.child?.user?.username || '자녀',
//           profileImage: connection?.child?.user?.profileImage || null,
//           stickerCount: { total: 0, available: 0 }
//         };
//       }
//     },
//     retry: 1,
//     enabled: !!connection?.child?.userId
//   });

//   // 3. 자녀 스티커 조회
//   const {
//     data: stickers = [],
//     isLoading: isStickersLoading,
//     error: stickersError
//   } = useQuery({
//     queryKey: ['childStickers', childId],
//     queryFn: () => stickerApi.getChildStickersByParent(childId),
//     retry: 1,
//     enabled: !!childId
//   });

//   // 4. 부모 보상 목록 조회
//   const {
//     data: rewards = [],
//     isLoading: isRewardsLoading,
//     error: rewardsError
//   } = useQuery({
//     queryKey: ['parentRewards'],
//     queryFn: rewardApi.getParentRewards,
//     retry: 1
//   });

//   // 에러 메시지 구성
//   const errorMessage = connectionError || childError || stickersError || rewardsError 
//     ? '일부 정보를 불러오는데 문제가 발생했습니다.' 
//     : null;

//   // 데이터 로딩 상태
//   const isLoading = isConnectionLoading || isChildLoading || isStickersLoading || isRewardsLoading;

//   // 새로고침 함수
//   const refresh = async () => {
//     setIsRefreshing(true);
//     try {
//       await Promise.all([
//         queryClient.invalidateQueries({ queryKey: ['childConnection', childId] }),
//         queryClient.invalidateQueries({ queryKey: ['childInfo'] }),
//         queryClient.invalidateQueries({ queryKey: ['childStickers', childId] }),
//         queryClient.invalidateQueries({ queryKey: ['parentRewards'] })
//       ]);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   return {
//     childInfo: childInfo || null,
//     stickers,
//     rewards,
//     isLoading,
//     isRefreshing,
//     errorMessage,
//     refresh
//   };
// }