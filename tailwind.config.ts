import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./entrypoints/**/*.{html,ts,vue}', './components/**/*.{html,ts,vue}'],
  theme: {
    extend: {
      colors: {
        // DevTools themed colors
        devtools: {
          bg: {
            light: '#ffffff',
            dark: '#202124',
          },
          panel: {
            light: '#f1f3f4',
            dark: '#292a2d',
          },
          border: {
            light: '#dadce0',
            dark: '#3c4043',
          },
          hover: {
            light: '#e8eaed',
            dark: '#35363a',
          },
          selected: {
            light: '#e8f0fe',
            dark: '#394457',
          },
          text: {
            light: '#202124',
            dark: '#e8eaed',
            mutedLight: '#5f6368',
            mutedDark: '#9aa0a6',
          },
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
