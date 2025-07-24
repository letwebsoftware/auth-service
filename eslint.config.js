// @ts-check
import eslint from '@eslint/js';
// @ts-expect-error eslint.config.js is a TypeScript file
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
);