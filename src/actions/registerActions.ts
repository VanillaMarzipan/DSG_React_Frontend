import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as Storage from '../utils/asyncStorage'
import * as CefSharp from '../utils/cefSharp'
import * as AssociateActions from './associateActions'
import * as TransactionActions from './transactionActions'
import * as UiActions from './uiActions'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { Platform } from 'react-native'
import { RegisterDataTypes } from '../reducers/registerData'
import { AppThunk } from '../reducers'
import { AppDispatch } from '../Main'

export const RECEIVE_REGISTER_DATA = 'RECEIVE_REGISTER_DATA'
export const CLOSE_REGISTER = 'CLOSE_REGISTER'
export const OPEN_REGISTER = 'OPEN_REGISTER'

export type RegisterActionTypes =
  | 'RECEIVE_REGISTER_DATA'
  | 'CLOSE_REGISTER'
  | 'OPEN_REGISTER'

const loggingHeader = 'actions > registerActions > '
/**
 * Register data action creator
 * @param {RegisterDataTypes} data Register data
 * @param {RegisterActionTypes} actionType Register data action type
 * @returns An action object containing an action type and data
 */
export const receiveRegisterData = (
  data: RegisterDataTypes,
  actionType: RegisterActionTypes
): { type: RegisterActionTypes; data: RegisterDataTypes } => {
  console.info('ENTER: ' + loggingHeader + 'receiveRegisterData\n' + JSON.stringify({
    actionType: actionType,
    data: data
  }))
  return {
    type: actionType,
    data
  }
}

const isWeb = Platform.OS === 'web'
let isCefSharp = false

if (isWeb) {
  isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
}

/**
 * Close register. Clear associate data. Update register data. If on a register, open cash drawer, print receipt and wait for drawer to close before updating Redux. Redux thunk.
 * @param {string} associateId
 */
export const closeRegister = (associateId: string): AppThunk => async (
  dispatch: AppDispatch
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'closeRegister\n' + JSON.stringify({
    associateId: associateId
  }))
  dispatch(UiActions.updateLoadingStates({ closeRegister: true }))
  CoordinatorAPI.closeRegister()
    .then(async res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'closeRegister: Error closing register\n' + JSON.stringify(res))
        throw new Error('Error closing register')
      }
      return res.json()
    })
    .then(async data => {
      console.info(loggingHeader + 'closeRegister: success\n' + JSON.stringify(data))
      dispatch(UiActions.receiveUiData({
        showModal: false,
        failedOperation: null,
        footerOverlayActive: 'None'
      }))
      dispatch(UiActions.updateLoadingStates({ closeRegister: false }))
      CefSharp.openCashDrawer()
      const startTime = new Date().getTime() / 1000
      CefSharp.printRegisterCloseReceipt(
        JSON.stringify(data.transactionResponse)
      )
      dispatch(
        UiActions.receiveUiData({
          showModal: 'cashDrawerOpen'
        })
      )
      await CefSharp.waitForCashDrawerToClose()
      dispatch({ type: 'UPDATE_UI_DATA', data: { showModal: false } })
      sendRumRunnerEvent('Cash Drawer', {
        reason: 'Close',
        f_screenTime: Number(new Date().getTime() / 1000 - startTime).toFixed(2)
      })
      dispatch(AssociateActions.clearAssociateData(associateId))
      Storage.storeData('registerClosed', 'true')
      dispatch(
        receiveRegisterData({ registerClosed: true, state: 0 }, CLOSE_REGISTER)
      )
    })
    .catch(() => {
      dispatch(UiActions.updateLoadingStates({ closeRegister: false }))
      setTimeout(() => {
        dispatch(
          UiActions.receiveUiData({
            showModal: 'retryFailedOperation',
            failedOperation: 'closeRegister'
          })
        )
      }, 500)
      setTimeout(() => dispatch(closeRegister(associateId)), 5000)
    })
  console.info('END: ' + loggingHeader + 'closeRegister')
}

/**
 * Open register. Update localStorage and Redux register data store. If on register, open cash drawer and wait for drawer to close before updating Redux store.
 */
