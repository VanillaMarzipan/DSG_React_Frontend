import { TransactionDataTypes } from '../reducers/transactionData'
import {
  setupGetCardDataEventWatcher,
  setupGetMsrDataEventWatcher,
  setupGiftCardTenderResponse,
  setupScanEventWatcher,
  setupGiftCardBalanceInquiryResponse,
  setupConfigurePinpadResponse,
  setupHealthCheckEventWatcher,
  setupGetReactStatusFunctions,
  setupSurveyResponse,
  setupLoyaltyPhoneNumberInputResponse,
  setupReceiptTypeResponse,
  setupEmailConfirmationResponse
} from './cefSharpEvents'
import { Customer } from '../reducers/loyaltyData'
import { DonationOption } from '../reducers/configurationData'
import { sendAppInsightsEvent } from './appInsights'
import { removeTaxSummaryIfDisabled } from './taxSummaryUtil'

setupScanEventWatcher()
setupGetCardDataEventWatcher()
setupGetMsrDataEventWatcher()
setupGiftCardTenderResponse()
setupGiftCardBalanceInquiryResponse()
setupConfigurePinpadResponse()
setupHealthCheckEventWatcher()
setupGetReactStatusFunctions()
setupSurveyResponse()
setupLoyaltyPhoneNumberInputResponse()
setupReceiptTypeResponse()
setupEmailConfirmationResponse()

const loggingHeader = 'utils > cefSharp > '

const isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')

/**
 * Show the PinPad idle screen.
 */
export const showPPScreenSaver = (): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'showPPScreenSaver')
    window.pinPadAsync.ShowIdleScreen()
  }
}

/**
 * Open the Cash Drawer
 */
export const openCashDrawer = (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'openCashDrawer')
    return window.printerAsync.OpenCashDrawer()
  }
}

/**
 * Print sales receipt
 * @param {string} transactionData Transaction data object as a JSON string
 * @param {string} storeInfo Store Info as a JSON string
 * @param {string} associateData Associate Data as a JSON string
 * @param {string} additionalInfo  Any additional data as a JSON string
 */
export const printSalesReceipt = (
  transactionData: string,
  storeInfo: string,
  associateData: string,
  additionalInfo: string
): void => {
  const parsedTransactionData = JSON.parse(transactionData)
  const updatedTransactionData = removeTaxSummaryIfDisabled(parsedTransactionData)
  const reserializedData = JSON.stringify(updatedTransactionData)

  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printSalesReceipt\n' + JSON.stringify({
      transactionData: reserializedData,
      storeInfo: storeInfo,
      associateData: associateData,
      additionalInfo: additionalInfo
    }))
    window.printerAsync.PrintSalesReceipt(
      reserializedData,
      storeInfo,
      associateData,
      additionalInfo
    )
  }
}

/**
 * Print gift receipts
 * @param {string} transactionData Transaction data object as a JSON string
 * @param {string} storeInfo Store Info as a JSON string
 * @param {string} associateData Associate Data as a JSON string
 * @param {string} additionalInfo  Any additional data as a JSON string
 */
export const printGiftReceipts = (
  transactionData: string,
  storeInfo: string,
  associateData: string,
  additionalInfo: string
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printGiftReceipts\n' + JSON.stringify({
      transactionData: transactionData,
      storeInfo: storeInfo,
      associateData: associateData,
      additionalInfo: additionalInfo
    }))
    window.printerAsync.PrintGiftReceipts(
      transactionData,
      storeInfo,
      associateData,
      additionalInfo
    )
  }
}

/**
 * Print store copy receipt
 * @param {string} transactionData Transaction data object as a JSON string
 * @param {string} storeInfo Store Info as a JSON string
 * @param {string} associateData Associate Data as a JSON string
 * @param {string} additionalInfo  Any additional data as a JSON string
 */
export const printStoreCopyReceipt = (
  transactionData: string,
  storeInfo: string,
  associateData: string,
  additionalInfo: string
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printStoreCopyReceipt\n' + JSON.stringify({
      transactionData: transactionData,
      storeInfo: storeInfo,
      associateData: associateData,
      additionalInfo: additionalInfo
    }))
    window.printerAsync.PrintStoreCopyReceipt(
      transactionData,
      storeInfo,
      associateData,
      additionalInfo
    )
  }
}

/**
 * Print Register Close Receipt
 * @param {string} transactionData  Transaction data object as a JSON string
 */
