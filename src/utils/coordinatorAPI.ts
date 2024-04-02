import * as Storage from './asyncStorage'
import 'cross-fetch/polyfill'
import { WarrantySelectionsType } from '../reducers/warrantyData'
import { ReturnItemType } from '../reducers/returnData'
import { TransactionDataTypes } from '../reducers/transactionData'
import { ReturnOriginationEnumType } from '../actions/returnActions'
import { PendingManagerOverrideData } from '../reducers/managerOverrideData'
import { INoSaleRequest } from '../actions/transactionActions'
export interface ReturnRequestType {
  returnItems: Array<ReturnItemType>
  orderLookupIdentifier?: string
}

const loggingHeader = 'utils > coordinatorAPI > '
const apiVersion = 'v11'
let abortGetLastTransactionDetailsController = null
let abortGetAssociateByIdController = null
let abortAccountLevelDetailsController = null
let abortGetLoyaltyAccountPhoneController = null
let abortGetLoyaltyAccountNameZipController = null
let abortGetLoyaltyAccountEmailController = null
let abortGetLoyaltyByAccountNumberController = null
let abortModifyLoyaltyAccountController = null
let abortEnrollLoyaltyAccountController = null
let abortGetFeatureFlagsController = null
let abortFetchWarrantiesController = null
let abortGetReturnsController = null

export const abortOutstandingRequestsOnVoid = () => {
  const requestsToAbort = [
    abortGetLastTransactionDetailsController,
    abortGetAssociateByIdController,
    abortAccountLevelDetailsController,
    abortGetLoyaltyAccountPhoneController,
    abortGetLoyaltyAccountNameZipController,
    abortGetLoyaltyAccountEmailController,
    abortGetLoyaltyByAccountNumberController,
    abortModifyLoyaltyAccountController,
    abortEnrollLoyaltyAccountController,
    abortGetFeatureFlagsController,
    abortFetchWarrantiesController,
    abortGetReturnsController
  ]
  requestsToAbort.forEach(request => {
    if (request) request.abort()
  })
}

let environment = "'#{Environment}#'"

let coordinatorUrl = process.env.NODE_ENV === 'development'
  ? 'https://poscoordinator-pcidev.appssec.an01.pcf.dcsg.com/api'
  : "'#{PosCoordinatorUrl}#'"

let coordinatorUrlSlicedForHealthCheck = coordinatorUrl.slice(0, coordinatorUrl.indexOf('/api'))

coordinatorUrl += '/' + apiVersion
if (process.env.REACT_APP_MODE === 'store-server') {
  // @TODO: This is an insecure way of specifying the backend URL. Fix this for edge in the future
  const urlParams = new URLSearchParams(location.search)
  const coordinatorUrlFromQuery = urlParams.get('coordinatorUrl')

  if (coordinatorUrlFromQuery) {
    coordinatorUrl = coordinatorUrlFromQuery + '/' + apiVersion
  }

  environment = 'kubernetes'
  coordinatorUrlSlicedForHealthCheck = coordinatorUrlFromQuery.slice(0, coordinatorUrlFromQuery.indexOf('/api'))
}

export const getEnvironment = (): string => {
  console.info('ENTER: ' + loggingHeader + 'getEnvironment')
  return environment.toUpperCase()
}

let token = ''
/**
   * Get auth token from localStorage or mobile equivalent
   * @returns {Promise<void>}
   */
;(async (): Promise<void> => {
  token = await Storage.getData('authToken')
})()

/**
 * Set new auth token
 * @param {string} newToken Auth token
 */
export const setToken = (newToken: string): void => {
  console.info('ENTER: ' + loggingHeader + 'setToken\n' + JSON.stringify({ newToken: newToken }))
  token = newToken
}

export const clearToken = (): void => {
  console.info('ENTER: ' + loggingHeader + 'clearToken')
  token = ''
}

const lookupTokenData = {
  token: '',
  timestamp: new Date(0)
}

/**
 * * Calls coordinator lookup authentication endpoint
 *  @param {number} storeNum
 *  @param {number} registerNum
 *  @returns {Promise<Response>} The lookup token, if successful
 */
export const authenticateLookupUser = (
  storeNum: number,
  registerNum: number
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'authenticateLookupUser\n' + JSON.stringify({
    storeNum: storeNum,
    registerNum: registerNum
  }))
  return coordinatorFetch('/LookupSecurity/Authenticate/', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      storeNumber: storeNum,
      registerNumber: registerNum
    })
  })
}

