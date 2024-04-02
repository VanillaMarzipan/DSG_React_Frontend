import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as TransactionActions from './transactionActions'
import * as Storage from '../utils/asyncStorage'
import { formatPhoneNumber } from '../utils/formatters'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { Customer, EmailConfirmationChoice, InvalidReward, LoyaltyDataTypes } from '../reducers/loyaltyData'
import { receiveUiData, updateLoadingStates } from './uiActions'
import Queue from '../utils/queue'
import { receiveCreditEnrollmentData } from './creditEnrollmentActions'
import { AppDispatch } from '../Main'
import { loyaltyAccountStorageLatch } from '../utils/reusableStrings'

export const UPDATE_LOYALTY_DATA = 'UPDATE_LOYALTY_DATA'

const loggingHeader = 'actions > loyaltyActions > '
/**
 * Updates loyalty data Redux store
 * @param {LoyaltyDataTypes} data Loyalty data
 */
export const receiveLoyaltyData = (data: LoyaltyDataTypes) => (dispatch: AppDispatch) => {
  console.info('ENTER: ' + loggingHeader + 'receiveLoyaltyData\n' + JSON.stringify({
    data: data
  }))
  return dispatch(updateLoyaltyData(data, UPDATE_LOYALTY_DATA))
}

/**
 * Loyalty data action creator
 * @param {LoyaltyDataTypes} data Loyalty data
 * @param {string} actionType Loyalty action type
 * @returns An action object containing an action type and data
 */
