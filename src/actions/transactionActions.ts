import * as CoordinatorAPI from '../utils/coordinatorAPI'
import { abortOutstandingRequestsOnVoid, OverrideCouponType } from '../utils/coordinatorAPI'
import * as Storage from '../utils/asyncStorage'
import * as UiActions from './uiActions'
import { updateLoadingStates } from './uiActions'
import { Platform } from 'react-native'
import * as CefSharp from '../utils/cefSharp'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import * as LoyaltyActions from './loyaltyActions'
import { fetchLoyaltyByAccountNumber } from './loyaltyActions'
import { updateAnalyticsData } from './analyticsActions'
import { addWarrantiesToTransaction, updateWarrantySelection } from './warrantyActions'
import { clearManagerOverrideInfo, receiveManagerOverrideInfo } from './managerOverrideActions'
import { PendingManagerOverrideData } from '../reducers/managerOverrideData'
import Queue from '../utils/queue'
import { TransactionDataTypes } from '../reducers/transactionData'
import { ReturnDataType } from '../reducers/returnData'
import { AppThunk } from '../reducers'
import { PrinterStringData } from '../reducers/printerString'
import { AssociateDataTypes } from '../reducers/associateData'
import { WarrantyDataTypes } from '../reducers/warrantyData'
import { Customer } from '../reducers/loyaltyData'
import { StoreInfoTypes } from '../reducers/storeInformation'
import { clearAssociateData, RECEIVE_ASSOCIATE_DATA, receiveAssociateData } from './associateActions'
import { checkIfItemListContainsAttribute, checkIfItemListContainsGiftReceiptEligibleItems, checkIfTrxFailedToFinalize, checkIsCashInvolved, getRoundUpAmount } from '../utils/transactionHelpers'
import { clearPrintReceiptData, receivePrintReceiptData } from './printReceiptActions'
import { getReturns } from './returnActions'
import { Dispatch } from 'redux'
import { AppDispatch } from '../Main'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { PanelsType } from '../reducers/uiData'
import { sendAppInsightsEvent } from '../utils/appInsights'
import { getConfigurationValue } from './configurationActions'
import { deleteItemStorageLatch, generalErrorMessage, GIFTCARD, invalidAssociateCredentialsMessage } from '../utils/reusableStrings'
import { setTenderEndzoneStatus } from './refundsActions'
import { EndzoneTenderStatus } from '../reducers/refundsData'
import { setRefundManagerOverrideApplied } from './alternateRefundActions'
import { removeTaxSummaryIfDisabled } from '../utils/taxSummaryUtil'
export const UPDATE_TRANSACTION_DATA = 'UPDATE_TRANSACTION_DATA'
export const CLEAR_TRANSACTION_DATA = 'CLEAR_TRANSACTION_DATA'
export const REPLACE_TRANSACTION_DATA = 'REPLACE_TRANSACTION_DATA'
export const UPDATE_ANALYTICS_DATA = 'UPDATE_ANALYTICS_DATA'

const loggingHeader = 'actions > transactionActions > '

const isWeb = Platform.OS === 'web'
let isCefSharp = false
const refresh = (): void => {
  window.location.reload()
}
if (isWeb) {
  isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
}

/**
 * Update transaction data in Redux store
 * @param {TransactionDataTypes} data Transaction data
 */
export const receiveTransactionData = (data: TransactionDataTypes) => (
  dispatch: Dispatch<AppDispatch>
): void => {
  console.info('BEGIN: ' + loggingHeader + 'receiveTransactionData\n' + JSON.stringify({ data: data }))
  if (data?.originalSaleInformation) {
    data.originalSaleInformation[0].returnItems.forEach(item => {
      item.returnItem = true
      item.transactionItemIdentifier = Number(item.lineNumber.toString() + item.sequenceNumber) * -1
    })
  }

  const updatedData = removeTaxSummaryIfDisabled(data)

  dispatch(updateTransactionData(updatedData, UPDATE_TRANSACTION_DATA))
  console.info('END: ' + loggingHeader + 'receiveTransactionData')
}

/**
 * Update transaction data in the Redux store and send the transaction
 * data to the PinPad. This should be used instead of individual calls
 * to prevent missed transaction updates to the PinPad developing without
 * a PinPad.
 */
export const receiveTransactionDataAndSendToPinPad = (data: TransactionDataTypes) => (
  dispatch: Dispatch<AppDispatch>
): void => {
  console.info('BEGIN: ' + loggingHeader + 'receiveTransactionDataAndSendToPinPad\n' + JSON.stringify({ data: data }))
  dispatch(receiveTransactionData(data))
  CefSharp.sendTransactionToPinPad(data)
  console.info('END: ' + loggingHeader + 'receiveTransactionDataAndSendToPinPad')
}

/**
 * Remove temporary key in transaction data in Redux store
 * @param {TransactionDataTypes} data Transaction data
 */
export const removeTemporaryTransactionDataKey = (transactionData: TransactionDataTypes, temporaryTransactionDataKey: string): AppThunk => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'removeTemporaryTransactionDataKey\n' + JSON.stringify({ transactionData: transactionData, temporaryTransactionDataKey: temporaryTransactionDataKey }))
  const data = JSON.parse(JSON.stringify(transactionData))
  delete data[temporaryTransactionDataKey]
  dispatch(updateTransactionData(data, REPLACE_TRANSACTION_DATA))
  console.info('END: ' + loggingHeader + 'removeTemporaryTransactionDataKey')
}

/**
 * Replace transaction data in Redux store
 * @param {TransactionDataTypes} data Transaction data
 */
export const replaceTransactionData = (data: TransactionDataTypes) => (
  dispatch: Dispatch<AppDispatch>
): void => {
  console.info('BEGIN: ' + loggingHeader + 'replaceTransactionData\n' + JSON.stringify({ data: data }))
  dispatch(updateTransactionData(data, REPLACE_TRANSACTION_DATA))
  console.info('END: ' + loggingHeader + 'replaceTransactionData')
}

const retryFinalizeActiveTransaction = (callNumber) => (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  return CoordinatorAPI.finalizeTransaction()
    .then(res => {
      if (!res.ok && res.status !== 410) {
        throw new Error('Failure to finalize transaction returned from checkForActiveTransaction')
      } else {
        setTimeout(() => {
          dispatch(UiActions.receiveUiData({ showModal: false }))
          dispatch(UiActions.backToHome())
        }, 5000)
      }
    })
    .catch(error => {
      console.info(loggingHeader + 'retryFinalize error:\n' + JSON.stringify(callNumber) + ' ' + JSON.stringify(error))
      setTimeout(() => dispatch(retryFinalizeActiveTransaction(callNumber + 1)), 5000)
    })
}
/**
 * Check for an active transaction
 */
export const checkForActiveTransaction = (): AppThunk => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'checkForActiveTransaction')
  CoordinatorAPI.checkForActiveTransaction()
    .then(res => {
      const managerOverrideInfo = JSON.parse(res.headers?.get('manager-override-info'))
      if (managerOverrideInfo !== null) {
        dispatch(receiveManagerOverrideInfo(managerOverrideInfo))
      }
      if (!res.ok) {
        console.warn(loggingHeader + 'checkForActiveTransaction: not successful\n' + JSON.stringify(res))
        throw new Error('Error in checkForActiveTransaction')
      } else if (res.status !== 204) {
        return res.json()
      }
    })
    .then(async data => {
      console.info(loggingHeader + 'checkForActiveTransaction: success\n' + JSON.stringify(data))
      if (data) {
        if (checkIfTrxFailedToFinalize(data)) {
          dispatch(UiActions.receiveUiData({ showModal: 'retryFailedOperation', failedOperation: 'finalizeTransaction' }))
          dispatch(retryFinalizeActiveTransaction(1))
        }
        if (data.customer) dispatch(fetchLoyaltyByAccountNumber(data.customer.loyaltyNumber, false))
        for (let i = 0; i < data.items.length; i++) {
          if (data.items[i].associatedItems) {
            if (!data.tenders || data.tenders.length === 0) {
              dispatch(addWarrantiesToTransaction([], false))
              break
            } else {
              dispatch(
                updateWarrantySelection({
                  warrantySelections: {
                    [data.items[i].transactionItemIdentifier]: {
                      warrantySku: data.items[i].associatedItems[0].sku,
                      itemTransactionIdentifier: data.items[i].associatedItems[0].transactionItemIdentifier,
                      warrantyDescription: data.items[i].associatedItems[0].description
                    }
                  }
                })
              )
            }
          }
        }
        dispatch(UiActions.receiveUiData({ activePanel: 'scanDetailsPanel' }))
        dispatch(receiveTransactionData(data))
      }
    })
    .catch(error => {
      console.error(loggingHeader + 'checkForActiveTransaction: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'checkForActiveTransaction')
}

export const setReceiptDetails = (storeInfo, additionalInfo): AppThunk => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  dispatch(receivePrintReceiptData({
    serializedStoreInfo: JSON.stringify(storeInfo),
    serializedAdditionalInfo: JSON.stringify(additionalInfo)
  }))
}

export const getLastTransactionDetails = (): AppThunk => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'getLastTransaction')
  CoordinatorAPI.getLastTransactionDetails()
    .then(res => {
      if (!res.ok) {
        throw new Error('Failure: getLastTrx')
      } else {
        return res.json()
      }
    })
    .then(res => {
      console.info(loggingHeader + 'getLastTrx: success\n' + JSON.stringify(res))
      // We're only interested in the last transaction if it's a sale or return transaction
      // - Print receipt functionality ONLY if last transaction was a sale or return
      // - Post void functionality ONLY if last transaction a sale transaction
      if (res.transaction.header?.transactionType === 1 ||
        res.transaction.header?.transactionType === 4) {
        dispatch(receivePrintReceiptData({
          serializedTransaction: JSON.stringify(res.transaction),
          serializedAssociateData: JSON.stringify(res.associate)
        }))
      } else {
        dispatch(clearPrintReceiptData())
      }
    })
    .catch(error => {
      dispatch(clearPrintReceiptData())
      console.error(loggingHeader + 'getLastTransaction: Error\n' + JSON.stringify(error))
    })
}