export const openRegister = (): AppThunk => async dispatch => {
  console.info('BEGIN: ' + loggingHeader + 'openRegister')
  CoordinatorAPI.openRegister()
    .then(async res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'openRegister: Error opening register\n' + JSON.stringify(res))
        setTimeout(() => {
          dispatch(
            UiActions.receiveUiData({
              showModal: 'error',
              modalErrorMessage: 'Error opening register'
            })
          )
        }, 500)
      }
      return res.json()
    })
    .then(async data => {
      console.info(loggingHeader + 'openRegister: success\n' + JSON.stringify(data))
      CefSharp.openCashDrawer()
      const startTime = new Date().getTime() / 1000
      dispatch(
        UiActions.receiveUiData({
          showModal: 'cashDrawerOpen'
        })
      )
      await CefSharp.waitForCashDrawerToClose()
      dispatch({ type: 'UPDATE_UI_DATA', data: { showModal: false } })
      sendRumRunnerEvent('Cash Drawer', {
        reason: 'Open',
        f_screenTime: Number(new Date().getTime() / 1000 - startTime).toFixed(2)
      })

      Storage.storeData('registerClosed', 'false')
      dispatch(
        receiveRegisterData(
          { ...data.registerResponse, registerClosed: false },
          OPEN_REGISTER
        )
      )
    })
    .catch(error => {
      console.error(loggingHeader + 'openRegister: Error\n' + JSON.stringify(error))
      setTimeout(() => {
        dispatch(
          UiActions.receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Error opening register - ' + error
          })
        )
      }, 500)
    })
  console.info('END: ' + loggingHeader + 'openRegister')
}

/**
 * Get register id from localStorage or CefSharp. Get register data. Get associate data. Validate token. Check for active transactions. If on register, bind to FiPay. Get feature flag data.
 * @param {number} storeNumber
 */
export const fetchRegisterData = (
  storeNumber: number
): AppThunk => async dispatch => {
  console.info('BEGIN: ' + loggingHeader + 'fetchRegisterData\n' + JSON.stringify({
    storeNumber: storeNumber
  }))
  let registerId
  if (!isCefSharp) {
    console.info(loggingHeader + 'fetchRegisterData: NOT isCefSharp')
    registerId = await Storage.getData('registerId')
  } else {
    console.info(loggingHeader + 'fetchRegisterData: isCefSharp')
    try {
      console.info(loggingHeader + 'fetchRegisterData: getting MAC address')
      registerId = await CefSharp.getRegisterMacAddress()
      if (!registerId) {
        console.warn(loggingHeader + 'fetchRegisterData: registerId is undefined')
        throw new Error('MAC address cannot be undefined')
      }
    } catch (error) {
      console.error(loggingHeader + 'fetchRegisterData\n' + JSON.stringify(error))
      setTimeout(() => {
        dispatch(
          UiActions.receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Failed to get MAC address from cefsharp'
          })
        )
      }, 500)
      return
    }
  }
  // TODO: isCefSharp reference is negation?
  if (!isCefSharp && !registerId) {
    console.info(loggingHeader + 'fetchRegisterData: NOT isCefSharp AND no registerId')
    const date = new Date()
    registerId = `B${date.getTime()}`
    Storage.storeData('registerId', registerId)
  }
  console.info(loggingHeader + 'fetchRegisterData: getting register data\n' + JSON.stringify({
    storeNumber: storeNumber,
    registerId: registerId
  }))
  CoordinatorAPI.getRegisterData(storeNumber, registerId)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'fetchRegisterData: Could not get register data\n' + JSON.stringify(res))
        return Promise.reject(new Error('Could not get register data'))
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info(loggingHeader + 'fetchRegisterData: getRegisterData success\n' + JSON.stringify(data))
      if (data.state !== 1) {
        // If register is not open, log out associate
        dispatch(AssociateActions.clearAssociateData())
        Storage.storeData('registerClosed', 'true')
      } else {
        Storage.storeData('registerClosed', 'false')
        dispatch(AssociateActions.fetchAssociateData())
      }
      CoordinatorAPI.validateToken().then(res => {
        if (res.ok) {
          dispatch(TransactionActions.checkForActiveTransaction())
        } else {
          dispatch(AssociateActions.clearAssociateData())
        }
      }).catch(() => {
        dispatch(AssociateActions.clearAssociateData())
      })
      dispatch(
        receiveRegisterData(
          { ...data, registerClosed: data.state !== 1 },
          RECEIVE_REGISTER_DATA
        )
      )
      CefSharp.bindToFipay().then(() =>
        CefSharp.setFipayRegisterNumber(data.registerNumber)
      ).catch(error => {
        console.error(loggingHeader + 'fetchRegisterData: fipay Error\n' + JSON.stringify(error))
        return Promise.reject(new Error('Error setting Fipay register number - ' + String(error)))
      })
    })
    .catch(error => {
      console.error(loggingHeader + 'fetchRegisterData: Error\n' + JSON.stringify(error))
      setTimeout(() => {
        dispatch(
          UiActions.receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Error getting register startup data - ' + String(error)
          })
        )
      }, 500)
    })
  console.info('END: ' + loggingHeader + 'fetchRegisterData')
}
