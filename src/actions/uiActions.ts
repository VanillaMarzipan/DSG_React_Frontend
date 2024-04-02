import { sendRumRunnerEvent } from '../utils/rumrunner'
import * as TransactionActions from './transactionActions'
import * as WarrantyActions from './warrantyActions'
import { LoadingStatesTypes, PanelsType, UiDataTypes } from '../reducers/uiData'
import { AppThunk } from '../reducers'
import { AppDispatch } from '../Main'
import { clearRefundsData } from './refundsActions'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { clearRefundManagerOverrides } from './alternateRefundActions'

export const UPDATE_UI_DATA = 'UPDATE_UI_DATA'
export const UPDATE_CREDIT_PANEL = 'UPDATE_CREDIT_PANEL'
export const UPDATE_LOADING_STATES = 'UPDATE_LOADING_STATES'

const loggingHeader = 'actions > uiActions > '
/**
 * Update ui data
 * @param {UiDataTypes} data UI Data object
 */
export const receiveUiData = (data: UiDataTypes) => (dispatch: AppDispatch): AppThunk => {
  console.info('BEGIN: ' + loggingHeader + 'receiveUiData\n' + JSON.stringify({ data: data }))
  return dispatch(updateUiData(data, UPDATE_UI_DATA))
  // console.info('END: ' + loggingHeader + 'receiveUiData')
}

export const updateLoadingStates = (data: LoadingStatesTypes) => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'updateLoadingStates\n' + JSON.stringify({ data: data }))
  dispatch(updateUiData(data, UPDATE_LOADING_STATES))
  console.info('END: ' + loggingHeader + 'updateLoadingStates')
}

export const setCreditErrorMessageForMatchingTenderIDs = () => (dispatch: AppDispatch): void => {
  dispatch(receiveUiData({
    creditPanelError: 'A TENDER IS ALREADY PROCESSING',
    creditPanelErrorInstructions: 'Please wait until it completes before allowing the athlete to swipe their card again'
  }))
}

/**
 * Updates active panel to paymentPanel
 */
export const completeTransaction = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'completeTransaction')
  dispatch(updateUiData({ activePanel: 'paymentPanel' }, UPDATE_UI_DATA))
  console.info('END: ' + loggingHeader + 'completeTransaction')
}

/**
 * Updates active panel to cashPanel
 */
export const displayCashPanel = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'displayCashPanel')
  dispatch(updateUiData({ activePanel: 'cashPanel' }, UPDATE_UI_DATA))
  console.info('END: ' + loggingHeader + 'displayCashPanel')
}

/**
 * Updates active panel to creditPanel
 */
export const displayCreditPanel = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'payWithCredit')
  dispatch(updateUiData({ activePanel: 'creditPanel', displayInsertCard: true }, UPDATE_UI_DATA))
  console.info('END: ' + loggingHeader + 'displayCreditPanel')
}
/**
 * Updates active panel to tenderAmountPanel
 */
export const promptForTenderAmount = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'promptForTenderAmount')
  dispatch(updateUiData({ activePanel: 'tenderAmountPanel' }, UPDATE_UI_DATA))
  console.info('END: ' + loggingHeader + 'promptForTenderAmount')
}

/**
 * Set new selectedItem and lastItem
 * @param {string | number} itemId Name or id of selected item
 */
export const selectItem = (itemId: string | number) => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'selectItem\n' + JSON.stringify({ itemId: itemId }))
  dispatch(
    updateUiData({ selectedItem: itemId, lastItem: itemId }, UPDATE_UI_DATA)
  )
  console.info('END: ' + loggingHeader + 'selectItem')
}

/**
 * Set active panel to loginPanel. Remove all loyalty, transaction and loyalty data.
 */
export const backToHome = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'backToHome')
  dispatch(TransactionActions.clearTransactionData())
  dispatch(
    updateUiData(
      {
        activePanel: 'initialScanPanel'
      },
      UPDATE_UI_DATA
    )
  )
  console.info('END: ' + loggingHeader + 'backToHome')
}

/**
 * BackButton: Set active panel to previous panel
 * @param {Panels} activePanel
 * @param splitTender
 * @param setSplitTender
 * @param warrantiesAdded
 */
export const back = (activePanel: PanelsType, splitTender?: boolean, setSplitTender?: (boolean) => void, warrantiesAdded?: boolean) => (dispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'back\n' + JSON.stringify({ activePanel: activePanel }))
  let toPage: PanelsType = null
  const warrantyData = window.reduxStore.getState().warrantyData
  switch (activePanel) {
  case 'warrantyPanel':
    toPage = 'scanDetailsPanel'
    if (warrantiesAdded) dispatch(WarrantyActions.addWarrantiesToTransaction([], false))
    dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
    dispatch(WarrantyActions.clearWarrantyData())
    break
  case 'paymentPanel':
    if (featureFlagEnabled('ReferencedRefunds')) {
      dispatch(clearRefundsData())
      dispatch(clearRefundManagerOverrides())
    }
    if (splitTender) {
      setSplitTender(false)
      toPage = 'paymentPanel'
    } else if (warrantyData?.warranties?.length > 0) {
      toPage = 'warrantyPanel'
    } else {
      dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
      toPage = 'scanDetailsPanel'
    }
    break
  case 'changePanel':
    toPage = 'paymentPanel'
    break
  case 'creditPanel':
  case 'cashPanel':
    toPage = 'paymentPanel'
    break
  case 'tenderAmountPanel':
    toPage = 'paymentPanel'
    break
  case 'scanDetailsPanel':
    toPage = 'initialScanPanel'
    break
  default:
    toPage = activePanel
  }
  dispatch(
    updateUiData(
      {
        activePanel: toPage,
        previousPanel: activePanel,
        creditPanelError: null,
        error: false,
        clearUpc: true,
        scanError: false,
        errorMessage: null
      },
      UPDATE_UI_DATA
    )
  )
  sendRumRunnerEvent('Back Button Press', {
    fromPage: activePanel,
    toPage: toPage
  })
  console.info('END: ' + loggingHeader + 'back')
}

/**
 * UI data action creator
 * @param {UiDataTypes} data UI data
 * @param {string} actionType UI data type
 * @returns An action object containing an action type and data
 */
export const updateUiData = (
  data: UiDataTypes | LoadingStatesTypes,
  actionType: string
): { type: string; data: UiDataTypes | LoadingStatesTypes } => {
  console.info('ENTER: ' + loggingHeader + 'updateUiData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

export const clearMsrSwipe = () => (dispatch: AppDispatch) => {
  dispatch(
    updateUiData(
      {
        giftCardAccountNumber: null,
        giftCardExpirationDate: null,
        giftCardError: null
      },
      UPDATE_UI_DATA
    )
  )
}

export const checkForLoading = (loadingStates) => {
  for (const apiCall in loadingStates) {
    if (loadingStates[apiCall]) {
      return true
    }
  }
  return false
}
