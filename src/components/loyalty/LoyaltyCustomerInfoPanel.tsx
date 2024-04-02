import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, Picker, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import TextInput from '../TextInput'
import { ThemeTypes } from '../../reducers/theme'
import { cleanseNonIntegers, formatPhoneNumber, onKeyPressPhoneNumber } from '../../utils/formatters'
import { Customer, LoyaltyDataTypes } from '../../reducers/loyaltyData'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import { CityStateResponse } from '../../actions/loyaltyActions'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { AsYouType } from 'libphonenumber-js'
import { checkForLoading, receiveUiData } from '../../actions/uiActions'
import { featureFlagEnabled } from '../../reducers/featureFlagData'

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

interface LoyaltyCustomerInfoPanelProps {
  firstName: string
  lastName: string
  street: string
  apartment: string
  zip: string
  city: string
  state: string
  email: string
  isVisible: boolean
  phone: string
  phoneOutput: string
  fetchCityStateByZip: (zip: string) => Promise<CityStateResponse>
  titleMessage: string
  errorMessage: string
  createAccount: (firstName?: string, lastName?: string, street?: string, apartment?: string, city?: string, state?: string, zip?: string, phone?: string, email?: string, storeNumber?: number) => void
  modifyAccount: (firstName: string, lastName: string, street: string, apartment: string, city: string, state: string, zip: string, phone: string, email: string, storeNumber: number, accountId: string, selectedItem: string, selectedCustomer: Customer) => void
  loyaltyData: LoyaltyDataTypes
  theme: ThemeTypes
  storeNumber: number
  selectedCustomer: Customer
  mode: string
  accountId: string
}

