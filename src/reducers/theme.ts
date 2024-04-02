import { DARK_MODE } from '../actions/themeActions'

export interface ThemeTypes {
  backgroundColor?: string
  fontColor?: string
  buttonBackground?: string
  transactionCardBackground?: string
}

const dark: ThemeTypes = {
  backgroundColor: '#303030',
  fontColor: '#ffffff',
  buttonBackground: '#006554',
  transactionCardBackground: '#424242'
}

function theme (
  state: ThemeTypes = {
    backgroundColor: '#ffffff',
    fontColor: 'rgba(0,0,0,0.87)',
    buttonBackground: '#006554',
    transactionCardBackground: '#f1f1f1'
  },
  action
) {
  switch (action.type) {
  case DARK_MODE:
    return {
      ...state,
      ...dark
    }
  default:
    return state
  }
}

export default theme
