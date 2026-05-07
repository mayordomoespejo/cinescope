import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import sonarjs from 'eslint-plugin-sonarjs'

export default defineConfig([
  globalIgnores(['dist', 'coverage', '.claude/worktrees']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: { ...jsxA11y.configs.recommended.rules },
  },
  sonarjs.configs.recommended,
  {
    rules: {
      // Downgrade noisy sonarjs style rules — these are pervasive in JSX/TSX
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/cognitive-complexity': 'warn',
    },
  },
])
