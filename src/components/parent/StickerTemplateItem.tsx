// import React from 'react';
// import { View, Text, Pressable } from 'react-native';
// import { Image } from 'expo-image';
// import * as Haptics from 'expo-haptics';
// import { StickerTemplate } from '../../api/modules/sticker';
// import { getStickerImageSource } from '../../services/stickerService';
// import { FontAwesome5 } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import Colors from '../../constants/Colors';

// interface StickerTemplateItemProps {
//   template: StickerTemplate;
//   color?: string;
//   onPress: (template: StickerTemplate) => void;
// }

// /**
//  * 스티커 템플릿 관리 화면에서 사용하는 스티커 아이템 컴포넌트
//  * 최신 트렌드에 맞게 디자인 업데이트
//  */
// const StickerTemplateItem = React.memo(({ template, onPress }: StickerTemplateItemProps) => {
//   const handlePress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     onPress(template);
//   };

//   // 스티커 배경 그래디언트 색상 생성
//   const getGradientColors = () => {
//     const defaultColors = ['rgba(209,250,229,0.5)', 'rgba(236,253,245,0.5)'];
    
//     if (!template.color) return defaultColors;
    
//     // 색상 변형을 위해 투명도를 조절한 두 가지 색상 생성
//     const baseColor = template.color;
//     return [
//       baseColor + '15', // 10% 투명도
//       baseColor + '05'  // 3% 투명도
//     ];
//   };

//   // 카테고리 배지 색상 설정
//   const getCategoryColor = () => {
//     const category = template.category?.toLowerCase() || '';
    
//     if (category.includes('성취')) return 'bg-blue-500';
//     if (category.includes('축하')) return 'bg-pink-500';
//     if (category.includes('칭찬')) return 'bg-amber-500';
//     if (category.includes('기념')) return 'bg-purple-500';
//     if (category.includes('일상')) return 'bg-emerald-500';
    
//     return 'bg-gray-500';
//   };

//   return (
//     <Pressable
//       className="m-1.5 active:opacity-90"
//       style={{ width: '47%' }}
//       onPress={handlePress}
//     >
//       <View className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
//         <LinearGradient
//           colors={getGradientColors()}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           className="p-4 items-center"
//         >
//           {template.category && (
//             <View className={`absolute top-2 right-2 px-2 py-0.5 rounded-full ${getCategoryColor()}`}>
//               <Text className="text-white text-[10px] font-medium">
//                 {template.category}
//               </Text>
//             </View>
//           )}
          
//           <Image
//             source={getStickerImageSource(template.imageUrl)}
//             style={{ width: 80, height: 80 }}
//             contentFit="contain"
//             className="mb-2"
//             transition={250}
//             cachePolicy="memory-disk"
//           />
//         </LinearGradient>
        
//         <View className="bg-white p-3 items-center">
//           <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
//             {template.name}
//           </Text>
          
//           {template.description && (
//             <Text className="text-xs text-center text-gray-500 mt-1" numberOfLines={1}>
//               {template.description}
//             </Text>
//           )}
          
//           <Pressable 
//             className="mt-2 flex-row items-center px-3 py-1.5 bg-gray-100 rounded-full active:bg-gray-200"
//             onPress={handlePress}
//           >
//             <FontAwesome5 name="info-circle" size={12} color={Colors.light.primary} className="mr-1" />
//             <Text className="text-xs text-emerald-700">자세히 보기</Text>
//           </Pressable>
//         </View>
//       </View>
//     </Pressable>
//   );
// });

// StickerTemplateItem.displayName = 'StickerTemplateItem';

// export default StickerTemplateItem;