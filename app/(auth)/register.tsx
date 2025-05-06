import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface registerProps {}

const register = ({}: registerProps) => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View>
        <Text>Register</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default register;
