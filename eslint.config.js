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
      '@cspell/spellchecker': 'off',
      'sonarjs/no-trivial-assertions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'sonarjs/x-powered-by': 'off',
    },
  },
])