/**
 *  Gets the lookup token, re-fetching it if necessary
 *  @param {number} storeNum
 *  @param {number} registerNum
 *  @returns {Promise<Response>} The lookup token, if successful
 */
export const getLookupToken = async (
  storeNum: number,
  registerNum: number
): Promise<string> => {
  const lookupTokenAge = new Date().getTime() - lookupTokenData.timestamp.getTime()
  // 180 minutes
  const lookupTokenExpiryAge = 180 * 60 * 1000
  if (lookupTokenAge > lookupTokenExpiryAge) {
    return authenticateLookupUser(storeNum, registerNum)
      .then(res => {
        if (!res.ok) {
          console.warn(loggingHeader + 'getLookupToken: Error authenticating lookup user\n' + JSON.stringify(res))
          throw new Error('Error attempting login')
        } else {
          return res.json()
        }
      })
      .then(data => {
        lookupTokenData.token = data.token
        lookupTokenData.timestamp = new Date()
        console.info(loggingHeader + 'getLookupToken: success\n' + JSON.stringify(data))
        return data.token
      })
  }
  return lookupTokenData.token
}

export const buildNumber =
  // eslint-disable-next-line quotes
  process.env.NODE_ENV === 'development' ? 'local' : "'#{Build.BuildNumber}#'"

/**
 * Calls coordinator configuration endpoint
 * @returns {Promise<Response>} Store information, if successful
 */
export const getStoreInfo = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getStoreInfo')
  return coordinatorFetch('/configuration', {}, true)
}

/**
 * Calls coordinator endpoint for register data
 * @param {number} storeNum store number
 * @param {string} mac register mac address
 * @returns {Promise<Response>} Register data, if successful
 */
export const getRegisterData = (
  storeNum: number,
  mac: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getRegisterData\n' + JSON.stringify({
    storeNum: storeNum,
    mac: mac
  }))
  return coordinatorFetch(`/Register/RegisterNumber/${storeNum}/${mac}`, {}, true)
}

