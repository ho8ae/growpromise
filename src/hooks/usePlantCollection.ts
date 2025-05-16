// hooks/usePlantCollection.ts
import { useState, useEffect } from 'react';
import plantApi, { PlantCollectionGroup } from '../api/modules/plant';

interface UsePlantCollectionProps {
  childId?: string;
  isParent?: boolean;
}

interface UsePlantCollectionReturn {
  collection: PlantCollectionGroup[];
  isLoading: boolean;
  error: string | null;
  refreshCollection: () => Promise<void>;
  completedPlantCount: number;
}

export const usePlantCollection = ({ 
  childId, 
  isParent = false 
}: UsePlantCollectionProps): UsePlantCollectionReturn => {
  const [collection, setCollection] = useState<PlantCollectionGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completedPlantCount, setCompletedPlantCount] = useState(0);
  
  // 식물 도감 불러오기
  const loadCollection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let collectionData;
      
      // 부모모드인지 자녀모드인지에 따라 적절한 API 호출
      if (isParent && childId) {
        collectionData = await plantApi.getChildPlantCollection(childId);
      } else {
        collectionData = await plantApi.getPlantCollection();
      }
      
      setCollection(collectionData);
      
      // 완료된 식물 수 계산
      let count = 0;
      collectionData.forEach(group => {
        count += group.plants.length;
      });
      setCompletedPlantCount(count);
    } catch (err) {
      console.error('식물 도감 로드 오류:', err);
      setError('식물 도감을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadCollection();
  }, [childId, isParent]);
  
  // 도감 새로고침
  const refreshCollection = async () => {
    await loadCollection();
  };
  
  return {
    collection,
    isLoading,
    error,
    refreshCollection,
    completedPlantCount
  };
};