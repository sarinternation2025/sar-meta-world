module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Allow unused variables and parameters for development/placeholder code
    'no-unused-vars': ['error', { 
      vars: 'all', 
      args: 'none', // Allow unused function arguments
      ignoreRestSiblings: false,
      argsIgnorePattern: '^_' // Allow variables starting with underscore
    }],
  },
};