/**
 * Checks for an active transaction
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const checkForActiveTransaction = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'checkForActiveTransaction')
  return coordinatorFetch('/Transaction/ActiveTransaction')
}

export const getLastTransactionDetails = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getLastTransaction')
  abortGetLastTransactionDetailsController = new AbortController()
  const cancelOnVoidSignal = abortGetLastTransactionDetailsController.signal
  return coordinatorFetch('/Transaction/GetLastTransactionDetails', {
    signal: cancelOnVoidSignal
  })
}

export const transactionByBarcode = (receiptBarcode: string, registersMustMatch = false): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'transactionByBarcode')
  return coordinatorFetch(`/Transaction/TransactionByBarcode?barCode=${receiptBarcode}&registersMustMatch=${registersMustMatch}`)
}

/**
 * Calls coordinator new cash tender endpoint
 * @param {string} cashReceived Amount of cash received by cashier
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const newCashTender = (cashReceived: string, managerId: string, managerPasscode: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'newTender\n' + JSON.stringify({ cashReceived: cashReceived }))
  return coordinatorFetch('/Tender/NewCashTender', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      amount: parseFloat(cashReceived),
      managerId: managerId,
      managerPasscode: managerPasscode
    })
  })
}

/**
 * Calls coordinator new credit tender endpoint
 * @param {{}} creditResponse response from credit
 * @param tenderIdentifier tender identifier
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const newCreditTender = (creditResponse: Record<string, unknown>, managerId: string, managerPasscode: string, tenderIdentifier: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'newCreditTender\n' + JSON.stringify({ creditResponse: creditResponse }))
  const tenderQuery = `?tenderIdentifier=${tenderIdentifier}`
  return coordinatorFetch(`/Tender/NewCreditTender${tenderQuery}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      creditResponse: creditResponse,
      managerId: managerId,
      managerPasscode: managerPasscode
    })
  })
}

/**
 * Calls coordinator finalize transaction endpoint
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const finalizeTransaction = (emailAddress?: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'finalizeTransaction')
  const endpoint = '/Transaction/FinalizeTransaction' + (emailAddress ? '?emailAddress=' + emailAddress : '')
  return coordinatorFetch(endpoint, {
    method: 'POST'
  })
}

/**
 * Calls coordinator void transaction endpoint
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const voidTransaction = (returnAuthorizationKey?: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'voidTransaction')
  return coordinatorFetch('/Transaction/VoidTransaction' + (returnAuthorizationKey ? '?returnAuthorizationKey=' + returnAuthorizationKey : ''), {
    method: 'POST'
  })
}

/**
 * Calls coordinator suspend transaction endpoint
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const suspendTransaction = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'suspendTransaction')
  return coordinatorFetch('/Transaction/SuspendTransaction', {
    method: 'POST'
  })
}

/**
 * Calls coordinator delete item endpoint
 * @param {number} Transaction id of item to be deleted
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const deleteItem = (transactionId: number): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'deleteItem\n' + JSON.stringify({ transactionId: transactionId }))
  return coordinatorFetch(`/Product/Item/${transactionId}`, {
    method: 'DELETE'
  })
}

export const getAssociateById = (associateId: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getAssociateById\n' + JSON.stringify({ associateId: associateId }))
  abortGetAssociateByIdController = new AbortController()
  const cancelOnVoidSignal = abortGetAssociateByIdController.signal
  return coordinatorFetch(`/Security/LookupAssociate/${associateId}`, {
    method: 'GET',
    signal: cancelOnVoidSignal
  })
}

export const setNsppSellingAssociateId = (associateId: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'setNsppSellingAssociateId\n' + JSON.stringify({ associateId: associateId }))
  return coordinatorFetch(`/Associate/WarrantySelling/${associateId}`, {
    method: 'PUT'
  })
}

export const setCreditEnrollingAssociateId = (associateId: string, approved: boolean): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'setCreditEnrollingAssociateId\n' + JSON.stringify({
    associateId: associateId,
    approved: approved
  }))
  return coordinatorFetch('/Associate/CreditEnrollment/', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify({
      associateId: associateId,
      approved: approved
    })
  })
}

export const noSaleTransaction = (noSaleRequest: INoSaleRequest): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'noSaleTransaction')
  const endpoint = '/Transaction/NoSaleTransaction'
  return coordinatorFetch(endpoint, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(noSaleRequest)
  })
}

export const removeCoupon = (couponCode: string): Promise<Response> => {
  const endpoint = `/Coupon/Remove?couponCode=${couponCode}`
  return coordinatorFetch(endpoint, {
    method: 'DELETE'
  })
}

export const ManagerOverride = async (managerId: string, managerPin: string, storeNumber: number, registerNumber: number, managerOverride: PendingManagerOverrideData) : Promise<Response> => {
  const endpoint = '/ManagerOverride'
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify({ managerId, managerPin, storeNumber, registerNumber, ...managerOverride })
  })
}
/**
 * Calls coordinator authentication endpoint
 * @param {string} associateId
 * @param {string} pin
 * @param {number} storeNum
 * @param {number} registerNum
 * @returns {Promise<Response>} Associate data, if successful
 */
export const authenticateUser = (
  associateId: string,
  pin: string,
  storeNum: number,
  registerNum: number,
  timezoneOffset: number = new Date().getTimezoneOffset() * -1
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'authenticateUser\n' + JSON.stringify({
    associateId: associateId,
    pin: pin,
    storeNum: storeNum,
    registerNum: registerNum,
    timezoneOffset: timezoneOffset
  }))
  return coordinatorFetch('/Security/Authenticate/', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      associateId: associateId,
      storeNumber: storeNum,
      passcode: pin,
      registerNumber: registerNum,
      timezoneOffset: timezoneOffset
    })
  },
  true)
}

/**
 * Calls coordinator endpoint to validate manager credentials
 * @param {string} associateId
 * @param {string} pin
 * @returns {Promise<Response>} true if manager, false otherwise
 */
export const isManager = (
  associateId: string,
  pin: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'isManager\n' + JSON.stringify({
    associateId: associateId,
    pin: pin
  }))
  return coordinatorFetch('/Security/IsManager', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      associateId: associateId,
      passcode: pin
    })
  })
}

/**
 * Call coordinator validate endpoint
 * @returns {Promise<Response>} ok if token is valid
 */
export const validateToken = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'validateToken')
  if (!token) {
    console.warn(loggingHeader + 'JWT is not set, skipping validateToken')
    return Promise.reject(Error('JWT is not set, skipping validateToken'))
  }
  return coordinatorFetch('/Security/ValidateToken/', {
    method: 'POST'
  })
}

