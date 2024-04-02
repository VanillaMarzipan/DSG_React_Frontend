import { CLOSE_REGISTER, OPEN_REGISTER, RECEIVE_REGISTER_DATA } from '../actions/registerActions'

export interface RegisterDataTypes {
  macAddress?: string
  storeNumber?: number
  registerNumber?: number
  state?: number
  stateDescription?: string
  registerClosed?: boolean
  isAdyen?: boolean
  isSimulator?: boolean
}

function registerData (
  state: RegisterDataTypes = {},
  action
): RegisterDataTypes {
  switch (action.type) {
  case RECEIVE_REGISTER_DATA:
  case OPEN_REGISTER:
  case CLOSE_REGISTER:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default registerData
