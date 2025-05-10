import React from 'react';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Ionicons, 
  Entypo, 
  Feather 
} from '@expo/vector-icons';

// 아이콘 타입
type IconType = 'material' | 'material-community' | 'ionicons' | 'entypo' | 'feather';

// FontAwesome5 아이콘 이름을 다른 아이콘 세트로 매핑
const ICON_MAPPING: Record<string, { name: string; type: IconType }> = {
  // 기본 아이콘
  'info': { name: 'info', type: 'material' },
  'clipboard-list': { name: 'assignment', type: 'material' },
  'check-circle': { name: 'check-circle', type: 'material' },
  'tasks': { name: 'checklist', type: 'material' },
  'star': { name: 'star', type: 'material' },
  'tint': { name: 'water-drop', type: 'material' },
  'hand-holding-water': { name: 'water', type: 'material-community' },
  'lightbulb': { name: 'lightbulb', type: 'material' },
  'question-circle': { name: 'help-circle', type: 'material' },
  
  // 캐릭터 관련 아이콘
  'seedling': { name: 'grass', type: 'material' },
  'spa': { name: 'eco', type: 'material' },
  'tree': { name: 'nature', type: 'material' },
  'apple-alt': { name: 'emoji-food-beverage', type: 'material' },
  'lock': { name: 'lock', type: 'material' },
  'chart-line': { name: 'trending-up', type: 'material' },
  
  // 기타 자주 사용하는 아이콘
  'home': { name: 'home', type: 'material' },
  'cog': { name: 'settings', type: 'material' },
  'user': { name: 'person', type: 'material' },
  'calendar-alt': { name: 'calendar-today', type: 'material' },
  'chevron-left': { name: 'chevron-left', type: 'material' },
  'chevron-right': { name: 'chevron-right', type: 'material' },
  'times': { name: 'close', type: 'material' },
  'exclamation-circle': { name: 'error', type: 'material' },
};

interface SafeIconProps {
  name: string;
  size: number;
  color: string;
}

const SafeIcon: React.FC<SafeIconProps> = ({ name, size, color }) => {
  // FontAwesome5 아이콘 이름을 매핑된 아이콘으로 변환
  const iconInfo = ICON_MAPPING[name] || { name: 'help', type: 'material' };
  
  // 아이콘 타입에 따라 적절한 아이콘 세트 사용
  switch (iconInfo.type) {
    case 'material':
      return <MaterialIcons name={iconInfo.name as any} size={size} color={color} />;
    case 'material-community':
      return <MaterialCommunityIcons name={iconInfo.name as any} size={size} color={color} />;
    case 'ionicons':
      return <Ionicons name={iconInfo.name as any} size={size} color={color} />;
    case 'entypo':
      return <Entypo name={iconInfo.name as any} size={size} color={color} />;
    case 'feather':
      return <Feather name={iconInfo.name as any} size={size} color={color} />;
    default:
      return <MaterialIcons name="help" size={size} color={color} />;
  }
};

export default SafeIcon;