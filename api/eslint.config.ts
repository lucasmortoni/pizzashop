import js from '@eslint/js'
import globals from 'globals'

import eslintTypeScriptConfig from 'typescript-eslint'
import eslintPrettierConfig from 'eslint-plugin-prettier/recommended'
import eslintDrizzleConfig from 'eslint-plugin-drizzle'

import { fixupPluginRules } from '@eslint/compat'

import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      js,
      drizzle: fixupPluginRules(eslintDrizzleConfig)
    },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      ...eslintDrizzleConfig.configs.recommended.rules
    }
  },
  eslintTypeScriptConfig.configs.recommended,
  eslintTypeScriptConfig.configs.strict,
  eslintPrettierConfig
])
