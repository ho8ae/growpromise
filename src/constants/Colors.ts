/**
 * 앱 전체에서 사용할 색상 상수를 정의합니다.
 */

export default {
  light: {
    // 기본 색상
    primary: '#10b981', // emerald-500
    secondary: '#8b5cf6', // violet-500
    tertiary: '#3b82f6', // blue-500
    
    // 테마 색상
    leafGreen: '#10b981', // emerald-500 (주요 브랜드 색상)
    leafLightGreen: '#a7f3d0', // emerald-200
    stemBrown: '#d97706', // amber-600
    sky: '#0ea5e9', // sky-500
    amber: '#f59e0b', // amber-500
    
    // 의미 색상
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
    
    // 중립 색상
    background: '#f8fafc', // slate-50
    card: '#ffffff', // white
    text: '#1e293b', // slate-800
    textSecondary: '#64748b', // slate-500
    border: '#e2e8f0', // slate-200
    placeholder: '#94a3b8', // slate-400
    
    // 약속 유형 색상
    promise: {
      study: '#60a5fa', // blue-400
      chore: '#a78bfa', // violet-400
      reading: '#34d399', // emerald-400
      music: '#f87171', // red-400
      exercise: '#fcd34d', // amber-300
      health: '#f472b6', // pink-400
      family: '#fb923c', // orange-400
      default: '#9ca3af', // gray-400
    },
    
    // 기존 색상 (이전 코드와의 호환성을 위해 유지)
    gray: '#d1d5db',
  },
  dark: {
    // 기본 색상
    primary: '#059669', // emerald-600
    secondary: '#7c3aed', // violet-600
    tertiary: '#2563eb', // blue-600
    
    // 테마 색상
    leafGreen: '#059669', // emerald-600 (주요 브랜드 색상)
    leafLightGreen: '#6ee7b7', // emerald-300
    stemBrown: '#b45309', // amber-700
    sky: '#0284c7', // sky-600
    amber: '#d97706', // amber-600
    
    // 의미 색상
    success: '#059669', // emerald-600
    warning: '#d97706', // amber-600
    error: '#dc2626', // red-600
    info: '#2563eb', // blue-600
    
    // 중립 색상
    background: '#0f172a', // slate-900
    card: '#1e293b', // slate-800
    text: '#f8fafc', // slate-50
    textSecondary: '#cbd5e1', // slate-300
    border: '#334155', // slate-700
    placeholder: '#64748b', // slate-500
    
    // 약속 유형 색상
    promise: {
      study: '#3b82f6', // blue-500
      chore: '#8b5cf6', // violet-500
      reading: '#10b981', // emerald-500
      music: '#ef4444', // red-500
      exercise: '#f59e0b', // amber-500
      health: '#ec4899', // pink-500
      family: '#f97316', // orange-500
      default: '#6b7280', // gray-500
    },
    
    // 기존 색상 (이전 코드와의 호환성을 위해 유지)
    gray: '#6b7280',
  },
};