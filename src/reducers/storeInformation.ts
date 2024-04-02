import { RECEIVE_STORE_INFO } from '../actions/storeActions'

export interface StoreInfoTypes {
  chainNumber?: number
  chainDescription?: string
  number?: number
  name?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phoneNumber?: string
}

function storeInfo (state: StoreInfoTypes = {}, action): StoreInfoTypes {
  switch (action.type) {
  case RECEIVE_STORE_INFO:
    return {
      ...state,
      ...action.data.storeInformation
    }
  default:
    return state
  }
}

export default storeInfo
