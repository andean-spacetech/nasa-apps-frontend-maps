module.exports = {
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  }
};
