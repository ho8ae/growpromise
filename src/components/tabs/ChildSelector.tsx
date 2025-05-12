import React from 'react';
import { Animated, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChildParentConnection } from '../../api/modules/user';

interface ChildSelectorProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  connectedChildren: ChildParentConnection[];
  selectedChildId: string | null;
  handleChildSelect: (childId: string) => void;
}

export default function ChildSelector({
  fadeAnim,
  translateY,
  connectedChildren,
  selectedChildId,
  handleChildSelect,
}: ChildSelectorProps) {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
      className="mb-4"
    >
      <Text className="text-sm font-medium text-gray-600 mb-2">
        자녀 선택
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {connectedChildren.map((connection) => {
          const isSelected = connection.childId === selectedChildId;
          const childName = connection.child?.user?.username || '자녀';
          const profileImage = connection.child?.user?.profileImage;
          
          return (
            <TouchableOpacity
              key={connection.childId}
              onPress={() => handleChildSelect(connection.childId)}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
                isSelected ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              {/* 프로필 이미지가 있으면 표시, 없으면 기본 아이콘 */}
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <View className="w-6 h-6 rounded-full bg-gray-300 mr-2 items-center justify-center">
                  <Text className="text-xs font-bold text-gray-500">
                    {childName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-gray-700'
                }`}
              >
                {childName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}