/**
 * Call coordinator edit item price endpoint
 * @param {number} transactionItemId transaction item id
 * @param {string} overridePrice new price
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const editItemPrice = (
  transactionItemId: number,
  overridePrice: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'editItemPrice\n' + JSON.stringify({
    transactionItemId: transactionItemId,
    overridePrice: overridePrice
  }))
  return coordinatorFetch(`/Product/PriceChange/${transactionItemId}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: overridePrice
  })
}

/**
 * Call coordinator get register endpoint
 * @param {number} storenumber Store number
 * @param {string} mac MAC address
 * @returns {Promise<Response>} Register data, if successful
 */
export const getRegister = (
  storenumber: number,
  mac: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getRegister\n' + JSON.stringify({
    storenumber: storenumber,
    mac: mac
  }))
  return coordinatorFetch(`/Register/RegisterNumber/${storenumber}/${mac}`, {
    method: 'GET'
  })
}

/**
 * Call coordinator open register endpoint
 * @returns {Promise<Response>} Register data, if successful
 */
export const openRegister = async (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'openRegister')
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Register/OpenRegister', {
    method: 'PATCH',
    headers: {
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    }
  })
}

/**
 * Call coordinator close register endpoint
 * @returns {Promise<Response>} Transaction response for printer, if successful
 */
export const closeRegister = async (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'closeRegister')
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Register/CloseRegister', {
    method: 'PATCH',
    headers: {
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    }
  })
}

