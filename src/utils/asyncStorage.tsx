import AsyncStorage from '@react-native-community/async-storage'

const loggingHeader = 'utils > asyncStorage > '

/**
 * Save data to localStorage or mobile equivalent
 * @async
 * @function
 * @param {string} key The key for this piece of data
 * @param {string} value The value of the data
 */
export const storeData = async (key: string, value: string): Promise<void> => {
  if (key !== 'activityTimestamp') { // Don't log clock changes
    console.info('BEGIN: ' + loggingHeader + 'storeData\n', JSON.stringify({
      key: key,
      value: value
    }))
  }

  try {
    await AsyncStorage.setItem(key, value)
  } catch (error) {
    console.error(loggingHeader + 'storeData: Error\n' + JSON.stringify(error))
  }

  if (key !== 'activityTimestamp') { // Don't log clock changes
    console.info('END: ' + loggingHeader + 'storeData')
  }
}

/**
 * Get data from localStorage or mobile equivalent
 * @async
 * @function
 * @param {string} key The key for this piece of data
 * @returns {string} Returns value
 */
export const getData = async (key: string): Promise<string> => {
  console.info('BEGIN: ' + loggingHeader + 'getData\n' + JSON.stringify({ key: key }))
  try {
    const value = await AsyncStorage.getItem(key)
    if (value !== null) {
      console.info('END: ' + loggingHeader + 'getData\n' + JSON.stringify({ value: value }))
      return value
    }
  } catch (e) {
    console.error(loggingHeader + 'getData: Error\n' + JSON.stringify(e))
  }
}

/**
 * Remove data from localStorage or mobile equivalent
 * @async
 * @function
 * @param {string[]} itemArr
 */
export const removeItems = async (itemArr: string[]): Promise<void> => {
  console.info('BEGIN: ' + loggingHeader + 'removeItems\n' + JSON.stringify({ itemArr: itemArr }))
  try {
    await AsyncStorage.multiRemove(itemArr)
  } catch (e) {
    console.error(loggingHeader + 'removeItems: Error\n' + JSON.stringify(e))
  }
  console.info('END: ' + loggingHeader + 'removeItems')
}
