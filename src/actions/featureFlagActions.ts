import { FeatureFlagDataTypes } from '../reducers/featureFlagData'

export const RECEIVE_FEATUREFLAG_DATA = 'RECEIVE_FEATUREFLAG_DATA'

const loggingHeader = 'actions > featureFlagActions > '
/**
 * Feature flag action creator
 * @param {FeatureFlagDataTypes} data Feature flag data
 * @param {string} actionType Feature flag action type
 * @returns An action object containing an action type and data
 */
export const updateFeatureFlagData = (
  data: FeatureFlagDataTypes,
  actionType: string
): { type: string; data: FeatureFlagDataTypes } => {
  console.info('ENTER: ' + loggingHeader + 'updateFeatureFlagData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}