const LoyaltyCustomerInfoPanel = ({
  ...props
}: LoyaltyCustomerInfoPanelProps): JSX.Element => {
  const dispatch = useDispatch()
  const uiData = useSelector(state => state.uiData)
  const asYouType = new AsYouType('US')
  const [firstName, setFirstName] = useState(props.firstName)
  const [lastName, setLastName] = useState(props.lastName)
  const [street, setStreet] = useState(props.street)
  const [apartment, setApartment] = useState(props.apartment)
  const [city, setCity] = useState(props.city)
  const [state, setState] = useState(props.state)
  const [zip, setZip] = useState(props.zip)
  const [email, setEmail] = useState(props.email)
  const [didSubmit, setDidSubmit] = useState(false)
  const [possibleCities, setPossibleCities] = useState<string[]>([])
  const [phone, setPhone] = useState(formatPhoneNumber(props.phone))
  const [isModify, setIsModify] = useState(false)

  const firstNameInput = useRef(null)
  const lastNameInput = useRef(null)
  const zipInput = useRef(null)
  const cityInput = useRef(null)
  const stateInput = useRef(null)
  const addressInput = useRef(null)
  const apartmentInput = useRef(null)
  const phoneInput = useRef(null)
  const emailInput = useRef(null)

  useEffect(() => {
    if (props.city.length === 0) {
      fetchCityState(zip, true)
    }
    setIsModify(email && email.length > 0)
    firstNameInput?.current?.focus()
    sendRumRunnerEvent('Loyalty Enrollment Event', { type: 'Form Visited' })
  }, [])

  useEffect(() => {
    if (city === 'None of the Above') {
      setPossibleCities([])
      setCity('')
      setTimeout(() => cityInput?.current?.focus(), 100)
    }
  }, [city])

  /**
   * Validates that zip has five characters, contains only numbers, and has no spaces. If so, looks up city and state and passes that data to handleCityState(). Else, clears state for city, state, and possibleCities.
   * @param {string} zip Zip code
   */
  const fetchCityState = async (zip: string, onMount?: boolean): Promise<void> => {
    if (isValidZip(zip)) {
      try {
        const lookup = await props.fetchCityStateByZip(zip)
        handleCityState(lookup)
        !onMount && addressInput?.current?.focus()
      } catch (error) {
        console.error('Error fetching city and state data from zip: ' + error)
      }
    } else {
      setCity('')
      setState('')
      setPossibleCities([])
    }
  }

  // function takes in a list of length two
  // this 0th element is a list of cities, the 1st element is a single state (API never returns 2 states)
  const handleCityState = (citiesStatePair: CityStateResponse): void => {
    const cities = citiesStatePair.cities
    const state = citiesStatePair.state
    if (cities.length > 0) {
      if (!city || city.length === 0) {
        setCity(cities[0])
        setState(state)
        setDidSubmit(false)
      }
      cities.push('None of the Above')

      setPossibleCities(cities)
    } else {
      // TODO - set a variable to display the textInput
      setCity('')
      setState('')
      setPossibleCities([])
    }
  }

  /**
   * Validates zip code
   * @param {string} zip Zip code
   * @returns {boolean}
   */
  const isValidZip = (zip: string): boolean => {
    if (zip.length < 5) {
      return false
    } else if (zip.length === 5) {
      return !isNaN(parseInt(zip, 10)) && !zip.includes(' ')
    } else if (zip.length === 6) {
      return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zip) && !zip.includes(' ')
    } else {
      return false
    }
  }

  /**
   * Returns max zip length based on presence of alpha characters
   * @param {string} zip Zip code
   * @returns { 5 | 6 }
   */
  const maxZipLength = (zip: string): 5 | 6 => {
    if (zip.length === 0) {
      return 5
    } else {
      if (/[a-zA-z]/.test(zip[0])) {
        return 6
      } else {
        return 5
      }
    }
  }

  /**
   * Validates all form elements
   * @returns {boolean}
   */
  const allFormsValid = (): boolean => {
    const isValid =
      firstName.length > 0 &&
      lastName.length > 0 &&
      street.length > 0 &&
      isValidZip(zip) &&
      city.length > 0 &&
      state.length === 2 &&
      /[a-zA-z][a-zA-Z]/.test(state) &&
      phone.length === 14 &&
      email.length > 0 &&
      emailRegex.test(email)
    return isValid
  }

  /**
   * Update state for inputs. Trigger form validation function.
   * @param e Keyboard event
   */
  const handleChange = (e): void => {
    e.target.id === 'street' && setStreet(e.target.value)
    e.target.id === 'apartment' && setApartment(e.target.value)
    e.target.id === 'city' && setCity(e.target.value)
    e.target.id === 'email' && setEmail(e.target.value)

    if (e.target.id === 'zip') {
      // TODO - ZIP CAN BE ALPHANEUMERIC! NEED MORE TESTS
      const zip = e.target.value
      setZip(zip.replace(/[^0-9]/g, ''))
      if (city.length === 0) {
        setState('')
        setPossibleCities([])
      }
    } else if (e.target.id === 'state') {
      if (
        (!e.target.value.includes(' ') && /[a-zA-Z]/.test(e.target.value)) ||
        e.target.value.length === 0
      ) {
        setState(e.target.value)
      }
    }
  }

  /**
   * Check what key was pressed. If enter and form is valid, submit. Else call setNextFormFocus().
   * @param e Keyboard event
   * @param ref Current input
   */
  const handleKeyPress = (e, nextRef): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      nextRef.current?.focus()
    }
  }

  const createOrModifyAccount = () => {
    const unformattedPhone = cleanseNonIntegers(phone)
    if (isModify) {
      props.modifyAccount(
        firstName.trim(),
        lastName.trim(),
        street.trim(),
        apartment.trim(),
        city.trim(),
        state,
        zip,
        unformattedPhone,
        email.trim(),
        props.storeNumber,
        props.accountId,
        '',
        props.selectedCustomer
      )
    } else {
      const value = isModify ? 'Modified' : 'Submitted'
      sendRumRunnerEvent('Loyalty Enrollment Event', { type: value })
      props.createAccount(
        firstName.trim(),
        lastName.trim(),
        street.trim(),
        apartment.trim(),
        city.trim(),
        state,
        zip,
        unformattedPhone,
        email.trim(),
        props.storeNumber
      )
    }
  }

  /**
   * Call fetchCityState() and set didSubmit to true.
   */
  const onSubmitZip = async (): Promise<void> => {
    if (city.length === 0) {
      await fetchCityState(zip)
      emailInput?.current?.focus()
    } else {
      cityInput?.current?.focus()
    }
  }

  const pickerCities = possibleCities.map((value, index) => (
    <Picker.Item key={index} label={value} value={value} />
  ))

  const checkErrorFields = (textField) => {
    return props.loyaltyData.errorFields?.length > 0 &&
      props.loyaltyData.errorFields.includes(textField.toLowerCase())
  }

  const enableApartmentTextField = featureFlagEnabled('LoyaltyApartmentField')
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{props.titleMessage}</Text>
      <View style={[styles.inputRow, styles.names]}>
        <TextInput
          ref={firstNameInput}
          id={1}
          nativeID='first-name-input'
          testID='first-name-input'
          name={'firstName'}
          label='First Name'
          value={firstName}
          error={
            (didSubmit && !firstName) ||
            checkErrorFields('firstName')}
          style={[styles.advancedInput, styles.name]}
          onChangeText={text =>
            setFirstName(text.replace(/([^a-zA-Z\s'-])/g, ''))
          }
          onKeyPress={event => handleKeyPress(event, lastNameInput)}
          labelBackgroundColor={'white'}
          color={props.theme.fontColor}
          paddingMode={'less'}
          mode='outlined'
          maxLength={40}
        />
        <TextInput
          ref={lastNameInput}
          id={2}
          nativeID='last-name-input'
          testID='last-name-input'
          name={'lastName'}
          label='Last Name'
          value={lastName}
          error={
            (didSubmit && !lastName) ||
            checkErrorFields('lastName')}
          style={[styles.advancedInput, styles.name, { marginHorizontal: 20 }]}
          onChangeText={text =>
            setLastName(text.replace(/([^a-zA-Z\s'-])/g, ''))
          }
          onKeyPress={event => handleKeyPress(event, phoneInput)}
          labelBackgroundColor={'white'}
          color={props.theme.fontColor}
          paddingMode={'less'}
          mode='outlined'
          maxLength={40}
        />
        <TextInput
          ref={phoneInput}
          id={7}
          nativeID='phone-input'
          testID='phone-input'
          name={'phone'}
          label='Phone Number'
          value={phone}
          error={
            (didSubmit && (!phone || phone.length !== 14)) ||
            checkErrorFields('phone') ||
            checkErrorFields('HomePhone')
          }
          style={[styles.advancedInput, styles.phone]}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleKeyPress(e, addressInput)
              return
            }
            onKeyPressPhoneNumber(e, phone, setPhone, asYouType)
          }}
          onChangeText={text => {
            // next two lines prevent non-numeric characters
            if (text[0] === '(' && text[1] !== undefined && isNaN(Number(text[1]))) return
            if (text.length === 1 && text[0] !== '(' && isNaN(Number(text[0]))) return

            if (text.length < 15) setPhone(text)
          }}
          maxLength={14}
          labelBackgroundColor={'white'}
          color={props.theme.fontColor}
          paddingMode={'less'}
          mode='outlined'
        />
      </View>
      <View style={[styles.inputRow, styles.bottomInputs]}>
        <TextInput
          ref={addressInput}
          id={6}
          nativeID='street'
          testID='street-input'
          name={'street'}
          label='Address'
          value={street}
          error={
            (didSubmit && !street) ||
            checkErrorFields('street')}
          style={[styles.advancedInput, styles.street, { flex: 9 }]}
          onChangeText={text => setStreet(text)}
          onKeyPress={event => handleKeyPress(event, enableApartmentTextField ? apartmentInput : zipInput)}
          labelBackgroundColor={'white'}
          color={props.theme.fontColor}
          paddingMode={'less'}
          mode='outlined'
        />
        {enableApartmentTextField && (
          <TextInput
            ref={apartmentInput}
            id={6}
            nativeID='apartment'
            testID='apartment-input'
            name={'apartment'}
            label='Apartment, Suite, Building'
            value={apartment}
            error={checkErrorFields('apartment')}
            style={[styles.advancedInput, styles.street, { flex: 4, marginLeft: 20 }]}
            onChangeText={text => setApartment(text)}
            onKeyPress={event => handleKeyPress(event, zipInput)}
            labelBackgroundColor={'white'}
            color={props.theme.fontColor}
            paddingMode={'less'}
            mode='outlined'
          />
        )}
      </View>
      <View style={styles.bottomHalf}>
        <View style={[styles.inputRow, styles.names, styles.zipRow]}>
          <TextInput
            ref={zipInput}
            id={3}
            nativeID='zip'
            testID='zip-input'
            name={'zip'}
            label='ZIP Code'
            value={zip}
            error={
              (didSubmit &&
                !isValidZip(zip)) ||
              checkErrorFields('zip') ||
              checkErrorFields('PostCode')
            }
            maxLength={maxZipLength(zip)}
            style={[styles.advancedInput, styles.zip, { flex: 2 }]}
            onChange={event => handleChange(event)}
            onKeyPress={event => {
              if (event.key === 'Enter' && isValidZip(zip)) {
                onSubmitZip()
              }
            }}
            labelBackgroundColor={'white'}
            color={props.theme.fontColor}
            paddingMode={'less'}
            mode='outlined'
          />
          {possibleCities?.length > 1
            ? (
              <Picker
                selectedValue={city}
                style={[styles.advancedInput, styles.city, styles.picker, { flex: 6 }]}
                onValueChange={itemValue => setCity(itemValue)}
                testID='city-input'
              >
                {pickerCities}
              </Picker>
            )
            : (
              <TextInput
                ref={cityInput}
                id={4}
                nativeID='city'
                testID='city-input'
                name={'city'}
                label='City'
                value={city}
                error={
                  (didSubmit && !city) ||
                  checkErrorFields('city')}
                style={[styles.advancedInput, styles.city, { flex: 6 }]}
                onChange={event => handleChange(event)}
                onKeyPress={event => handleKeyPress(event, stateInput)}
                labelBackgroundColor={'white'}
                color={props.theme.fontColor}
                paddingMode={'less'}
                mode='outlined'
              />
            )}

          <TextInput
            ref={stateInput}
            id={5}
            nativeID='state'
            testID='state-input'
            name={'state'}
            label='State'
            value={state}
            error={
              (didSubmit && state?.length !== 2) ||
              checkErrorFields('state')
            }
            maxLength={2}
            style={[styles.advancedInput, styles.state, { flex: 2 }]}
            onChange={event => handleChange(event)}
            onKeyPress={event => handleKeyPress(event, emailInput)}
            labelBackgroundColor={'white'}
            color={props.theme.fontColor}
            paddingMode={'less'}
            mode='outlined'
          />
        </View>
        <View style={[styles.inputRow, styles.bottomInputs]}>
          <TextInput
            ref={emailInput}
            id={8}
            name={'email'}
            label='Email'
            value={email}
            nativeID='email'
            testID='email-input'
            error={
              (didSubmit && !(email.length > 0 && emailRegex.test(email))) ||
              checkErrorFields('email') ||
              checkErrorFields('EmailAddress')
            }
            style={[styles.advancedInput, styles.email, { marginRight: 20 }]}
            onChange={event => handleChange(event)}
            onKeyPress={event => handleKeyPress(event, emailInput)}
            labelBackgroundColor={'white'}
            color={props.theme.fontColor}
            paddingMode={'less'}
            mode='outlined'
          />
          <TouchableOpacity
            style={styles.buttonContainer}
            testID='confirm-changes'
            onPress={() => {
              const readyToSubmit = allFormsValid()
              if (readyToSubmit) {
                console.info('ACTION: components > loyalty > LoyaltyCustomerInfoPanel > onPress (confirm-changes: valid)')
                dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
                createOrModifyAccount()
              } else {
                console.info('ACTION: components > loyalty > LoyaltyCustomerInfoPanel > onPress (confirm-changes: NOT valid)')
                setDidSubmit(true)
                firstNameInput?.current?.focus()
              }
            }}
            disabled={checkForLoading(uiData.loadingStates)}
          >
            <View style={styles.button}>
              {uiData.loadingStates.loyaltyEnrollment ||
                uiData.loadingStates.loyaltyEdit
                ? (
                  <ActivityIndicator />
                )
                : (
                  <Text style={styles.buttonText}>
                    {props.mode === 'ENROLL' ? 'SUBMIT' : 'CONFIRM CHANGES'}
                  </Text>
                )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    display: 'flex',
    width: '100%',
    marginTop: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'column'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  accountExists: {
    marginBottom: 30,
    marginLeft: '16%',
    color: '#DA1600',
    opacity: 1
  },
  advancedInput: {
    marginBottom: 12,
    height: 52,
    flex: 1
  },
  inputRow: {
    width: '100%',
    justifyContent: 'space-between'
  },
  zipRow: {
    justifyContent: 'flex-start'
  },
  names: {
    display: 'flex',
    flexDirection: 'row'
  },
  name: {
    width: 303
  },
  street: {
    width: 414
  },
  city: {
    width: 202,
    marginRight: 16
  },
  state: {
    width: 78
  },
  picker: {
    backgroundColor: 'white',
    height: 46,
    marginTop: 5.75,
    borderColor: 'rgba(0,0,0,.54)',
    color: 'black'
  },
  zip: {
    width: 119,
    marginRight: 16
  },
  phone: {
    width: 192
  },
  email: {
    width: 302,
    marginBottom: 0
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    width: 303
  },
  button: {
    width: 303,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#191F1C'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#191F1C',
    fontWeight: 'bold'
  },
  bottomHalf: {
    display: 'flex',
    width: '100%'
  },
  bottomInputs: {
    display: 'flex',
    flexDirection: 'row'
  },
  gray: {
    backgroundColor: 'gray'
  },
  invalidZip: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 5
  },
  invalidZipTest: {
    color: '#B00020'
  }
})

LoyaltyCustomerInfoPanel.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  street: PropTypes.string.isRequired,
  zip: PropTypes.string.isRequired,
  city: PropTypes.string,
  state: PropTypes.string,
  email: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  phone: PropTypes.string.isRequired,
  fetchCityStateByZip: PropTypes.func.isRequired,
  titleMessage: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  createAccount: PropTypes.func.isRequired,
  loyaltyData: PropTypes.object,
  theme: PropTypes.object,
  storeNumber: PropTypes.number,
  uiData: PropTypes.object,
  selectedCustomer: PropTypes.object,
  mode: PropTypes.string,
  accountId: PropTypes.string
}

export default LoyaltyCustomerInfoPanel