export const printRegisterCloseReceipt = (transactionData: string): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printRegisterCloseReceipt\n' + JSON.stringify({ transactionData: transactionData }))
    window.printerAsync.PrintRegisterCloseReceipt(transactionData)
  }
}

/**
 * Print Enrollment Confirmation Receipt
 * @param {string} loyaltyNumber Customer loyalty number
 */
export const printEnrollmentConfirmationReceipt = (
  loyaltyNumber: string
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printEnrollmentConfirmationReceipt\n' + JSON.stringify({ loyaltyNumber: loyaltyNumber }))
    window.printerAsync.PrintEnrollmentConfirmationReceipt(loyaltyNumber)
  }
}

export const printEnrollmentDeniedChit = (
  serializedTransaction: string, serializedStoreInformation: string, serailizedAssociateData: string, chitType: string, applicationKeyNumber: string
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printEnrollmentDeniedChit\n' + JSON.stringify({
      serializedTransaction: serializedTransaction,
      serializedStoreInformation: serializedStoreInformation,
      serailizedAssociateData: serailizedAssociateData,
      chitType: chitType,
      applicationKeyNumber: applicationKeyNumber
    }))
    window.printerAsync.PrintEnrollmentDeniedChit(serializedTransaction, serializedStoreInformation, serailizedAssociateData, chitType, applicationKeyNumber)
  }
}

export const printGiftCardBalanceInquiryChit = (
  serializedTransaction: string, serializedStoreInformation: string, serailizedAssociateData: string, remainingBalance: string, accountNumber: string
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printGiftCardBalanceInquiryChit\n' + JSON.stringify({
      serializedTransaction,
      serializedStoreInformation,
      serailizedAssociateData,
      remainingBalance,
      accountNumber
    }))
    window.printerAsync.PrintGiftCardBalanceInquiryChit(serializedTransaction, serializedStoreInformation, serailizedAssociateData, remainingBalance, accountNumber)
  }
}

export const printComplimentaryGiftCardChit = (
  serializedTransaction: string, serializedStoreInformation: string, serailizedAssociateData: string, remainingBalance: string, accountNumber: string
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printComplimentaryGiftCardChit\n' + JSON.stringify({
      serializedTransaction,
      serializedStoreInformation,
      serailizedAssociateData,
      remainingBalance,
      accountNumber
    }))
    window.printerAsync.PrintComplimentaryGiftCardChit(serializedTransaction, serializedStoreInformation, serailizedAssociateData, remainingBalance, accountNumber)
  }
}

export const printProductDetailChit = (
  productName: string, serializedStyleVariant: string, productPrice: number
): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printProductDetailChit\n' + JSON.stringify({
      productName,
      serializedStyleVariant,
      productPrice
    }))
    window.printerAsync.PrintProductDetailChit(productName, serializedStyleVariant, productPrice)
  }
}

export const beginCreditAccountLookup = async (
  serializedTransaction: string, zipcode: string
): Promise<string> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'beginCreditAccountLookup\n' + JSON.stringify({
      serializedTransaction: serializedTransaction,
      zipcode: zipcode
    }))
    const response = await window.pinPadAsync.BeginCreditAccountLookup(serializedTransaction, zipcode)
    return response
  }
}

export const abortCreditAccountLookup = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'abortCreditAccountLookup\n')
    window.pinPadAsync.AbortCreditAccountLookup()
  }
}

/**
 * Print Credit Temporary Shopping Pass
 * @param {string} creditApplicationResponse  credit application response object as a JSON string
 */
export const printTemporaryShoppingPass = (creditApplicationResponse: string): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printTemporaryShoppingPass\n' + JSON.stringify({ creditApplicationResponse: creditApplicationResponse }))
    window.printerAsync.PrintTemporaryShoppingPass(creditApplicationResponse)
  }
}

export const tenderWithTemporaryShoppingPass = (serializedTransaction: string, shoppingPass: string, tenderAmount: string) => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'tenderWithTemporaryShoppingPass\n' + JSON.stringify({ serializedTransaction: serializedTransaction }))
    return window.pinPadAsync.TenderWithTemporaryShoppingPass(serializedTransaction, shoppingPass, tenderAmount)
  }
}

export const tenderWithCreditAccountLookup = (serializedTransaction: string, tenderAmount: string) => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'tenderWithCreditAccountLookup\n' + JSON.stringify({ serializedTransaction: serializedTransaction }))
    return window.pinPadAsync.TenderWithCreditAccountLookup(serializedTransaction, tenderAmount)
  }
}

