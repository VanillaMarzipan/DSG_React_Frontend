import { useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import IdentificationPicker from './IdentificationPicker'
import { useDispatch } from 'react-redux'
import { clearCreditEnrollmentData, receiveCreditEnrollmentData } from '../actions/creditEnrollmentActions'
import TextInput from './TextInput'
import { beginCreditAccountLookup, sendTransactionToPinPad, tenderWithCreditAccountLookup, tenderWithTemporaryShoppingPass } from '../utils/cefSharp'
import { receiveUiData, setCreditErrorMessageForMatchingTenderIDs } from '../actions/uiActions'
import { createNewCreditTender } from '../actions/transactionActions'
import * as Storage from '../utils/asyncStorage'
import { sendAppInsightsEvent } from '../utils/appInsights'
import { TransactionDataTypes } from '../reducers/transactionData'
import DecoratorLine from './reusable/DecoratorLine'
import BarcodeSvg from './svg/BarcodeSvg'
import BackButton from './BackButton'
import { determineIfStringIsTempShoppingPass } from '../utils/transactionHelpers'

interface CreditLookupProps {
  creditPanelErrorInstructions: string
  creditPanelError: string
  tenderAmountInput: string
}
const CreditLookup = ({
  creditPanelErrorInstructions,
  creditPanelError,
  tenderAmountInput
}: CreditLookupProps) => {
  const creditLookupZipRef = useRef(null)
  const [identificationType, setIdentificationType] = useState('-1')
  const { creditLookupStep, creditLookupStatus, creditLookupActive } = useSelector(state => state.creditEnrollmentData)
  const selectedLoyaltyCustomer = useSelector(state => state.loyaltyData.selectedLoyaltyCustomer)
  const { printerString, associateData, returnData, warrantyData, uiData, transactionData } = useSelector(state => state)
  const dispatch = useDispatch()
  const idTypeTextLabels = {
    0: "Driver's License Number",
    1: 'Passport Number',
    2: 'Military ID Number',
    4: 'State ID Number'
  }

  const [idNumber, setIdNumber] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [maskedPan, setMaskedPan] = useState('')
  const [userCommittedToCreditLookup, setUsercommitedToCreditLookup] = useState(false)
  const disableNextButton = (
    (!userCommittedToCreditLookup && identificationType === '-1') ||
    (userCommittedToCreditLookup && (idNumber.length === 0 || zipCode.length < 5)) ||
    uiData.processingTempPass
  )
  const handleCreditAccountLookup = (transactionData: TransactionDataTypes, zipcode) => {
    dispatch(receiveCreditEnrollmentData({ creditLookupStep: 2 }))
    sendAppInsightsEvent('ExecuteCreditAccountLookup', {
      transactionNumber: transactionData?.header?.transactionNumber,
      creditLookupActive
    })
    beginCreditAccountLookup(JSON.stringify(transactionData), zipcode)
      .then(async res => {
        const parsedResponse = JSON.parse(res)
        if (parsedResponse.errorCode || parsedResponse?.Result?.Status === 1) {
          dispatch(receiveCreditEnrollmentData({ creditLookupStatus: 'generalError' }))
        } else if (parsedResponse.CardFound === true) {
          dispatch(receiveCreditEnrollmentData({ creditLookupStatus: 'found' }))
          setCustomerName(parsedResponse.FirstName + ' ' + parsedResponse.LastName)
          setMaskedPan(parsedResponse.MaskedPan)
        } else {
          dispatch(receiveCreditEnrollmentData({ creditLookupStatus: 'notFound' }))
        }
        dispatch(receiveCreditEnrollmentData({ creditLookupStep: 3 }))
      })
      .catch(error => {
        console.info('Credit lookup error: ', error)
        dispatch(receiveCreditEnrollmentData({ creditLookupStatus: 'generalError' }))
      })
      .finally(() => {
        sendTransactionToPinPad(transactionData)
      })
  }
  useEffect(() => {
    const shouldBlockTender = async () => {
      const createNewCreditTenderLatch = await Storage.getData('createNewCreditTenderLatch')
      if (createNewCreditTenderLatch === transactionData.header.tenderIdentifier) {
        dispatch(setCreditErrorMessageForMatchingTenderIDs())
      }
    }
    shouldBlockTender()
  }, [])
  useEffect(() => {
    if (uiData.showModal === 'creditEnrollment' && !userCommittedToCreditLookup && uiData.scanEvent && uiData.scanEvent.scanValue) {
      if (!determineIfStringIsTempShoppingPass(uiData.scanEvent.scanValue)) {
        dispatch(receiveUiData({
          creditPanelError: 'Invalid temporary shopping pass barcode',
          creditPanelErrorInstructions: 'Please try again.'
        }))
        return
      }
      dispatch(receiveUiData({
        processingTempPass: true,
        creditPanelError: null,
        creditPanelErrorInstructions: null,
        displayInsertCard: false,
        activePanel: 'creditPanel',
        showModal: false
      }))
      tenderWithTemporaryShoppingPass(JSON.stringify(transactionData), uiData.scanEvent.scanValue, tenderAmountInput === '0.00' ? transactionData.total.remainingBalance.toString() : tenderAmountInput)
        .then(data => {
          const response = JSON.parse(data)
          if (response.Result.Status === 1 && response.Result.PaymentErrorResponse.ErrorCondition === 14) {
            dispatch(receiveUiData({
              creditPanelError: response.Result.PaymentErrorResponse.RefusalReason,
              creditPanelErrorInstructions: 'Please try again.'
            }))
          } else {
            dispatch(receiveUiData({
              scanEvent: null
            }))
            dispatch(createNewCreditTender(
              printerString,
              associateData,
              selectedLoyaltyCustomer,
              returnData,
              data,
              warrantyData,
              transactionData.header.tenderIdentifier
            ))
          }
          dispatch(receiveUiData({ processingTempPass: false }))
        })
        .catch(error => {
          dispatch(receiveUiData({ processingTempPass: false }))
          console.error('TempPassTender Error: ', error)
        })
    }
  }, [uiData.scanEvent?.scanTime])
  return (
    <View style={styles.container}>
      {
        userCommittedToCreditLookup && creditLookupStep === 1 &&
        <BackButton
          back={() => setUsercommitedToCreditLookup(false)}
          style={{ top: -40, left: 20 }}
          size='small'
          customFontSize={16}
        />
      }
      {creditLookupStep === 1 && (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {creditPanelError
            ? (
              <>
                <Text style={{ color: '#B10216', fontWeight: 'bold', marginTop: 34, marginBottom: 24 }}>
                  {creditPanelError}
                </Text>
                <Text style={styles.text}>{creditPanelErrorInstructions}</Text>
              </>
            )
            : (
              <>
                <Text style={styles.text}>
                  {userCommittedToCreditLookup
                    ? (
                      "Using the athlete's identification,\nenter the following information below."
                    )
                    : (
                      "Select the athlete's identification type\nin order to lookup a ScoreRewards Credit Card."
                    )
                  }
                </Text>
                <IdentificationPicker
                  identificationType={identificationType}
                  setIdentificationType={setIdentificationType}
                  customStyles={{ marginBottom: 20 }}
                  idTypeTextLabels={idTypeTextLabels}
                />
              </>
            )}
          {userCommittedToCreditLookup
            ? (
              <View>
                <TextInput
                  nativeID={'identification-number-text-input'}
                  testID={'identification-number-text-input'}
                  labelBackgroundColor='white'
                  label={idTypeTextLabels[identificationType]}
                  style={styles.textInput}
                  value={idNumber}
                  autoFocus={true}
                  onChangeText={text => {
                    setIdNumber(text)
                  }}
                  mode='outlined'
                  onSubmitEditing={() => creditLookupZipRef.current?.focus()}
                />
                <TextInput
                  nativeID={'zip-code-text-input'}
                  testID={'zip-code-text-input'}
                  ref={creditLookupZipRef}
                  labelBackgroundColor='white'
                  label={'Zip Code'}
                  style={[styles.textInput, { marginBottom: 16 }]}
                  value={zipCode}
                  onChangeText={text => {
                    const reg = /^[0-9\b]+$/
                    if (text.length >= 1 && !reg.test(text)) return
                    setZipCode(text)
                  }}
                  mode='outlined'
                  maxLength={5}
                  onSubmitEditing={() => {
                    if (!disableNextButton) {
                      handleCreditAccountLookup(transactionData, zipCode)
                    }
                  }}

                />
              </View>
            )
            : (
              <></>
            )
          }
        </View>
      )}
      {
        creditLookupStep === 1 && !creditPanelError &&
          <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={{ width: 343 }}>
              <TouchableOpacity
                onPress={() => {
                  if (userCommittedToCreditLookup) {
                    handleCreditAccountLookup(transactionData, zipCode)
                  } else {
                    setUsercommitedToCreditLookup(true)
                  }
                }}
                style={[
                  styles.primaryButton,
                  {
                    width: '100%'
                  },
                  disableNextButton && { backgroundColor: '#c8c8c8' }
                ]}
                disabled={disableNextButton}
              >
                <Text style={[styles.primaryButtonText, disableNextButton && { color: '#797979' }]}>
                  NEXT
                </Text>
              </TouchableOpacity>
            </View>
            {
              !userCommittedToCreditLookup &&
                <View style={styles.tempShoppingPassContainer}>
                  <View style={styles.orSeparator}>
                    <DecoratorLine customStyles={styles.decoratorLine}/>
                    <Text style={styles.orText}>or</Text>
                    <DecoratorLine customStyles={styles.decoratorLine}/>
                  </View>
                  <BarcodeSvg/>
                  <Text style={styles.tempShoppingPassText}>Scan a temporary shopping pass.</Text>
                </View>
            }
          </View>
      }
      {creditLookupStep === 2 && (
        <Text style={[styles.text, { marginTop: 90 }]}>
          Instruct the athlete to complete the instructions on the PinPad
        </Text>
      )}
      {creditLookupStep === 3 && (
        creditLookupStatus === 'found'
          ? (
            <View>
              <Text style={[styles.text, { marginTop: 16, marginBottom: 16 }]}>
                {'Account found for ' + customerName}
              </Text>
              <Text style={[styles.text, { fontWeight: '700', marginBottom: 108 }]}>
                {maskedPan}
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { marginBottom: 58 }]}
                onPress={() => {
                  dispatch(receiveUiData({
                    processingAccountLookupTender: true,
                    showModal: false,
                    activePanel: 'creditPanel'
                  }))
                  dispatch(clearCreditEnrollmentData())
                  setIdentificationType('-1')
                  setIdNumber('')
                  setZipCode('')
                  tenderWithCreditAccountLookup(JSON.stringify(transactionData), transactionData.total.remainingBalance.toString())
                    .then(data => {
                      const response = JSON.parse(data)
                      console.info('tenderWithAccountLookupRes: ', response)
                      if (response.Result.Status === 1 && response.Result.PaymentErrorResponse.ErrorCondition === 14) {
                        console.info('tenderWithAccountLookup: Errror')
                        dispatch(receiveUiData({
                          creditPanelError: response.Result.PaymentErrorResponse.RefusalReason,
                          creditPanelErrorInstructions: 'Please try again.'
                        }))
                      } else {
                        dispatch(createNewCreditTender(
                          printerString,
                          associateData,
                          selectedLoyaltyCustomer,
                          returnData,
                          data,
                          warrantyData,
                          transactionData.header.tenderIdentifier
                        ))
                      }
                      dispatch(receiveUiData({ processingAccountLookupTender: false }))
                    })
                    .catch(error => {
                      dispatch(receiveUiData({ processingAccountLookupTender: false }))
                      console.info('TempPassTender Error: ', error)
                    })
                }}
              >
                <Text style={styles.primaryButtonText}>
                PAY WITH CARD
                </Text>
              </TouchableOpacity>
            </View>
          )
          : (
            <View>
              <Text style={[styles.text, styles.errorText]}>
                {creditLookupStatus === 'notFound' ? 'NO ACCOUNT FOUND' : 'SORRY, SOMETHING WENT WRONG'}
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  dispatch(receiveCreditEnrollmentData({
                    creditLookupStep: 1,
                    creditLookupStatus: 'none'
                  }))
                  setIdentificationType('-1')
                  setIdNumber('')
                  setZipCode('')
                }}
              >
                <Text style={styles.secondaryButtonText}>
                  {creditLookupStatus === 'notFound' ? 'LOOKUP ACCOUNT' : 'TRY LOOKUP AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: 'center'
  },
  text: {
    textAlign: 'center',
    fontSize: 16
  },
  errorText: {
    fontWeight: '700',
    color: '#b10216',
    marginBottom: 58
  },
  textInput: {
    marginBottom: 20,
    width: 343,
    height: 60
  },
  primaryButton: {
    width: 341,
    height: 44,
    backgroundColor: '#bb5811',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 1.5
  },
  secondaryButton: {
    width: 341,
    height: 44,
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
    borderWidth: 2,
    borderColor: '#191f1c'
  },
  secondaryButtonText: {
    color: '#191f1c',
    fontWeight: '700',
    letterSpacing: 1.5
  },
  tempShoppingPassContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24
  },
  orSeparator: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  decoratorLine: {
    width: '25%',
    backgroundColor: '#C5C5C5'
  },
  orText: {
    marginHorizontal: 8,
    color: '#666666'
  },
  tempShoppingPassText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 60
  }
})

export default CreditLookup