export const transactionByBarcode = (receiptBarcode, callOrigin: 'postVoid' | 'reprintGiftReceipt', registersMustMatch?): AppThunk => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'transactionByBarcode')
  dispatch(updateLoadingStates({ transactionByBarcode: true }))
  dispatch(receivePrintReceiptData({
    transactionByBarcodeError: null,
    transactionByBarcodeErrorMessage: null
  }))
  CoordinatorAPI.transactionByBarcode(receiptBarcode, registersMustMatch)
    .then(res => {
      if (res.status === 422 || res.ok) {
        return res.json()
      } else {
        throw new Error('Failure: getLastTrx')
      }
    })
    .then(res => {
      dispatch(updateLoadingStates({ transactionByBarcode: false }))
      if (res.statusCode && res.statusCode === 422) {
        console.info(loggingHeader + 'transactionByBarcode: 422 Error\n' + JSON.stringify(res))
        dispatch(receivePrintReceiptData({
          transactionByBarcodeError: res.reasonCode,
          transactionByBarcodeErrorMessage: res.message
        }))
        return
      } else if (callOrigin === 'reprintGiftReceipt' && !checkIfItemListContainsGiftReceiptEligibleItems(res.items)) {
        dispatch(receivePrintReceiptData({
          transactionByBarcodeError: 'noSaleItems',
          transactionByBarcodeErrorMessage: 'Transaction is not eligible for gift receipts'
        }))
        return
      }
      console.info(loggingHeader + 'transactionByBarcode: success\n' + JSON.stringify(res))
      dispatch(receivePrintReceiptData({
        transactionFoundViaBarcode: res
      }))
    })
    .catch(error => {
      dispatch(receivePrintReceiptData({
        transactionByBarcodeError: 'generalError',
        transactionByBarcodeErrorMessage: 'Sorry, something went wrong. Please try again.'
      }))
      dispatch(updateLoadingStates({ transactionByBarcode: false }))
      console.error(loggingHeader + 'transactionByBarcode: Error\n' + JSON.stringify(error))
    })
}

/**
 * Search for a upc, coupon, or scorecard account
 * @param {string} input Search input
 * @param {string} associateId Associate id
 * @param {string} inputSource Scan source (for analytics)
 * @param {string} [age] Age of customer (optional)
 */
export const omniSearch = (
  input: string,
  associateId: string,
  inputSource: 'loyaltyPanel' | 'scan' | 'manual' | 'productLookup' = 'scan',
  age?: string,
  sapId?: string,
  activePanel?: PanelsType,
  transactionType?: string
) => async dispatch => {
  console.info('BEGIN: ' + loggingHeader + 'omniSearch\n' + JSON.stringify({
    input: input,
    associateId: associateId,
    inputSource: inputSource,
    age: age,
    sapId: sapId
  }))
  if (input !== '') {
    dispatch(updateLoadingStates({ omniSearch: input }))
    const thisAge = age || (await Storage.getData('age'))
    const startTime = new Date().getTime()
    console.info(loggingHeader + 'omniSearch: Enqueuing lookup\n' + JSON.stringify({
      input: input,
      associateId: associateId,
      thisAge: thisAge,
      sapId: sapId
    }))
    Queue.enqueue(() => CoordinatorAPI.omniSearch(input, associateId, thisAge, sapId), 'omniSearch')
      .then(res => {
        if (!res.ok) {
          if (res.status === 422 && input.trim().charAt(0).toLowerCase() === 'r') {
            Queue.dequeue()
            return res.json()
          }
          console.warn(loggingHeader + 'omniSearch: not successful\n' + JSON.stringify(res))
          if (res.status === 451) {
            res.json().then(async data => {
              if (data.type === 'RestrictedProduct') {
                const attribute = data.restrictedProductAttributes[0].description
                switch (attribute) {
                case 'RestrictedAge21':
                case 'RestrictedAge':
                  if (thisAge) {
                    dispatch(
                      UiActions.receiveUiData({
                        showModal: 'athleteIsAgeRestricted',
                        modalErrorMessage: 'Athlete ineligible to purchase, based on age.'
                      })
                    )
                  } else {
                    const latestAge = await Storage.getData('age')
                    if (!latestAge) {
                      dispatch(receiveTransactionData({ tempUpc: data.upc }))
                      dispatch(
                        UiActions.receiveUiData({
                          showModal: 'ageRestriction',
                          modalErrorMessage: null,
                          autofocusTextbox: 'Modal'
                        })
                      )
                    } else {
                      dispatch(omniSearch(input, associateId, 'scan', latestAge))
                    }
                  }
                  break
                case 'Recall':
                  dispatch(
                    UiActions.receiveUiData({
                      showModal: 'recall'
                    })
                  )
                  break
                case 'Launch':
                  dispatch(
                    UiActions.receiveUiData({
                      showModal: 'launch'
                    })
                  )
                  break
                default:
                  break
                }
              }
            })
          } else {
            Queue.dequeue()
            let msg = 'Barcode unknown'
            if (res.status === 409) {
              msg = 'Coupon already scanned'
              dispatch(
                UiActions.receiveUiData({
                  clearUpc: true,
                  errorMessage: null,
                  scanError: false,
                  activePanel: 'scanDetailsPanel',
                  selectedItem: 'couponPanel',
                  footerOverlayActive: 'None',
                  showAddAssociateDiscount: false
                })
              )
            } else if (res.status === 422 && input.length === 22) {
              const isAdyen = window.reduxStore.getState().registerData.isAdyen
              const returnsEnabled = isAdyen && featureFlagEnabled('InStoreReturns')
              console.info(loggingHeader + 'Omnisearch: 22 digit barcode scanned-', JSON.stringify({ returnsEnabled: returnsEnabled, input: input }))
              if (returnsEnabled) {
                if (activePanel === 'initialScanPanel' || (activePanel === 'scanDetailsPanel' && transactionType !== 'Return')) {
                  dispatch(UiActions.receiveUiData({
                    showModal: 'returns',
                    clearUpc: true
                  }))
                  dispatch(getReturns(input))
                  return
                } else {
                  dispatch(UiActions.receiveUiData({ scanError: true, scanErrorMessage: 'Returns Error' }))
                  return
                }
              } else {
                msg = 'Returns are not yet supported on Endzone'
              }
            } else if (res.status === 422 && input.length === 12) {
              res.json().then(data => {
                if (data?.error?.reasonCode === 1) {
                  msg = 'Cannot scan warranty upcs'
                }
                dispatch(
                  UiActions.receiveUiData({
                    scanError: true,
                    scanErrorMessage: msg,
                    clearUpc: false,
                    showModal: false
                  })
                )
              })
            }
            dispatch(
              UiActions.receiveUiData({
                scanError: true,
                scanErrorMessage: msg,
                clearUpc: false,
                showModal: false
              })
            )
            if (res.status !== 409) {
              if (input.trim().charAt(0).toLowerCase() === 'p') {
                sendRumRunnerEvent('Unknown search result', {
                  type: 'Coupon',
                  code: input
                })
                sendAppInsightsEvent('UnknownSearchResult', {
                  type: 'Coupon',
                  code: input
                })
              } else {
                sendRumRunnerEvent('Unknown search result', {
                  type: 'Barcode',
                  code: input
                })
                sendAppInsightsEvent('UnknownSearchResult', {
                  type: 'Barcode',
                  code: input
                })
              }
            }
            // Do not throw error for any of the cases above.
            return null
          }
          console.warn(loggingHeader + 'omniSearch: Could not get item\n' + JSON.stringify(res))
          throw new Error('Could not get item')
        } else {
          dispatch(LoyaltyActions.clearInvalidReward())
          return res.json()
        }
      })
      .then(async data => {
        console.info(loggingHeader + 'omniSearch: success\n' + JSON.stringify(data))
        dispatch(updateLoadingStates({ omniSearch: null }))

        if (!data) return

        // Queuebuster
        if (data.type === 6) {
          data.items.forEach((upc) => {
            setTimeout(() => dispatch(omniSearch(upc, associateId, 'manual')), 1)
          })
          dispatch(
            UiActions.receiveUiData({
              clearUpc: true,
              errorMessage: null,
              scanError: false,
              activePanel: 'scanDetailsPanel',
              footerOverlayActive: 'None',
              showAddAssociateDiscount: false
            })
          )
        } else if (data.type === 'Transaction') {
          dispatch(receiveTransactionData(data.transaction))
          const lastItemIsPFP = data.transaction.items[data.transaction.items.length - 1].promptForPrice
          if (!lastItemIsPFP) {
            if (Queue.queue.length > 0) {
              if (Queue.queueOperation[0] !== 'omniSearch') {
                dispatch(updateLoadingStates({ omniSearch: null }))
              } else {
                dispatch(updateLoadingStates({ omniSearch: input }))
              }
              Queue.dequeue()
            }
          }
          !data.transaction.items.some(
            i => !i.returnPrice && !i.amount
          ) && CefSharp.sendTransactionToPinPad(data.transaction)
          dispatch(
            UiActions.receiveUiData({
              selectedItem:
              data.transaction.items[data.transaction.items.length - 1]
                .transactionItemIdentifier,
              lastItem:
              data.transaction.items[data.transaction.items.length - 1]
                .transactionItemIdentifier,
              scanError: false,
              errorMessage: null,
              clearUpc: true,
              showModal: false,
              activePanel: 'scanDetailsPanel',
              footerOverlayActive: 'None',
              showAddAssociateDiscount: false
            })
          )
          sendRumRunnerEvent('Item Entry', {
            inputValue: input,
            inputSource: inputSource,
            inputType: 'upc',
            inputError: false,
            f_screenTime: Number((new Date().getTime() / 1000) - (startTime / 1000)).toFixed(2)
          })
          sendAppInsightsEvent('ItemEntry', {
            inputValue: input,
            inputSource: inputSource,
            inputType: 'upc',
            inputError: false,
            duration: new Date().getTime() - startTime
          })
        } else if (data.type === 'LoyaltyAccounts') {
          // TODO: Edit this when coordinator is updated to return transaction data with loyalty lookup
          dispatch(
            receiveTransactionData(data.transaction)
          )

          dispatch(
            UiActions.receiveUiData({
              clearUpc: true,
              errorMessage: null,
              scanError: false,
              activePanel: 'scanDetailsPanel',
              footerOverlayActive: 'None',
              showAddAssociateDiscount: false
            })
          )
          CefSharp.cancelLoyaltyPhoneInput()
          LoyaltyActions.processLoyaltyLookup(dispatch, data.loyalty, input)
          sendRumRunnerEvent('Item Entry', {
            inputValue: input,
            inputSource: inputSource,
            inputType: 'phone',
            inputError: false,
            f_screenTime: Number((new Date().getTime() / 1000) - (startTime / 1000)).toFixed(2)
          })
          sendAppInsightsEvent('ItemEntry', {
            inputValue: input,
            inputSource: inputSource,
            inputType: 'phone',
            inputError: false,
            duration: new Date().getTime() - startTime
          })
        } else if (data.type === 'Coupon') {
          dispatch(receiveTransactionDataAndSendToPinPad(data.transaction))
          dispatch(
            UiActions.receiveUiData({
              clearUpc: true,
              errorMessage: null,
              scanError: false,
              activePanel: 'scanDetailsPanel',
              selectedItem: 'couponPanel',
              footerOverlayActive: 'None',
              showAddAssociateDiscount: false
            })
          )
        } else if (data.type === 'Reward') {
          if (featureFlagEnabled('RewardExceedsDiscount') && data.totalRewardsAmountExceedsTotalDiscountAmount) {
            dispatch(UiActions.receiveUiData({ showModal: 'rewardAmountExceedsDiscountedAmount' }))
          }
          dispatch(LoyaltyActions.receiveLoyaltyData({ lastAppliedReward: data.reward.rewardCertificateNumber }))
          dispatch(receiveTransactionDataAndSendToPinPad(data.transaction))
          dispatch(
            UiActions.receiveUiData({
              clearUpc: true,
              errorMessage: null,
              scanError: false,
              activePanel: 'scanDetailsPanel',
              selectedItem: inputSource === 'loyaltyPanel' ? 'LOYALTY_PANEL' : 'rewardPanel',
              footerOverlayActive: 'None',
              showAddAssociateDiscount: false
            })
          )
        } else if (data.type === 'AssociateDiscount') {
          dispatch(receiveTransactionDataAndSendToPinPad(data.transaction))
          dispatch(
            UiActions.receiveUiData({
              clearUpc: true,
              errorMessage: null,
              scanError: false,
              activePanel: 'scanDetailsPanel',
              selectedItem: 'associateDiscountPanel',
              footerOverlayActive: 'None',
              showAddAssociateDiscount: false
            })
          )
        } else if (data.type === 'FamilyNight') {
          const missingData = data.missingData === 0 ? 'couponCode' : 'associateID'
          dispatch(receiveAssociateData({
            familyNightModalStep: missingData,
            familyNightOmniSearchQuery: data.suppliedData
          }, RECEIVE_ASSOCIATE_DATA))
          dispatch(UiActions.receiveUiData({
            footerOverlayActive: 'Teammate',
            showAddAssociateDiscount: true,
            clearUpc: true,
            autofocusTextbox: 'Modal',
            scanEvent: null
          }))
        } else if (data.type === 'Error' && data.upc.trim().charAt(0).toLowerCase() === 'r') {
          dispatch(LoyaltyActions.addInvalidReward({
            reasonCode: data.error.reasonCode,
            message: data.error.message,
            upc: data.upc,
            rewardCertificate: data.rewardCertificate
          }))
          dispatch(
            UiActions.receiveUiData({
              selectedItem: 'rewardPanel',
              autofocusTextbox: 'OmniSearch',
              activePanel: 'scanDetailsPanel',
              clearUpc: true
            })
          )
        } else {
          throw new Error('Could not process search')
        }
      })
      .catch(error => {
        sendRumRunnerEvent('Item Entry', {
          inputValue: input,
          inputSource: inputSource,
          inputType: 'error',
          inputError: true,
          errorMessage: error.message,
          f_screenTime: Number((new Date().getTime() / 1000) - (startTime / 1000)).toFixed(2)
        })
        sendAppInsightsEvent('ItemEntry', {
          inputValue: input,
          inputSource: inputSource,
          inputType: 'error',
          inputError: true,
          errorMessage: error.message,
          duration: new Date().getTime() - startTime
        })
        dispatch(updateLoadingStates({ omniSearch: null }))
        dispatch(
          UiActions.receiveUiData({
            scanError: true,
            scanErrorMessage: generalErrorMessage,
            clearUpc: false
          })
        )
        console.error(loggingHeader + 'omniSearch: Error\n' + JSON.stringify(error))
      })
  }
  console.info('END: ' + loggingHeader + 'omniSearch')
}

