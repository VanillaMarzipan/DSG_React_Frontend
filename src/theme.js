import { createContext } from 'react'

export const themes = {
  light: {
    backgroundColor: '#ffffff',
    fontColor: 'rgba(0,0,0,0.87)',
    buttonBackground: '#006554',
    transactionCardBackground: '#f1f1f1'
  },
  dark: {
    backgroundColor: '#303030',
    fontColor: '#ffffff',
    buttonBackground: '#006554',
    transactionCardBackground: '#424242'
  }
}

export const activeTheme = themes.light

export const ThemeContext = createContext(
  themes.light // default value
)
