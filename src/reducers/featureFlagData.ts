import { RECEIVE_FEATUREFLAG_DATA } from '../actions/featureFlagActions'

export interface FeatureFlagDataTypes {
  features?: FeatureFlagTypes
}

export type FeatureFlagTypes =
  | ''
  | 'Credit'
  | 'Suspend'
  | 'LauncherHealthChecks'
  | 'Returns'
  | 'InStoreReturns'
  | 'ManualCoupons'
  | 'eReceipts'
  | 'ManuallyEnterGiftCard'
  | 'TaxSummary'
  | Array<string>

function featureFlagData (
  state: FeatureFlagDataTypes = { features: null },
  action
): FeatureFlagDataTypes {
  switch (action.type) {
  case RECEIVE_FEATUREFLAG_DATA:
    window.featureFlagData = {
      ...state,
      ...action.data
    }
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export function featureFlagEnabled (featureFlag: string): boolean {
  if (window.featureFlagData?.features) {
    return window.featureFlagData.features.includes(featureFlag)
  }
  return false
}

export default featureFlagData