/**
 * Delete an item from the transaction
 * @param {number} transactionId Transaction Id
 */
export const deleteItem = (transactionId: number) => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'deleteItem\n' + JSON.stringify({
    transactionId: transactionId
  }))
  const latch = await Storage.getData(deleteItemStorageLatch)
  if (latch === transactionId.toString()) {
    console.warn('deleteItem already processing [matching latch: ' + transactionId + ']')
    return
  }
  await Storage.storeData(deleteItemStorageLatch, transactionId.toString())
  dispatch(UiActions.updateLoadingStates({ deleteItem: transactionId }))
  CoordinatorAPI.deleteItem(transactionId)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'deleteItem: Could not delete item\n' + JSON.stringify(res))
        throw new Error('Could not delete item')
      } else {
        return res.json()
      }
    })
    .then(async data => {
      console.info(loggingHeader + 'deleteItem: success\n' + JSON.stringify(data))
      sendAppInsightsEvent('DeleteItem', {
        transactionId,
        error: false
      })
      if (data.header.transactionStatusDescription === 'Void') {
        abortOutstandingRequestsOnVoid()
        CefSharp.endTransaction((await Storage.getData('features')), (await Storage.getData('configuration')))
        Storage.removeItems(['age'])
        dispatch(
          UiActions.receiveUiData({
            clearUpc: true,
            errorMessage: null,
            scanError: false,
            activePanel: 'initialScanPanel'
          })
        )
        dispatch(
          LoyaltyActions.updateLoyaltyData(
            {
              selectedLoyaltyCustomer: null,
              loyaltyCustomers: null,
              loyaltyError: null,
              retryParameters: {
                firstName: '',
                lastName: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                email: '',
                storeNumber: 0,
                lastItem: '',
                loyaltyAccount: ''
              },
              retryType: '',
              didCreatedAccountExist: false,
              isNoAccountFound: false,
              phoneInput: '',
              phoneOutput: '',
              lastPhoneLookup: '',
              altScreenName: null
            },
            LoyaltyActions.UPDATE_LOYALTY_DATA
          )
        )
        dispatch(clearTransactionData())
        sendAppInsightsEvent('VoidTransaction', {
          cause: 'DeleteItem'
        })
      } else {
        dispatch(receiveTransactionDataAndSendToPinPad(data))
        dispatch(
          UiActions.receiveUiData({ scanError: false, errorMessage: null })
        )
      }
      dispatch(UiActions.updateLoadingStates({ deleteItem: null }))
      await Storage.removeItems([deleteItemStorageLatch])
    })
    .catch(async error => {
      await Storage.removeItems([deleteItemStorageLatch])
      dispatch(UiActions.updateLoadingStates({ deleteItem: null }))
      console.error(loggingHeader + 'deleteItem: Error\n' + JSON.stringify(error))
      sendAppInsightsEvent('DeleteItem', {
        transactionId,
        error: true,
        errorMessage: error.message
      })
    })
  console.info('END: ' + loggingHeader + 'deleteItem')
}

export const editItemPriceWithManagerOverride = (
  itemId: number,
  overridePrice: string,
  everydayPrice: string,
  promptForPrice: boolean,
  isManager: boolean,
  callOrigin?: string
) : AppThunk => async (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  let editPriceManagerOverrideThreshold = getConfigurationValue('manageroverridethresholds', 'editItemPrice')
  editPriceManagerOverrideThreshold = editPriceManagerOverrideThreshold !== null ? editPriceManagerOverrideThreshold : 0.2
  const percentChange = Math.abs(1 - (parseFloat(overridePrice) / parseFloat(everydayPrice)))
  if (callOrigin !== 'sportsMatterPrompt') {
    if (featureFlagEnabled('EditPriceManagerOverride') && percentChange > editPriceManagerOverrideThreshold && !promptForPrice && !isManager) {
      const managerOverrideInfo = {
        ManagerOverrideData: JSON.stringify({ itemId, overridePrice, everydayPrice, callOrigin }),
        ManagerOverrideType: 2
      }
      dispatch(receiveManagerOverrideInfo([managerOverrideInfo]))
    } else {
      dispatch(editItemPrice(itemId, overridePrice, callOrigin))
    }
  } else {
    dispatch(editItemPrice(itemId, overridePrice, callOrigin))
  }
}

/**
 * Edit price of item
 * @param {string} itemId Item id
 * @param {string} overridePrice New item price
 * @async
 */
export const editItemPrice = (
  itemId: number,
  overridePrice: string,
  callOrigin?: string
): AppThunk => async (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'editItemPrice\n' + JSON.stringify({
    itemId,
    overridePrice
  }))
  dispatch(updateLoadingStates({ editItemPrice: itemId }))
  CoordinatorAPI.editItemPrice(itemId, overridePrice)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'editItemPrice: Could not edit item price\n' + JSON.stringify(res))
        throw new Error('Could not edit item price')
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info(loggingHeader + 'editItemPrice: success\n' + JSON.stringify(data))
      if (callOrigin === 'sportsMatterPrompt') dispatch(UiActions.receiveUiData({ showModal: false }))
      dispatch(UiActions.receiveUiData({ autofocusTextbox: 'OmniSearch' }))
      dispatch(updateLoadingStates({ editItemPrice: null }))
      dispatch(receiveTransactionDataAndSendToPinPad(data))
    })
    .catch(error => {
      dispatch(updateLoadingStates({ editItemPrice: null }))
      console.error(loggingHeader + 'editItemPrice: Error\n' + JSON.stringify(error))
      if (callOrigin === 'sportsMatterPrompt') refresh()
    })
  console.info('END: ' + loggingHeader + 'editItemPrice')
}

/**
 * Create a new credit tender
 * @param {PrinterStringData} printerString storeInfo as a string
 * @param {AssociateDataTypes} associateData Associate data object
 * @param {Customer} selectedLoyaltyCustomer Selected customer object
 * @param {any} creditResponse Response from CefSharp.beginCreditTender method
 * @param {WarrantyDataTypes} warrantyData Warranty data object
 * @param {string} tenderIdentifier Current transaction tender identifier
 * @param {string} refundCustomerOrderNumber Referenced refund customer order number (optional)
 * @param {number} refundTenderNumber Referenced refund tender index (optional)
 */
