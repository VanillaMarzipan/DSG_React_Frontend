module.exports = {
  extends: [
    "eslint:recommended",
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
    "plugin:cypress/recommended"
  ],
  plugins: [
    'react',
    'react-native',
    'promise',
    '@typescript-eslint',
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  env: {
    'react-native/react-native': true
  },
  rules: {
    "semi": 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: true, classes: true, variables: false }
    ],
    "no-use-before-define": "off",
    '@typescript-eslint/member-delimiter-style': [
      'error',
      { multiline: { delimiter: 'none' } }
    ],
    "indent": ['error', 2],
    "quotes": [2, "single", { "avoidEscape": true }],
    'jsx-quotes': [2, 'prefer-single'],
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"]
  },
  globals: {
    focus: true,
    browser: true,
    fetch: true,
    localStorage: true,
    it: true,
    expect: true,
    async: true,
    Headers: true,
    CefSharp: true,
    boundAsync: true,
    describe: true,
    performance: true,
    JSX: true
  },
  settings: {
    "react": {
      "createClass": "createReactClass",
      "pragma": "React",
      "fragment": "Fragment",
      "version": "detect",
      "flowVersion": "0.53"
    },
  }
}