export const updateLoyaltyData = (
  data: LoyaltyDataTypes,
  actionType: string
): { type: string; data: LoyaltyDataTypes } => {
  console.info('ENTER: ' + loggingHeader + 'updateLoyaltyData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

/**
 * Update loyalty data based on the number of loyalty accounts in data. If only 1 account, also call addLoyaltyToTransaction().
 * @param {any} dispatch Redux dispatch function
 * @param {Customer[]} data Array of loyalty customer(s)
 * @param {string} phoneNumber Loyalty account phone number
 */
export const processLoyaltyLookup = (
  dispatch: AppDispatch,
  data: Customer[],
  phoneNumber: string
): void => {
  console.info('BEGIN: ' + loggingHeader + 'processLoyaltyLookup\n' + JSON.stringify({
    data: data,
    phoneNumber: phoneNumber
  }))

  data.forEach(el => {
    if (!el.firstName || el.firstName === '') {
      console.warn('Customer first name is null or empty\n' + JSON.stringify(el))
    }
    if (!el.lastName || el.lastName === '') {
      console.warn('Customer last name is null or empty\n' + JSON.stringify(el))
    }

    if (!el.loyalty || el.loyalty === '') {
      console.warn("Customer loyalty number invalid. Can't be null or empty\n" + JSON.stringify(el))
      throw new Error("Customer loyalty number invalid. Can't be null or empty")
    }
  })
  sendRumRunnerEvent('Scorecard Lookup Results', { count: data.length })
  if (data.length > 1) {
    console.info(loggingHeader + 'processLoyaltyLookup: More than one customer')
    dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL' }))
    dispatch(
      updateLoyaltyData(
        {
          loyaltyCustomers: data.slice(0, 11),
          altScreenName: null,
          lastPhoneLookup: formatPhoneNumber(phoneNumber),
          phoneInput: phoneNumber,
          phoneOutput: formatPhoneNumber(phoneNumber),
          accountLookupFailure: false,
          isNoAccountFound: true
        },
        UPDATE_LOYALTY_DATA
      )
    )
  } else {
    console.info(loggingHeader + 'processLoyaltyLookup: Zero or one customers')
    dispatch(updateLoyaltyData(
      {
        loyaltyCustomers: data,
        accountLookupFailure: phoneNumber.toUpperCase().startsWith('L') && data.length === 0
      },
      UPDATE_LOYALTY_DATA)
    )
  }

  if (data.length === 1) {
    console.info(loggingHeader + 'processLoyaltyLookup: One customer')
    dispatch(
      updateLoyaltyData(
        {
          isNoAccountFound: false
        },
        UPDATE_LOYALTY_DATA
      )
    )
    data[0]?.loyalty && dispatch(addLoyaltyAccountToTransaction(data[0]))

    dispatch(receiveUiData({ selectedItem: null }))
  }

  if (data.length === 0) {
    console.info(loggingHeader + 'processLoyaltyLookup: Zero customers')
    if (!phoneNumber.toUpperCase().startsWith('L')) {
      dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL', autofocusTextbox: 'LoyaltyAdvancedSearch' }))
      dispatch(
        updateLoyaltyData(
          {
            altScreenName: 'advanced',
            lastPhoneLookup: formatPhoneNumber(phoneNumber),
            phoneInput: phoneNumber,
            phoneOutput: formatPhoneNumber(phoneNumber),
            isNoAccountFound: true,
            selectedLoyaltyCustomer: null
          },
          UPDATE_LOYALTY_DATA
        )
      )
    } else {
      dispatch(
        updateLoyaltyData(
          {
            altScreenName: 'advanced',
            lastPhoneLookup: phoneNumber,
            phoneInput: phoneNumber,
            phoneOutput: phoneNumber,
            isNoAccountFound: true,
            selectedLoyaltyCustomer: null
          },
          UPDATE_LOYALTY_DATA
        )
      )
      dispatch(
        receiveUiData({
          selectedItem: 'LOYALTY_PANEL',
          scanError: true,
          scanErrorMessage: 'Unknown Barcode. Please Try Searching By Phone Number.',
          clearUpc: false,
          showModal: false
        })
      )
    }
  }
  console.info('END: ' + loggingHeader + 'processLoyaltyLookup')
}

/**
 * Gets loyalty account data based on phone number and updates loyalty Redux store. Redux thunk.
 * @param {string} phoneInput Loyalty phone number
 * @param callOrigin
 * @param enrollmentLookupStep
 * @async
 */
export const fetchLoyalty = (phoneInput: string, callOrigin?: string, enrollmentLookupStep?: number) => async (
  dispatch: AppDispatch
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchLoyalty')
  const onLoadingState = callOrigin === 'creditEnrollment' ? { creditEnrollment: true } : { loyaltyLookup: true }
  const offLoadingState = callOrigin === 'creditEnrollment' ? { creditEnrollment: false } : { loyaltyLookup: false }
  dispatch(updateLoadingStates(onLoadingState))
  dispatch(
    updateLoyaltyData(
      {
        altScreenName: null,
        phoneOutput: formatPhoneNumber(phoneInput),
        phoneInput: phoneInput,
        lastPhoneLookup: formatPhoneNumber(phoneInput)
      },
      UPDATE_LOYALTY_DATA
    )
  )
  CoordinatorAPI.getLoyaltyAccountPhone(phoneInput)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'fetchLoyalty: Could not retrieve loyalty data\n' + JSON.stringify(res))
        dispatch(
          updateLoyaltyData(
            {
              loyaltyError: res.status,
              retryParameters: { phone: phoneInput },
              retryType: 'phone'
            },
            UPDATE_LOYALTY_DATA
          )
        )
        return null
      }
      return res.json()
    })
    .then(data => {
      dispatch(updateLoadingStates(offLoadingState))
      if (!data) {
        return
      }

      console.info(loggingHeader + 'fetchLoyalty: success\n' + JSON.stringify(data))

      if (!Array.isArray(data)) {
        throw new Error('Loyalty response must be an array')
      }

      if (callOrigin === 'creditEnrollment') {
        if (data.length === 1) {
          dispatch(
            updateLoyaltyData({
              selectedLoyaltyCustomer: data[0],
              isNoAccountFound: false
            }, UPDATE_LOYALTY_DATA)
          )
          dispatch(receiveCreditEnrollmentData({
            enrollmentLookupStep: enrollmentLookupStep + 1,
            loyaltyLookupStatus: 'successOneAccount'
          }))
        } else if (data.length === 0) {
          dispatch(receiveCreditEnrollmentData({ loyaltyLookupStatus: 'noAccountFound' }))
        } else if (data.length > 0) {
          dispatch(receiveCreditEnrollmentData({ loyaltyLookupStatus: 'successMultipleAccounts' }))
        }
      } else {
        processLoyaltyLookup(dispatch, data, phoneInput)
      }

      sendRumRunnerEvent('Loyalty Account Lookup', {
        lookupBy: 'phone',
        numberOfResults: data.length
      })
    })
    .catch(error => {
      console.error(loggingHeader + 'fetchLoyalty: Error\n' + JSON.stringify(error))
      dispatch(updateLoadingStates(offLoadingState))
      setTimeout(() => {
        dispatch(
          receiveUiData({
            showModal: 'error',
            modalErrorMessage: 'Error looking up customer - ' + error
          })
        )
      }, 500)
    })
  console.info('END: ' + loggingHeader + 'fetchLoyalty')
}