export const createNewCreditTender = (
  printerString: PrinterStringData,
  associateData: AssociateDataTypes,
  selectedLoyaltyCustomer: Customer,
  returnData: ReturnDataType,
  creditResponse: Record<string, unknown>,
  warrantyData: WarrantyDataTypes,
  tenderIdentifier: string,
  refundCustomerOrderNumber?: string,
  refundTenderNumber?: number,
  alternateTenderManagerOverrideId?: string,
  alternateTenderManagerOverridePin?: string
) => async (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'createNewCreditTender\n' + JSON.stringify({
    printerString: printerString,
    associateData: associateData,
    selectedLoyaltyCustomer: selectedLoyaltyCustomer,
    creditResponse: creditResponse,
    warrantyData: warrantyData,
    tenderIdentifier: tenderIdentifier,
    refundCustomerOrderNumber: refundCustomerOrderNumber,
    refundTenderNumber: refundTenderNumber,
    alternateTenderManagerOverrideId: alternateTenderManagerOverrideId,
    alternateTenderManagerOverridePin: alternateTenderManagerOverridePin
  }))

  const latch = await Storage.getData('createNewCreditTenderLatch')
  if (latch === tenderIdentifier) {
    console.warn('createNewCreditTender already processing [matching latch: ' + tenderIdentifier + ']')
    return
  }
  await Storage.storeData('createNewCreditTenderLatch', tenderIdentifier)
  dispatch(updateLoadingStates({ newTender: true }))
  CoordinatorAPI.newCreditTender(creditResponse, alternateTenderManagerOverrideId, alternateTenderManagerOverridePin, tenderIdentifier)
    .then(async res => {
      if (res.status >= 500) throw new Error('Error adding new credit tender')
      if (res.status === 409) {
        await dispatch(checkForActiveTransaction())
      }
      console.info(loggingHeader + 'createNewCreditTender: response\n' + JSON.stringify(res))
      return res.json()
    })
    .then(async data => {
      console.info(loggingHeader + 'createNewCreditTender: success\n' + JSON.stringify(data))
      dispatch(updateLoadingStates({ giftCardActivation: false, newTender: false }))
      dispatch(UiActions.receiveUiData({
        showModal: false,
        failedOperation: null,
        giftCardAccountNumber: null
      }))
      await Storage.removeItems(['createNewCreditTenderLatch'])
      if (data.actionCode && data.actionCode !== 200) {
        dispatch(
          UiActions.updateUiData(
            {
              creditPanelError: data.errorMessage,
              creditPanelErrorInstructions: data.errorInstructions,
              displayInsertCard: false
            },
            UiActions.UPDATE_CREDIT_PANEL
          )
        )
        if (data.transaction) {
          dispatch(receiveTransactionDataAndSendToPinPad(data.transaction))
        }
      } else if (data.statusCode !== 409) {
        dispatch(receiveTransactionData(data))
        if (featureFlagEnabled('ReferencedRefunds') && refundCustomerOrderNumber) {
          if (alternateTenderManagerOverrideId?.length > 0) dispatch(setRefundManagerOverrideApplied(refundCustomerOrderNumber))
          dispatch(setTenderEndzoneStatus(refundCustomerOrderNumber, refundTenderNumber, EndzoneTenderStatus.Processed))
        }
        const isCashInvolved = checkIsCashInvolved(data.tenders)
        const isNotRefundingOver500toGiftCards = !(
          featureFlagEnabled('IncrementedGiftCardRefunds') &&
          data.total.grandTotal < -500 &&
          data.tenders?.some(tender => tender.cardType === GIFTCARD)
        )
        if (data.total.remainingBalance === 0) {
          const tenderType = isCashInvolved ? 'Total' : 'Credit'
          dispatch(
            UiActions.receiveUiData({
              activePanel: 'changePanel',
              tenderType: tenderType
            })
          )
        } else if (isNotRefundingOver500toGiftCards) {
          dispatch(
            UiActions.receiveUiData({
              activePanel: 'paymentPanel'
            })
          )
        }
      }
    })
    .catch(async error => {
      dispatch(updateLoadingStates({ giftCardActivation: false, newTender: false }))
      await Storage.removeItems(['createNewCreditTenderLatch'])
      console.error(loggingHeader + 'createNewCreditTender: Error\n' + JSON.stringify(error))
      setTimeout(() => {
        dispatch(createNewCreditTender(
          printerString,
          associateData,
          selectedLoyaltyCustomer,
          returnData,
          creditResponse,
          warrantyData,
          tenderIdentifier,
          refundCustomerOrderNumber,
          refundTenderNumber))
      }, 5000)

      dispatch(UiActions.receiveUiData({
        showModal: 'retryFailedOperation',
        failedOperation: 'createNewCreditTender'
      }))
    })
  console.info('END: ' + loggingHeader + 'createNewCreditTender')
}

/**
 * Calculate the change to give the customer. If enough money has been given to cover the cost of all items, call finalizeTransaction action.
 * @param {number} cashAmount Amount of cash received
 * @param {number} remainingBalance Amount still needed for transaction
 * @param {PrinterStringData} printerString StoreInfo as a string
 * @param {AssociateDataTypes} associateData Associate data object
 * @param {Customer} selectedLoyaltyCustomer Selected loyalty customer object
 * @param {ReturnDataType} returnData Return data
 * @param {WarrantyDataTypes} warrantyData Warranty data object
 * @param {string} refundCustomerOrderNumber Referenced refund customer order number (optional)
 * @param {number} refundTenderNumber Referenced refund tender index (optional)
 * @param {string} alternateTenderManagerOverrideId Alternate tender manager override manager id (optional)
 * @param {number} alternateTenderManagerOverridePin Alternate tender manager override manager passcode (optional)
 */
export const calculateChange = (
  cashAmount: number,
  remainingBalance: number,
  printerString: PrinterStringData,
  associateData: AssociateDataTypes,
  selectedLoyaltyCustomer: Customer,
  returnData: ReturnDataType,
  warrantyData: WarrantyDataTypes,
  refundCustomerOrderNumber?: string,
  refundTenderNumber?: number,
  alternateTenderManagerOverrideId?: string,
  alternateTenderManagerOverridePin?: string
) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'calculateChange\n' + JSON.stringify({
    cashAmount: cashAmount,
    remainingBalance: remainingBalance,
    printerString: printerString,
    associateData: associateData,
    selectedLoyaltyCustomer: selectedLoyaltyCustomer,
    warrantyData: warrantyData,
    refundCustomerOrderNumber: refundCustomerOrderNumber,
    refundTenderNumber: refundTenderNumber,
    alternateTenderManagerOverrideId: alternateTenderManagerOverrideId,
    alternateTenderManagerOverridePin: alternateTenderManagerOverridePin
  }))
  dispatch(updateLoadingStates({ newTender: true }))
  CoordinatorAPI.newCashTender(
    cashAmount.toString(),
    alternateTenderManagerOverrideId,
    alternateTenderManagerOverridePin)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'calculateChange: not successful\n' + JSON.stringify(res))
        throw new Error('Could not add new tender')
      } else {
        return res.json()
      }
    })
    .then(data => {
      dispatch(updateLoadingStates({ newTender: false }))
      console.info(loggingHeader + 'calculateChange: success\n' + JSON.stringify(data))
      dispatch(receiveTransactionData(data))
      if (featureFlagEnabled('ReferencedRefunds') && refundCustomerOrderNumber) {
        if (alternateTenderManagerOverrideId?.length > 0) dispatch(setRefundManagerOverrideApplied(refundCustomerOrderNumber))
        dispatch(setTenderEndzoneStatus(refundCustomerOrderNumber, refundTenderNumber, EndzoneTenderStatus.Processed))
      }
      if (cashAmount >= remainingBalance) {
        dispatch(
          UiActions.receiveUiData({
            activePanel: 'changePanel',
            tenderType: 'Cash'
          })
        )
      } else {
        dispatch(
          UiActions.receiveUiData({
            activePanel: 'paymentPanel'
          })
        )
      }
    })
    .catch(error => {
      dispatch(updateLoadingStates({ newTender: false }))
      console.error(loggingHeader + 'calculateChange: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'calculateChange')
}

const completeTransactionForCustomer = (
  data,
  storeInfo,
  isCashInvolved,
  associateData,
  additionalInformation,
  firstFinalizeFailed,
  emailAddress = null,
  emailAndOrPrintFlag = null
) => async (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'completeTransactionForCustomer\n' + JSON.stringify({
    data: data,
    storeInfo: storeInfo,
    isCashInvolved: isCashInvolved,
    associateData: associateData,
    additionalInformation: additionalInformation,
    firstFinalizeFailed: firstFinalizeFailed,
    emailAddress: emailAddress,
    emailAndOrPrintFlag: emailAndOrPrintFlag
  }))
  CefSharp.endTransaction((await Storage.getData('features')), (await Storage.getData('configuration')))
  dispatch(receiveTransactionData(data))
  if (isWeb) {
    (async () => {
      const startTime = new Date().getTime()
      additionalInformation.eReceipts = emailAndOrPrintFlag

      if (isCashInvolved) CefSharp.openCashDrawer()

      const { printReceiptData, loyaltyData } = window.reduxStore.getState()

      additionalInformation.separateGiftReceipts = printReceiptData.midSaleSeparateGiftReceipts

      const nikeConnectConfiguration = getConfigurationValue('nikeconnectcampaign')
      additionalInformation.enableNikeConnect = nikeConnectConfiguration?.enableProductTags

      CefSharp.printSalesReceipt(
        JSON.stringify(data),
        storeInfo,
        JSON.stringify(associateData),
        JSON.stringify(additionalInformation)
      )

      if (
        nikeConnectConfiguration?.enableNikeChit &&
        checkIfItemListContainsAttribute(data.items, 8) &&
        !loyaltyData.accountLevelDetails?.partyAttributes?.attributes?.nike_connected
      ) {
        CefSharp.printNikeConnectedChit()
      }

      if (isCashInvolved) {
        await CefSharp.waitForCashDrawerToClose()

        sendRumRunnerEvent('Cash Drawer', {
          reason: 'Transaction',
          f_screenTime: Number((new Date().getTime() / 1000) - (startTime / 1000)).toFixed(2)
        })
        sendAppInsightsEvent('CashDrawerClosed', {
          reason: 'Transaction',
          duration: new Date().getTime() - startTime
        })
      }

      if (!firstFinalizeFailed) {
        if (isCefSharp) dispatch(UiActions.backToHome())
      }
    })()
    dispatch(LoyaltyActions.clearCustomer())
    console.info('END: ' + loggingHeader + 'completeTransactionForCustomer')
  }
}

/**
 * Call finalize transaction. Update transaction data. If on register, print receipt, open cash drawer if cash sale. Show pin pad screen saver. Remove customer age and loyalty info from localStorage and redux.
 * @param {AssociateDataTypes} associateData Associate data object
 * @param {StoreInfoTypes} storeInformation Store information object
 * @param {Customer} selectedLoyaltyCustomer Selected customer object
 * @param {boolean} isCashInvolved Cash sale indicator
 * @param {WarrantyDataTypes} warrantyData Warranty data object
 */
export const finalizeTransaction = (
  associateData: AssociateDataTypes,
  storeInformation: StoreInfoTypes,
  selectedLoyaltyCustomer: Customer,
  isCashInvolved: boolean,
  warrantyData: WarrantyDataTypes,
  returnData?: ReturnDataType,
  callNumber?: number,
  preFinalizeData?: TransactionDataTypes,
  emailAddress?: string,
  emailAndOrPrintFlag?: string
) => async (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'finalizeTransaction\n' + JSON.stringify({
    associateData: associateData,
    storeInformation: storeInformation,
    selectedLoyaltyCustomer: selectedLoyaltyCustomer,
    isCashInvolved: isCashInvolved,
    warrantyData: warrantyData
  }))

  const additionalInformation = {
    LoyaltyOptions: {
      selectedLoyaltyCustomer: selectedLoyaltyCustomer
    },
    AuthorizationIncentiveMessage: returnData?.returnAuthorizationData?.action.toLowerCase() === 'approved' ? returnData?.returnAuthorizationData?.printMessage : null
  }
  const storeInfo = JSON.stringify(storeInformation)
  // Send survey results
  const featureFlags = await Storage.getData('features')
  const csatEnabled = featureFlags?.includes('CSATSurvey')
  if (csatEnabled) {
    const surveyResults = await CefSharp.getPinPadSurveyResults()
    let status = 0
    let rank = 0
    if (surveyResults != null) {
      switch (surveyResults) {
      case 0:
        status = 1
        break
      case 10:
        status = 0
        break
      default:
        status = 2
        rank = surveyResults
      }
      await CoordinatorAPI.sendSurveyResults(status, rank, preFinalizeData.header.transactionNumber)
    }
  }

  const latchedTransactionNumber = await Storage.getData('finalizeTransactionLatch')
  if (latchedTransactionNumber === preFinalizeData.header.transactionNumber.toString()) {
    console.warn(`Failure to finalize: finalizeTransactionLatch(${latchedTransactionNumber}) matches attempted transaction`)
    return
  }
  await Storage.storeData('finalizeTransactionLatch', preFinalizeData.header.transactionNumber.toString())
  CoordinatorAPI.finalizeTransaction(emailAddress)
    .then(async res => {
      if (res.status === 410) {
        refresh()
      } else if (!res.ok) {
        console.warn(loggingHeader + 'finalizeTransaction: not successful\n' + JSON.stringify(res))
        throw new Error('Could not finalize transaction')
      } else {
        return res.json()
      }
    })
    .then(async (data) => {
      console.info(loggingHeader + 'finalizeTransaction: success\n' + JSON.stringify(data))
      dispatch(UiActions.receiveUiData({ showModal: false, failedOperation: null }))
      dispatch(
        updateAnalyticsData(
          { warrantyPanelViewed: false },
          UPDATE_ANALYTICS_DATA
        )
      )
      !isCefSharp &&
      dispatch(
        UiActions.receiveUiData({ showNewTransactionButton: true })
      )
      if (callNumber === 1) {
        dispatch(
          completeTransactionForCustomer(
            data,
            storeInfo,
            isCashInvolved,
            associateData,
            additionalInformation,
            false,
            emailAddress,
            emailAndOrPrintFlag
          )
        )
      } else if (callNumber > 1) {
        if (isCashInvolved) {
          await CefSharp.waitForCashDrawerToClose()
        }
        dispatch(UiActions.backToHome())
      }
    })
    .catch(async error => {
      console.error(loggingHeader + 'finalizeTransaction: Error\n' + JSON.stringify(callNumber) + ' ' + JSON.stringify(error))
      dispatch(UiActions.receiveUiData({ showModal: 'retryFailedOperation', failedOperation: 'finalizeTransaction' }))
      if (callNumber === 1) {
        const endDateTime = new Date()
        const preFinalizeDataClone = JSON.parse(JSON.stringify(preFinalizeData))
        preFinalizeDataClone.header.endDateTime = endDateTime.toISOString()
        dispatch(completeTransactionForCustomer(
          preFinalizeDataClone,
          storeInfo,
          isCashInvolved,
          associateData,
          additionalInformation,
          true,
          emailAddress,
          emailAndOrPrintFlag
        ))
      }
      await Storage.removeItems(['finalizeTransactionLatch'])
      setTimeout(() =>
        dispatch(
          finalizeTransaction(
            associateData,
            storeInformation,
            selectedLoyaltyCustomer,
            isCashInvolved,
            warrantyData,
            returnData,
            callNumber + 1,
            preFinalizeData,
            emailAddress,
            emailAndOrPrintFlag
          )
        ), 5000)
    })
  console.info('END: ' + loggingHeader + 'finalizeTransaction')
}

