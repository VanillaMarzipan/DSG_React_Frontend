import { LowestReturnPriceItem, ReturnAuthorizationResponseType, ReturnDataType, ReturnOrderType, TradeInItem } from '../reducers/returnData'
import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as UiActions from './uiActions'
import * as CefSharp from '../utils/cefSharp'
import { receiveTransactionDataAndSendToPinPad } from './transactionActions'
import { ReturnRequestType } from '../utils/coordinatorAPI'
import { Dispatch } from 'redux'
import { AppDispatch } from '../Main'
import { fetchLoyaltyByAccountNumber } from './loyaltyActions'
import { receiveManagerOverrideInfo } from './managerOverrideActions'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { Modals } from '../reducers/uiData'
import { getConfigurationValue } from './configurationActions'
import { generalErrorMessage, barcodeNotFoundMessage, noDataFoundMessage } from '../utils/reusableStrings'
export const UPDATE_RETURN_DATA = 'UPDATE_RETURN_DATA'
const loggingHeader = 'actions > returnActions > '
export const receiveReturnData = (data: ReturnDataType) => (dispatch): void => {
  data.returnableItems && data.returnableItems.forEach(item => {
    const transactionItemIdentifier = Number(item.lineNumber.toString() + item.sequenceNumber)
    item.transactionItemIdentifier = -transactionItemIdentifier
  })
  dispatch(updateReturnData(data, UPDATE_RETURN_DATA))
}

export interface NonReceiptedReturnIdDetailsType {
  barcode?: string
  idType?: number
  idNumber?: string
  issuingStateOrProvince?: string
  state?: string
  firstName?: string
  lastName?: string
  address1?: string
  address2?: string
  city?: string
  zip?: string
  expiryDate?: string
  birthdate?: string
}

export const clearReturnData = () => (dispatch): void => {
  dispatch(updateReturnData({
    nonReturnableItems: [],
    returnableItems: [],
    returnAuthorizationData: null,
    nonReceiptedReturnItems: [],
    nonReceiptedReturnActive: false,
    tradeInItems: [],
    addNonReceiptedReturnItemsError: false,
    fetchLowestReturnPriceError: null,
    returnsLoyaltyAccountsFound: null,
    returnsLoyaltyAccountsFoundError: null,
    lookedUpOrders: null,
    returnOriginationType: null,
    giftCardRefundTracker: []
  }, UPDATE_RETURN_DATA))
}