export const reverseGiftCardActivation = (serializedTransaction: string, transactionItemIdentifier: number): Promise<string> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'reverseGiftCardActivation\n' + JSON.stringify({
      serializedTransaction: serializedTransaction,
      transactionItemIdentifier: transactionItemIdentifier
    }))
    return window.pinPadAsync.GiftCardActivationReversal(serializedTransaction, transactionItemIdentifier)
  }
}

export const reverseGiftCardActivationWithTransactionNumber = (transactionNumber: number, amount: number, activationTimestamp: string, activationTransactionId: string) => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'reverseGiftCardActivationWithTransactionNumber\n' + JSON.stringify({
      transactionNumber: transactionNumber,
      amount: amount,
      activationTimestamp: activationTimestamp,
      activationTransactionId: activationTransactionId
    }))
    return window.pinPadAsync.GiftCardActivationReversalWithTransactionNumber(transactionNumber, amount.toString(), activationTimestamp, activationTransactionId)
  }
}

/**
 * Print Suspend Transaction
 * @param {string} suspendTransactionResponse Stringified response from coordinator suspend endpoint
 */
export async function printSuspendReceipt (
  suspendTransactionResponse: string
): Promise<void> {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printSuspendReceipt\n' + JSON.stringify({ suspendTransactionResponse: suspendTransactionResponse }))
    window.printerAsync.PrintSuspendReceipt(suspendTransactionResponse)
  }
}

export async function printReturnAuthorizationReceipt (
  returnAuthorizationMessage: string
): Promise<void> {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'printSuspendReceipt\n' + JSON.stringify({ returnAuthorizationMessage: returnAuthorizationMessage }))
    window.printerAsync.PrintReturnAuthorizationReceipt(returnAuthorizationMessage)
  }
}

/**
 * Waits for drawer to close
 */
export async function waitForCashDrawerToClose (): Promise<void> {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'waitForCashDrawerToClose')
    return window.printerAsync.WaitForCashDrawerToClose()
  }
}

/**
 * Gets store info from POSLauncher
 * @returns {Promise<string>} A promise that resolves to a string of JSON data about the current store
 */
export async function getStoreInformation (): Promise<string> {
  // isCefSharp check happens in Routes.tsx around getInitialDate()
  console.info('ENTER: ' + loggingHeader + 'getStoreInformation')
  return window.storeInformationAsync.GetStoreInformation()
}

/**
 * Gets application version from POSLauncher
 * @returns {Promise<string>} A promise that resolves to a string of the version number of POS Launcher
 */
export async function getApplicationVersionNumber (): Promise<string> {
  console.info('ENTER: ' + loggingHeader + 'getApplicationVersionNumber')
  let versionNumber = 'web'
  if (isCefSharp) {
    if (window.applicationAsync) {
      versionNumber = window.applicationAsync.GetVersionNumber()
    } else {
      versionNumber = 'unknown'
    }
  }
  return versionNumber
}

/**
 *
 * Gets the pinpad type from POSLauncher
 * @returns {Promise<string>} A promise that resolves to the pinpad type (Adyen or Fipay)
 */
export async function getPinpadType (): Promise<string> {
  console.info('ENTER: ' + loggingHeader + 'getPinpadType')
  let pinpadType = 'Adyen'
  if (isCefSharp) {
    if (window.fipayAsync) {
      pinpadType = window.fipayAsync.GetPinpadType()
    }
  }
  return pinpadType
}

/**
 * Notify scanner to expect configuration instead of UPC
 * @returns {Promise<void>} A promise that resolves to a string of JSON data about a pinpad
 */
export async function activatePinpadConfigurationScanHandler (): Promise<void> {
  console.info('ENTER: ' + loggingHeader + 'activatePinpadConfigurationScanHandler')
  if (isCefSharp) {
    return window.applicationAsync.ActivatePinpadConfigurationScanHandler()
  }
}

/**
 * Deactivate pinpad configuration so scanner is expecting UPCs again
 */
export async function deactivatePinpadConfigurationScanHandler (): Promise<void> {
  console.info('ENTER: ' + loggingHeader + 'deactivatePinpadConfigurationScanHandler')
  if (isCefSharp) {
    return window.applicationAsync.DeactivatePinpadConfigurationScanHandler()
  }
}

