import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { 
    ignores: [
      'dist',
      'node_modules',
      'packages/react-app/node_modules*',
      '**/.tailwindcss-*/**',
      '**/.autoprefixer-*/**',
      '**/.vite/**',
      '**/.nanoid-*/**',
      'packages/**',
      'backend/**',
      'cli-agent/**',
      '**/postcss.config.cjs'
    ] 
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.2' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['error', { 
        'varsIgnorePattern': '^(React|_|Canvas|OrbitControls|Stars|Globe3D|Dashboard|RotatingGlobe|StrictMode|App)$',
        'argsIgnorePattern': '^_'
      }],
    },
  },
]