/**
 * Transaction data action creator
 * @param {TransactionDataTypes} data Transaction data
 * @param {string} actionType Transaction data action type
 * @returns An action object containing and action type and data
 */
export const updateTransactionData = (
  data: TransactionDataTypes,
  actionType: string,
  temporaryTransactionDataKey?: string
): { type: string; data: TransactionDataTypes; temporaryTransactionDataKey?: string } => {
  console.info('ENTER: ' + loggingHeader + 'updateTransactionData\n' + JSON.stringify({
    data: data,
    actionType: actionType,
    temporaryTransactionDataKey: temporaryTransactionDataKey
  }))
  if (temporaryTransactionDataKey) {
    return {
      type: actionType,
      data,
      temporaryTransactionDataKey: temporaryTransactionDataKey
    }
  }
  return {
    type: actionType,
    data
  }
}

/**
 * Remove all transaction data
 */
export const clearTransactionData = (): AppThunk => async (dispatch: Dispatch<AppDispatch>) => {
  console.info('BEGIN: ' + loggingHeader + 'clearTransactionData')
  dispatch(receiveAssociateData({ nsppSellingAssociate: null }, RECEIVE_ASSOCIATE_DATA))
  dispatch(updateTransactionData({}, CLEAR_TRANSACTION_DATA))
  console.info('END: ' + loggingHeader + 'clearTransactionData')
}

/**
 * Void transaction and remove all transaction and customer data from redux and localStorage.
 * @param {number} storeNumber
 * @param {number} registerNumber
 */
export const voidTransaction = (
  transaction: TransactionDataTypes,
  returnData: ReturnDataType,
  voidLoading: boolean,
  promptForFeedback?: boolean
) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'voidTransaction\n' + JSON.stringify({
    storeNumber: transaction.header.storeNumber,
    registerNumber: transaction.header.registerNumber
  }))
  if (voidLoading) {
    return
  }
  dispatch(updateLoadingStates({ void: true }))
  let returnAuthorizationKey = null
  if (returnData?.returnAuthorizationData?.action?.toLowerCase() !== 'denied' && returnData?.returnAuthorizationData?.transactionId) {
    returnAuthorizationKey = returnData.returnAuthorizationData.transactionId
  }
  // transaction have giftcards?  if so, deactivate
  let unprocessedGiftCardsCount = 0
  if (transaction.items) {
    transaction.items.forEach(item => {
      if (item.adyenTransactionId) {
        unprocessedGiftCardsCount++
        CefSharp.reverseGiftCardActivation(JSON.stringify(transaction), item.transactionItemIdentifier)
          .then(data => {
            try {
              const _data = JSON.parse(data)
              unprocessedGiftCardsCount--
              if (_data?.Result?.Status === 0) {
                console.info(loggingHeader + 'voidTransaction: reverseGiftCardActivation success\n' + JSON.stringify(_data))
              } else {
                console.error(loggingHeader + 'voidTransaction: reverseGiftCardActivation failure\n' + JSON.stringify(_data))
              }
              if (unprocessedGiftCardsCount === 0) {
                dispatch(updateLoadingStates({ void: false }))
                dispatch(UiActions.receiveUiData({
                  showModal: promptForFeedback ? 'void' : false,
                  suspendMessage: promptForFeedback ? 'ok' : null
                }))
              }
            } catch (err) {
              console.error(loggingHeader + 'voidTransaction: reverseGiftCardActivation failure.  Response unknown type.\n' + JSON.stringify(data))
              dispatch(updateLoadingStates({ void: false }))
              dispatch(UiActions.receiveUiData({
                showModal: promptForFeedback ? 'void' : false,
                suspendMessage: promptForFeedback ? 'ok' : null
              }))
            }
          })
      }
    })
  }
  console.info(loggingHeader + 'voidTransaction: post reversals')
  CoordinatorAPI.voidTransaction(returnAuthorizationKey)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'voidTransaction: Could not void transaction\n' + JSON.stringify(res))
        throw new Error('Could not void transaction')
      } else {
        return null
      }
    })
    .then(async () => {
      console.info(loggingHeader + 'voidTransaction: success')
      dispatch(LoyaltyActions.clearInvalidReward())
      CefSharp.endTransaction((await Storage.getData('features')), (await Storage.getData('configuration')))
      if (unprocessedGiftCardsCount === 0) {
        dispatch(updateLoadingStates({ void: false }))
        dispatch(UiActions.receiveUiData({
          showModal: promptForFeedback ? 'void' : false,
          suspendMessage: promptForFeedback ? 'ok' : null
        }))
      }
      dispatch(clearTransactionData())
      sendRumRunnerEvent('Void Transaction', {
        store: transaction.header.storeNumber,
        register: transaction.header.registerNumber
      })
      sendAppInsightsEvent('VoidTransaction', {
        cause: 'User',
        error: false
      })
    })
    .catch(error => {
      dispatch(updateLoadingStates({ void: false }))
      console.error(loggingHeader + 'voidTransaction: Error\n' + JSON.stringify(error))
      sendAppInsightsEvent('VoidTransaction', {
        cause: 'User',
        error: true,
        errorMessage: error.message
      })
    })

  console.info('END: ' + loggingHeader + 'voidTransaction')
}

export const autoVoidTransaction = (returnData: ReturnDataType, voidLoading: boolean
) => (dispatch: Dispatch<AppDispatch>): void => {
  if (voidLoading) {
    return
  }
  console.info('BEGIN: ' + loggingHeader + 'autoVoidTransaction\n')
  dispatch(UiActions.updateLoadingStates({ frontendAutoVoid: true }))
  CoordinatorAPI.checkForActiveTransaction()
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'frontendAutoVoid - checkForActiveTransaction: not successful\n' + JSON.stringify(res))
        throw new Error('Error in frontendAutoVoid - checkForActiveTransaction')
      } else if (res.status === 204) {
        // no active transaction
        dispatch(clearAssociateData())
        refresh()
        return
      }
      return res.json()
    })
    .then(data => {
      if (data.tenders?.length === 0 && data.header?.storeNumber && data.header.registerNumber) {
        dispatch(voidTransaction(data, returnData, voidLoading))
        dispatch(clearAssociateData())
      }
      dispatch(UiActions.updateLoadingStates({ frontendAutoVoid: false }))
    })
    .catch(error => {
      console.info(error)
      dispatch(UiActions.updateLoadingStates({ frontendAutoVoid: false }))
    })
}

