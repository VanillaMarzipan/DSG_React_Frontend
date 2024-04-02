import { ThemeTypes } from '../reducers/theme'
import { Dispatch } from 'redux'

export const DARK_MODE = 'DARK_MODE'

const loggingHeader = 'actions > themeActions > '
/**
 * Enable dark mode
 */
export const goDark = () => (dispatch: Dispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'goDark')
  dispatch(updateTheme({}, DARK_MODE))
  console.info('END: ' + loggingHeader + 'goDark')
}

/**
 * Update theme in the Redux store
 * @param {ThemeTypes} data
 * @param {string} actionType
 * @returns An action object containing an action type and data
 */
export const updateTheme = (
  data: ThemeTypes,
  actionType: string
): { type: string; data: ThemeTypes } => {
  console.info('ENTER: ' + loggingHeader + 'updateTheme')
  return {
    type: actionType,
    data
  }
}
