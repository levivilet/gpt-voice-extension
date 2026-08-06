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
    },
  },
])
