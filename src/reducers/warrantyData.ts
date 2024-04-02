import { CLEAR_WARRANTY_DATA, UPDATE_WARRANTY_DATA, UPDATE_WARRANTY_SELECTION } from '../actions/warrantyActions'

import { Item } from './transactionData'

export interface WarrantiesObject {
  item: Item
  warranties: Array<Warranty>
}

export interface Warranty {
  sku: string
  planDescription: string
  product: Item
  pricing: {
    quantity: number
    sku: string
    everydayPrice: number
    referencePrice: number
    unitSellingPrice: number
  }
}

export interface WarrantyDataTypes {
  warranties?: Array<WarrantiesObject>
  warrantySelections?: WarrantySelectionsType
}

export interface SelectedWarrantyType {
  warrantySku: string
  itemTransactionIdentifier: number
  warrantyDescription?: string
}

export interface WarrantySelectionsType {
  [key: number]: SelectedWarrantyType
}

interface ActionType {
  type: string
  data: WarrantyDataTypes
}

const warrantyData = (
  state: WarrantyDataTypes = {},
  action: ActionType
): WarrantyDataTypes => {
  switch (action.type) {
  case UPDATE_WARRANTY_DATA:
    return {
      ...state,
      ...action.data
    }
  case UPDATE_WARRANTY_SELECTION:
    return {
      ...state,
      warrantySelections: {
        ...state.warrantySelections,
        ...action.data.warrantySelections
      }
    }
  case CLEAR_WARRANTY_DATA:
    return {}
  default:
    return state
  }
}

export default warrantyData
