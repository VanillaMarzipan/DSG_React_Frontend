import { SET_REFUND_MANAGER_OVERRIDE, CREATE_REFUND_MANAGER_OVERRIDE, CLEAR_REFUND_MANAGER_OVERRIDES, SET_REFUND_MANAGER_OVERRIDE_APPLIED } from '../actions/alternateRefundActions'

export enum RefundManagerOverrideResponse {
  NoResponse,
  Allowed,
  NotAllowed,
  Error,
  Declined,
  Processed
}

export interface IRefundManagerOverride {
  managerOverrideResponse: RefundManagerOverrideResponse
  managerOverrideId: string
  managerOverridePIN: string
  applied: boolean
}

export type AlternateRefundDataType = { [key: string]: IRefundManagerOverride }

function alternateRefundData (
  state: AlternateRefundDataType | null = {},
  action
): AlternateRefundDataType {
  switch (action.type) {
  case CREATE_REFUND_MANAGER_OVERRIDE: {
    const clone: AlternateRefundDataType = JSON.parse(JSON.stringify(state))
    if (action.data.co in clone) {
      console.warn(`CO ${action.data.co} already created`)
      return clone
    }
    clone[action.data.co] = {
      managerOverrideResponse: RefundManagerOverrideResponse.NoResponse,
      managerOverrideId: '',
      managerOverridePIN: '',
      applied: false
    }
    return clone
  }
  case SET_REFUND_MANAGER_OVERRIDE: {
    const clone: AlternateRefundDataType = JSON.parse(JSON.stringify(state))
    if (!(action.data.co in clone)) {
      throw new Error(`Unable to set manager override for refund.  Refund doesn't exist for CO ${action.data.co}`)
    }
    clone[action.data.co].managerOverrideResponse = action.data.overrideDetails.response
    clone[action.data.co].managerOverrideId = action.data.overrideDetails.associateNum
    clone[action.data.co].managerOverridePIN = action.data.overrideDetails.associatePin
    return clone
  }
  case SET_REFUND_MANAGER_OVERRIDE_APPLIED: {
    const clone: AlternateRefundDataType = JSON.parse(JSON.stringify(state))
    if (!(action.data.co in clone)) {
      console.warn(`Unable to apply manager override for refund.  Refund doesn't exist for CO ${action.data.co}`)
    }
    if (clone[action.data.co].applied) {
      console.error(`Manager override already applied for CO ${action.data.co}`)
    }
    clone[action.data.co].applied = true
    return clone
  }
  case CLEAR_REFUND_MANAGER_OVERRIDES: {
    return {}
  }
  default:
    return state
  }
}

export default alternateRefundData
