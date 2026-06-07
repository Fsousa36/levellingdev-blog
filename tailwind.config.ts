import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#06070b',
        panel: '#0f1720',
        line: '#263241',
        cyan: '#49d7ff',
        mint: '#79f2c0',
        amber: '#ffd166'
      },
      boxShadow: {
        glow: '0 0 60px rgba(73, 215, 255, 0.14)'
      }
    }
  },
  plugins: [typography]
};

export default config;
