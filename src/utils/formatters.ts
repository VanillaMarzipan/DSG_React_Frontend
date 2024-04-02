const loggingHeader = 'utils > formatters > '

/**
 * Formats an input into a number or number string with two decimal places
 * @param {string} input string representing a number
 * @returns a number or string with two decimal places
 */
export const formatNumber = (input: string): string => {
  console.info('BEGIN: ' + loggingHeader + 'formatNumber\n' + JSON.stringify({ input: input }))
  const newVal = input.replace('.', '')
  if (isNaN(parseFloat(newVal))) {
    return '0.00' // if the input is invalid just set the value to 0.00
  }
  const num = parseFloat(newVal)
  const retval = (num / 100).toFixed(2) // move the decimal up to places return a X.00 format
  console.info('END: ' + loggingHeader + 'formatNumber\n' + JSON.stringify(retval))
  return retval.toString()
}

/**
 * Adds zeros to the upc to make it 12 digits
 * @param {string} upc UPC
 * @returns {string} a 12 digit UPC
 */
export const padUpc = (upc: string): string => {
  console.info('BEGIN: ' + loggingHeader + 'padUpc\n' + JSON.stringify({ upc: upc }))
  let upcStr = '' + upc
  while (upcStr.length < 12) {
    upcStr = '0' + upcStr
  }
  console.info('END: ' + loggingHeader + 'padUpc\n' + JSON.stringify(upcStr))
  return upcStr
}

/**
 * Formats a phone number: (555)555-5555
 * @param {string} input phone number
 * @returns {string} a phone number formatted as (555)555-5555
 */
export const formatPhoneNumber = (input: string): string => {
  console.info('BEGIN: ' + loggingHeader + 'formatPhoneNumber\n' + JSON.stringify({ input: input }))
  let retval = ''
  if (input) {
    let phoneNumber = input.slice(0, 2)
    if (input.length > 2) phoneNumber = '(' + input.slice(0, 3) + ')'
    if (input.length > 3) {
      phoneNumber += ' ' + input.slice(3, 6)
    }
    if (input.length > 6) {
      phoneNumber += '-' + input.slice(6, 10)
    }
    retval = phoneNumber
  }
  console.info('END: ' + loggingHeader + 'formatPhoneNumber\n' + JSON.stringify(retval))
  return retval
}

export const cleanseNonIntegers = (formattedPhoneNum) => {
  let plainPhoneNum = ''

  const arr = [...formattedPhoneNum]

  arr.forEach((el) => {
    if (!isNaN(parseInt(el, 10))) plainPhoneNum += el
  })

  return plainPhoneNum
}

export const formatDateString = (dateString) => {
  const arrayedString = [...dateString]
  let slashCount = 0
  arrayedString.forEach(el => {
    if (el === '/') slashCount++
  })
  const reg = /^[0-9\b]+$/
  if (!reg.test(arrayedString[arrayedString.length - 1])) arrayedString.splice(arrayedString.length - 1, 1)
  if (slashCount !== 2) {
    for (let i = 0; i < arrayedString.length; i++) {
      if (((i === 2 && arrayedString.length < 5) || (i === 5 && arrayedString[5] !== '/'))) {
        arrayedString.splice(i, 0, '/')
        break
      }
    }
  }
  return arrayedString.join('')
}

export const obfuscateAccountNumber = (accountNumber: string, showLastFourDigitsOnly = false): string => {
  if (!accountNumber || accountNumber.length < 10 || accountNumber.length > 20) {
    throw new Error('Not a valid account number')
  }
  if (showLastFourDigitsOnly) return '************' + accountNumber.slice(-4)
  return accountNumber.substring(0, 6) + '******' + accountNumber.slice(-4)
}

export const onKeyPressPhoneNumber = (e, textValue, setTextValue, asYouType) => {
  let parensDashCount = 0
  for (let i = 0; i < textValue.length; i++) {
    if (textValue[i] === '(' || textValue[i] === ')' || textValue[i] === '-') {
      parensDashCount++
    }
  }

  if (e.key !== 'Backspace' && parensDashCount < 3) {
    if (textValue.length <= 4) {
      setTextValue(cleanseNonIntegers(textValue))
    } else if (textValue[0] !== '1' && textValue[0] !== '0') {
      setTextValue(asYouType.input(textValue))
    }
  } else if (textValue.length === 10) { // auto delete hyphen in phone number
    setTextValue(asYouType.input(textValue))
  } else if (textValue.length === 7) { // auto clear parens after deleting 4th digit
    setTextValue(cleanseNonIntegers(textValue))
  }
}

export const convertISODateToMonthDayYear = (isoDateString: string): string => {
  const date = new Date(isoDateString)
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

export const userFriendlyTenderTypes = {
  priv1: 'DSG Maastercard',
  synchrony_comc: 'DSG Mastercard',
  priv2: 'DSG Credit Card',
  synchrony_plcc: 'DSG Credit Card'
}

export const returnListOfNonRepeatingTenders = (tendersArray) => {
  console.info('returnListOfNonRepeatingTenders - tenders: ', JSON.stringify(tendersArray))
  if (!tendersArray || tendersArray.length === 0) return 'No tenders'

  let result = ''

  interface ITendersEncountered {
    string: boolean
  }
  const tendersEncountered: ITendersEncountered | Record<never, never> = {}

  tendersArray.forEach((tender, index) => {
    let newTenderToAdd = ''

    if (tender.tenderType === 1) {
      newTenderToAdd = 'CASH'
    } else if (tender.tenderType === 2) {
      newTenderToAdd = tender.cardType
    } else {
      newTenderToAdd = 'Unknown'
    }

    const caseCleansedTender = newTenderToAdd.toLowerCase()
    if (userFriendlyTenderTypes[caseCleansedTender]) {
      newTenderToAdd = userFriendlyTenderTypes[caseCleansedTender]
    }

    if (!tendersEncountered[newTenderToAdd]) {
      tendersEncountered[newTenderToAdd] = true
      if (tendersArray.length > 1 && index > 0) {
        newTenderToAdd = ', ' + newTenderToAdd
      }
      result += newTenderToAdd
    }
  })

  return result
}

export const capitalizeFirstLetter = (s: string) => {
  if (!s || s.length < 1) return ''
  return s[0].toUpperCase() + s.slice(1)
}