export const accountLevelDetails = (
  accountNumber: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'accountLevelDetails\n' + JSON.stringify({ accountNumber: accountNumber }))
  abortAccountLevelDetailsController = new AbortController()
  const cancelOnVoidSignal = abortAccountLevelDetailsController.signal
  return coordinatorFetch(`/Loyalty/AccountLevelDetails/${accountNumber}`, {
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator loyalty phone number lookup endpoint
 * @param {string} phoneNumber phone number
 * @returns {Promise<Response>} Loyalty data, if successful
 */
export const getLoyaltyAccountPhone = (
  phoneNumber: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getLoyaltyAccountPhone\n' + JSON.stringify({ phoneNumber: phoneNumber }))
  abortGetLoyaltyAccountPhoneController = new AbortController()
  const cancelOnVoidSignal = abortGetLoyaltyAccountPhoneController.signal
  return coordinatorFetch(`/Loyalty/phone/${phoneNumber}`, {
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator loyalty advanced search endpoint
 * @param {string} firstName First name
 * @param {string} lastName Last name
 * @param {string} zip Zip code
 * @returns {Promise<Response>} Loyalty data, if successful
 */
export const getLoyaltyAccountNameZip = (
  firstName: string,
  lastName: string,
  zip: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getLoyaltyAccountNameZip\n' + JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    zip: zip
  }))
  abortGetLoyaltyAccountNameZipController = new AbortController()
  const cancelOnVoidSignal = abortGetLoyaltyAccountNameZipController.signal
  return coordinatorFetch(`/Loyalty/name/${firstName}/${lastName}/${zip}`, {
    signal: cancelOnVoidSignal
  })
}

export const fetchProductByUpc = (upc: string) => {
  console.info('ENTER: ' + loggingHeader + 'fetchProductByUpc\n' + JSON.stringify({ upc: upc }))
  return coordinatorFetch(`/ProductLookUp/ProductByUpc/${upc}`)
}

/**
 * Call coordinator loyalty email lookup endpoint
 * @param {string} email Email address
 * @returns {Promise<Response>} Loyalty data, if successful
 */
export const getLoyaltyAccountEmail = (email: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getLoyaltyAccountEmail\n' + JSON.stringify({ email: email }))
  abortGetLoyaltyAccountEmailController = new AbortController()
  const cancelOnVoidSignal = abortGetLoyaltyAccountEmailController.signal
  return coordinatorFetch(`/Loyalty/email/${email}`, {
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator loyalty account number lookup endpoint
 * @param {string} loyaltyAccountNumber Loyalty account number
 * @returns {Promise<Response>} Loyalty data, if successful
 */
export const getLoyaltyByAccountNumber = (
  loyaltyAccountNumber: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getLoyaltyByAccountNumber\n' + JSON.stringify({ loyaltyAccountNumber: loyaltyAccountNumber }))
  abortGetLoyaltyByAccountNumberController = new AbortController()
  const cancelOnVoidSignal = abortGetLoyaltyByAccountNumberController.signal
  return coordinatorFetch(`/Loyalty/account/${loyaltyAccountNumber}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator add loyalty account to transaction endpoint
 * @param {string} loyaltyNumber Loyalty account number
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const addLoyaltyAccount = async (
  loyaltyNumber: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'addLoyaltyAccount\n' + JSON.stringify({
    loyaltyNumber: loyaltyNumber
  }))
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch(`/Transaction/Customer/${loyaltyNumber}`, {
    headers: {
      accept: 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    method: 'POST'
  })
}

/**
 * Call coordinator remove loyalty account from transaction endpoint
 * @returns {Promise<Response>} Transaction data, if successful
 */
export const removeLoyaltyAccount = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'removeLoyaltyAccount')
  return coordinatorFetch('/Transaction/Customer', {
    method: 'DELETE'
  })
}

/**
 * Call coordinator modify loyalty account endpoint
 * @param {string} firstName First name
 * @param {string} lastName Last name
 * @param {string} street Street address
 * @param {string} city City
 * @param {string} state State
 * @param {string} zip Zip code
 * @param {string} phone Phone number
 * @param {string} email Email
 * @param {number} storeNumber Store number
 * @param {string} accountId Loyalty account number
 * @returns {Promise<Response>} Ok, if successful
 */
export const modifyLoyaltyAccount = (
  firstName: string,
  lastName: string,
  street: string,
  apartment: string,
  city: string,
  state: string,
  zip: string,
  phone: string,
  email: string,
  storeNumber: number,
  accountId: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'modifyLoyaltyAccount\n' + JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    street: street,
    apartment: apartment,
    city: city,
    state: state,
    postCode: zip,
    phone: phone,
    emailAddress: email,
    storeNumber: storeNumber,
    accountId: accountId
  }))
  abortModifyLoyaltyAccountController = new AbortController()
  const cancelOnVoidSignal = abortModifyLoyaltyAccountController.signal
  return coordinatorFetch(`/Loyalty/account/${accountId}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify({
      FirstName: firstName,
      LastName: lastName,
      Street: street,
      Apartment: apartment,
      City: city,
      State: state,
      PostCode: zip,
      HomePhone: phone,
      EmailAddress: email,
      Country: 'USA'
    }),
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator enroll loyalty account endpoint
 * @param {string} firstName First name
 * @param {string} lastName Last name
 * @param {string} street Street address
 * @param {string} city City
 * @param {string} state State
 * @param {string} zip Zip code
 * @param {string} phone Phone number
 * @param {string} email Email
 * @param {number} storeNumber Store number
 * @param {string} accountId Loyalty account number
 * @returns {Promise<Response>} Return loyalty customer data, if successful
 */
export const enrollLoyaltyAccount = (
  firstName: string,
  lastName: string,
  street: string,
  apartment: string,
  city: string,
  state: string,
  zip: string,
  phone: string,
  email: string,
  storeNumber: number
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'enrollLoyaltyAccount\n' + JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    street: street,
    apartment: apartment,
    city: city,
    state: state,
    postCode: zip,
    phone: phone,
    emailAddress: email,
    storeNumber: storeNumber
  }))
  abortEnrollLoyaltyAccountController = new AbortController()
  const cancelOnVoidSignal = abortEnrollLoyaltyAccountController.signal
  return coordinatorFetch('/Loyalty/account', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify({
      FirstName: firstName,
      LastName: lastName,
      Street: street,
      Apartment: apartment,
      City: city,
      State: state,
      PostCode: zip,
      HomePhone: phone,
      EmailAddress: email,
      Country: 'USA'
    }),
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator endpoint to get city and state by zip code
 * @param {string} zip Zip code
 * @returns {Promise<Response>} Return city and state, if successful
 */
export const getCityStateByZip = (zip: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getCityStateByZip\n' + JSON.stringify({ zip: zip }))
  return coordinatorFetch(`/Loyalty/zip/${zip}`)
}

/**
 * Call coordinator feature flag endpoint
 * @param {number} storeNumber Store number
 * @param {number} registerNumber Register number
 * @param {string | number} associateId Associate id
 * @returns {Promise<Response>} Return feature flag data, if successful
 */
export const getFeatureFlags = (
  storeNumber: number,
  registerNumber: number,
  associateId: string | number
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getFeatureFlags\n' + JSON.stringify({
    storeNumber: storeNumber,
    registerNumber: registerNumber,
    associateId: associateId
  }))
  abortGetFeatureFlagsController = new AbortController()
  const cancelOnVoidSignal = abortGetFeatureFlagsController.signal
  return coordinatorFetch(
    `/Features/${storeNumber}/${registerNumber}/${associateId}`,
    { signal: cancelOnVoidSignal },
    true
  )
}

export const getFeatureFlagsAndConfiguration = (
  chain: number,
  storeNumber: number,
  registerNumber: number,
  associateId: string | number
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getFeatureFlagsAndConfiguration\n' + JSON.stringify({
    chain: chain,
    storeNumber: storeNumber,
    registerNumber: registerNumber,
    associateId: associateId
  }))
  return coordinatorFetch(
    `/Configuration/Settings?chain=${chain}&storeNumber=${storeNumber}&registerNumber=${registerNumber}&associateId=${associateId}`,
    {},
    true
  )
}