export const updateReturnData = (
  data: ReturnDataType,
  actionType: string
): { type: string; data: ReturnDataType } => {
  console.info('ENTER: ' + loggingHeader + 'updateReturnData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

export const authorizeReturn = (zeroDue: boolean, showModal: Modals, identificationDetails?: NonReceiptedReturnIdDetailsType) => async (dispatch): Promise<void> => {
  console.info('ENTER: ' + loggingHeader + 'authorizeReturn\n' + JSON.stringify({
    zeroDue: zeroDue,
    identificationDetails: identificationDetails
  }))
  dispatch(UiActions.updateLoadingStates({ authorizeReturn: true }))
  await CoordinatorAPI.authorizeReturn(identificationDetails).then(res => {
    if (res.ok) {
      console.info('ENTER: ' + loggingHeader + 'authorizeReturn: success')
      return res.json()
    } else if (res.status === 400) {
      return res.json()
    } else {
      console.warn(loggingHeader + 'authorizeReturn: Error authorizing return: ' + JSON.stringify(res.body))
      throw new Error('Unable to authorize return')
    }
  }).then((data: ReturnAuthorizationResponseType) => {
    console.info(loggingHeader + 'authorizeReturn: Response from return authorization: ' + JSON.stringify(data))
    dispatch(UiActions.updateLoadingStates({ authorizeReturn: false }))
    if (data.statusCode === 400) {
      const message = JSON.parse(data.message)
      if (message.action === 'REENTERMANUALLY') {
        console.info(loggingHeader + 'authorizeReturn: status400 - REENTERMANUALLY')
        dispatch(receiveReturnData({
          returnAuthorizationData: {
            transactionId: null,
            action: 'manual-entry',
            screenMessage: null,
            printMessage: null,
            ruleName: null,
            ruleDescription: 'ID scanning prohibited',
            rewardMessage: null,
            repromptAction: null,
            overrideAllowed: false
          }
        }))
        return
      } else {
        console.info(loggingHeader + 'authorizeReturn: status400 - general error')
        throw new Error('authorizeReturn: status400 - general error')
      }
    }
    dispatch(receiveReturnData({
      returnAuthorizationData: data
    }))

    if (data.action.toLowerCase() !== 'warned' && data.action.toLowerCase() !== 'denied') {
      if (zeroDue) {
        dispatch(UiActions.receiveUiData({
          activePanel: 'changePanel',
          tenderType: 'Total'
        }))
      }
      if (showModal === 'returnsAuthorization') {
        dispatch(
          UiActions.receiveUiData({
            showModal: false
          })
        )
      }
    } else {
      CefSharp.printReturnAuthorizationReceipt(data.printMessage)
      dispatch(
        UiActions.receiveUiData({
          showModal: 'returnsAuthorization'
        })
      )
    }

    return data
  }).catch(err => {
    console.error(loggingHeader + 'Returns Authorization - Catch Error: ' + err)
    dispatch(receiveReturnData({
      returnAuthorizationData: {
        transactionId: null,
        action: 'approved',
        screenMessage: null,
        printMessage: null,
        ruleName: null,
        ruleDescription: 'No response approval',
        rewardMessage: null,
        repromptAction: null,
        overrideAllowed: false
      }
    }))
    if (zeroDue) {
      dispatch(UiActions.receiveUiData({
        activePanel: 'changePanel',
        tenderType: 'Total',
        showModal: false
      }))
    } else {
      dispatch(UiActions.completeTransaction())
      if (showModal === 'returnsAuthorization') {
        dispatch(
          UiActions.receiveUiData({
            showModal: false
          })
        )
      }
    }
    dispatch(UiActions.updateLoadingStates({ authorizeReturn: false }))
  })
}

export const fetchProductByUpcAction = (upc: string, tradeInItems: Array<TradeInItem>, setTradeInItems: (tradeInItems: Array<TradeInItem>) => void, clearSearchField: () => void, setErrorMessage: (string) => void) => async (dispatch): Promise<void> => {
  setErrorMessage(null)
  dispatch(UiActions.updateLoadingStates({ fetchProductByUpc: true }))
  CoordinatorAPI.fetchProductByUpc(upc)
    .then(res => {
      if (res.ok) {
        return res.json()
      } else {
        if (res.status === 422) {
          setErrorMessage(barcodeNotFoundMessage)
        } else {
          throw new Error('ERROR: fetchProductbyUpc')
        }
      }
    })
    .then(data => {
      dispatch(UiActions.updateLoadingStates({ fetchProductByUpc: false }))
      data.quantity = 1
      const clone: Array<TradeInItem> = tradeInItems.slice()
      data.returnPrice = 0
      clone.push(data)
      setTradeInItems(clone)
      clearSearchField()
    })
    .catch(error => {
      setErrorMessage(generalErrorMessage)
      dispatch(UiActions.updateLoadingStates({ fetchProductByUpc: false }))
      console.error('ERROR: ' + loggingHeader + 'FetchProductByUpc: ', error)
    })
}

export const addTradeInItemsAction = (tradeInItems: Array<TradeInItem>, setErrorMessage: (string) => void) => async (dispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ addTradeInItems: true }))
  CoordinatorAPI.addTradeInItems(tradeInItems)
    .then(res => {
      if (res.ok) {
        return res.json()
      } else {
        throw new Error('Error: addTradeInItemsAction')
      }
    })
    .then(data => {
      if (data) {
        const returnItem = data?.originalSaleInformation[0]?.returnItems[0]
        dispatch(UiActions.updateLoadingStates({ addTradeInItems: false }))
        dispatch(receiveTransactionDataAndSendToPinPad(data))
        dispatch(UiActions.receiveUiData({ showModal: false, selectedItem: returnItem.transactionItemIdentifier }))
      } else {
        throw new Error(noDataFoundMessage)
      }
    })
    .catch(error => {
      setErrorMessage(generalErrorMessage)
      dispatch(UiActions.updateLoadingStates({ addTradeInItems: false }))
      console.error('ERROR: ' + loggingHeader + 'AddTradeInItems: ', error)
    })
}

export const updateTradeInItemPriceAction = (tradeInItems: Array<TradeInItem>, index: number, price: number) => async (dispatch): Promise<void> => {
  const clone: Array<TradeInItem> = JSON.parse(JSON.stringify(tradeInItems))
  clone[index].returnPrice = price
  dispatch(updateReturnData({ tradeInItems: clone }, UPDATE_RETURN_DATA))
}

