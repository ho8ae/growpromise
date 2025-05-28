// src/managers/ModalManager.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plant } from '../api/modules/plant';
import { GrowthResult } from '../api/modules/plant';
import PlantCompletionModal from '../components/plant/PlantCompletionModal';
import { useNavigation } from '../providers/NavigationProvider';

interface ModalState {
  plantCompletion: {
    visible: boolean;
    plant: Plant | null;
    growthResult: GrowthResult | null;
  };
  // 추후 다른 모달들도 여기에 추가 가능
}

interface ModalManagerContextType {
  // 식물 완료 모달
  showPlantCompletion: (plant: Plant, growthResult: GrowthResult) => void;
  hidePlantCompletion: () => void;

  // 범용 모달 메서드 (확장성을 위해)
  showModal: (type: string, data: any) => void;
  hideModal: (type: string) => void;

  // 모달 상태 확인
  isModalVisible: (type: string) => boolean;
}

const ModalManagerContext = createContext<ModalManagerContextType | null>(null);

export const useModalManager = () => {
  const context = useContext(ModalManagerContext);
  if (!context) {
    throw new Error('useModalManager must be used within ModalManagerProvider');
  }
  return context;
};

interface ModalManagerProviderProps {
  children: React.ReactNode;
}

export const ModalManagerProvider: React.FC<ModalManagerProviderProps> = ({ children }) => {
  const { navigateToHome, navigateToCollection } = useNavigation();
  const queryClient = useQueryClient();
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [modalState, setModalState] = useState<ModalState>({
    plantCompletion: {
      visible: false,
      plant: null,
      growthResult: null,
    },
  });

  // 🎯 식물 완료 모달 확인 핸들러 (데이터 새로고침 추가)
  const handlePlantCompletionConfirm = () => {
    console.log('🎉 Plant completion confirmed in ModalManager');
  
    const isCompleted =
      modalState.plantCompletion.growthResult?.isCompleted ||
      modalState.plantCompletion.growthResult?.isMaxStage;
  
    // 모달 숨기기 먼저
    hidePlantCompletion();
  
    // 🔄 강제 데이터 새로고침
    queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
    queryClient.invalidateQueries({ queryKey: ['promiseStats'] });
    queryClient.invalidateQueries({ queryKey: ['plantCollection'] });
  
    // 🎯 완성된 식물의 경우 선택지 제공
    if (isCompleted) {
      setTimeout(() => {
        // 새 식물 선택하기 vs 홈으로 가기 선택지 제공
        console.log('🌱 Redirecting to plant selection or home');
        navigateToHome(); // 또는 특별한 완성 페이지로
      }, 500);
    }
  };

  // 식물 완료 모달 표시
  const showPlantCompletion = useCallback(
    (plant: Plant, growthResult: GrowthResult) => {
      console.log('🎉 Plant completion modal requested');
      setModalState((prev) => ({
        ...prev,
        plantCompletion: {
          visible: true,
          plant,
          growthResult,
        },
      }));
    },
    [],
  );

  // 식물 완료 모달 숨기기
  const hidePlantCompletion = useCallback(() => {
    console.log('❌ Plant completion modal hide requested');

    // 🔄 데이터 새로고침
    queryClient.invalidateQueries({ queryKey: ['currentPlant'] });

    setModalState((prev) => ({
      ...prev,
      plantCompletion: {
        visible: false,
        plant: null,
        growthResult: null,
      },
    }));
  }, [queryClient]);

  // 범용 모달 메서드
  const showModal = useCallback((type: string, data: any) => {
    console.log(`📱 Show modal: ${type}`);
    setModalState((prev) => ({
      ...prev,
      [type]: {
        visible: true,
        ...data,
      },
    }));
  }, []);

  const hideModal = useCallback((type: string) => {
    console.log(`❌ Hide modal: ${type}`);
    setModalState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type as keyof ModalState],
        visible: false,
      },
    }));
  }, []);

  // 모달 상태 확인
  const isModalVisible = useCallback(
    (type: string) => {
      return (modalState as any)[type]?.visible || false;
    },
    [modalState],
  );

  return (
    <ModalManagerContext.Provider
      value={{
        showPlantCompletion,
        hidePlantCompletion,
        showModal,
        hideModal,
        isModalVisible,
      }}
    >
      {children}

      {/* 식물 완료 모달 렌더링 */}
      {modalState.plantCompletion.visible &&
        modalState.plantCompletion.plant &&
        modalState.plantCompletion.growthResult && (
          <PlantCompletionModal
            visible={modalState.plantCompletion.visible}
            plant={modalState.plantCompletion.plant}
            growthResult={modalState.plantCompletion.growthResult}
            onClose={handlePlantCompletionConfirm} // 변경됨
            onContinue={handlePlantCompletionConfirm} // 변경됨
          />
        )}
    </ModalManagerContext.Provider>
  );
};
