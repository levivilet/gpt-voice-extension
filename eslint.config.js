import * as config from '@lvce-editor/eslint-config'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...config.default,
  ...config.recommendedRegex,
  ...config.recommendedTsconfig,
  ...config.recommendedVirtualDom,
  ...config.recommendedActions,
  {
    rules: {
      'virtual-dom/prefer-state-destructuring': 'off',
      '@cspell/spellchecker': 'off',
      'virtual-dom/hoist-static-nodes': 'off',
      'sonarjs/no-trivial-assertions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'sonarjs/x-powered-by': 'off',
    },
  },
  {
    files: ['packages/node/src/server.ts'],
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'no-console': 'off',
    },
  },
])