export const fetchLowestReturnPrice = (upc: string, nonReceiptedReturnItems: Array<LowestReturnPriceItem>) => async (dispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ fetchLowestReturnPrice: true }))
  console.info('ENTER: ' + loggingHeader + 'fetchLowestReturnPrice\n' + JSON.stringify({ upc, nonReceiptedReturnItems }))
  await CoordinatorAPI.fetchLowestReturnPrice(upc)
    .then(res => {
      if (res.status === 422) {
        console.error('ERROR: ' + loggingHeader + 'fetchLowestReturnPrice ' + 'Status: 422')
        dispatch(receiveReturnData({ fetchLowestReturnPriceError: 'upcNotFound' }))
      } else if (!res.ok) {
        throw new Error('Error: could not get fetch lowest price')
      } else {
        return res.json()
      }
    })
    .then(data => {
      dispatch(UiActions.updateLoadingStates({ fetchLowestReturnPrice: false }))
      if (!data) return
      console.info('Success: ' + loggingHeader + 'fetchLowestReturnPrice\n' + JSON.stringify({ data }))
      dispatch(receiveReturnData({ fetchLowestReturnPriceError: null }))
      const clone = nonReceiptedReturnItems.slice()
      clone.push(data)
      dispatch(updateReturnData({ nonReceiptedReturnItems: clone }, UPDATE_RETURN_DATA))
    })
    .catch(error => {
      dispatch(UiActions.updateLoadingStates({ fetchLowestReturnPrice: false }))
      dispatch(receiveReturnData({ fetchLowestReturnPriceError: 'generalError' }))
      console.error('ERROR: ' + loggingHeader + 'FetchLowestReturnPrice: ', error)
    })
}

export interface CheckedTrackerType {
  [index: number]: boolean
}

export const addNonReceiptedReturnItems = (itemsArray: Array<LowestReturnPriceItem>, itemNumsReturnChecked: CheckedTrackerType, itemNumsDamagedChecked: CheckedTrackerType) => async (dispatch): Promise<void> => {
  console.info('ENTER: ' + loggingHeader + 'addNonReceiptedReturnItems\n' + JSON.stringify({ itemsArray, itemNumsReturnChecked, itemNumsDamagedChecked }))
  dispatch(UiActions.updateLoadingStates({ addNonReceiptedReturnItems: true }))
  const flattenedItemsRequest = []
  itemsArray.forEach((item, index) => {
    if (itemNumsReturnChecked[index]) {
      const flattenedItem = {
        ...item.product,
        returnPrice: item.returnPrice * -1,
        quantity: 1,
        damaged: false
      }
      if (itemNumsDamagedChecked[index]) {
        flattenedItem.damaged = true
      }
      flattenedItemsRequest.push(flattenedItem)
    }
  })
  let nonReceiptedReturnsThreshold = getConfigurationValue('manageroverridethresholds', 'nonReceiptedReturns')
  let thresholdExceeded = false
  await CoordinatorAPI.addNonReceiptedReturnItems(flattenedItemsRequest)
    .then(async res => {
      if (!res.ok) {
        throw new Error('Error: could not add nonreceipted return items')
      } else {
        if (featureFlagEnabled('NonReceiptedReturnManagerOverride')) {
          const managerOverrideInfo = JSON.parse(res.headers?.get('manager-override-info'))
          nonReceiptedReturnsThreshold = nonReceiptedReturnsThreshold !== null ? nonReceiptedReturnsThreshold : 1
          if (managerOverrideInfo !== null) {
            const managerOverrideData = JSON.parse(managerOverrideInfo[0].ManagerOverrideData)
            if (managerOverrideData?.ReturnTotal > nonReceiptedReturnsThreshold) {
              dispatch(receiveManagerOverrideInfo(managerOverrideInfo))
              thresholdExceeded = true
            }
          }
        }
        return res.json()
      }
    })
    .then(data => {
      const item = data.originalSaleInformation[0].returnItems[0]
      console.info('ENTER: ' + loggingHeader + 'addNonReceiptedReturnItems\n' + JSON.stringify(data))
      dispatch(UiActions.updateLoadingStates({ addNonReceiptedReturnItems: false }))
      dispatch(UiActions.receiveUiData({ selectedItem: Number(item.lineNumber.toString() + item.sequenceNumber) * -1 }))
      dispatch(receiveTransactionDataAndSendToPinPad(data))
      if (!thresholdExceeded || window.reduxStore.getState().associateData?.isManager) {
        dispatch(UiActions.receiveUiData({ showModal: false }))
      }
    })
    .catch(error => {
      dispatch(UiActions.updateLoadingStates({ addNonReceiptedReturnItems: false }))
      dispatch(receiveReturnData({ addNonReceiptedReturnItemsError: true }))
      console.error('Error-addnonReceiptedReturnItems: ', error)
    })
}

