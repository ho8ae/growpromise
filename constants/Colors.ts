// constants/Colors.ts
const tintColorLight = '#3b82f6'; // blue-500
const tintColorDark = '#60a5fa'; // blue-400

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#9ca3af', // gray-400
    tabIconSelected: tintColorLight,
    primary: '#3b82f6', // blue-500
    secondary: '#10b981', // green-500
    accent: '#8b5cf6', // violet-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    info: '#0ea5e9', // sky-500
    gray: '#9ca3af', // gray-400
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#6b7280', // gray-500
    tabIconSelected: tintColorDark,
    primary: '#60a5fa', // blue-400
    secondary: '#34d399', // green-400
    accent: '#a78bfa', // violet-400
    warning: '#fbbf24', // amber-400
    danger: '#f87171', // red-400
    info: '#38bdf8', // sky-400
    gray: '#6b7280', // gray-500
  },
};