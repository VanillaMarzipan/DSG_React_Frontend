import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as Storage from '../utils/asyncStorage'
import * as RegisterActions from './registerActions'
import * as TransactionActions from './transactionActions'
import * as UIActions from './uiActions'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { autoReload } from '../utils/autoReload'
import { AppThunk } from '../reducers'
import { AssociateDataTypes, SapAssociateDictionaryType } from '../reducers/associateData'
import { clearPrintReceiptData } from './printReceiptActions'
import { AppDispatch } from '../Main'

export const RECEIVE_ASSOCIATE_DATA = 'RECEIVE_ASSOCIATE_DATA'
export const RECEIVE_REGISTER_DATA = 'RECEIVE_REGISTER_DATA'
export const CLEAR_ASSOCIATE_DATA = 'CLEAR_ASSOCIATE_DATA'
export const ERROR_ASSOCIATE_DATA = 'ERROR_ASSOCIATE_DATA'
export const CLEAR_LOGIN_ERROR = 'CLEAR_LOGIN_ERROR'
export const UPDATE_SAP_ASSOCIATE_DICTIONARY = 'UPDATE_SAP_ASSOCIATE_DICTIONARY'

export type AssociateActionTypes =
  | 'RECEIVE_ASSOCIATE_DATA'
  | 'CLEAR_ASSOCIATE_DATA'
  | 'ERROR_ASSOCIATE_DATA'
  | 'CLEAR_LOGIN_ERROR'
  | 'UPDATE_SAP_ASSOCIATE_DICTIONARY'

const loggingHeader = 'actions > associateActions > '
/**
 * @async
 * Checks localStorage for associate data and updates redux associateData store. Sets authenticated to true or false depending on the presence of associate data in localStorage. Redux thunk.
 */
export const fetchAssociateData = (): AppThunk => async (
  dispatch
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchAssociateData')
  if ((await Storage.getData('authenticated')) === 'true') {
    const data = {
      authenticated: true,
      associateId: await Storage.getData('associateId'),
      firstName: await Storage.getData('firstName'),
      lastName: await Storage.getData('lastName'),
      isManager: await Storage.getData('isManager') === 'true'
    }
    console.info(loggingHeader + 'fetchAssociateData:\n' + JSON.stringify(data))
    dispatch(receiveAssociateData(data, RECEIVE_ASSOCIATE_DATA))
  } else {
    const data = { authenticated: false }
    dispatch(receiveAssociateData(data, RECEIVE_ASSOCIATE_DATA))
    console.info(loggingHeader + 'fetchAssociateData:\n' + JSON.stringify(data))
  }
  console.info('END: ' + loggingHeader + 'fetchAssociateData')
}