export const performCoordinatorHealthCheck = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'performCoordinatorHealthCheck')

  return fetch(`${coordinatorUrlSlicedForHealthCheck}/health`, {
    method: 'GET'
  })
}

/**
 * Call coordinator feedback endpoint
 * @param {string} feedback User feedback
 * @param {string} associateFirstName associate first name
 */
export const submitFeedback = (
  feedbackType: number,
  associateFirstName: string,
  feedback: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'submitFeedback\n' + JSON.stringify({
    feedbackType: feedbackType,
    associateFirstName: associateFirstName,
    feedback: feedback
  }))
  const feedbackRequest = {
    message: feedback,
    associateFirstName: associateFirstName,
    feedbackType: feedbackType,
    sent: (new Date()).toString()
  }
  return coordinatorFetch('/Feedback/SendFeedback', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(feedbackRequest)
  })
}

/**
 * Call coordinator void feedback endpoint
 * @param {number} associateId Associate
 * @param {string} associateFirstName associate first name
 * @param {number} transactionNumber Transaction number
 * @param {string} message Void feedback message
 */
export const sendVoidFeedback = (
  associateId: number,
  associateFirstName: string,
  transactionNumber: number,
  message: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'sendVoidFeedback\n' + JSON.stringify({
    associateId: associateId,
    associateFirstName: associateFirstName,
    transactionNumber: transactionNumber,
    message: message
  }))
  const feedbackDetails = {
    message: message,
    associateFirstName: associateFirstName,
    sent: (new Date()).toString(),
    associateId: associateId
  }
  return coordinatorFetch(`/Feedback/Void/${transactionNumber}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(feedbackDetails)
  })
}

/**
 * Call coordinator suspend feedback endpoint
 * @param {number} associateId Associate id
 * @param {string} associateFirstName associate first name
 * @param {number} transactionNumber Transaction number
 * @param {string} message Void feedback message
 */
export const sendSuspendFeedback = (
  associateId: number,
  associateFirstName: string,
  transactionNumber: number,
  message: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'sendSuspendFeedback\n' + JSON.stringify({
    associateId: associateId,
    associateFirstName: associateFirstName,
    transactionNumber: transactionNumber,
    message: message
  }))
  const feedbackDetails = {
    message: message,
    associateFirstName: associateFirstName,
    sent: (new Date()).toString(),
    associateId: associateId
  }
  return coordinatorFetch(`/Feedback/Suspend/${transactionNumber}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(feedbackDetails)
  })
}

/**
 * Calls coordinator omnisearch endpoint
 * @param {string} query Search query
 * @param {string} associateId Associate id
 * @param {string} age Age of customer
 * @returns {Promise<Response>} Return transaction data or loyalty data, if successful
 */
