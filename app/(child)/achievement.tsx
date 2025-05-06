import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

interface AchievementProps {
  // 필요한 props를 여기에 정의
}

const Achievement = ({}: AchievementProps) => {
  return (
    <View style={styles.container}>
      <Text>업적 화면</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Achievement;