export const getAssociateById = (associateId: string): AppThunk => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'getAssociateById')
  dispatch(UIActions.updateLoadingStates({ getAssociateById: true }))
  CoordinatorAPI.getAssociateById(associateId)
    .then(res => {
      if (!res.ok) {
        if (res.status === 422) {
          dispatch(UIActions.receiveUiData({ error: true, errorMessage: 'Invalid Associate Number' }))
          console.warn(loggingHeader + 'getAssociateById: Invalid Associate Number [' + associateId + ']')
          throw new Error('Invalid Associate Number [' + associateId + ']')
        } else {
          dispatch(UIActions.receiveUiData({ error: true, errorMessage: 'Unable to get associate info' }))
          console.warn(loggingHeader + 'getAssociateById: Unable to get associate info [' + associateId + ']')
          throw new Error('Unable to get associate info [' + associateId + ']')
        }
      } else {
        return res.json()
      }
    })
    .then(res => {
      console.info(loggingHeader + 'getAssociateById\n' + JSON.stringify(res))
      dispatch(UIActions.receiveUiData({ error: false, errorMessage: null }))
      dispatch(UIActions.updateLoadingStates({ getAssociateById: false }))
      dispatch(receiveAssociateData({ nsppSellingAssociate: res }, RECEIVE_ASSOCIATE_DATA))
    })
    .catch(error => {
      dispatch(UIActions.updateLoadingStates({ getAssociateById: false }))
      console.error(loggingHeader + 'getAssociateById error: \n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'getAssociateById')
}

export const getAssociateByIdForItemLevelSap = (associateId: string): AppThunk => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'getAssociateByIdForItemLevelSap')
  dispatch(UIActions.updateLoadingStates({ getAssociateById: true }))
  dispatch(receiveAssociateData({ sapError: false }, RECEIVE_ASSOCIATE_DATA))
  CoordinatorAPI.getAssociateById(associateId)
    .then(res => {
      if (!res.ok) {
        dispatch(receiveAssociateData({ sapError: true }, RECEIVE_ASSOCIATE_DATA))
        if (res.status === 422) {
          console.warn(loggingHeader + 'getAssociateByIdForItemLevelSap: Invalid Associate Number [' + associateId + ']')
          throw new Error('Invalid Associate Number [' + associateId + ']')
        } else {
          console.warn(loggingHeader + 'getAssociateByIdForItemLevelSap: Unable to get associate info [' + associateId + ']')
          throw new Error('Unable to get associate info [' + associateId + ']')
        }
      } else {
        return res.json()
      }
    })
    .then(res => {
      console.info(loggingHeader + 'getAssociateByIdForItemLevelSap\n' + JSON.stringify(res))
      dispatch(UIActions.updateLoadingStates({ getAssociateById: false }))
      dispatch(receiveAssociateData({
        sapError: false,
        itemLevelSapAssociate: res,
        itemLevelSapStep: 2
      }, RECEIVE_ASSOCIATE_DATA))
    })
    .catch(error => {
      dispatch(receiveAssociateData({ sapError: true }, RECEIVE_ASSOCIATE_DATA))
      dispatch(UIActions.updateLoadingStates({ getAssociateById: false }))
      console.error(loggingHeader + 'getAssociateByIdForItemLevelSap error: \n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'getAssociateByIdForItemLevelSap')
}

/**
 * @async
 * Gets register data. Logs user in. Saves data to localStorage. Calls checkForActiveTransaction. Opens register if not already open. Redux thunk.
 * @param {string} associateId Associate id
 * @param {string} pin Associate PIN
 * @param {number} storeNumber Store number
 * @param {string} macAddress Device MAC address
 */
export const authenticateUser = (
  associateId: string,
  pin: string,
  storeNumber: number,
  macAddress: string
): AppThunk => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'authenticateUser\n' + JSON.stringify({
    associateId: associateId,
    pin: pin,
    storeNumber: storeNumber,
    macAddress: macAddress
  }))
  dispatch(UIActions.updateLoadingStates({ signIn: true }))
  // Get register data from backend
  CoordinatorAPI.getRegister(storeNumber, macAddress)
    .then(res => {
      if (res.ok) {
        return res.json()
      } else {
        console.warn(loggingHeader + 'authenticateUser: Unable to get register details\n' + JSON.stringify(res))
        throw new Error('Unable to get register details')
      }
    })
    .then(registerData => {
      dispatch({ type: RECEIVE_REGISTER_DATA, data: { ...registerData, registerClosed: registerData.state !== 1 } })

      // Call authentication function
      CoordinatorAPI.authenticateUser(
        associateId,
        pin,
        storeNumber,
        registerData.registerNumber
      )
        .then(res => {
          if (!res.ok) {
            dispatch(
              receiveAssociateData({ error: true }, ERROR_ASSOCIATE_DATA)
            )
            sendRumRunnerEvent('Login Fail', {
              associateId: associateId
            })
            console.warn(loggingHeader + 'authenticateUser: Error attempting login\n' + JSON.stringify(res))
            throw new Error('Error attempting login')
          } else {
            return res.json()
          }
        })
        .then(data => {
          // Store data in localStorage
          Storage.storeData('authenticated', 'true')
          Storage.storeData('associateId', associateId)
          Storage.storeData('firstName', data.firstName)
          Storage.storeData('lastName', data.lastName)
          Storage.storeData('authToken', data.token)
          Storage.storeData('isManager', data.isManager)
          CoordinatorAPI.setToken(data.token)
          // Update associate data in Redux store
          dispatch(
            receiveAssociateData(
              { authenticated: true, ...data },
              RECEIVE_ASSOCIATE_DATA
            )
          )
          // Stop displaying loading indicator
          dispatch(
            UIActions.receiveUiData({
              activePanel: 'initialScanPanel'
            })
          )
          dispatch(UIActions.updateLoadingStates({ signIn: false }))
          // Send analytics data to rumrunner
          dispatch(TransactionActions.checkForActiveTransaction())
          sendRumRunnerEvent('Login', {
            associateId: associateId
          })
          // If register is not open, open register
          if (registerData.state === 0) {
            dispatch(RegisterActions.openRegister())
          }
          console.info(loggingHeader + 'authenticateUser: success\n' + JSON.stringify(data))
        })
        .catch(error => {
          dispatch(UIActions.updateLoadingStates({ signIn: false }))
          console.error(loggingHeader + 'authenticateUser: Error authenticating user\n' + JSON.stringify(error))
        })
      // Call autoReload to get latest updates
      setTimeout(() => {
        process.env.NODE_ENV !== 'development' && autoReload()
      }, 200)
    })
    .catch(error => {
      console.error(loggingHeader + 'authenticateUser: Error getRegisterDetails\n' + JSON.stringify(error))
      dispatch(
        receiveAssociateData({
          error: true,
          errorMessage: 'Connection error occurred while logging in'
        }, ERROR_ASSOCIATE_DATA)
      )
      dispatch(UIActions.updateLoadingStates({ signIn: false }))
    })
  console.info('END: ' + loggingHeader + 'authenticateUser')
}

/**
 * Clears login error
 */
export const clearLoginError = () => (dispatch: AppDispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'clearLoginError')
  return dispatch(receiveAssociateData({ error: false }, CLEAR_ASSOCIATE_DATA))
}

