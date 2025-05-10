import React from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { ChildParentConnection } from '../../api/modules/user';

interface ChildSelectorProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  connectedChildren: ChildParentConnection[];
  selectedChildId: string | null;
  handleChildSelect: (childId: string) => void;
}

const ChildSelector = ({ 
  fadeAnim, 
  translateY, 
  connectedChildren, 
  selectedChildId, 
  handleChildSelect 
}: ChildSelectorProps) => {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 8,
      }}
    >
      <View className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-3">
        <Text className="text-gray-700 font-medium mb-2">자녀 선택</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {connectedChildren.map((connection) => (
            <Pressable
              key={connection.childId}
              onPress={() => handleChildSelect(connection.childId)}
              className={`mr-2 px-4 py-2 rounded-lg ${
                selectedChildId === connection.childId 
                  ? 'bg-emerald-100 border-emerald-300' 
                  : 'bg-gray-100 border-gray-200'
              } border`}
            >
              <Text 
                className={selectedChildId === connection.childId 
                  ? 'text-emerald-700 font-medium' 
                  : 'text-gray-700'
                }
              >
                {connection.child?.user.username || '자녀'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

export default ChildSelector;