/**
 * Gets loyalty customer data based on name and zip. If only one customer exists, add to transaction. If no customers exist, auto fill entered info on enrollment form. Redux thunk.
 * @param {string} firstName First name
 * @param {string} lastName Last Name
 * @param {string} zip Zip code
 * @param {string} lastItem Name or id of last item selected
 * @async
 */
export const fetchLoyaltyAdvanced = (
  firstName: string,
  lastName: string,
  zip: string,
  lastItem?: string
) => async (dispatch: AppDispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchLoyaltyAdvanced\n' + JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    zip: zip,
    lastItem: lastItem
  }))
  dispatch(updateLoadingStates({ loyaltyAdvanced: true }))
  CoordinatorAPI.getLoyaltyAccountNameZip(firstName, lastName, zip)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'fetchLoyaltyAdvanced: Could not retrieve loyalty data\n' + JSON.stringify(res))
        dispatch(
          updateLoyaltyData(
            {
              loyaltyError: res.status,
              retryType: 'advanced',
              retryParameters: {
                firstName: firstName,
                lastName: lastName,
                zip: zip,
                lastItem: lastItem
              }
            },
            UPDATE_LOYALTY_DATA
          )
        )
        throw new Error('Could not retrieve loyalty data')
      }
      return res.json()
    })
    .then(data => {
      console.info(loggingHeader + 'fetchLoyaltyAdvanced: success\n' + JSON.stringify(data))
      if (data.length > 1) {
        console.info(loggingHeader + 'fetchLoyaltyAdvanced: found more than one customer')
        dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL' }))
        dispatch(
          updateLoyaltyData(
            {
              loyaltyCustomers: data.slice(0, 11),
              altScreenName: null
            },
            UPDATE_LOYALTY_DATA
          )
        )
      } else {
        console.info(loggingHeader + 'fetchLoyaltyAdvanced: found zero or one customers')
        dispatch(
          updateLoyaltyData({
            loyaltyCustomers: data
          }, UPDATE_LOYALTY_DATA)
        )
      }

      if (data.length === 1) {
        console.info(loggingHeader + 'fetchLoyaltyAdvanced: found one customer')
        dispatch(
          updateLoyaltyData({
            selectedLoyaltyCustomer: data[0],
            isNoAccountFound: false
          }, UPDATE_LOYALTY_DATA)
        )
        dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
        dispatch(addLoyaltyAccountToTransaction(data[0]))
        dispatch(selectItemPanel(lastItem))
      }

      if (data.length === 0) {
        console.info(loggingHeader + 'fetchLoyaltyAdvanced: found zero customers')
        dispatch(
          updateLoyaltyData(
            {
              firstNameInput: firstName,
              lastNameInput: lastName,
              zipInput: zip,
              isNoAccountFound: true,
              altScreenName: 'enrollment',
              lastCustomerLookup: firstName + ' ' + lastName,
              lastPhoneLookup: null
            },
            UPDATE_LOYALTY_DATA
          )
        )
        dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL', autofocusTextbox: 'LoyaltyAdvancedSearch', activePanel: 'scanDetailsPanel' }))
      }
      dispatch(updateLoadingStates({ loyaltyAdvanced: false }))
      sendRumRunnerEvent('Loyalty Account Lookup', {
        lookupBy: 'advanced',
        numberOfResults: data.length
      })
    })
    .catch(error => {
      dispatch(updateLoadingStates({ loyaltyAdvanced: false }))
      console.error(loggingHeader + 'fetchLoyaltyAdvanced: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'fetchLoyaltyAdvanced')
}

/**
 * Adds loyalty account to transaction and updates transaction data.
 * @param {Customer} loyaltyData Loyalty account
 * @async
 */
export const addLoyaltyAccountToTransaction = (loyaltyData: Customer, isEnrollment?: boolean) => async (
  dispatch: AppDispatch
): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'addLoyaltyAccountToTransaction\n' + JSON.stringify({
    loyaltyNumber: loyaltyData.loyalty
  }))
  dispatch(updateLoadingStates({ addLoyaltyToTransaction: true }))
  Queue.enqueue(() => CoordinatorAPI.addLoyaltyAccount(loyaltyData.loyalty), 'addLoyaltyAccount')
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'addLoyaltyAccountToTransaction: Could not add loyalty account to transaction\n' + JSON.stringify(res))
        throw new Error('Could not add loyalty account to transaction')
      } else {
        return res.json()
      }
    })
    .then(data => {
      dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL' }))
      dispatch(updateLoadingStates({ addLoyaltyToTransaction: false }))
      console.info(loggingHeader + 'addLoyaltyAccountToTransaction: success\n' + JSON.stringify(data))
      dispatch(TransactionActions.receiveTransactionData(data))

      dispatch(
        updateLoyaltyData(
          { selectedLoyaltyCustomer: loyaltyData, altScreenName: isEnrollment ? 'confirmation' : 'details' },
          UPDATE_LOYALTY_DATA
        )
      )
      dispatch(accountLevelDetails(loyaltyData.loyalty))
      Queue.dequeue()
    })
    .catch(error => {
      console.error(loggingHeader + 'addLoyaltyAccountToTransaction: Error\n' + JSON.stringify(error))
      dispatch(updateLoadingStates({ addLoyaltyToTransaction: false }))

      setTimeout(() => {
        dispatch(
          updateLoyaltyData(
            {
              loyaltyError: error,
              retryType: 'accountNumber',
              retryParameters: { loyaltyAccount: loyaltyData.loyalty }
            },
            UPDATE_LOYALTY_DATA
          )
        )
        Queue.dequeue()
      }, 500)
    })
  console.info('END: ' + loggingHeader + 'addLoyaltyAccountToTransaction')
}

