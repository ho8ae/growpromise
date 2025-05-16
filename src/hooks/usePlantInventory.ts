// hooks/usePlantInventory.ts
import { useState, useEffect } from 'react';
import plantApi, { PlantType, PlantInventoryItem, PackType } from '../api/modules/plant';

interface UsePlantInventoryProps {
  childId?: string;
  isParent?: boolean;
}

interface UsePlantInventoryReturn {
  inventory: PlantInventoryItem[];
  isLoading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  packPrices: Record<PackType, number> | null;
  drawPlant: (packType: PackType) => Promise<any>;
}

export const usePlantInventory = ({ 
  childId, 
  isParent = false 
}: UsePlantInventoryProps): UsePlantInventoryReturn => {
  const [inventory, setInventory] = useState<PlantInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [packPrices, setPackPrices] = useState<Record<PackType, number> | null>(null);
  
  // 식물 인벤토리 불러오기
  const loadInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let inventoryData;
      
      // 부모모드인지 자녀모드인지에 따라 적절한 API 호출
      if (isParent && childId) {
        inventoryData = await plantApi.getChildPlantInventory(childId);
      } else {
        inventoryData = await plantApi.getPlantInventory();
      }
      
      setInventory(inventoryData);
      
      // 카드팩 가격 정보 가져오기
      try {
        const prices = await plantApi.getPackPrices();
        setPackPrices(prices);
      } catch (priceErr) {
        console.warn('카드팩 가격 정보 로드 실패:', priceErr);
        // 기본 가격 설정
        setPackPrices({
          [PackType.BASIC]: 100,
          [PackType.PREMIUM]: 300,
          [PackType.SPECIAL]: 500
        });
      }
    } catch (err) {
      console.error('식물 인벤토리 로드 오류:', err);
      setError('식물 인벤토리를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInventory();
  }, [childId, isParent]);
  
  // 식물 뽑기 기능
  const drawPlant = async (packType: PackType) => {
    try {
      setIsLoading(true);
      
      const result = await plantApi.drawPlant(packType);
      
      // 인벤토리 새로고침
      await loadInventory();
      
      return result;
    } catch (err) {
      console.error('식물 뽑기 오류:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // 인벤토리 새로고침
  const refreshInventory = async () => {
    await loadInventory();
  };
  
  return {
    inventory,
    isLoading,
    error,
    refreshInventory,
    packPrices,
    drawPlant
  };
};