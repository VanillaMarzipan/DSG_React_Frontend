import { ReactFragment, Ref, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../components/StyledText'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { authenticateUser, clearLoginError } from '../actions/associateActions'
import { ThemeTypes } from '../reducers/theme'
import { fetchLowestPriceAndName, fetchProductLookupDetails } from '../actions/productLookupActions'
import { CurrentPage } from '../reducers/productLookupData'
import { sendRumRunnerEvent } from '../utils/rumrunner'

interface LoginProps {
  theme: ThemeTypes
}

const Login = ({ theme }: LoginProps) => {
  const { associateData, registerData, storeInfo, productLookupData, uiData } = useSelector(
    state => ({
      associateData: state.associateData,
      registerData: state.registerData,
      storeInfo: state.storeInfo,
      productLookupData: state.productLookupData,
      uiData: state.uiData
    })
  )

  const dispatch = useDispatch()

  const [associateNum, setAssociateNum] = useState('')
  const [pin, setPin] = useState('')
  const [associateNumError, setAssociateNumError] = useState(false)
  const [pinError, setPinError] = useState(false)

  const idInput = useRef(null)
  const pinInput = useRef(null)
  const disableEnterButton = (!associateNum || !pin || associateNumError || pinError)

  useEffect(() => {
    // Clear inputs and error messages
    setAssociateNum('')
    setPin('')
    setAssociateNumError(false)
    setPinError(false)
    // Auto focus input
    idInput?.current && idInput.current.focus()

    if (uiData.autofocusTextbox === 'Login') {
      setTimeout(() => {
        idInput?.current && idInput.current.focus()
      }, 10)
    }
  }, [associateData.authenticated, registerData.registerClosed])

  /**
   * Clear login error from redux
   */
  const updateLoginError = (): void => {
    associateData.error && dispatch(clearLoginError())
  }

  /**
   * Validate and update associate id state
   * @param {string} text input value
   */
  const associateIdInput = (text: string): void => {
    updateLoginError()
    const cleanText = text.trim()
    const textLength = cleanText.length
    const regEx = /^\d*$/
    if (regEx.test(cleanText) && textLength < 8) {
      setAssociateNum(cleanText)
      setAssociateNumError(!/^\d{7}$/.test(cleanText) && textLength > 0)
    }
  }

  /**
   * Validate and update pin state
   * @param {string} text input value
   */
  const onPinInput = (text: string): void => {
    updateLoginError()
    setPin(/^\d*$/.test(text) ? text : '')
    setPinError(!/^\d{6}$/.test(text) && text.trim().length > 0)
  }

  /**
   * Validate inputs are not blank or in an error state. Dispatch authenticate action
   * @param {string} associateNum
   * @param {string} pin
   */
  const onSubmitLogin = (associateNum: string, pin: string): void => {
    if (associateNum !== '' && pin !== '' && !(associateNumError || pinError)) {
      dispatch(
        authenticateUser(
          associateNum,
          pin,
          storeInfo.number,
          registerData.macAddress
        )
      )
    }
  }

  /**
   * Makes enter key act as tab unless inputs are filled, then submit form.
   * @param {Ref<ReactFragment>} ref reference to currently focused input
   */
  const handleEnterKey = (ref: Ref<ReactFragment>): void => {
    if (associateNum !== '' && pin !== '' && !(associateNumError || pinError)) {
      onSubmitLogin(associateNum, pin)
    } else if (ref === idInput) {
      pinInput.current.focus()
    } else {
      idInput.current.focus()
    }
  }

  useEffect(() => {
    // If scanned with barcode scanner
    if (uiData.scanEvent?.scanTime) {
      if (uiData.productLookupPanelSelected && (productLookupData.currentPage === CurrentPage.Landing || productLookupData.currentPage === CurrentPage.SearchResults)) {
        dispatch(fetchProductLookupDetails(uiData.scanEvent.scanValue))
        sendRumRunnerEvent('Product Lookup Scan', {
          authenticated: false
        })
      } else if (uiData.lowestPriceInquiryPanelSelected) {
        dispatch(fetchLowestPriceAndName(uiData.scanEvent.scanValue))
      }
    }
  }, [uiData.scanEvent?.scanTime])

  return (
    <View style={styles.app}>
      <Header
        storeNumber={registerData.storeNumber}
        registerNumber={registerData.registerNumber}
        text={!registerData.state ? '' : 'Hello! Please Login'}
        theme={theme}
        transactionCardShowing={false}/>
      <View style={styles.mainContainer}>
        <View
          style={[
            styles.root,
            {
              height: '100%'
            }
          ]}
        >
          <View
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            {registerData.registerClosed && (
              <Text style={styles.closedRegisterText}>
                REGISTER IS CLOSED
              </Text>
            )}
            <TextInput
              ref={idInput}
              style={styles.textField}
              labelBackgroundColor={theme.backgroundColor}
              testID='associate-num'
              label='Associate Number'
              error={associateNumError || associateData.error}
              value={associateNum}
              onChangeText={text => associateIdInput(text)}
              mode='outlined'
              autoFocus={true}
              onSubmitEditing={() => {
                handleEnterKey(idInput)
              }}
              color={theme.fontColor}
              maxLength={7}
            />
            {associateNumError && (
              <View>
                <Text style={{ color: '#8d0d02', marginBottom: 12 }}>
                  Invalid Associate Number
                </Text>
              </View>
            )}
            <TextInput
              ref={pinInput}
              style={styles.textField}
              secureTextEntry={true}
              textContentType='password'
              labelBackgroundColor={theme.backgroundColor}
              testID='associate-pin'
              label='PIN'
              error={pinError || associateData.error}
              value={pin}
              onChangeText={text => onPinInput(text)}
              onSubmitEditing={() => {
                handleEnterKey(pinInput)
              }}
              mode='outlined'
              color={theme.fontColor}
              maxLength={6}
            />
            {associateData.errorMessage && (
              <View>
                <Text style={{ color: '#8d0d02', marginBottom: 12 }}>Error: {associateData.errorMessage}</Text>
              </View>
            )}
            {pinError && (
              <View>
                <Text style={{ color: '#8d0d02', marginBottom: 12 }}>Invalid PIN</Text>
              </View>
            )}
            <TouchableOpacity
              testID='login-submit'
              onPress={() => {
                onSubmitLogin(associateNum, pin)
              }}
              disabled={uiData.loadingStates.signIn || disableEnterButton}
            >
              <View style={[styles.button, disableEnterButton && { backgroundColor: '#C8C8C8' }]}>
                {uiData.loadingStates.signIn
                  ? (
                    <ActivityIndicator color='#ffffff'/>
                  )
                  : (
                    <Text style={[styles.buttonText, disableEnterButton && { color: '#4F4F4F' }]}>Enter</Text>
                  )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

Login.propTypes = {
  theme: PropTypes.object
}

export default Login

const styles = StyleSheet.create({
  root: {
    minHeight: 206,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  container: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  textField: {
    minWidth: 390,
    height: 60,
    marginBottom: 16,
    borderRadius: 0
  },
  button: {
    width: 260,
    height: 40,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  app: {
    flex: 1,
    display: 'flex'
  },
  appHeader: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  grid: {
    flex: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  gridContainer: {
    flexWrap: 'wrap',
    width: '100%',
    flex: 1
  },
  gridItem: {
    margin: 0,
    flexDirection: 'column'
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    borderTopWidth: 2,
    borderColor: '#a7a7a7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closedRegisterText: {
    color: '#B10216',
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'archivo',
    fontWeight: 'bold'
  }
})