/**
 * Get all cities and the state associated with a zip code
 * @param {string} zip Zip code
 * @returns {Promise<(string[]| string)[]>} All cities and a state
 * @async
 */
export const fetchCityStateByZip = (zip: string) => async (): Promise<CityStateResponse> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchCityStateByZip\n' + JSON.stringify({
    zip: zip
  }))
  const cities = []
  let state = ''
  if (zip.length === 5 && !zip.includes(' ')) {
    await CoordinatorAPI.getCityStateByZip(zip)
      .then(res => {
        if (!res.ok) {
          console.warn(loggingHeader + 'fetchCityStateByZip: could not get City and State\n' + JSON.stringify(res))
          throw new Error('could not get City and State')
        }
        return res.json()
      })
      .then(data => {
        console.info(loggingHeader + 'fetchCityStateByZip: success\n' + JSON.stringify(data))
        if (data.length > 0) {
          state = data[0].state
          for (const object in data) {
            cities.push(
              data[object].city.replace(/\w\S*/g, function (txt) {
                if (typeof txt === 'string') {
                  return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
                } else {
                  return ''
                }
              })
            )
          }
        }
      })
      .catch(error => console.error(loggingHeader + 'fetchCityStateByZip: Error\n' + JSON.stringify(error)))
  }
  console.info('END: ' + loggingHeader + 'fetchCityStateByZip\n' + JSON.stringify([cities, state]))
  return { cities: cities, state: state }
}

export interface CityStateResponse {
  cities: string[]
  state: string
}

/**
 * Modify loyalty account, if successful, update Redux loyalty store
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} street
 * @param {string} city
 * @param {string} state
 * @param {string} zip
 * @param {string} phone
 * @param {string} email
 * @param {number} storeNumber
 * @param {string} accountId
 * @param {string} selectedItem Currently selected item
 * @param {Customer} selectedCustomer Currently selected customer object
 * @async
 */