export const postVoidTransaction = (serializedTransaction: string, storeInfo: StoreInfoTypes, associateData: AssociateDataTypes, managerId?: string, managerPin?: string) => async (dispatch: Dispatch<AppDispatch>): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ postVoid: true }))
  dispatch({
    type: 'UPDATE_UI_DATA',
    data: { modalErrorMessage: null }
  })
  console.info('BEGIN: ' + loggingHeader + 'beginPostVoid\n' + serializedTransaction)
  const postVoidResult = await CefSharp.beginPostVoid(serializedTransaction)
  if (postVoidResult === null) return
  const postVoidResultParsed = JSON.parse('' + postVoidResult)
  console.trace('postVoidResultParsed: [' + JSON.stringify(postVoidResultParsed) + ']')
  if (postVoidResultParsed.ErrorMessage) {
    dispatch(UiActions.updateLoadingStates({ postVoid: false }))
    dispatch({
      type: 'UPDATE_UI_DATA',
      data: { modalErrorMessage: postVoidResultParsed.ErrorMessage }
    })
    console.error(postVoidResultParsed.ExceptionMessage)
    return
  }
  console.trace('postVoidResult: [' + JSON.stringify(postVoidResult) + ']')
  const postVoidRequest = { ...postVoidResultParsed, managerId, managerPin }
  CoordinatorAPI.postVoidTransaction(postVoidRequest).then(res => {
    if (res.status !== 200) {
      // display error
      dispatch({
        type: 'UPDATE_UI_DATA',
        data: { modalErrorMessage: 'An error occurred post voiding transaction' }
      })
      dispatch(UiActions.updateLoadingStates({ postVoid: false }))
    } else {
      res.json()
        .then(async data => {
          const performDefaultPostVoidActions = async () => {
            const cashIsInvolved = data.postVoidInformation.originalTransaction.tenders.some(t => t.tenderType === 1)
            if (cashIsInvolved) {
              await CefSharp.openCashDrawer()
            }
            CefSharp.printSalesReceipt(strData, JSON.stringify(storeInfo), JSON.stringify(associateData), JSON.stringify({ postvoid: true }))
            if (cashIsInvolved) {
              dispatch(
                UiActions.receiveUiData({
                  showModal: 'cashDrawerOpen'
                })
              )
              await CefSharp.waitForCashDrawerToClose()
            }

            dispatch({
              type: 'UPDATE_UI_DATA',
              data: { showModal: false, modalErrorMessage: false, footerOverlayActive: 'None' }
            })
            dispatch(UiActions.updateLoadingStates({ postVoid: false }))
          }

          const strData = JSON.stringify(data)
          console.info('post void success, [' + strData + ']')
          const giftCardsToReverse = data.postVoidInformation.originalTransaction.items.filter(item => item.accountNumber)
          if (giftCardsToReverse.length > 0) {
            giftCardsToReverse.forEach((giftCard, index) => {
              try {
                CefSharp.reverseGiftCardActivation(strData, giftCard.transactionItemIdentifier)
                  .then(() => {
                    if (index === (giftCardsToReverse.length - 1)) {
                      // if there are gift cards to reverse, perform default actions after reversals are complete
                      performDefaultPostVoidActions()
                    }
                  })
              } catch (error) {
                performDefaultPostVoidActions()
                console.error('An error occurred reversing gift cards')
              }
            })
          } else {
            performDefaultPostVoidActions()
          }
        })
        .catch(e => {
          dispatch({
            type: 'UPDATE_UI_DATA',
            data: { modalErrorMessage: 'Sorry, something went wrong, please try again.' }
          })
          dispatch(UiActions.updateLoadingStates({ postVoid: false }))
          console.info(loggingHeader + 'coordinatorAPI > postVoidLastTransaction: ', JSON.stringify(e))
        })
        // hand postvoid transaction back to launcher to print
      dispatch(getLastTransactionDetails())
    }
  })
    .catch(error => {
      dispatch({
        type: 'UPDATE_UI_DATA',
        data: { modalErrorMessage: 'Sorry, something went wrong, please try again.' }
      })
      dispatch(UiActions.updateLoadingStates({ postVoid: false }))
      console.info(loggingHeader + 'Coordinator Error: ', JSON.stringify(error))
    })
}

const completeSuspendTransaction = (storeNumber, registerNumber, promptForFeedback, data) => async (dispatch) => {
  console.info(loggingHeader + 'suspendTransaction: success\n' + JSON.stringify(data))
  dispatch(UiActions.receiveUiData({ suspendMessage: 'ok' }))
  CefSharp.endTransaction((await Storage.getData('features')), (await Storage.getData('configuration')))
  CefSharp.printSuspendReceipt(JSON.stringify(data))
  dispatch(updateLoadingStates({ void: false }))
  dispatch(clearTransactionData())
  if (promptForFeedback === false) {
    dispatch(UiActions.receiveUiData({
      showModal: false
    }))
  }
  sendRumRunnerEvent('Suspend Transaction', {
    store: storeNumber,
    register: registerNumber
  })
  sendAppInsightsEvent('SuspendTransaction', {
    error: false
  })
}
/**
 * Suspend transaction, print suspend receipt, and remove all transaction and customer data from redux and localStorage.
 * @param {number} storeNumber
 * @param {number} registerNumber
 */
export const suspendTransaction = (
  storeNumber: number,
  registerNumber: number,
  voidLoading: boolean,
  promptForFeedback: boolean
) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'suspendTransaction\n' + JSON.stringify({
    storeNumber: storeNumber,
    registerNumber: registerNumber
  }))
  if (voidLoading) {
    return
  }
  dispatch(updateLoadingStates({ void: true }))
  CoordinatorAPI.suspendTransaction()
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'suspendTransaction: not successful\n' + JSON.stringify(res))
        if (res.status === 500) {
          dispatch(UiActions.receiveUiData({ suspendMessage: `An error occurred while attempting to suspend the transaction.${'\n'}Please click Confirm to try again.` }))
        }
        throw new Error('Could not suspend transaction')
      } else if (res.status === 204) {
        dispatch(completeSuspendTransaction(storeNumber, registerNumber, promptForFeedback, null))
      } else {
        return res.json()
      }
    })
    .then(async data => {
      dispatch(completeSuspendTransaction(storeNumber, registerNumber, promptForFeedback, data))
    })
    .catch(error => {
      dispatch(updateLoadingStates({ void: false }))
      console.error(loggingHeader + 'suspendTransaction: Error\n' + JSON.stringify(error))
      sendAppInsightsEvent('SuspendTransaction', {
        error: true,
        errorMessage: error.message
      })
    })
  console.info('END: ' + loggingHeader + 'suspendTransaction')
}

export const setGiftReceipts = (
  items: Array<number>
) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'setGiftReceipts\n' + JSON.stringify({ items: items }))
  dispatch(UiActions.updateLoadingStates({ updateGiftReceipts: true }))
  CoordinatorAPI.setGiftReceipts(items)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'setGiftReceipts: not successful\n' + JSON.stringify(res))
        throw new Error('Could not set gift receipts')
      } else {
        return res.json()
      }
    })
    .then(data => {
      dispatch(UiActions.updateLoadingStates({ updateGiftReceipts: false }))
      console.info(loggingHeader + 'setGiftReceipts: success\n' + JSON.stringify(data))
      dispatch(
        receiveTransactionData(data.data)
      )
    })
    .catch((error) => {
      console.info('setGiftReceiptsError: ', error)
      dispatch(UiActions.updateLoadingStates({ updateGiftReceipts: false }))
    })
  console.info('END: ' + loggingHeader + 'setGiftReceipts')
}

export const overrideCoupon = (
  request: OverrideCouponType, expiredCouponFeatureFlag = false
) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'overrideCoupon\n' + JSON.stringify(request))
  dispatch(UiActions.receiveUiData({ manualDiscountError: false }))
  dispatch(UiActions.updateLoadingStates({ manualDiscount: true }))
  CoordinatorAPI.overrideCoupon(request)
    .then(res => {
      const managerOverrideInfo = JSON.parse(res.headers.get('manager-override-info'))
      if (expiredCouponFeatureFlag && managerOverrideInfo) {
        dispatch(receiveManagerOverrideInfo(managerOverrideInfo))
      }
      if (!res.ok) {
        console.warn(loggingHeader + 'overrideCoupon: not successful\n' + JSON.stringify(res))
        throw new Error('Could not override coupon')
      } else {
        return res.json()
      }
    })
    .then(data => {
      const pendingManagerOverrideData = window.reduxStore.getState().pendingManagerOverrideData
      if (pendingManagerOverrideData === null) {
        dispatch(UiActions.receiveUiData({ showModal: false }))
      }
      dispatch(UiActions.updateLoadingStates({ manualDiscount: false }))
      dispatch(receiveTransactionDataAndSendToPinPad(data))
    })
    .catch((error) => {
      console.info('couponOverrideError: ', error)
      dispatch(UiActions.receiveUiData({ manualDiscountError: true }))
      dispatch(UiActions.updateLoadingStates({ manualDiscount: false }))
    })
}

export const scanGiftCard = (accountNumber: string) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(UiActions.updateLoadingStates({ omniSearch: 'scanGiftCard', sellGiftCard: true }))
  dispatch(UiActions.receiveUiData({
    scanError: false,
    scanErrorMessage: null
  }))
  CoordinatorAPI.newGiftCard(accountNumber)
    .then(res => {
      if (!res.ok) {
        console.error(loggingHeader + 'scanGiftCard: not successful\n' + JSON.stringify(res))
        throw new Error('Error scanning gift card')
      } else {
        return res.json()
      }
    })
    .then(data => {
      dispatch(UiActions.updateLoadingStates({ omniSearch: null, sellGiftCard: false }))
      console.info(loggingHeader + 'scanGiftCard: success\n' + JSON.stringify(data))
      dispatch(receiveTransactionData(data))
      dispatch(UiActions.receiveUiData({
        showModal: false,
        selectedItem: 'GIFTCARD',
        giftCardState: 'Not Active',
        accountNumber: accountNumber,
        activePanel: 'scanDetailsPanel',
        autofocusTextbox: 'PriceEdit'
      }))
    })
    .catch(err => {
      dispatch(UiActions.updateLoadingStates({ omniSearch: null, sellGiftCard: false }))
      dispatch(
        UiActions.receiveUiData({
          scanError: true,
          scanErrorMessage: err.message,
          giftCardAccountNumber: null
        })
      )
    })
}

