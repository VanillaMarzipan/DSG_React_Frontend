import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as RegisterActions from './registerActions'
import * as CefSharp from '../utils/cefSharp'
import * as Storage from '../utils/asyncStorage'
import * as UiActions from './uiActions'
import { PrinterStringData } from '../reducers/printerString'
import { AppDispatch } from '../Main'

export const RECEIVE_STORE_INFO = 'RECEIVE_STORE_INFO'

const loggingHeader = 'actions > storeActions > '
/**
 * Store info action creator
 * @param {PrinterStringData} data Store info
 * @param {string} actionType Store info action type
 * @returns An action object containing an action type and data
 */
export const receiveStoreInfo = (
  data: PrinterStringData,
  actionType: string
): { type: string; data: PrinterStringData } => {
  console.info('ENTER: ' + loggingHeader + 'receiveStoreInfo\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

/**
 * Get store info from coordinator. Call fetchRegisterData. Update printer string and store info Redux store.
 */
export const fetchStoreInfo = () => (dispatch: AppDispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchStoreInfo')
  return CoordinatorAPI.getStoreInfo()
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'fetchStoreInfo: Could not get store data\n' + JSON.stringify(res))
        throw new Error('Could not get store data')
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info(loggingHeader + 'fetchStoreInfo: success\n' + JSON.stringify(data))
      const storeNumber: string = data.storeInformation.number
      Storage.storeData('storeNumber', storeNumber)
      dispatch(RegisterActions.fetchRegisterData(data.storeInformation.number))
      dispatch(receiveStoreInfo(data, RECEIVE_STORE_INFO))
    })
    .catch(error => {
      console.error(loggingHeader + 'fetchStoreInfo: Error\n' + JSON.stringify(error))

      setTimeout(() => {
        dispatch(
          UiActions.receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Error fetching store info from coordinator - ' + error
          })
        )
      }, 500)
    })
}

/**
 * Get store info from CefSharp. Use coordinator as a backup if CefSharp fails. Call fetchRegisterData. Update printer string and store info Redux store.
 */
export const fetchStoreInfoFromLauncher = () => (
  dispatch: AppDispatch
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchStoreInfoFromLauncher')
  return CefSharp.getStoreInformation()
    .then(data => {
      if (data) {
        console.info(loggingHeader + 'fetchStoreInfoFromLauncher: success\n' + JSON.stringify(data))
        const storeInformationObject: PrinterStringData = JSON.parse(data)
        const storeNumber: string = storeInformationObject.storeInformation.number.toString()
        Storage.storeData('storeNumber', storeNumber)

        dispatch(
          RegisterActions.fetchRegisterData(
            storeInformationObject.storeInformation.number
          )
        )

        dispatch(receiveStoreInfo(storeInformationObject, RECEIVE_STORE_INFO))
      } else {
        console.warn(loggingHeader + 'fetchStoreInfoFromLauncher: ' +
          'Failed to retrieved Store Information from launcher - falling back to Coordinator configuration'
        )
        dispatch(fetchStoreInfo())
      }
    })
    .catch(error => {
      console.error(loggingHeader + 'fetchStoreInfoFromLauncher: Error\n' + JSON.stringify(error))

      setTimeout(() => {
        dispatch(
          UiActions.receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Error fetching store info from launcher - ' + error
          })
        )
      }, 500)
    })
}