export const modifyAccount = (
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
  accountId: string,
  selectedItem: string,
  selectedCustomer: Customer
) => async (dispatch: AppDispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'modifyAccount\n' + JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    street: street,
    apartment: apartment,
    city: city,
    state: state,
    zip: zip,
    phone: phone,
    email: email,
    storeNumber: storeNumber,
    accountId: accountId,
    selectedItem: selectedItem,
    selectedCustomer: selectedCustomer
  }))

  const activeLatchStatus = 'active'
  const latch = await Storage.getData(loyaltyAccountStorageLatch)
  if (latch === activeLatchStatus) {
    console.warn('modifyLoyaltyAccount already processing [matching latch: ', activeLatchStatus, ']')
    return
  }
  await Storage.storeData(loyaltyAccountStorageLatch, activeLatchStatus)

  dispatch(updateLoadingStates({ loyaltyEdit: true }))
  CoordinatorAPI.modifyLoyaltyAccount(
    firstName,
    lastName,
    street,
    apartment,
    city,
    state,
    zip,
    phone,
    email,
    storeNumber,
    accountId
  )
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'modifyAccount: Could not modify customer account\n' + JSON.stringify(res))
        if (res.status === 400) {
          return res.json()
        } else {
          throw new Error('Could not modify customer account')
        }
      }
      const newCustomer = { ...selectedCustomer }
      newCustomer.firstName = firstName
      newCustomer.lastName = lastName
      newCustomer.emailAddress = email
      newCustomer.street = street
      newCustomer.apartment = apartment
      newCustomer.city = city
      newCustomer.state = state
      newCustomer.zip = zip
      newCustomer.homePhone = phone
      dispatch(
        updateLoyaltyData(
          {
            selectedLoyaltyCustomer: newCustomer,
            errorFields: []
          },
          UPDATE_LOYALTY_DATA
        )
      )
      dispatch(receiveUiData({ selectedItem: selectedItem }))
    })
    .then(async data => {
      console.info(loggingHeader + 'modifyAccount: success\n' + JSON.stringify(data))
      dispatch(updateLoadingStates({ loyaltyEdit: false }))
      if (data) {
        dispatch(
          updateLoyaltyData(
            {
              errorFields: JSON.parse(data.message.toLowerCase())
            },
            UPDATE_LOYALTY_DATA
          )
        )
      }
      await Storage.removeItems([loyaltyAccountStorageLatch])
    })
    .catch(async error => {
      await Storage.removeItems([loyaltyAccountStorageLatch])
      dispatch(updateLoadingStates({ loyaltyEdit: false }))
      console.error(loggingHeader + 'modifyAccount: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'modifyAccount')
}

/**
 * Enroll customer in loyalty program, if customer is already enrolled, display edit enrollment screen.
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} street
 * @param {string} city
 * @param {string} state
 * @param {string} zip
 * @param {string} phone
 * @param {string} email
 * @param {number} storeNumber
 * @async
 */
export const createAccount = (
  firstName?: string,
  lastName?: string,
  street?: string,
  apartment?: string,
  city?: string,
  state?: string,
  zip?: string,
  phone?: string,
  email?: string,
  storeNumber?: number
) => async (dispatch: AppDispatch): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'fetchEnrollment\n' + JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    street: street,
    apartment: apartment,
    city: city,
    state: state,
    zip: zip,
    phone: phone,
    email: email,
    storeNumber: storeNumber
  }))

  const activeLatchStatus = 'active'
  const latch = await Storage.getData(loyaltyAccountStorageLatch)
  if (latch === activeLatchStatus) {
    console.warn('createLoyaltyAccount already processing [matching latch: ', activeLatchStatus, ']')
    return
  }
  await Storage.storeData(loyaltyAccountStorageLatch, activeLatchStatus)

  dispatch(updateLoadingStates({ loyaltyEnrollment: true }))
  let responseCode = 0
  CoordinatorAPI.enrollLoyaltyAccount(
    firstName,
    lastName,
    street,
    apartment,
    city,
    state,
    zip,
    phone,
    email,
    storeNumber
  )
    .then(res => {
      if (!res.ok && res.status !== 409) {
        console.warn(loggingHeader + 'fetchEnrollment: status ' + res.status.toString() + '\n' + JSON.stringify(res))
        dispatch(updateLoadingStates({ loyaltyEnrollment: false }))
        dispatch(
          updateLoyaltyData(
            {
              loyaltyError: res.status,
              retryType: 'enroll',
              retryParameters: {
                firstName: firstName,
                lastName: lastName,
                street: street,
                apartment: apartment,
                city: city,
                state: state,
                zip: zip,
                phone: phone,
                email: email,
                storeNumber: storeNumber
              }
            },
            UPDATE_LOYALTY_DATA
          )
        )
        sendRumRunnerEvent('Loyalty Enrollment', {
          statusCode: res.status
        })
      }
      responseCode = res.status
      return res.json()
    })
    .then(async data => {
      dispatch(updateLoadingStates({ loyaltyEnrollment: false }))
      if (responseCode !== 200 && responseCode !== 409) {
        console.warn(loggingHeader + 'fetchEnrollment: responseCode === 400\n' + JSON.stringify(data))
        dispatch(
          updateLoyaltyData(
            {
              errorFields: JSON.parse(data.message.toLowerCase())
            },
            UPDATE_LOYALTY_DATA
          )
        )
        sendRumRunnerEvent('Loyalty Enrollment', {
          statusCode: responseCode
        })
      } else {
        console.warn(loggingHeader + 'fetchEnrollment: responseCode != 400\n' + JSON.stringify(data))
        dispatch(
          updateLoyaltyData(
            {
              firstNameInput: firstName,
              lastNameInput: lastName,
              zipInput: zip,
              selectedLoyaltyCustomer: data,
              errorFields: [],
              altScreenName: 'confirmation',
              isNoAccountFound: false
            },
            UPDATE_LOYALTY_DATA
          )
        )
        dispatch(addLoyaltyAccountToTransaction(data, true))
        sendRumRunnerEvent('Loyalty Enrollment', {
          statusCode: responseCode
        })
        if (responseCode === 409) {
          console.warn(loggingHeader + 'fetchEnrollment: responseCode === 409\n' + JSON.stringify(data))
          // 409 means the account already exits. Edit account screen is shown.
          dispatch(
            receiveUiData({
              selectedItem: 'LOYALTY_PANEL'
            })
          )
          dispatch(
            receiveLoyaltyData({ errorFields: ['EmailAddress'], altScreenName: 'edit' })
          )
        }
      }
      await Storage.removeItems([loyaltyAccountStorageLatch])
    })
    .catch(async error => {
      await Storage.removeItems([loyaltyAccountStorageLatch])
      dispatch(updateLoadingStates({ loyaltyEnrollment: false }))
      console.error(loggingHeader + 'fetchEnrollment: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'fetchEnrollment')
}

/**
 * Displays loyalty edit panel and sets phoneInput and phoneOutput in Redux loyalty store
 * @param {string} phoneNumber
 */
export const selectLoyaltyEditPanel = (phoneNumber: string) => (
  dispatch: AppDispatch
): void => {
  console.info('BEGIN: ' + loggingHeader + 'selectLoyaltyEditPanel\n' + JSON.stringify({
    phoneNumber: phoneNumber
  }))
  dispatch(
    receiveLoyaltyData({
      altScreenName: 'edit',
      phoneInput: phoneNumber,
      phoneOutput: formatPhoneNumber(phoneNumber)
    })
  )
  console.info('END: ' + loggingHeader + 'selectLoyaltyEditPanel')
}

/**
 * Displays loyalty customer details panel
 */
export const selectLoyaltyPanel = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'selectLoyaltyPanel')
  dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL' }))
  dispatch(receiveLoyaltyData({ altScreenName: 'details' }))
  console.info('END: ' + loggingHeader + 'selectLoyaltyPanel')
}

