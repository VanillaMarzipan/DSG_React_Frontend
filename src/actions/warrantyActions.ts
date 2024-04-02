import { WarrantyDataTypes, WarrantySelectionsType } from '../reducers/warrantyData'
import * as UiActions from './uiActions'
import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as TransactionActions from './transactionActions'

export const UPDATE_WARRANTY_DATA = 'UPDATE_WARRANTY_DATA'
export const UPDATE_WARRANTY_SELECTION = 'UPDATE_WARRANTY_SELECTION'
export const CLEAR_WARRANTY_DATA = 'CLEAR_WARRANTY_DATA'

const loggingHeader = 'actions > warrantyActions > '
/**
 * Update warranty data
 * @param {WarrantyDataTypes} data Warranty data object
 */
export const receiveWarrantyData = (data: WarrantyDataTypes) => (
  dispatch
): void => {
  console.info('BEGIN: ' + loggingHeader + 'receiveWarrantyData\n' + JSON.stringify({ data: data }))
  dispatch(updateWarrantyData(data, UPDATE_WARRANTY_DATA))
  console.info('END: ' + loggingHeader + 'receiveWarrantyData')
}

/**
 * Update warranty selection
 * @param {WarrantyDataTypes} data Warranty data object
 */
export const updateWarrantySelection = (data: WarrantyDataTypes) => (
  dispatch
): void => {
  console.info('BEGIN: ' + loggingHeader + 'updateWarrantySelection\n' + JSON.stringify({ data: data }))
  dispatch(updateWarrantyData(data, UPDATE_WARRANTY_SELECTION))
  console.info('END: ' + loggingHeader + 'updateWarrantySelection')
}

/**
 * Warranty data action creator
 * @param {WarrantyDataTypes} data Warranty data object
 * @param {string} actionType Warranty action type
 * @returns an action object with type and data
 */
export const updateWarrantyData = (
  data: WarrantyDataTypes,
  actionType: string
): { type: string; data: WarrantyDataTypes } => {
  console.info('ENTER: ' + loggingHeader + 'updateWarrantyData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

/**
 * Remove warranty data from Redux store
 * @returns an action object with type
 */
export const clearWarrantyData = (): { type: string } => {
  console.info('ENTER: ' + loggingHeader + 'clearWarrantyData')
  return {
    type: 'CLEAR_WARRANTY_DATA'
  }
}

/**
 * Get available warranties for items on the transaction. If warranties are available, then display warranty panel. Otherwise move on to tender type screen.
 */
export const getWarranties = () => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'getWarranties')
  dispatch(UiActions.updateLoadingStates({ complete: true }))
  CoordinatorAPI.fetchWarranties()
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'getWarranties: Error in fetchWarranties\n' + JSON.stringify(res))
        dispatch(
          UiActions.receiveUiData({
            activePanel: 'paymentPanel'
          })
        )
        throw new Error('Error in fetchWarranties')
      } else if (res.status !== 204) {
        return res.json()
      }
    })
    .then(async data => {
      console.info(loggingHeader + 'getWarranties: success\n' + JSON.stringify(data))
      dispatch(UiActions.updateLoadingStates({ complete: false }))
      if (data.length > 0) {
        dispatch(receiveWarrantyData({ warranties: data }))
        dispatch(UiActions.receiveUiData({ activePanel: 'warrantyPanel' }))
      } else {
        dispatch(UiActions.completeTransaction())
      }
    })
    .catch(error => {
      dispatch(UiActions.updateLoadingStates({ complete: false }))
      console.error(loggingHeader + 'getWarranties: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'getWarranties')
}

/**
 * Add selected warranties to the transaction
 * @param {WarrantySelection} warrantySelection Warranty selection object
 * @param {boolean} [completeTransaction=true] If true, move to tender screen
 * @param {boolean} [isReturnTransaction=false] If true, do returns authorization
 */
export const addWarrantiesToTransaction = (
  warrantySelection: WarrantySelectionsType,
  completeTransaction = true
) => async (dispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'addWarrantiesToTransaction\n' + JSON.stringify({
    warrantySelection: warrantySelection,
    completeTransaction: completeTransaction
  }))
  dispatch(UiActions.updateLoadingStates({ complete: true }))
  const warrantySelectionArray = Object.values(warrantySelection || []).filter(
    warranty => warranty.warrantySku !== null
  )

  CoordinatorAPI.addWarranties(warrantySelectionArray)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'addWarrantiesToTransaction: not successful\n' + JSON.stringify(res))
        throw new Error('Error in fetchWarranties')
      } else if (res.status !== 204) {
        return res.json()
      }
    })
    .then(data => {
      console.info(loggingHeader + 'addWarrantiesToTransaction: successful\n' + JSON.stringify(data))
      dispatch(UiActions.updateLoadingStates({ complete: false }))
      dispatch(TransactionActions.receiveTransactionDataAndSendToPinPad(data))
      if (completeTransaction) {
        dispatch(UiActions.completeTransaction())
      }
    })
    .catch(error => {
      dispatch(UiActions.updateLoadingStates({ complete: false }))
      console.error(loggingHeader + 'addWarrantiesToTransaction: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'addWarrantiesToTransaction')
}