/**
 * Associate data action creator
 * @param {AssociateDataTypes} data Associate data
 * @param {AssociateActionTypes} actionType Associate action type
 * @returns An action object containing an action type and data
 */
export const receiveAssociateData = (
  data: AssociateDataTypes | SapAssociateDictionaryType,
  actionType: AssociateActionTypes
): { type: AssociateActionTypes; data: AssociateDataTypes | SapAssociateDictionaryType } => {
  console.info('ENTER: ' + loggingHeader + 'receiveAssociateData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

/**
 * Clear associate data from the Redux store and localStorage
 * @param {string} associateId Associate id
 * @async
 */
export const clearAssociateData = (associateId = 'unknown'): AppThunk => async (
  dispatch
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'clearAssociateData\n' + JSON.stringify({
    associateId: associateId
  }))
  Storage.removeItems([
    'authenticated',
    'firstName',
    'lastName',
    'associateId',
    'authToken',
    'isManager'
  ])
  CoordinatorAPI.clearToken()
  dispatch(receiveAssociateData({
    authenticated: false,
    isManager: false,
    associateId: null,
    firstName: null,
    lastName: null,
    error: false,
    errorMessage: null,
    nsppSellingAssociate: null,
    itemLevelSapAssociate: null,
    itemLevelSapStep: 1,
    sapError: false,
    itemLevelSapUpcs: [],
    sapAssociateDictionary: {},
    token: null,
    familyNightModalStep: 'associateID',
    familyNightOmniSearchQuery: ''
  }, CLEAR_ASSOCIATE_DATA))
  dispatch(clearPrintReceiptData())
  sendRumRunnerEvent('Logout', {
    associateId: associateId
  })
  console.info('END: ' + loggingHeader + 'clearAssociateData')
}

export const addItemLevelSapUpc = (currentUpcs, upc) => dispatch => {
  let clone = [] // catch for anomaly of currentUpcs being undefined on load
  if (currentUpcs) {
    clone = currentUpcs.slice()
  }
  clone.push(upc)
  dispatch(receiveAssociateData({ itemLevelSapUpcs: clone }, RECEIVE_ASSOCIATE_DATA))
}

interface AddAssociateDiscountRequestType {
  associateId: string
  familyNightCouponCode?: string
}

export const addAssociateDiscount = (request: AddAssociateDiscountRequestType): AppThunk => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'addAssociateDiscount')
  dispatch(UIActions.updateLoadingStates({ addAssociateDiscount: true }))
  CoordinatorAPI.addAssociateDiscount(request)
    .then(res => {
      if (!res.ok && res.status !== 400 && res.status !== 422) {
        throw new Error('Failed request to add associate discount: ' + JSON.stringify({ res: res.status }))
      } else {
        return res.json()
      }
    })
    .then(data => {
      dispatch(UIActions.updateLoadingStates({ addAssociateDiscount: false }))
      console.info(loggingHeader + 'addAssociateDiscount\n' + JSON.stringify(data))
      if (data.statusCode === 400 || data.statusCode === 422) {
        dispatch(UIActions.receiveUiData({
          modalErrorMessage: data.statusCode === 422 ? 'Sorry, the associate ID was not found. Please check the ID and try again.' : data.message
        }))
        return
      }
      dispatch(TransactionActions.receiveTransactionDataAndSendToPinPad(data))
      dispatch(UIActions.receiveUiData({
        footerOverlayActive: 'None',
        activePanel: 'scanDetailsPanel',
        selectedItem: 'associateDiscountPanel',
        showAddAssociateDiscount: false
      }))
    })
    .catch(error => {
      dispatch(UIActions.updateLoadingStates({ addAssociateDiscount: false }))
      dispatch(UIActions.receiveUiData({
        modalErrorMessage: 'Sorry, something went wrong. Please try again.'
      }))
      console.error(loggingHeader + 'addAssociateDiscount error: \n' + JSON.stringify(error))
    })
}
