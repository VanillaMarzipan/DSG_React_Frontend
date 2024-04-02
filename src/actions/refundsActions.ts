import { EndzoneTenderStatus, RefundStatus } from '../reducers/refundsData'
import * as CefSharp from '../utils/cefSharp'
import { getGiftCardMinimumAmount } from '../utils/giftCardHelpers'
import { giftcardMaximumAmount } from '../utils/reusableNumbers'

export const ADD_REFUND_METHODS = 'refunds/add-refund-method'
export const ADD_REFERENCED_REFUND = 'refunds/add-referenced-refund'
export const CLEAR_REFUNDS_DATA = 'refunds/clear-refund-data'
export const SET_CURRENT_REFUND_CO = 'refunds/set-current-refund-co'
export const SET_REFUND_STATUS = 'refunds/set-refund-status'
export const SET_REFUND_TENDER_STATUS = 'refunds/set-refund-tender-status'
export const ADD_REFUND_TO_GIFT_CARD = 'refunds/add-to-gift-card-refund'
export const ADD_REFUND_TO_CASH = 'refunds/add-refund-to-cash'
export const SET_CURRENT_TENDER_ID = 'refunds/set-current-tender-id'
export const SET_ALTERNATE_TENDER_TYPE = 'refunds/set-alternate-tender-type'
export const REFRESH_REFUNDS_DATA = 'refunds/refresh-refunds-data'

const loggingHeader = 'actions > refundsActions > '

const addRefundMethods = (customerOrderNumber: string, amount: number, refundResponse: string) => {
  const giftcardMinimum = getGiftCardMinimumAmount()
  return {
    type: ADD_REFUND_METHODS,
    data: {
      co: customerOrderNumber,
      amount: amount,
      response: refundResponse,
      giftCardMinimumAmount: giftcardMinimum,
      giftcardMaximumAmount: giftcardMaximumAmount
    }
  }
}

const addReferencedRefund = (customerOrderNumber: string, amount: number, refundResponse: string) => {
  const giftcardMinimum = getGiftCardMinimumAmount()
  return {
    type: ADD_REFERENCED_REFUND,
    data: {
      co: customerOrderNumber,
      amount: amount,
      response: refundResponse,
      giftCardMinimumAmount: giftcardMinimum,
      giftcardMaximumAmount: giftcardMaximumAmount
    }
  }
}

export const clearRefundsData = () => (dispatch) => {
  dispatch({
    type: CLEAR_REFUNDS_DATA,
    data: null
  })
}

export const setCurrentRefundCustomerOrderNumber = (customerOrderNumber: string) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_REFUND_CO,
    data: customerOrderNumber
  })
}

export const setRefundStatus = (customerOrderNumber: string, status: RefundStatus) => (dispatch) => {
  dispatch({
    type: SET_REFUND_STATUS,
    data: {
      co: customerOrderNumber,
      status: status
    }
  })
}

export const setTenderEndzoneStatus = (customerOrderNumber: string, tenderId: number, status: EndzoneTenderStatus) => (dispatch) => {
  dispatch({
    type: SET_REFUND_TENDER_STATUS,
    data: {
      co: customerOrderNumber,
      tenderId: tenderId,
      status: status
    }
  })
}

export const addRefundToGiftCard = (customerOrderNumber: string, amount: number, originalTenderId: number) => (dispatch) => {
  dispatch({
    type: ADD_REFUND_TO_GIFT_CARD,
    data: {
      co: customerOrderNumber,
      amount: amount,
      originalTenderId: originalTenderId
    }
  })
}

export const addRefundToCash = (customerOrderNumber: string, amount: number, originalTenderId: number) => (dispatch) => {
  dispatch({
    type: ADD_REFUND_TO_CASH,
    data: {
      co: customerOrderNumber,
      amount: amount,
      originalTenderId: originalTenderId
    }
  })
}

export const setCurrentlyProcessingTenderInternalReduxId = (customerOrderNumber: string, id: number) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_TENDER_ID,
    data: {
      co: customerOrderNumber,
      id: id
    }
  })
}

export const setAlternateTenderTypeSelected = (customerOrderNumber: string, type: string) => (dispatch) => {
  dispatch({
    type: SET_ALTERNATE_TENDER_TYPE,
    data: {
      co: customerOrderNumber,
      type: type
    }
  })
}

export const refreshRefundData = () => (dispatch) => {
  dispatch({
    type: REFRESH_REFUNDS_DATA
  })
}

export const getReferencedRefund = (customerOrderNumber: string, amount: number, serializedTransaction: string) => (dispatch) => {
  console.info(`${loggingHeader} -> getReferencedRefund([${customerOrderNumber}, ${amount}, ${serializedTransaction}])`)
  CefSharp.getReferencedRefund(customerOrderNumber, amount, serializedTransaction)
    .then(data => {
      console.info(`${loggingHeader} -> getReferencedRefund -> CefSharp response [${JSON.stringify(data)}]`)
      dispatch(addReferencedRefund(customerOrderNumber, amount, data))
    })
    .catch(err => {
      console.error(`${loggingHeader} getReferencedRefund error calling addReferencedRefund. Customer order was [${customerOrderNumber}]. Error was [${err}]`)
      dispatch(addReferencedRefund(customerOrderNumber, 0, 'ERROR'))
    })
}

export const getRefundMethods = (customerOrderNumber: string, amount: number, returnSource: number) => (dispatch) => {
  console.info(`BEGIN refundsActions.cs -> getRefundMethods([${customerOrderNumber}, ${amount}, ${returnSource}])`)
  CefSharp.getRefundMethods(customerOrderNumber, amount, returnSource)
    .then(data => {
      console.info(`${loggingHeader} -> getRefundMethods -> CefSharp response [${JSON.stringify(data)}]`)
      dispatch(addRefundMethods(customerOrderNumber, amount, data))
    })
    .catch(err => {
      console.error(`${loggingHeader} getRefundMethods error calling addRefundMethods. Customer order was [${customerOrderNumber}]. Error was [${err}]`)
      dispatch(addRefundMethods(customerOrderNumber, 0, 'ERROR'))
    })
}