/**
 * Displays loyalty enrollment screen
 */
export const setEnrollment = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'setEnrollment')
  dispatch(
    updateLoyaltyData({ altScreenName: 'enrollment' }, UPDATE_LOYALTY_DATA)
  )
  console.info('END: ' + loggingHeader + 'setEnrollment')
}

/**
 * Displays loyalty account details panel
 */
export const cancelEdit = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'cancelEdit')
  dispatch(
    updateLoyaltyData(
      { altScreenName: 'details', didCreatedAccountExist: false },
      UPDATE_LOYALTY_DATA
    )
  )
  console.info('END: ' + loggingHeader + 'cancelEdit')
}

/**
 * Clears all loyalty inputs
 */
export const clearText = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'clearText')
  dispatch(
    updateLoyaltyData(
      {
        phoneInput: '',
        phoneOutput: '',
        firstNameInput: '',
        lastNameInput: '',
        zipInput: '',
        isNoAccountFound: false
      },
      UPDATE_LOYALTY_DATA
    )
  )
  console.info('END: ' + loggingHeader + 'clearText')
}

/**
 * Clear all loyalty customer data from Redux store and clear loyalty inputs
 * @param {string} altScreenName Name of current panel displayed
 * @param {string | number} lastItem Name of last item or panel displayed
 */
export const clearCustomer = (
  altScreenName?: string,
  lastItem?: string | number
) => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'clearCustomer')
  dispatch(
    updateLoyaltyData(
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
        altScreenName: null,
        lastPhoneLookup: null,
        lastCustomerLookup: null,
        pinpadReceiptChoice: '',
        emailConfirmationChoice: EmailConfirmationChoice.NotSet
      },
      UPDATE_LOYALTY_DATA
    )
  )

  dispatch(clearText())
  if (altScreenName !== 'advanced' && altScreenName !== 'enrollment') {
    console.info(loggingHeader + 'clearCustomer: altScreenName not "advanced" or "enrollment"\n' + JSON.stringify({
      altScreenName: altScreenName
    }))
    dispatch(receiveUiData({ selectedItem: lastItem }))
  }
  console.info('END: ' + loggingHeader + 'clearCustomer')
}

