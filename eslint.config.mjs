import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    overrides: {
      'vue/max-attributes-per-line': ['error', { singleline: 1 }],
    },
  },
})