export const omniSearch = async (
  query: string,
  associateId: string,
  age?: string,
  sellingAssociateId?: string
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'omniSearch\n' + JSON.stringify({
    query: query,
    associateId: associateId,
    age: age,
    sellingAssociateId: sellingAssociateId
  }))
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch(`/OmniSearch${age ? '?age=' + age : ''}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    method: 'POST',
    body: JSON.stringify({ query, associateId, sellingAssociateId })
  })
}

/**
 * Call coordinator warranty endpoint
 * @returns {Promise<Response>} Return warranty data, if successful
 */
export const fetchWarranties = (): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'fetchWarranties')
  abortFetchWarrantiesController = new AbortController()
  const cancelOnVoidSignal = abortFetchWarrantiesController.signal
  return coordinatorFetch('/Warranty/AvailableWarranties', {
    signal: cancelOnVoidSignal
  })
}

/**
 * Call coordinator add warranty endpoint
 * @param {WarrantySelectionsType} warranties Array of warranties
 * @returns {Promise<Response>} Return transaction data, if successful
 */
export const addWarranties = (
  warranties: WarrantySelectionsType
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'addWarranties\n' + JSON.stringify({ warranties: warranties }))
  return coordinatorFetch('/Warranty/AddToTransaction', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(warranties)
  })
}

export const setGiftReceipts = (
  items: Array<number>
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'setGiftReceipts\n' + JSON.stringify({ items: items }))
  return coordinatorFetch('/Product/GiftReceipts', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(items)
  })
}

/**
 * Calls coordinator survey results endpoint
 * @param {number} status Survey status - 0 = skipped, 1 = auto dismissed, 2 = answered
 * @param {number} rank Survey response from athlete
 * @param {number} transactionNumber
 * @returns {Promise<Response>} Nothing
 */
export const sendSurveyResults = (
  status: number,
  rank: number,
  transactionNumber: number
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'sendSurveyResults\n' + JSON.stringify({
    result: status,
    rank: rank,
    transactionNumber: transactionNumber
  }))
  return coordinatorFetch('/Survey/CustomerSatisfaction', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      result: status,
      rank: rank,
      transactionNumber: transactionNumber
    })
  })
}

export const getReturns = (orderNum: string): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getReturns\n' + JSON.stringify({ orderNum: orderNum }))
  abortGetReturnsController = new AbortController()
  const cancelOnVoidSignal = abortGetReturnsController.signal
  return coordinatorFetch(`/Returns/${orderNum}`, {
    method: 'GET',
    signal: cancelOnVoidSignal
  })
}

export const addReturnItems = async (returnReq: ReturnRequestType, returnOriginationType?: ReturnOriginationEnumType): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'getReturns\n' + JSON.stringify(returnReq))
  const loyaltyReturnReq = {
    ...returnReq,
    returnOriginationType: returnOriginationType
  }
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Returns/AddReturnItems', {
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    method: 'POST',
    body: JSON.stringify(returnOriginationType ? loyaltyReturnReq : returnReq)
  })
}

export interface PostVoidTransactionDataTypes extends TransactionDataTypes {
  managerId?: string
  managerPin?: string
}

export const postVoidTransaction = async (transaction: PostVoidTransactionDataTypes): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'postVoidLastTransaction\n' + JSON.stringify(transaction))
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Transaction/PostVoidTransaction', {
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    method: 'POST',
    body: JSON.stringify(transaction)
  })
}

export const authorizeReturn = async (identificationDetails = null): Promise<Response> => {
  console.info('Enter: ' + loggingHeader + 'authorizeReturn\n')
  return coordinatorFetch('/Returns/Authorize', {
    method: 'Post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(identificationDetails)
  })
}

export interface OverrideCouponType {
  couponCode: string
  couponOverrideDetail: {
    overrideType: number
    dollarOrPercentOff?: number
  }
}

export const overrideCoupon = async (
  request: OverrideCouponType
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'overrideCoupon\n' + JSON.stringify(request))
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Coupon', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json-patch+json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify(request)
  })
}
interface CoordinatorFetchOptionsType {
  headers?
  method?
  body?
  signal?
}
const coordinatorFetch = async (path: string, options?: CoordinatorFetchOptionsType, bypassAuth?: boolean, canUseLookupAuth?: boolean): Promise<Response> => {
  const state = window.reduxStore.getState()
  const transactionKey = state.transactionData?.header?.transactionKey
  if (!options) {
    options = {}
  }
  if (!options.headers) {
    options.headers = {}
  }
  if (transactionKey) {
    options.headers['X-DSG-TransactionKey'] = transactionKey
  }
  if (!bypassAuth) {
    if (canUseLookupAuth && token === '') {
      const lookupToken = await getLookupToken(
        state.registerData?.storeNumber,
        state.registerData?.registerNumber
      )
      options.headers.Authorization = `Bearer ${lookupToken}`
    } else {
      options.headers.Authorization = `Bearer ${token}`
    }
  }

  return fetch(`${coordinatorUrl}${path}`, options)
}

export interface SetGiftCardAmountType {
  accountNumber: string
  expirationDate: string
  amount: number
  transactionItemIdentifier: number
  adyenTransactionId: string
  adyenTimestamp: string
}

export const setGiftCardAmount = async (
  request: SetGiftCardAmountType
): Promise<Response> => {
  console.info('ENTER: ' + loggingHeader + 'setGiftCardAmount\n' + JSON.stringify(request))

  return coordinatorFetch('/GiftCard', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    body: JSON.stringify(request)
  })
}

export const newGiftCard = async (
  accountNumber: string
): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/GiftCard', {
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    method: 'POST',
    body: JSON.stringify({
      accountNumber: accountNumber
    })
  })
}

export const removeGiftCard = async (
  transactionItemIdentifier: number
): Promise<Response> => {
  return coordinatorFetch('/GiftCard/' + transactionItemIdentifier.toString(), {
    method: 'DELETE'
  })
}

export const fetchLowestReturnPrice = async (
  upc: string
): Promise<Response> => {
  return coordinatorFetch(`/Returns/NonReceiptedProduct/${upc}`, {
    method: 'GET'
  }, false, true)
}

export const addTradeInItems = async (itemsArray): Promise<Response> => {
  return coordinatorFetch('/Returns/AddTradeInItems/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nonReceiptedReturnItems: itemsArray
    })
  })
}

export const addNonReceiptedReturnItems = async (
  itemsArray
): Promise<Response> => {
  return coordinatorFetch('/Returns/AddNonReceiptedReturnItems/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nonReceiptedReturnItems: itemsArray
    })
  })
}

export const removeReward = async (
  rewardCertificateNumber
): Promise<Response> => {
  return coordinatorFetch(`/Loyalty/RewardCertificate/${rewardCertificateNumber}`, {
    method: 'DELETE'
  })
}

export const applyManualTransactionDiscount = async (
  request
): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Discount/Transaction/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify(request)
  })
}

export const applyManualItemDiscount = async (
  request,
  transactionItemID
): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch(`/Discount/Item/${transactionItemID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify(request)
  })
}

