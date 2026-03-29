import js from '@eslint/js'
import vue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,   // ← Isso resolve o erro
        project: './tsconfig.app.json',
      },
    },
  },
]