/**
 * Remove loyalty account from transaction. Remove all loyalty data from Redux store. Clear all loyalty inputs.
 * @param {string} altScreenName Name of current panel displayed
 * @param {string | number} lastItem Name of last item or panel displayed
 */
export const removeLoyaltyAccount = (
  altScreenName: string,
  lastItem: string | number
) => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'removeLoyaltyAccount\n' + JSON.stringify({
    altScreenName: altScreenName,
    lastItem: lastItem
  }))
  dispatch(updateLoadingStates({ removeLoyaltyAccount: true }))
  CoordinatorAPI.removeLoyaltyAccount()
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'removeLoyaltyAccount: Could not remove loyalty account from transaction\n' + JSON.stringify(res))
        throw new Error('Could not remove loyalty account from transaction')
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info(loggingHeader + 'removeLoyaltyAccount: success')
      if (data.customer === undefined) {
        data.customer = null
      }
      if (data.header.transactionStatus === 3) {
        CoordinatorAPI.abortOutstandingRequestsOnVoid()
      }
      dispatch(TransactionActions.receiveTransactionData(data))
      dispatch(clearCustomer(altScreenName, lastItem))
      dispatch(receiveUiData({ selectedItem: lastItem }))
      dispatch(updateLoadingStates({ removeLoyaltyAccount: false }))
      dispatch(receiveLoyaltyData({ accountLevelDetails: null }))
      sendRumRunnerEvent('Loyalty Account Removed', {
        removed: 1
      })
    })
    .catch(error => {
      dispatch(updateLoadingStates({ removeLoyaltyAccount: false }))
      console.error(loggingHeader + 'removeLoyaltyAccount: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'removeLoyaltyAccount')
}

/**
 * Displays previous panel. Removes all loyalty data from Redux store. Clears all loyalty inputs.
 * @param {string} altScreenName Name of current panel displayed
 * @param {string | number} lastItem Name of last item or panel
 */
export const cancelEnrollment = (
  altScreenName: string,
  lastItem: string | number
) => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'cancelEnrollment')
  dispatch(clearCustomer(altScreenName, lastItem))
  dispatch(receiveUiData({ selectedItem: lastItem }))
  dispatch(receiveLoyaltyData({ altScreenName: null }))
  console.info('END: ' + loggingHeader + 'cancelEnrollment')
}

/**
 * Displays loyalty advanced search panel
 */
export const setAdvancedSearch = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'setAdvancedSearch')
  dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL', autofocusTextbox: 'LoyaltyAdvancedSearch' }))
  dispatch(receiveLoyaltyData({ altScreenName: 'advanced' }))
  console.info('END: ' + loggingHeader + 'setAdvancedSearch')
}

/**
 * Adds loyalty account to transaction. Updates loyalty data with selected loyalty customer.
 * @param {number} index Index of customer in loyaltyCustomers array to add to transaction
 * @param {Customer[]} loyaltyCustomers Array of loyalty customer objects
 */
export const selectLoyaltyAccount = (
  index: number,
  loyaltyCustomers: Customer[]
) => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'selectLoyaltyAccount\n' + JSON.stringify({
    index: index,
    loyaltyCustomers: loyaltyCustomers
  }))
  dispatch(addLoyaltyAccountToTransaction(loyaltyCustomers[index]))
  dispatch(
    updateLoyaltyData(
      {
        altScreenName: null,
        isNoAccountFound: false
      },
      UPDATE_LOYALTY_DATA
    )
  )
  console.info('END: ' + loggingHeader + 'selectLoyaltyAccount')
}

/**
 * Displays given panel
 * @param {string | number} lastItem Panel or item to display
 */
export const selectItemPanel = (lastItem: string | number) => (
  dispatch: AppDispatch
): void => {
  console.info('BEGIN: ' + loggingHeader + 'selectItemPanel\n' + JSON.stringify({
    lastItem: lastItem
  }))
  dispatch(receiveUiData({ selectedItem: lastItem }))
  dispatch(
    updateLoyaltyData(
      {
        altScreenName: null
      },
      UPDATE_LOYALTY_DATA
    )
  )
  console.info('END: ' + loggingHeader + 'selectItemPanel')
}

