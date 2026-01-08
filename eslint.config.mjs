import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // Disable rules that are too strict for this codebase
      'no-case-declarations': 'off',
      'prefer-const': 'warn',
    },
  },
  {
    ignores: ['tmp/**', 'node_modules/**', '.next/**', 'out/**'],
  }
);
