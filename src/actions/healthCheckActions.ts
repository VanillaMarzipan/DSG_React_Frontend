import { HealthCheckResults } from '../reducers/healthCheckData'

export const UPDATE_HEALTH_CHECK_DATA = 'UPDATE_HEALTH_CHECK_DATA'
const loggingHeader = 'actions > healthCheckActions > '

export const receiveHealthCheckData = (data: HealthCheckResults) => (dispatch): void => {
  dispatch(updateHealthCheckData(data, UPDATE_HEALTH_CHECK_DATA))
}

export const updateHealthCheckData = (
  data: HealthCheckResults,
  actionType: string
): { type: string; data: HealthCheckResults } => {
  console.info('ENTER: ' + loggingHeader + 'updateHealthCheckData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}