/**
 * Gets MAC address of register
 * @returns {Promise<string>} A promise that resolves to a MAC Address
 */
export async function getRegisterMacAddress (): Promise<string> {
  // isCefSharp check happens in Routes.tsx around getInitialDate()
  console.info('ENTER: ' + loggingHeader + 'getRegisterMacAddress')
  return window.registerInformationAsync.GetRegisterMacAddress()
}

export async function isCashDrawerOpen (): Promise<boolean> {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'isCashDrawerOpen')
    return window.printerAsync.IsCashDrawerOpen()
  } else {
    console.info('ENTER: ' + loggingHeader + 'isCashDrawerOpen: NOT isCefSharp')
    return false
  }
}

export async function beginTransaction (features: string, configuration: string, transactionNumber: number): Promise<void> {
  sendAppInsightsEvent('StartTransaction', { transactionNumber })
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'beginTransaction\n' + JSON.stringify({ transactionNumber, features: features }))
    window.transactionMonitorAsync.BeginTransaction(features, configuration, transactionNumber)
  }
}

export async function endTransaction (features: string, configuration: string): Promise<void> {
  sendAppInsightsEvent('EndTransaction')
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'endTransaction\n' + JSON.stringify({ features: features }))
    window.transactionMonitorAsync.EndTransaction(features, configuration)
  }
}

/**
 * Send transaction data to pin pad
 * @param {TransactionDataTypes} transactionData Transaction data object
 */
export const sendTransactionToPinPad = (
  transactionData: TransactionDataTypes
): void => {
  if (isCefSharp) {
    const updatedData = removeTaxSummaryIfDisabled(transactionData)

    console.info('ENTER: ' + loggingHeader + 'sendTransactionToPinPad\n' + JSON.stringify({ transactionData: updatedData }))
    window.pinPadAsync.ShowScrollingReceipt(JSON.stringify(updatedData))
  }
}

/**
 * End survey prompt on pin pad
 */
export const endPinPadSurvey = (): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'endPinPadSurvey\n')
    window.pinPadAsync.EndSurvey()
  }
}

/**
 * Get results from survey prompt
 */
export const getPinPadSurveyResults = async (): Promise<number | null> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'getPinPadSurveyResults\n')
    return window.pinPadAsync.GetSurveyResults()
  } else {
    return null
  }
}

/**
 * Display processing on pin pad
 */
export const displayProcessingOnPinPad = (): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'displayProcessingOnPinPad')
    window.pinPadAsync.ShowProcessing()
  }
}

export const setBarcodeScannerEnabled = (enabled): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'setBarcodeScannerEnabled\n' + JSON.stringify({ enabled: enabled }))
    return window.scannerAsync.ScanningEnabled(enabled)
  }
}

export const beginGiftCardBalanceInquiry = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'beginGiftCardBalanceInquiry\n')
    window.pinPadAsync.BeginGiftCardBalanceInquiry()
  }
}

export const abortGiftCardOperation = async (): Promise<boolean> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'abortGiftCardOperation\n')
    return window.pinPadAsync.AbortGiftCardOperation()
  }
}

export const beginGiftCardActivation = (
  amount: number,
  account: string,
  expiry: string,
  transaction: TransactionDataTypes,
  isGiftCardSale: boolean,
  isStoreCredit: boolean,
  tenderKey: string
  // eslint-disable-next-line
): Promise<any[]> => {
  console.info('ENTER: ' + loggingHeader + 'beginGiftCardActivation\n' + JSON.stringify(transaction), amount)
  // TODO: Add amount.toString() to the beginTender call when Bob pushes updated Launcher repo
  if (isCefSharp) return window.fipayAsync.BeginGiftCardActivation(amount.toString(), account, expiry, JSON.stringify(transaction), isGiftCardSale, isStoreCredit, tenderKey)
}

export const BeginGiftCardActivationWithTransactionNumber = (
  account: string,
  expiry: string,
  amount: number,
  transactionNumber: number,
  isGiftCardSale: boolean,
  isStoreCredit: boolean
  // eslint-disable-next-line
): Promise<string> => {
  console.info('ENTER: ' + loggingHeader + 'beginGiftCardActivationWithTransactionNumber\n' + JSON.stringify(transactionNumber))
  if (isCefSharp) return window.fipayAsync.BeginGiftCardActivationWithTransactionNumber(account, expiry, amount.toString(), transactionNumber, isGiftCardSale, isStoreCredit)
  else {
    return Promise.resolve(JSON.stringify({
      Result: {
        Status: 0
      },
      PoiData: {
        TransactionTimeStamp: '2022-03-15 12:34',
        TransactionID: '1234567'
      }
    }))
  }
}

