import { RefundManagerOverrideResponse } from '../reducers/alternateRefundData'

export const CREATE_REFUND_MANAGER_OVERRIDE = 'refunds/create-manager-override'
export const SET_REFUND_MANAGER_OVERRIDE = 'refunds/set-manager-override'
export const SET_REFUND_MANAGER_OVERRIDE_APPLIED = 'refunds/set-manager-override-applied'
export const CLEAR_REFUND_MANAGER_OVERRIDES = 'refunds/clear-manager-overrides'

export const createRefundManagerOverride = (customerOrderNumber: string) => (dispatch) => {
  dispatch({
    type: CREATE_REFUND_MANAGER_OVERRIDE,
    data: {
      co: customerOrderNumber
    }
  })
}

export const setRefundManagerOverride = (customerOrderNumber: string, associateNum: string, associatePin: string, refundManagerOverrideResponse: RefundManagerOverrideResponse) => (dispatch) => {
  dispatch({
    type: SET_REFUND_MANAGER_OVERRIDE,
    data: {
      co: customerOrderNumber,
      overrideDetails: {
        associateNum: associateNum,
        associatePin: associatePin,
        response: refundManagerOverrideResponse
      }
    }
  })
}

export const setRefundManagerOverrideApplied = (customerOrderNumber: string) => (dispatch) => {
  dispatch({
    type: SET_REFUND_MANAGER_OVERRIDE_APPLIED,
    data: {
      co: customerOrderNumber
    }
  })
}

export const clearRefundManagerOverrides = () => (dispatch) => {
  dispatch({
    type: CLEAR_REFUND_MANAGER_OVERRIDES,
    data: null
  })
}
