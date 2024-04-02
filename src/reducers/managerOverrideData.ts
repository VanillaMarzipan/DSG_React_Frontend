import { RECEIVE_MANAGER_OVERRIDE_INFO, CLEAR_MANAGER_OVERRIDE_INFO } from '../actions/managerOverrideActions'

interface ManualDiscountOverrideResponse {
  originalRequest: {
    reason: number
    type: number
    amount: number
    additionalDetail: string
  }
  thresholdExceededDetails: {
    configuredThresholdAmount: number
    managerOverrideRequiredType: number
    managerOverrideRequiredTypeDescription: string
    originalPrice: number
    percentDifference: number
  }
  transactionItemIdentifier?: number
}

interface ModalDetails {
  mainHeader: string
  subHeader: string
  mainText?: string
}

/**
 * TypeScript type for ManagerOverride.
 * ManagerOverrideType is an enum with the following values:
 *   ExpiredCoupon = 0,
 *   NoReceiptReturn = 1,
 *   EditPrice = 2,
 *   ManualTransactionDiscount = 5,
 *   ManualItemDiscount = 6
 */
export interface PendingManagerOverrideData {
  ManagerOverrideData?: string
  ManagerOverrideType: number
  ManualDiscountResponse?: ManualDiscountOverrideResponse
  ModalDetails?: ModalDetails
}

interface ActionType {
  type: string
  data: PendingManagerOverrideData[]
}

const pendingManagerOverrideData = (
  state: PendingManagerOverrideData = null,
  action: ActionType
): PendingManagerOverrideData => {
  switch (action.type) {
  case RECEIVE_MANAGER_OVERRIDE_INFO:
    return action.data[0]
  case CLEAR_MANAGER_OVERRIDE_INFO:
    return null
  default:
    return state
  }
}

export default pendingManagerOverrideData
