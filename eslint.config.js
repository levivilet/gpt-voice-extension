import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  ...config.recommendedRegex,
  ...config.recommendedTsconfig,
  ...config.recommendedVirtualDom,
  ...config.recommendedActions,
  {
    rules: {
      'virtual-dom/prefer-state-destructuring': 'off',
    },
  },
]