export const lookupLoyaltyForReturns = (phoneNumber: string) => async (dispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ loyaltyLookup: true }))
  dispatch(receiveReturnData({ returnsLoyaltyAccountsFoundError: null, selectedReturnsLoyaltyAccount: null }))
  await CoordinatorAPI.getLoyaltyAccountPhone(phoneNumber)
    .then(res => {
      if (!res.ok) {
        throw new Error('Error: could not add nonreceipted return items')
      } else {
        return res.json()
      }
    })
    .then(accountsFound => {
      console.info(`SUCCESS: lookupLoyaltyForReturns - [${JSON.stringify(accountsFound)}]`)
      dispatch(UiActions.updateLoadingStates({ loyaltyLookup: false }))
      dispatch(receiveReturnData({
        returnsLoyaltyAccountsFound: accountsFound,
        returnsLoyaltyAccountsFoundError: accountsFound.length === 0 ? 'noAccountsFound' : null
      }))

      if (accountsFound.length === 1) {
        dispatch(getReturnsByLoyaltyAction(accountsFound[0].loyalty))
        dispatch(receiveReturnData({ selectedReturnsLoyaltyAccount: accountsFound[0] }))
      }
    })
    .catch(error => {
      console.error('Error-lookupLoyaltyForReturns: ', error)
      dispatch(UiActions.updateLoadingStates({ loyaltyLookup: false }))
      dispatch(receiveReturnData({
        returnsLoyaltyAccountsFound: null,
        returnsLoyaltyAccountsFoundError: 'generalError'
      }))
    })
}

export const handleNoOrdersFound = (res: Response, dispatch: Dispatch<AppDispatch>): void => {
  let errorMessage
  dispatch(receiveReturnData({ returnsLoyaltyAccountsFoundError: 'noOrdersFound' }))
  if (res.status === 204) errorMessage = 'No Orders Found'
  else errorMessage = res.statusText
  console.info(`SUCCESS: getReturnsByLoyaltyAction - [${res.status} ${errorMessage}]` + JSON.stringify(res))
  return null
}

export const getReturnsByLoyaltyAction = (accountNumber: string) => async (dispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ getReturns: true }))
  await CoordinatorAPI.getReturnsByLoyalty(accountNumber)
    .then(res => {
      if (!res.ok) {
        if (res.status === 404 || res.status === 400) handleNoOrdersFound(res, dispatch)
        else throw new Error('Error: getReturnsByLoyaltyAction')
      } else if (res.status === 204) {
        handleNoOrdersFound(res, dispatch)
      } else {
        return res.json()
      }
    })
    .then(ordersFound => {
      dispatch(UiActions.updateLoadingStates({ getReturns: false }))

      if (!ordersFound) return

      console.info(`SUCCESS: getReturnsByLoyaltyAction - [${ordersFound}]`)
      const ordersSortedOldestToNewest = ordersFound.slice()
      ordersSortedOldestToNewest.sort((a, b) => {
        return (new Date(a.originalSaleInfo.transactionDate)).getTime() - (new Date(b.originalSaleInfo.transactionDate)).getTime()
      })
      addTotalAndItemIdentifiersToReturnList(ordersSortedOldestToNewest)
      dispatch(receiveReturnData({
        lookedUpOrders: ordersSortedOldestToNewest,
        returnOriginationType: 3
      }))
    })
    .catch(error => {
      console.error('Error-getReturnsByLoyaltyAction: ', error)
      dispatch(UiActions.updateLoadingStates({ getReturns: false }))
    })
}

export const handleOrderNotFound = (res: Response, dispatch: Dispatch<AppDispatch>): void => {
  dispatch(UiActions.receiveUiData({ returnsError: 'orderNotFound' }))
  console.warn(loggingHeader + 'getReturns: order not found\n' + JSON.stringify(res))
}

