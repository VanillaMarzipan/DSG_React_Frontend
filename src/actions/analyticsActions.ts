import { AnalyticsData } from '../reducers/analyticsData'

export const UPDATE_ANALYTICS_DATA = 'UPDATE_ANALYTICS_DATA'

const loggingHeader = 'actions > analyticsActions > '
/**
 * Analytics data action creator
 * @param {AnalyticsData} data Analytics data
 * @param {string} actionType Analytics action type
 * @returns An action object containing an action type and data
 */
export const updateAnalyticsData = (
  data: AnalyticsData,
  actionType: string
): { type: string; data: AnalyticsData } => {
  console.info('ENTER: ' + loggingHeader + 'updateAnalyticsData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}