export const accountLevelDetails = (accountNumber: string) => (
  dispatch: AppDispatch
): void => {
  dispatch(updateLoadingStates({ accountLevelDetails: true }))
  console.info('BEGIN: ' + loggingHeader + 'accountLevelDetails')
  CoordinatorAPI.accountLevelDetails(accountNumber)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'accountLevelDetails: Could not retrieve account level details/reward certificates\n' + JSON.stringify(res))
        throw new Error('Could not retrieve available level details/reward certificates')
      }
      return res.json()
    })
    .then(data => {
      console.info(loggingHeader + 'accountLevelDetails: success\n' + JSON.stringify(data))
      dispatch(updateLoadingStates({ accountLevelDetails: false }))
      dispatch(
        updateLoyaltyData(
          { accountLevelDetails: data },
          UPDATE_LOYALTY_DATA
        )
      )
    })
    .catch(error => {
      dispatch(updateLoadingStates({ accountLevelDetails: false }))
      console.error(loggingHeader + 'accountLevelDetails: Error\n' + JSON.stringify(error))
    })
  console.info('END: ' + loggingHeader + 'accountLevelDetails')
}

/**
 * Gets loyalty data by scorecard number
 * @param {string} accountNumber Scorecard number
 * @param updateTransaction
 */
export const fetchLoyaltyByAccountNumber = (accountNumber: string, updateTransaction = true, updateLoyaltyPanel = true) => (
  dispatch: AppDispatch
): void => {
  console.info('BEGIN: ' + loggingHeader + 'fetchLoyaltyByAccountNumber\n' + JSON.stringify({
    accountNumber: accountNumber
  }))
  CoordinatorAPI.getLoyaltyByAccountNumber(accountNumber)
    .then(res => {
      if (!res.ok) {
        console.warn(loggingHeader + 'fetchLoyaltyByAccountNumber: Could not retrieve loyalty data\n' + JSON.stringify(res))
        dispatch(
          updateLoyaltyData(
            {
              loyaltyError: res.status,
              retryType: 'accountNumber',
              retryParameters: { loyaltyAccount: accountNumber }
            },
            UPDATE_LOYALTY_DATA
          )
        )
        throw new Error('Could not retrieve loyalty data')
      }
      return res.json()
    })
    .then(data => {
      console.info(loggingHeader + 'fetchLoyaltyByAccountNumber: success\n' + JSON.stringify(data))

      if (data.length === 0) {
        dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL', autofocusTextbox: 'LoyaltyAdvancedSearch' }))
        dispatch(
          updateLoyaltyData(
            {
              altScreenName: 'advanced',
              isNoAccountFound: true,
              loyaltyCustomers: data,
              lastPhoneLookup: accountNumber
            },
            UPDATE_LOYALTY_DATA
          )
        )
      }

      if (data.length === 1) {
        if (updateTransaction) {
          dispatch(addLoyaltyAccountToTransaction(data[0]))
        } else {
          dispatch(
            updateLoyaltyData(
              { selectedLoyaltyCustomer: data[0], altScreenName: 'details' },
              UPDATE_LOYALTY_DATA
            )
          )
          dispatch(accountLevelDetails(data[0].loyalty))
        }

        if (updateLoyaltyPanel) {
          dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL' }))
        }
      }
    })
    .catch(error => console.error(loggingHeader + 'fetchLoyaltyByAccountNumber: Error\n' + JSON.stringify(error)))
  console.info('END: ' + loggingHeader + 'fetchLoyaltyByAccountNumber')
}

/**
 * Adds invalid reward to loyalty data
 * @param {InvalidReward} invalidReward invalidReward
 * @async
 */
export const addInvalidReward = (invalidReward: InvalidReward) => async (
  dispatch: AppDispatch
): Promise<void> => {
  console.info('ENTER: ' + loggingHeader + 'updateInvalidRewardData\n' + JSON.stringify({
    invalidReward: invalidReward
  }))
  dispatch(receiveLoyaltyData({ invalidReward: invalidReward }))
  console.info('END: ' + loggingHeader + 'updateInvalidRewardData\n')
}

/**
 * Remove all invalid reward data
 */
export const clearInvalidReward = () => (dispatch: AppDispatch): void => {
  console.info('BEGIN: ' + loggingHeader + 'clearInvalidReward')
  dispatch(receiveLoyaltyData({ invalidReward: {} }))
  console.info('END: ' + loggingHeader + 'clearInvalidReward')
}