export const getReturns = (orderNum: string) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'getReturns\n' + JSON.stringify({ orderNum: orderNum }))
  dispatch(UiActions.updateLoadingStates({ getReturns: true }))
  CoordinatorAPI.getReturns(orderNum)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'getReturns: not successful\n' + JSON.stringify(res))
        if (res.status === 404 || res.status === 400) handleOrderNotFound(res, dispatch)
        else throw new Error('Could not get return order')
      } else if (res.status === 204) {
        handleOrderNotFound(res, dispatch)
      } else {
        return res.json()
      }
    })
    .then(orderFound => {
      console.info(loggingHeader + 'getReturns: success\n' + JSON.stringify(orderFound))
      dispatch(UiActions.updateLoadingStates({ getReturns: false }))
      if (!orderFound) {
        return
      }
      dispatch(UiActions.receiveUiData({ returnsError: false }))
      const returnableItems = []
      const nonReturnableItems = []
      const returnOriginationType = orderFound.returnOriginationType
      orderFound.orderUnits.forEach(item => {
        if (item.returnEligibility.includes('ELIGIBLE')) {
          item.customerOrderNumber = orderFound.customerOrderNumber
          item.distributionOrderNumber = item.fulfillmentDetails.distributionOrderNumber
          returnableItems.push(item)
        } else {
          nonReturnableItems.push(item)
        }
      })
      dispatch(receiveReturnData({ nonReturnableItems, returnableItems, returnOriginationType }))
    })
    .catch((error) => {
      console.info('getReturnsError: ', error)
      dispatch(UiActions.receiveUiData({ returnsError: 'generalError' }))
      dispatch(UiActions.updateLoadingStates({ getReturns: false }))
    })
  console.info('END: ' + loggingHeader + 'getReturns')
}

export const getReturnsFromCreditCardLookup = (orderNumbers: Array<string>): Promise<Array<ReturnOrderType>> => {
  return CoordinatorAPI.getReturnsByCreditCardOrderList(orderNumbers)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'getReturnsFromCreditCardLookup: not successful\n' + JSON.stringify(res))
        throw new Error('Sorry, something went wrong. Please try again.')
      }
      if (res.status === 204) {
        console.warn(loggingHeader + 'getReturnsFromCreditCardLookup: no orders found\n' + JSON.stringify(res))
        throw new Error('Order not found.')
      }
      return res.json()
    })
    .then(orders => {
      addTotalAndItemIdentifiersToReturnList(orders)
      return orders
    })
}

export type ReturnOriginationEnumType =
  | 0 // receipted
  | 1 // non-receipted
  | 2 // gift receipt
  | 3 // loyalty-lookup
  | 4 // Manual
  | 5 // Trade-in
  | 6 // lookup by credit card

export const addReturnItems = (
  returnReq: ReturnRequestType,
  returnOriginationType: ReturnOriginationEnumType
) => (dispatch: Dispatch<AppDispatch>): void => {
  console.info('BEGIN: ' + loggingHeader + 'addReturnItems\n' + JSON.stringify(returnReq))
  dispatch(UiActions.updateLoadingStates({ addReturnItems: true }))
  CoordinatorAPI.addReturnItems(returnReq, returnOriginationType)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'addReturnItems: not successful\n' + JSON.stringify(res))
        throw new Error('Could not add return items')
      } else {
        return res.json()
      }
    })
    .then(data => {
      const item = data.originalSaleInformation[0].returnItems[0]
      if (data.customer) dispatch(fetchLoyaltyByAccountNumber(data.customer.loyaltyNumber, false, false))
      dispatch(UiActions.receiveUiData({ showModal: false, selectedItem: Number(item.lineNumber.toString() + item.sequenceNumber) * -1 }))
      dispatch(UiActions.updateLoadingStates({ addReturnItems: false }))
      dispatch(receiveTransactionDataAndSendToPinPad(data))
      console.info(loggingHeader + 'addReturnItems: success\n' + JSON.stringify(data))
    })
    .catch((error) => {
      console.info('addReturnItemsError: ', error)
      dispatch(UiActions.receiveUiData({ returnsError: 'generalError' }))
      dispatch(UiActions.updateLoadingStates({ addReturnItems: false }))
    })
  console.info('END: ' + loggingHeader + 'addReturnItems')
}
const addTotalAndItemIdentifiersToReturnList = (orders) => {
  orders.forEach(order => {
    let calculatedTotal = 0
    order.orderUnits.forEach(unit => {
      if (unit.returnPrice) {
        calculatedTotal += unit.returnPrice
      }
      if (unit.taxInfo && unit.taxInfo.returnTax) {
        calculatedTotal += unit.taxInfo.returnTax
      }
    })
    order.calculatedTotal = calculatedTotal
    order.orderUnits.forEach(orderUnit => {
      const transactionItemIdentifier = Number(orderUnit.lineNumber.toString() + orderUnit.sequenceNumber)
      orderUnit.transactionItemIdentifier = -transactionItemIdentifier
      if (orderUnit.fulfillmentDetails) {
        orderUnit.distributionOrderNumber = orderUnit.fulfillmentDetails.distributionOrderNumber
      }
    })
  })
}