/**
 * Send a message to the pin pad to begin a credit tender
 * @param {object} transaction The current active transaction
 * @returns {Promise<any[]>} credit data from CefSharp
 */
export const beginCreditTender = (
  amount: number,
  transaction: TransactionDataTypes
  // eslint-disable-next-line
): Promise<any[]> => {
  console.info('ENTER: ' + loggingHeader + 'beginCreditTender\n' + JSON.stringify(transaction))
  // TODO: Add amount.toString() to the beginTender call when Bob pushes updated Launcher repo
  if (isCefSharp) return window.fipayAsync.BeginTender(amount.toString(), JSON.stringify(transaction), transaction.header.tenderIdentifier)
}

/**
 * Send a message to the pin pad to begin a giftcard tender
 * NOTE: Should be temporary for Adyen - will be able to revert back to beginCreditTender when Adyen card acquisition call
 *   supports giftcards
 * @param {object} transaction The current active transaction
 * @returns {Promise<any[]>} credit data from CefSharp
 */
export const beginGiftCardTender = (
  amount: number,
  transaction: TransactionDataTypes,
  keyed: boolean
): Promise<void> => {
  console.info('ENTER: ' + loggingHeader + 'beginGiftCardTender\n' + JSON.stringify(transaction))
  // TODO: Add amount.toString() to the beginTender call when Bob pushes updated Launcher repo
  if (isCefSharp) return window.fipayAsync.BeginGiftCardTender(amount.toString(), JSON.stringify(transaction), keyed, transaction.header.tenderIdentifier)
}

/**
 * Sets register number for FiPay (credit processing)
 * @param {number} registerNumber Current register number
 */
export const setFipayRegisterNumber = (registerNumber: number): void => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'setFipayRegisterNumber\n' + JSON.stringify({ registerNumber: registerNumber }))
    window.fipayAsync.SetRegisterNumber(registerNumber)
  }
}

interface CustomerDetailsType {
    loyaltyCustomer: Customer
    phoneNumber: string
    identificationType: string
    identificationNumber: string
}

export const beginCreditApplication = (
  transaction: TransactionDataTypes,
  customerDetails: CustomerDetailsType
): Promise<string> => {
  console.info('ENTER: ' + loggingHeader + 'beginCreditApplication\n' + JSON.stringify(transaction))
  if (isCefSharp) return window.fipayAsync.BeginCreditApplication(JSON.stringify(transaction), JSON.stringify(customerDetails))
}

/**
 * Bind CefSharp pin pad methods to the window object. Needs to be called before any other pin pad methods
 * @async
 * @returns {Promise<void>}
 */
export const bindToPP = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToPP')
    try {
      await window.CefSharp.BindObjectAsync('pinPadAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToPP: Error\n' + JSON.stringify(err))
    }
  }
}

/**
 * Bind CefSharp FiPay methods to the window object. Needs to be called before any other FiPay methods
 * @async
 * @returns {Promise<void>}
 */
export const bindToFipay = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToFipay')
    try {
      await window.CefSharp.BindObjectAsync('fipayAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToFipay: Error\n' + JSON.stringify(err))
    }
  }
}

/**
 * Bind CefSharp printer methods to the window object. Needs to be called before any other printer methods
 * @async
 * @returns {Promise<void>}
 */
export const bindToPrinter = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToPrinter')
    try {
      await window.CefSharp.BindObjectAsync('printerAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToPrinter: Error\n' + JSON.stringify(err))
    }
  }
}

/**
 * Bind CefSharp store information methods to the window object. Needs to be called before any other store information methods
 * @async
 * @returns {Promise<void>}
 */
export const bindToStoreInformation = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToStoreInformation')
    try {
      await window.CefSharp.BindObjectAsync('storeInformationAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToStoreInformation: Error\n' + JSON.stringify(err))
    }
  }
}

/**
 * Bind CefSharp register information methods to the window object. Needs to be called before any other register information methods
 * @async
 * @returns {Promise<void>}
 */
export const bindToRegisterInformation = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToRegisterInformation')
    try {
      await window.CefSharp.BindObjectAsync('registerInformationAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToRegisterInformation: Error\n' + JSON.stringify(err))
    }
  }
}

