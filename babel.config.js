module.exports = {
  presets: [],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-syntax-optional-chaining',
    ['@babel/plugin-transform-react-jsx', {
      runtime: 'automatic'
    }]
  ]
}
