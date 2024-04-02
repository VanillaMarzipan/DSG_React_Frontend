import {
  CLEAR_ASSOCIATE_DATA,
  ERROR_ASSOCIATE_DATA,
  RECEIVE_ASSOCIATE_DATA,
  UPDATE_SAP_ASSOCIATE_DICTIONARY
} from '../actions/associateActions'

export interface SellingAssociateType {
  associateId: string
  firstName: string
  lastName: string
}

export interface SapAssociateDictionaryType {
  [key: string]: string
}

type FamilyNightModalStepTypes =
  | 'associateID'
  | 'couponCode'

export interface AssociateDataTypes {
  authenticated?: boolean
  associateId?: string
  firstName?: string
  lastName?: string
  error?: boolean
  isManager?: boolean
  errorMessage?: string
  nsppSellingAssociate?: SellingAssociateType | null
  itemLevelSapAssociate?: SellingAssociateType | null
  sapAssociateDictionary?: SapAssociateDictionaryType
  itemLevelSapStep?: number
  sapError?: boolean
  itemLevelSapUpcs?: Array<string>
  token?: string
  familyNightModalStep?: FamilyNightModalStepTypes
  familyNightOmniSearchQuery?: string
}

function associateData (
  state: AssociateDataTypes = {
    authenticated: false,
    associateId: null,
    firstName: null,
    lastName: null,
    error: false,
    errorMessage: null,
    isManager: false,
    nsppSellingAssociate: null,
    itemLevelSapAssociate: null,
    sapAssociateDictionary: {},
    itemLevelSapStep: 1,
    sapError: false,
    itemLevelSapUpcs: [],
    token: null,
    familyNightModalStep: 'associateID',
    familyNightOmniSearchQuery: ''
  },
  action
): AssociateDataTypes {
  switch (action.type) {
  case RECEIVE_ASSOCIATE_DATA:
    return {
      ...state,
      ...action.data
    }
  case UPDATE_SAP_ASSOCIATE_DICTIONARY:
    return {
      ...state,
      sapAssociateDictionary: {
        ...state.sapAssociateDictionary,
        ...action.data
      }
    }
  case CLEAR_ASSOCIATE_DATA:
    return {
      ...action.data
    }
  case ERROR_ASSOCIATE_DATA:
    return {
      ...action.data
    }
  default:
    return state
  }
}

export default associateData
