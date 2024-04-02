import { RECEIVE_STORE_INFO } from '../actions/storeActions'
import { StoreInfoTypes } from './storeInformation'

export interface PrinterStringData {
  storeInformation?: StoreInfoTypes
}

function printerString (
  state: PrinterStringData = {},
  action
): PrinterStringData {
  switch (action.type) {
  case RECEIVE_STORE_INFO:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default printerString
