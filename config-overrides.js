/* eslint-disable @typescript-eslint/no-var-requires */
const {
  useBabelRc,
  override,
  addWebpackAlias,
  babelInclude,
  fixBabelImports
} = require('customize-cra')
const path = require('path')
// const path = require('path')

module.exports = override(
  useBabelRc(),
  fixBabelImports('module-resolver', {
    alias: {
      '^react-native$': 'react-native-web'
    }
  }),
  addWebpackAlias({
    'react-native': 'react-native-web'
  }),
  babelInclude([
    path.resolve('src'), // make sure you link your own source
    // any react-native modules you need babel to compile
    path.resolve('node_modules/react-native-popup-menu'),
    path.resolve('node_modules/@react-native-community/slider')
  ])
)