export const removeGiftCard = (transaction: TransactionDataTypes, transactionItemIdentifier: number) => async (
  dispatch: Dispatch<AppDispatch>
): Promise<void> => {
  const handleRemoveGiftCardLoadingAndLatch = async () => {
    await Storage.removeItems([deleteItemStorageLatch])
    dispatch(updateLoadingStates({ deleteItem: null }))
  }
  const latch = await Storage.getData(deleteItemStorageLatch)
  if (latch === transactionItemIdentifier.toString()) {
    console.warn('deleteItem already processing [matching latch: ' + transactionItemIdentifier + ']')
    return
  }
  await Storage.storeData(deleteItemStorageLatch, transactionItemIdentifier.toString())
  dispatch(UiActions.updateLoadingStates({ deleteItem: transactionItemIdentifier }))
  CefSharp.reverseGiftCardActivation(JSON.stringify(transaction), transactionItemIdentifier)
    .then(fromCef => {
      console.info(loggingHeader + ' removeGiftCard\n' + fromCef)
      const cefResponse = JSON.parse(fromCef)
      if (cefResponse.Result.Status !== 0) {
        console.error(loggingHeader + ' reverseGiftCardActivation\n' + JSON.stringify(fromCef))
      }
      CoordinatorAPI.removeGiftCard(transactionItemIdentifier)
        .then(res => {
          if (!res.ok) {
            throw new Error('Unable to update database with gift card removal')
          } else {
            return res.json()
          }
        })
        .then(async data => {
          dispatch(UiActions.receiveUiData({
            autofocusTextbox: 'OmniSearch',
            giftCardAccountNumber: null,
            errorMessage: null,
            scanError: false,
            giftCardError: null,
            selectedItem: null
          }))
          if (data.header.transactionStatusDescription === 'Void') {
            abortOutstandingRequestsOnVoid()
            CefSharp.endTransaction((await Storage.getData('features')), (await Storage.getData('configuration')))
            Storage.removeItems(['age'])
            dispatch(
              UiActions.receiveUiData({
                clearUpc: true,
                activePanel: 'initialScanPanel'
              })
            )
            dispatch(
              LoyaltyActions.updateLoyaltyData(
                {
                  selectedLoyaltyCustomer: null,
                  loyaltyCustomers: null,
                  loyaltyError: null,
                  retryParameters: {
                    firstName: '',
                    lastName: '',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    phone: '',
                    email: '',
                    storeNumber: 0,
                    lastItem: '',
                    loyaltyAccount: ''
                  },
                  retryType: '',
                  didCreatedAccountExist: false,
                  isNoAccountFound: false,
                  phoneInput: '',
                  phoneOutput: '',
                  lastPhoneLookup: '',
                  altScreenName: null
                },
                LoyaltyActions.UPDATE_LOYALTY_DATA
              )
            )
            dispatch(clearTransactionData())
            sendAppInsightsEvent('VoidTransaction', {
              cause: 'RemoveGiftCard'
            })
          } else {
            dispatch(UiActions.receiveUiData({ showModal: false }))
            dispatch(receiveTransactionDataAndSendToPinPad(data))
          }
          handleRemoveGiftCardLoadingAndLatch()
        })
        .catch(err => {
          handleRemoveGiftCardLoadingAndLatch()
          console.error(loggingHeader + ' > removeGiftCard\n' + JSON.stringify(err))
        })
    })
    .catch(err => {
      handleRemoveGiftCardLoadingAndLatch()
      console.error(loggingHeader + ' > removeGiftCard\n' + JSON.stringify(err))
    })
}

export const setGiftCardAmount = (
  account: string,
  amount: number,
  expiry: string,
  transaction: TransactionDataTypes,
  transactionItemIdentifier: number
) =>
  (dispatch: Dispatch<AppDispatch>): void => {
    dispatch(updateLoadingStates({ giftCardActivation: true }))
    CefSharp.beginGiftCardActivation(amount, account, expiry, transaction, true, false, null)
      .then(data => {
        const payload = JSON.parse(data[0])
        if (payload.Result.Status === 0) {
          const request: CoordinatorAPI.SetGiftCardAmountType = {
            amount: amount,
            accountNumber: account,
            expirationDate: expiry,
            transactionItemIdentifier: transactionItemIdentifier,
            adyenTransactionId: payload.PoiData.TransactionID,
            adyenTimestamp: payload.PoiData.TimeStamp
          }
          CoordinatorAPI.setGiftCardAmount(request)
            .then(res => {
              if (res.ok) {
                return res.json()
              } else {
                console.error(loggingHeader + 'setGiftCardAmount: not successful\n' + JSON.stringify(res))
                throw new Error('Unable to update database with giftcard information')
              }
            })
            .then(data => {
              dispatch(UiActions.receiveUiData({ showModal: false, giftCardState: 'Active', autofocusTextbox: 'OmniSearch' }))
              dispatch(receiveTransactionDataAndSendToPinPad(data))
            })
            .catch(err => {
              dispatch(UiActions.receiveUiData({
                giftCardError: err.message
              }))
            })
        } else {
          console.error(loggingHeader + 'setGiftCardAmount: not successful\n' + JSON.stringify(data))
          if (payload.Result.Status === 1 && payload.Result.PaymentErrorResponse?.ErrorCondition === 99) {
            dispatch(UiActions.receiveUiData({
              giftCardError: 'Cannot activate store credit.  Please use a gift card.'
            }))
          } else {
            dispatch(UiActions.receiveUiData({
              giftCardError: payload.AdditionalResponse.refusalReasonRaw
            }))
          }
        }
      })
      .catch(err => {
        console.error(loggingHeader + 'setGiftCardAmount: not successful\n' + JSON.stringify(err))
        dispatch(UiActions.receiveUiData({
          giftCardError: 'Unable to activate gift card'
        }))
      })
      .finally(() => {
        dispatch(updateLoadingStates({ giftCardActivation: false }))
      })
  }

export interface INoSaleRequest {
  managerId: string
  managerPasscode: string
}

export const createNoSaleTransaction = (noSaleRequest?: INoSaleRequest, setManagerOverrideErrorMessage?) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(UiActions.updateLoadingStates({ createNoSaleTransaction: true }))
  CoordinatorAPI.noSaleTransaction(noSaleRequest)
    .then(async res => {
      dispatch(UiActions.updateLoadingStates({ createNoSaleTransaction: false }))
      if (res.status === 200) {
        console.info(loggingHeader + 'Success: noSaleTransaction: ' + JSON.stringify(res))
        CefSharp.openCashDrawer()
        dispatch(
          UiActions.receiveUiData({
            showModal: 'cashDrawerOpen'
          })
        )
        await CefSharp.waitForCashDrawerToClose()
        dispatch(
          UiActions.receiveUiData({
            showModal: false,
            footerOverlayActive: 'None'
          })
        )
      } else if (res.status === 428) {
        console.info(loggingHeader + 'Precondition: noSaleTransaction - Manager Override Required: ' + JSON.stringify(res))
        dispatch(receiveManagerOverrideInfo([{
          ManagerOverrideType: 8,
          ModalDetails: {
            mainHeader: 'No Sale',
            subHeader: 'Teammate is requesting to open the cash drawer for No Sale.'
          }
        }]))
        dispatch(UiActions.receiveUiData({
          showModal: 'managerOverride'
        }))
      } else if (res.status === 422) {
        console.error(loggingHeader + 'Error: noSaleTransaction - Manager Credentials Invalid: ' + JSON.stringify(res))
        if (setManagerOverrideErrorMessage) setManagerOverrideErrorMessage(invalidAssociateCredentialsMessage)
      } else {
        throw new Error('Failed to create no sale transaction')
      }
    })
    .catch(err => {
      setManagerOverrideErrorMessage(generalErrorMessage)
      dispatch(UiActions.updateLoadingStates({ createNoSaleTransaction: false }))
      console.error(loggingHeader + 'Error creating no sale transaction: ', err)
    })
}

export const managerOverride = (associateNum: string, pin: string, storeNumber: number, registerNumber: number, managerOverride: PendingManagerOverrideData, setErrorMessage: (string) => void) => (dispatch : Dispatch<AppDispatch>) => {
  dispatch(UiActions.updateLoadingStates({ managerOverrideLoading: true }))
  const payload = { ManagerOverrideType: managerOverride?.ManagerOverrideType, ManagerOverrideData: null }
  switch (managerOverride?.ManagerOverrideType) {
  // Expired Coupon
  case 0: {
    payload.ManagerOverrideData = JSON.parse(managerOverride?.ManagerOverrideData).CouponCode
    break
  }
  // Edit Price
  case 2: {
    const data = JSON.parse(managerOverride.ManagerOverrideData)
    payload.ManagerOverrideData = data.itemId
    break
  }
  }
  CoordinatorAPI.ManagerOverride(associateNum, pin, storeNumber, registerNumber, payload)
    .then((res) => {
      dispatch(UiActions.updateLoadingStates({ managerOverrideLoading: false }))
      if (res.status === 200) {
        if (managerOverride?.ManagerOverrideType === 2) {
          const data = JSON.parse(managerOverride.ManagerOverrideData)
          dispatch(editItemPrice(data.itemId, data.overridePrice, data.callOrigin))
        }
        dispatch(UiActions.receiveUiData({ showModal: false, autofocusTextbox: 'OmniSearch' }))
        res.json().then(data => {
          dispatch(clearManagerOverrideInfo())
          dispatch(receiveTransactionData(data))
        })
      } else {
        res.json().then(data => {
          if (data.statusCode === 422) {
            setErrorMessage(invalidAssociateCredentialsMessage)
          } else {
            setErrorMessage(data.message)
          }
          console.error(loggingHeader + 'managerOverride: ', JSON.stringify(data))
        })
      }
    })
    .catch(error => {
      console.error(loggingHeader + 'Error performing manager override: ', error)
      dispatch(UiActions.updateLoadingStates({ managerOverrideLoading: false }))
      setErrorMessage('Something went wrong performing manager override. Please try again.')
    })
}

export const removeCoupon = (couponCode: string, setErrorMessage: (string) => void, selectedItem: number) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(updateLoadingStates({ removeCoupon: true }))
  CoordinatorAPI.removeCoupon(couponCode)
    .then(async res => {
      if (res.status === 200) {
        dispatch(updateLoadingStates({ removeCoupon: false }))
        dispatch(UiActions.receiveUiData({ autofocusTextbox: 'OmniSearch', selectedItem }))
        return res.json()
      } else {
        dispatch(updateLoadingStates({ removeCoupon: false }))
        setErrorMessage('Something went wrong.  Please try again.')
        console.error(`${loggingHeader} 'Error: removeCoupon [${couponCode}] - ', ${JSON.stringify(res)}`)
        throw new Error(`Failed to remove coupon [${couponCode}]`)
      }
    })
    .then(data => {
      dispatch(updateLoadingStates({ removeCoupon: false }))
      console.info(`${loggingHeader} 'Success: removeCoupon [${couponCode}] - ', ${JSON.stringify(data)}`)
      dispatch(UiActions.receiveUiData({ showModal: false }))
      dispatch(clearManagerOverrideInfo())
      dispatch(receiveTransactionDataAndSendToPinPad(data))
    })
    .catch(error => {
      console.error(loggingHeader + `Error: removeCoupon [${couponCode}]: `, error)
      dispatch(updateLoadingStates({ removeCoupon: false }))
      setErrorMessage('Something went wrong. Please try again.')
    })
}

