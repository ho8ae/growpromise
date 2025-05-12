import React from 'react';
import { Animated } from 'react-native';
import PlantContainer from './PlantContainer';

interface CharacterContainerProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  characterStage: number;
  completedPromises: number;
  totalPromises: number;
  userType?: string;
  isLoading: boolean;
  onPress: () => void;
  childId?: string;
}

const CharacterContainer = ({
  fadeAnim,
  translateY,
  userType,
  isLoading,
  onPress,
  childId,
}: CharacterContainerProps) => {
  return (
    <PlantContainer
      fadeAnim={fadeAnim}
      translateY={translateY}
      userType={userType === 'parent' ? 'PARENT' : 'CHILD'}
      isLoading={isLoading}
      onPress={onPress}
      childId={childId}
    />
  );
};

export default CharacterContainer;
