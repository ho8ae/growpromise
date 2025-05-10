import React from 'react';
import { Animated } from 'react-native';
import CharacterDisplay from '../common/CharacterDisplay';

interface CharacterContainerProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  characterStage: number;
  completedPromises: number;
  totalPromises: number;
  userType?: string;
  isLoading: boolean;
  onPress: () => void;
}

const CharacterContainer = ({
  fadeAnim,
  translateY,
  characterStage,
  completedPromises,
  totalPromises,
  userType,
  isLoading,
  onPress,
}: CharacterContainerProps) => {
  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY }], marginBottom: 20 }}
    >
      <CharacterDisplay
        characterStage={characterStage}
        completedPromises={completedPromises}
        totalPromises={totalPromises}
        userType={userType === 'PARENT' ? 'parent' : 'child'}
        isLoading={isLoading}
        onPress={onPress}
      />
    </Animated.View>
  );
};

export default CharacterContainer;