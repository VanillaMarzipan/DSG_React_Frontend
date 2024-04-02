import * as CoordinatorAPI from '../utils/coordinatorAPI'
import { AppThunk } from '../reducers'
import * as Storage from '../utils/asyncStorage'
import { RECEIVE_FEATUREFLAG_DATA, updateFeatureFlagData } from './featureFlagActions'
import { receiveUiData } from './uiActions'
import { ConfigurationDataType } from '../reducers/configurationData'

export const RECEIVE_CONFIGURATION_DATA = 'RECEIVE_CONFIGURATION_DATA'

export const loggingHeader = 'actions > configurationActions > '

export const updateConfigurationData = (
  data: ConfigurationDataType,
  actionType: string
): { type: string; data: ConfigurationDataType } => {
  console.info('ENTER: ' + loggingHeader + 'updateConfigurationData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

export const fetchFeaturesAndConfiguration = (
  chain: number,
  storeNumber: number,
  registerNumber: number,
  associateId: string | number
): AppThunk => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchFeaturesAndConfiguration\n' + JSON.stringify({
    chain: chain,
    storeNumber: storeNumber,
    registerNumber: registerNumber,
    associateId: associateId
  }))
  CoordinatorAPI.getFeatureFlagsAndConfiguration(chain, storeNumber, registerNumber, associateId)
    .then(res => {
      if (res.ok || res.status === 422) {
        return res.json()
      } else {
        console.warn(loggingHeader + 'fetchFeaturesAndConfiguration: Unable to get configuration\n' + JSON.stringify(res))
        throw new Error('Unable to get features and configuration')
      }
    })
    .then(data => {
      console.info(loggingHeader + 'fetchFeaturesAndConfiguration: success\n' + JSON.stringify(data))

      if (data.features.success) {
        console.info(loggingHeader + 'fetchFeaturesAndConfiguration: found feature flag data')
        Storage.storeData('features', JSON.stringify(data.features.data))
        dispatch(
          updateFeatureFlagData({ features: data.features.data }, RECEIVE_FEATUREFLAG_DATA)
        )
      } else {
        checkFeatureFlagsAndConfigurationInLocalStorage(dispatch)
      }

      if (data.settings.success) {
        console.info(loggingHeader + 'fetchFeaturesAndConfiguration: found settings data')
        Storage.storeData('configuration', JSON.stringify(data.settings.data))
        dispatch(
          updateConfigurationData({ settings: data.settings.data }, RECEIVE_CONFIGURATION_DATA)
        )
      } else {
        checkFeatureFlagsAndConfigurationInLocalStorage(dispatch)
      }
    })
    .catch(error => {
      console.warn(loggingHeader + 'fetchFeaturesAndConfiguration: error\n' + JSON.stringify(error))
      setTimeout(() => {
        dispatch(
          receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Feature flags and config / Failure to connect to coordinator - ' + String(error)
          })
        )
      }, 500)
    })
  console.info('END: ' + loggingHeader + 'fetchFeaturesAndConfiguration')
}

export const checkFeatureFlagsAndConfigurationInLocalStorage = (dispatch) => {
  Storage.getData('features')
    .then(x => {
      if (x === '' || x === undefined || x === null) {
        console.error(loggingHeader + 'fetchFeaturesAndConfiguration: feature flag data not received from coordinator and no feature flags found in storage')
        throw new Error('No feature flags could be found')
      }
    })
    .catch(err => {
      console.warn(loggingHeader + 'fetchFeaturesAndConfiguration: error - unable to read feature flags from local storage: ', err)
      setTimeout(() => {
        dispatch(
          receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Unable to receive feature flags'
          })
        )
      }, 500)
    })

  Storage.getData('configuration')
    .then(x => {
      if (x === '' || x === undefined || x === null) {
        console.error(loggingHeader + 'fetchFeaturesAndConfiguration: configuration data not received from coordinator and no configuration found in storage')
        throw new Error('No feature flags could be found')
      }
    })
    .catch(err => {
      console.warn(loggingHeader + 'fetchFeaturesAndConfiguration: error - unable to read configuration from local storage: ', err)
      setTimeout(() => {
        dispatch(
          receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Unable to receive configuration'
          })
        )
      }, 500)
    })
}

export const getConfigurationValue = (configurationName: string, valueKey?: string) => {
  const configurationData = window.reduxStore.getState().configurationData
  if (
    configurationData &&
    configurationData.settings &&
    configurationData.settings.length > 0
  ) {
    for (let i = 0; i < configurationData.settings.length; i++) {
      if (configurationData.settings[i].name === configurationName) {
        if (valueKey) {
          return configurationData.settings[i].value[valueKey]
        } else {
          return configurationData.settings[i].value
        }
      }
    }
  }
  return null
}
