// constants/Colors.ts
const tintColorLight = '#4ade80'; // green-400
const tintColorDark = '#86efac'; // green-300

export default {
  light: {
    text: '#3f3f46', // zinc-700
    background: '#f8fafc', // slate-50
    tint: tintColorLight,
    tabIconDefault: '#9ca3af', // gray-400
    tabIconSelected: tintColorLight,
    
    // 기본 색상
    primary: '#4ade80', // green-400 - 메인 버튼, 강조색
    secondary: '#a3e635', // lime-400 - 서브 버튼, 보조색
    tertiary: '#fde68a', // amber-200 - 포인트 색상
    
    // 식물 느낌의 색상
    leafGreen: '#10b981', // emerald-500 - 잎사귀 색상
    stemBrown: '#92400e', // amber-800 - 줄기 색상
    softEarth: '#d6d3d1', // stone-300 - 흙 색상
    
    // 배경 및 카드용 파스텔 색상
    leafBg: '#d1fae5', // emerald-100 - 잎 테마 배경
    stemBg: '#fef3c7', // amber-100 - 줄기 테마 배경
    soilBg: '#f5f5f4', // stone-100 - 흙 테마 배경
    
    // 포인트 색상
    sunYellow: '#fcd34d', // amber-300 - 해 포인트 색상
    waterBlue: '#bae6fd', // sky-200 - 물 포인트 색상
    flowerPink: '#fda4af', // rose-300 - 꽃 포인트 색상

    // 텍스트 색상
    gray: '#9ca3af', // gray-400
    white: '#ffffff', // white
    black: '#000000', // black
  },
  // 다크 모드용 색상 (필요 시)
  dark: {
    // ...
  }
};