export const fetchProductLookupSearchResults = async (
  searchTerm: string
): Promise<Response> => {
  return coordinatorFetch(`/ProductLookup/Search/${searchTerm}`, {
    method: 'GET'
  }, false, true)
}

export const fetchProductLookupDetails = async (
  upc: string
): Promise<Response> => {
  return coordinatorFetch(`/ProductLookup/Details/${upc}`, {
    method: 'GET'
  }, false, true)
}

export const fetchProductLookupCategories = async (): Promise<Response> => {
  return coordinatorFetch('/ProductLookup/Categories/', {
    method: 'GET'
  }, false, true)
}

export const fetchProductPricing = async (
  sku: string
): Promise<Response> => {
  return coordinatorFetch(`/Pricing/PriceBySku/${sku}`, {
    method: 'GET'
  }, false, true)
}

export const getReturnsByLoyalty = async (
  accountNumber: string
): Promise<Response> => {
  return coordinatorFetch(`/Returns/Loyalty/${accountNumber}`, {
    method: 'GET'
  })
}

export const getReturnsByCreditCardOrderList = async (
  orderNumbers: Array<string>
): Promise<Response> => {
  const orderNumberQuery = '?orderNumbers=' + orderNumbers.join('&orderNumbers=')
  return coordinatorFetch(`/Returns/OrdersFromCreditCardLookup${orderNumberQuery}`, {
    method: 'GET'
  })
}

export const getSurveyConfiguration = async () : Promise<Response> => {
  return coordinatorFetch('/Survey/Configuration/', {
    method: 'GET'
  }, false, false)
}

export const sendSurveyResponse = async (
  request
): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Survey/Feedback/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify(request)
  })
}

export const addAssociateDiscount = async (request): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/Discount/Associate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify(request)
  })
}

export const addTaxExemptInfromation = async (
  customerNumber: string
): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
  return coordinatorFetch('/TaxExempt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json-patch+json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify({
      customerNumber: customerNumber
    })
  })
}

export const createComplimentaryGiftCard = async (request): Promise<Response> => {
  const applicationVersionNumber = await Storage.getData('applicationVersionNmber')
  return coordinatorFetch('/Transaction/ComplimentaryGiftCard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json-patch+json',
      'X-DSG-VersionNumber-ReactPos': buildNumber,
      'X-DSG-VersionNumber-PosLauncher': applicationVersionNumber
    },
    body: JSON.stringify(request)
  })
}

export const getCurrentTransactionNumber = async (): Promise<Response> => {
  return coordinatorFetch('/Transaction/TransactionNumber', {
    method: 'GET'
  })
}