export const bindToTransactionMonitor = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToTransactionMonitor')
    try {
      await window.CefSharp.BindObjectAsync('transactionMonitorAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToTransactionMonitor: Error\n' + JSON.stringify(err))
    }
  }
}

export const bindToBarcodeScanner = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToBarcodeScanner')
    try {
      await window.CefSharp.BindObjectAsync('scannerAsync', 'bound')
    } catch (error) {
      console.error(loggingHeader + 'bindToBarcodeScanner: Error\n' + JSON.stringify(error))
    }
  }
}

/**
 * Bind CefSharp application (Launcher) methods to the window object. Needs to be called before any other application methods
 * @async
 * @returns {Promise<void>}
 */
export const bindToApplication = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'bindToApplication')
    try {
      await window.CefSharp.BindObjectAsync('applicationAsync', 'bound')
    } catch (err) {
      console.error(loggingHeader + 'bindToApplication: Error', err)
    }
  }
}

export const bindToHealthCheck = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ', loggingHeader, 'bindToHealthCheck')
    try {
      await window.CefSharp.BindObjectAsync('healthCheckAsync', 'bound')
    } catch (error) {
      console.error(loggingHeader + 'bindToHealthCheck: Error', error)
    }
  }
}

export const performHealthExam = async (): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'performHealthExam\n')
    await window.healthCheckAsync.PerformHealthExam()
  }
}

export const beginPostVoid = async (serializedTransaction: string): Promise<void> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'beginPostVoid\n')
    return window.fipayAsync.BeginPostVoid(serializedTransaction)
  } else {
    return null
  }
}

export const promptAthleteForDonation = async (prompt: string, options: Array<DonationOption>): Promise<string> => {
  if (isCefSharp) {
    console.info('ENTER: ' + loggingHeader + 'promptAthleteForDonation\n')
    const request = {
      prompt: prompt,
      options: options
    }
    return window.pinPadAsync.PromptForDonation(JSON.stringify(request))
  }
}

export const initiatePinpadSurvey = async (serializedSurveyConfiguration: string): Promise<string> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'initiatePinpadSurvey')
    return window.pinPadAsync.InitiatePinpadSurvey(serializedSurveyConfiguration)
  } else {
    return null
  }
}

export const printNikeConnectedChit = async (): Promise<void> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'printNikeConnectedChit')
    window.printerAsync.PrintNikeConnectedChit()
  } else {
    return null
  }
}

export const initiateLoyaltyPhoneInput = async (): Promise<void> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'initiateLoyaltyPhoneInput')
    return window.pinPadAsync.InitiatePhoneNumberInput()
  } else {
    return null
  }
}

export const cancelLoyaltyPhoneInput = async (): Promise<void> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'cancelLoyaltyPhoneInput')
    return window.pinPadAsync.CancelPhoneNumberInput()
  }
}

export const initiateReceiptTypePrompt = async (): Promise<void> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'initiateReceiptTypePrompt')
    return window.pinPadAsync.InitiateReceiptTypePrompt()
  } else {
    return null
  }
}

export const cancelReceiptTypePrompt = async (): Promise<void> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'cancelReceiptTypePrompt')
    return window.pinPadAsync.CancelReceiptTypePrompt()
  }
}

export const initiateEmailConfirmation = async (emailAddress: string): Promise<void> => {
  if (isCefSharp) {
    console.debug('ENTER: ' + loggingHeader + 'initiateEmailConfirmation')
    return window.pinPadAsync.InitiateEmailConfirmationPrompt(emailAddress)
  } else {
    return null
  }
}

export const getRefundMethods = async (customerOrderNumber: string, amount: number, returnSource: number): Promise<string> => {
  console.debug(`ENTER: ${loggingHeader}getRefundMethods(${customerOrderNumber}, ${amount}, ${returnSource})`)
  if (isCefSharp) {
    return window.pinPadAsync.GetRefundMethods(customerOrderNumber, amount, returnSource)
  } else {
    return null
  }
}

export const getReferencedRefund = async (customerOrderNumber: string, amount: number, serializedTransaction: string): Promise<string> => {
  console.debug(`ENTER: ${loggingHeader}getReferencedRefund(${customerOrderNumber}, ${amount}, ${serializedTransaction})`)
  if (isCefSharp) {
    return window.pinPadAsync.GetReferencedRefund(customerOrderNumber, amount, serializedTransaction)
  } else {
    return null
  }
}
