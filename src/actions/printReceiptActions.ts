import { PrintReceiptDataType } from '../reducers/printReceiptData'

export const UPDATE_PRINT_RECEIPT_DATA = 'UPDATE_PRINT_RECEIPT_DATA'
const loggingHeader = 'actions > printReceiptActions > '

export const receivePrintReceiptData = (data: PrintReceiptDataType) => (dispatch): void => {
  dispatch(updatePrintReceiptData(data, UPDATE_PRINT_RECEIPT_DATA))
}

export const clearPrintReceiptData = () => (dispatch): void => {
  dispatch(updatePrintReceiptData({
    serializedTransaction: null,
    serializedAssociateData: null,
    serializedStoreInfo: null,
    serializedAdditionalInfo: null,
    reprintReceiptAvailable: false,
    midSaleSeparateGiftReceipts: true
  }, UPDATE_PRINT_RECEIPT_DATA))
}

export const updatePrintReceiptData = (
  data: PrintReceiptDataType,
  actionType: string
): { type: string; data: PrintReceiptDataType } => {
  console.info('ENTER: ' + loggingHeader + 'updatePrintReceiptData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}