export const removeRewardAction = (rewardCertificateNumber) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(updateLoadingStates({ removeReward: true }))
  CoordinatorAPI.removeReward(rewardCertificateNumber)
    .then(async res => {
      if (res.status === 200) {
        return res.json()
      } else {
        console.error(`${loggingHeader} 'Error: removeReward [${rewardCertificateNumber}] - ', ${JSON.stringify(res)}`)
        throw new Error('Failed to remove reward')
      }
    })
    .then(data => {
      dispatch(updateLoadingStates({ removeReward: false }))
      console.info(`${loggingHeader} Success: removeReward [${rewardCertificateNumber}]-  ${JSON.stringify(data)}`)
      dispatch(LoyaltyActions.receiveLoyaltyData({ removeRewardError: false }))
      dispatch(UiActions.receiveUiData({ showModal: false }))
      dispatch(receiveTransactionDataAndSendToPinPad(data))
    })
    .catch(error => {
      console.error(`Catch: removeReward [${rewardCertificateNumber}] -  ${error}`)
      dispatch(LoyaltyActions.receiveLoyaltyData({ removeRewardError: true }))
      dispatch(updateLoadingStates({ removeReward: false }))
    })
}

export const addSportsMatterRoundUp = (sportsMatterUpc: string, associateId: string, customAmount = null) => (dispatch: Dispatch<AppDispatch>) => {
  console.info('addSportsMatterRoundUp', sportsMatterUpc, associateId, customAmount)
  dispatch(updateLoadingStates({ addSportsMatterRoundUp: customAmount !== null ? customAmount : 'round-up' }))
  dispatch(UiActions.receiveUiData({ error: false }))
  CoordinatorAPI.omniSearch(sportsMatterUpc, associateId)
    .then(async res => {
      if (res.status === 200) {
        return res.json()
      } else {
        console.error(`${loggingHeader} 'Error: addSportsMatterRoundup [${sportsMatterUpc}] - ', ${JSON.stringify(res)}`)
        throw new Error('Failed to add sports matter round up')
      }
    })
    .then(data => {
      // loading state for addSportsMatterRoundup is turned off in the onDismiss of the modal
      let sportsMatterTransactionItemID = null
      for (let i = 0; i < data.transaction.items.length; i++) {
        if (data.transaction.items[i].upc === sportsMatterUpc) {
          sportsMatterTransactionItemID = data.transaction.items[i].transactionItemIdentifier
          break
        }
      }
      if (sportsMatterTransactionItemID === null) {
        dispatch(updateLoadingStates({ addSportsMatterRoundUp: false }))
        console.error(`${loggingHeader} Error: sports matter upc not found in transaction`)
      }

      if (customAmount !== null) {
        dispatch(editItemPrice(sportsMatterTransactionItemID, customAmount, 'sportsMatterPrompt'))
        sendAppInsightsEvent('SportsMatterSelection', {
          selection: customAmount,
          amount: customAmount
        })
      } else {
        const roundUpAmount = getRoundUpAmount(data.transaction.total.grandTotal)
        dispatch(editItemPrice(sportsMatterTransactionItemID, roundUpAmount, 'sportsMatterPrompt'))
        sendAppInsightsEvent('SportsMatterSelection', {
          selection: 'round-up',
          amount: roundUpAmount
        })
      }
    })
    .catch(e => {
      dispatch(updateLoadingStates({ addSportsMatterRoundUp: false }))
      dispatch(UiActions.receiveUiData({ error: 'addSportsMatterRoundUp' }))
      sendAppInsightsEvent('SportsMatterSelection', {
        selection: 'error',
        amount: '0.00'
      })
      console.info(`${loggingHeader} Error: addSportsMatterRoundUp: `, JSON.stringify(e))
    })
}

interface ManualDiscountRequestType {
  reason: number
  type: number
  amount: number
  additionalDetail: string
  managerId?: string
  managerPasscode?: string
}

export const applyManualTransactionDiscountAction = (request: ManualDiscountRequestType, setManagerOverrideErrorMessage?) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(updateLoadingStates({ manualDiscount: true }))
  dispatch(UiActions.receiveUiData({ manualDiscountError: false }))
  CoordinatorAPI.applyManualTransactionDiscount(request)
    .then(async res => {
      if (res.ok || res.status === 428 || res.status === 422) {
        return res.json()
      } else {
        throw new Error('Failure to apply manual transaction')
      }
    })
    .then(data => {
      if (data.statusCode === 422 && setManagerOverrideErrorMessage) {
        setManagerOverrideErrorMessage(invalidAssociateCredentialsMessage)
        console.error(`${loggingHeader} Error: manualTransactionDiscount: ${data.message}`)
        return
      }
      if (data?.thresholdExceededDetails?.managerOverrideRequiredType) { // Status 428
        if (
          data.originalRequest.reason === 2 &&
          (data.originalRequest.amount > data.thresholdExceededDetails.originalPrice)
        ) {
          dispatch(UiActions.receiveUiData({
            manualDiscountError: `Package Price cannot be set above original price ($${data.thresholdExceededDetails.originalPrice.toFixed(2)})`
          }))
          return
        }
        if (
          data.originalRequest.reason < 2 && // Manager Discount or Coupon Discount
          data.originalRequest.type === 0 && // Dollar Discount
          (data.originalRequest.amount > data.thresholdExceededDetails.originalPrice)
        ) {
          dispatch(UiActions.receiveUiData({
            manualDiscountError: `Discount amount cannot exceed original price ($${data.thresholdExceededDetails.originalPrice.toFixed(2)})`
          }))
          return
        }
        dispatch(UiActions.receiveUiData({ showModal: 'managerOverride' }))
        dispatch(receiveManagerOverrideInfo([{
          ManagerOverrideType: data.thresholdExceededDetails.managerOverrideRequiredType,
          ManualDiscountResponse: data
        }]))
        return
      }
      dispatch(UiActions.receiveUiData({ showModal: false }))
      console.info(`${loggingHeader} Success: applyManualTransactionDiscount - [${JSON.stringify(data)}]`)
      dispatch(receiveTransactionDataAndSendToPinPad(data))
    })
    .catch(e => {
      if (setManagerOverrideErrorMessage) {
        setManagerOverrideErrorMessage(generalErrorMessage)
      } else {
        dispatch(UiActions.receiveUiData({ manualDiscountError: generalErrorMessage }))
      }
      console.error(`${loggingHeader} Error: applyManualTransactionDiscount - [${JSON.stringify(e)}]`)
    })
    .finally(() => {
      dispatch(updateLoadingStates({ manualDiscount: false }))
    })
}

export const applyManualItemDiscountAction = (request: ManualDiscountRequestType, transactionItemID, setManagerOverrideErrorMessage?) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(updateLoadingStates({ manualDiscount: true }))
  dispatch(UiActions.receiveUiData({ manualDiscountError: false }))
  CoordinatorAPI.applyManualItemDiscount(request, transactionItemID)
    .then(async res => {
      if (res.ok || res.status === 428 || res.status === 422) {
        return res.json()
      } else {
        console.error(`Error: ApplyManualItemDiscount - [${JSON.stringify({ request: request, transactionItemID: transactionItemID })}]`)
        throw new Error('Failure to apply manual item transaction')
      }
    })
    .then(data => {
      if (data.statusCode === 422 && setManagerOverrideErrorMessage) {
        setManagerOverrideErrorMessage(invalidAssociateCredentialsMessage)
        console.error(`${loggingHeader} Error: manualItemDiscount: ${data.message}`)
        return
      }
      if (data?.thresholdExceededDetails?.managerOverrideRequiredType) { // Status 428
        if (
          data.originalRequest.type === 0 && // Dollar Discount
          (data.originalRequest.amount > data.thresholdExceededDetails.originalPrice)
        ) {
          dispatch(UiActions.receiveUiData({
            manualDiscountError: `Discount amount cannot exceed original price ($${data.thresholdExceededDetails.originalPrice.toFixed(2)})`
          }))
          return
        }
        dispatch(UiActions.receiveUiData({ showModal: 'managerOverride' }))
        dispatch(receiveManagerOverrideInfo([{
          ManagerOverrideType: data.thresholdExceededDetails.managerOverrideRequiredType,
          ManualDiscountResponse: data
        }]))
        return
      }
      dispatch(UiActions.receiveUiData({ showModal: false }))
      console.info(`${loggingHeader} Success: applyManualItemDiscount - [${JSON.stringify(data)}]`)
      dispatch(receiveTransactionDataAndSendToPinPad(data))
    })
    .catch(e => {
      if (setManagerOverrideErrorMessage) {
        setManagerOverrideErrorMessage(generalErrorMessage)
      } else {
        dispatch(UiActions.receiveUiData({ manualDiscountError: generalErrorMessage }))
      }
      console.error(`${loggingHeader} Error: applyManualItemDiscount - [${JSON.stringify(e)}]`)
    })
    .finally(() => {
      dispatch(updateLoadingStates({ manualDiscount: false }))
    })
}

export const addTaxExemptInformation = (customerNumber: string) => (dispatch: Dispatch<AppDispatch>) => {
  dispatch(updateLoadingStates({ taxExemptLookup: true }))
  dispatch(UiActions.receiveUiData({ taxExemptError: null }))
  CoordinatorAPI.addTaxExemptInfromation(customerNumber)
    .then(async res => {
      if (!res.ok && res.status !== 422) {
        throw new Error('Failure making call to add tax exempt details')
      }
      return res.json()
    })
    .then(data => {
      dispatch(updateLoadingStates({ taxExemptLookup: false }))
      if (data.statusCode === 422) {
        if (data.reasonCode === 601) {
          dispatch(UiActions.receiveUiData({ taxExemptError: 'invalidCustomerNumber' }))
        } else {
          throw new Error(data)
        }
      } else {
        dispatch(receiveTransactionData(data))
        CefSharp.sendTransactionToPinPad(data)
        dispatch(
          UiActions.receiveUiData({
            clearUpc: true,
            errorMessage: null,
            scanError: false,
            activePanel: 'scanDetailsPanel',
            selectedItem: 'taxExemptPanel',
            footerOverlayActive: 'None',
            showAddAssociateDiscount: false,
            showModal: false,
            taxExemptError: null
          })
        )
      }
    })
    .catch(e => {
      dispatch(updateLoadingStates({ taxExemptLookup: false }))
      dispatch(UiActions.receiveUiData({ taxExemptError: 'general' }))
      console.error(`${loggingHeader} Error addTaxExemptInformation - [${JSON.stringify(e)}]`)
    })
}
