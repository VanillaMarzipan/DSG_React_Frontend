import { useEffect, useState } from 'react'
import Text from './StyledText'
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import TextInput from './TextInput'
import { EmailConfirmationChoice, LoyaltyDataTypes } from '../reducers/loyaltyData'
import { ThemeTypes } from '../reducers/theme'
import { useDispatch } from 'react-redux'
import { finalizeTransaction } from '../actions/transactionActions'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { checkIsCashInvolved } from '../utils/transactionHelpers'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import * as CefSharp from '../utils/cefSharp'
import * as Storage from '../utils/asyncStorage'

interface ReceiptCardProps {
  loyaltyData: LoyaltyDataTypes
  theme: ThemeTypes
}

enum ViewState {
  ChooseReceiptType,
  PinpadEmailConfirmation,
  ModifyEmail,
  Final
}

const isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')

const validEmailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

const ReceiptCard = ({ loyaltyData, theme }: ReceiptCardProps): JSX.Element => {
  const [finalizeCalled, setFinalizeCalled] = useState(false)
  const [receiptOptionSelected, setReceiptOptionSelected] = useState(false)
  const [buttonPressed, setButtonPressed] = useState('')
  const [receiptMessage, setReceiptMessage] = useState('receipt printed')
  const [textboxChanged, setTextboxChanged] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [input, setInput] = useState(loyaltyData.selectedLoyaltyCustomer?.emailAddress)
  const [useEmail, setUseEmail] = useState(false)
  const [customerChoseReceiptType, setCustomerChoseReceiptType] = useState(false)
  const [currentViewState, setCurrentViewState] = useState<ViewState>(ViewState.ChooseReceiptType)
  const [surveySent, setSurveySent] = useState(false)

  const dispatch = useDispatch()

  const transaction = useSelector(state => state.transactionData)
  const associateData = useSelector(state => state.associateData)
  const printerString = useSelector(state => state.printerString)
  const isCashInvolved = checkIsCashInvolved(transaction.tenders)
  const warrantyData = useSelector(state => state.warrantyData)
  const returnData = useSelector(state => state.returnData)

  useEffect(() => {
    if (!featureFlagEnabled('eReceipts') || !loyaltyData.selectedLoyaltyCustomer?.emailAddress) {
      performFinalize()
    } else if (featureFlagEnabled('PinpadReceiptPrompt')) {
      CefSharp.initiateReceiptTypePrompt()
    }
  }, [])

  useEffect(() => {
    if (loyaltyData.pinpadReceiptChoice.length > 0) {
      setCustomerChoseReceiptType(true)
      if (!buttonPressed) {
        setButtonPressed(loyaltyData.pinpadReceiptChoice)
      }
    }
  }, [loyaltyData.pinpadReceiptChoice])

  useEffect(() => {
    if (loyaltyData.emailConfirmationChoice !== EmailConfirmationChoice.NotSet) {
      if (loyaltyData.emailConfirmationChoice === EmailConfirmationChoice.Yes) {
        handleSubmitReceiptChoice()
      } else {
        sendSurvey()
      }
    }
  }, [loyaltyData.emailConfirmationChoice])

  useEffect(() => {
    if (buttonPressed.length > 0) {
      console.info('ReceiptCard -> receipt option [' + buttonPressed + '] selected')
      setReceiptOptionSelected(true)
      if (!customerChoseReceiptType) {
        CefSharp.cancelReceiptTypePrompt()
          .catch(error => {
            console.error('Error > CefSharp > CancelReceiptTypePrompt: ', error)
          })
      }
      if (buttonPressed !== 'print') {
        if (featureFlagEnabled('PinpadReceiptPrompt')) {
          CefSharp.initiateEmailConfirmation(loyaltyData.selectedLoyaltyCustomer.emailAddress)
        }
        setUseEmail(true)
        setReceiptMessage('receipt' + (buttonPressed !== 'eReceiptOnly' ? ' printed and' : '') + ' emailed to')
      } else {
        setReceiptMessage('receipt printed')
        handleSubmitReceiptChoice()
      }
    }
  }, [buttonPressed])

  useEffect(() => {
    let viewState = currentViewState
    if (finalizeCalled) {
      viewState = ViewState.Final
    } else if (loyaltyData.selectedLoyaltyCustomer?.emailAddress) {
      if (!receiptOptionSelected) {
        viewState = ViewState.ChooseReceiptType
      } else if (buttonPressed !== 'print') {
        if (!isCefSharp || !featureFlagEnabled('PinpadReceiptPrompt')) {
          viewState = ViewState.ModifyEmail
        } else {
          if (loyaltyData.emailConfirmationChoice === EmailConfirmationChoice.NotSet) {
            viewState = ViewState.PinpadEmailConfirmation
          } else if (loyaltyData.emailConfirmationChoice === EmailConfirmationChoice.No) {
            viewState = ViewState.ModifyEmail
          }
        }
      }
    }

    if (viewState !== currentViewState) {
      console.info('ReceiptCard -> changing view state from ' + ViewState[currentViewState] + ' to ' + ViewState[viewState])
      setCurrentViewState(viewState)
    }
  }, [buttonPressed, loyaltyData.emailConfirmationChoice, receiptOptionSelected, finalizeCalled])

  const handleInput = (value: string): void => {
    setInput(value)
    setTextboxChanged(true)
    setEmailError(!validEmailRegex.test(String(value).toLowerCase()))
  }

  const sendSurvey = async () => {
    if (!surveySent) {
      setSurveySent(true)
      const surveyConfigurationString = await Storage.getData('surveyConfiguration')
      if (surveyConfigurationString) {
        const surveyConfiguration = JSON.parse(surveyConfigurationString)
        surveyConfiguration.customParameters = {
          TransactionNumber: transaction.header.transactionNumber,
          ScorecardMember: !!loyaltyData.selectedLoyaltyCustomer
        }

        await CefSharp.initiatePinpadSurvey(JSON.stringify(surveyConfiguration))
      }
    }
  }

  const performFinalize = () => {
    if (!finalizeCalled) {
      setFinalizeCalled(true)
      sendSurvey()

      const emailAddress = useEmail ? input : null
      dispatch(
        finalizeTransaction(
          associateData,
          printerString.storeInformation,
          loyaltyData.selectedLoyaltyCustomer,
          isCashInvolved,
          warrantyData,
          returnData,
          1,
          transaction,
          emailAddress,
          buttonPressed
        )
      )
    }
  }

  const handleSubmitReceiptChoice = async () => {
    performFinalize()
  }

  const ReceiptTypeHeader = () => {
    return (
      <>
        <Text style={[styles.promptHeaderText, { marginTop: 38 }]}>
          How would the athlete like their receipt?
        </Text>
        {featureFlagEnabled('PinpadReceiptPrompt') &&
          <Text style={[styles.promptMessageText, { marginTop: 24 }]}>
            Ask the athlete to choose on the PIN Pad.{'\n'}
            or{'\n'}
            Select the athlete&apos;s choice from the options below.
          </Text>
        }
      </>
    )
  }

  const PinpadEmailValidationMessage = () => {
    return (
      <>
        <Text style={[styles.promptMessageText, { marginTop: 100 }]}>
          Waiting for the athlete to confirm their email{'\n'}
          on the PIN pad.
        </Text>
      </>
    )
  }

  const ModifyEmailHeader = () => {
    return (
      <>
        <Text style={[styles.promptMessageText, { marginTop: 66 }]}>
          Is the email information below correct?{'\n'}
          If not, you can change it now.
        </Text>
        <Text style={[styles.promptMessageText, { marginTop: 20 }]}>
          This will not change the email on the account,{'\n'}
          only where the receipt will go.
        </Text>
      </>
    )
  }

  type ReceiptButtonProps = {
    buttonText: string
    buttonPressedText: string
    buttonStyle: StyleProp<ViewStyle>
    textStyle: StyleProp<TextStyle>
    testID: string
  }

  const ReceiptTypeButton = (props: ReceiptButtonProps) => {
    return (
      <TouchableOpacity
        testID={props.testID}
        style={props.buttonStyle}
        onPress={() => {
          if (!buttonPressed) {
            setButtonPressed(props.buttonPressedText)
          }
        }}
      >
        <Text style={props.textStyle}>
          {props.buttonText}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    featureFlagEnabled('eReceipts')
      ? (
        <>
          {currentViewState === ViewState.ChooseReceiptType && (
            <>
              <ReceiptTypeHeader/>
              <ReceiptTypeButton
                buttonText='PRINT'
                buttonPressedText='print'
                buttonStyle={styles.printReceiptButton}
                textStyle={styles.buttonText}
                testID='print-receipt-button'/>
              <ReceiptTypeButton
                buttonText='EMAIL'
                buttonPressedText='eReceiptOnly'
                buttonStyle={styles.emailReceiptButton}
                textStyle={styles.buttonText}
                testID='email-receipt-button'/>
              <ReceiptTypeButton
                buttonText='BOTH EMAIL AND PRINT'
                buttonPressedText='eReceiptAndPrint'
                buttonStyle={styles.emailAndPrintReceiptButton}
                textStyle={styles.emailAndPrintButtonText}
                testID='email-and-print-receipt-button'/>
            </>)
          }

          {currentViewState === ViewState.PinpadEmailConfirmation && (
            <PinpadEmailValidationMessage />)
          }

          {currentViewState === ViewState.ModifyEmail && (
            <View style={styles.columnContainer}>
              <>
                <ModifyEmailHeader/>
                <TextInput
                  autoFocus={true}
                  blurOnSubmit={false}
                  nativeID='receiptEmail'
                  labelBackgroundColor={theme.transactionCardBackground}
                  label='E-mail Address'
                  borderColor={emailError ? '#8d0d02' : '#4F4F4F'}
                  style={styles.textBox}
                  value={textboxChanged ? input : loyaltyData.selectedLoyaltyCustomer?.emailAddress}
                  onChangeText={text => handleInput(text)}
                  error={emailError}
                  mode='outlined'
                  onSubmitEditing={() => {
                    if (!emailError) {
                      handleSubmitReceiptChoice()
                    }
                  }}
                  color={theme.fontColor}
                />
                <TouchableOpacity
                  testID='send-button'
                  style={[styles.printReceiptButton, emailError && styles.buttonDisabled]}
                  disabled={emailError}
                  onPress={() => {
                    handleSubmitReceiptChoice()
                  }}
                >
                  <Text style={styles.buttonText}>SEND</Text>
                </TouchableOpacity>
              </>
            </View>)
          }

          {currentViewState === ViewState.Final && (
            <>
              <Text style={[styles.receiptPrintedText, { color: theme.fontColor, display: 'flex', flexDirection: 'row' }]}>
                {receiptMessage}
              </Text>
              {buttonPressed !== 'print' &&
                <Text
                  style={[styles.receiptPrintedText, { color: theme.fontColor, marginTop: 18 }]}>
                  {input}
                </Text>
              }
            </>)
          }
        </>
      )
      : (
        <Text style={[styles.receiptPrintedText, { color: theme.fontColor }]}>
          receipt printed
        </Text>
      )
  )
}

const styles = StyleSheet.create({
  receiptPrintedText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  promptText: {
    fontSize: 16,
    color: '#000000'
  },
  promptHeaderText: {
    fontFamily: 'Archivo',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000'
  },
  promptMessageText: {
    fontFamily: 'Archivo',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000'
  },
  emailConfirmationText: {
    fontFamily: 'Archivo',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000'
  },
  columnContainer: {
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  emailReceiptButton: {
    width: 325,
    height: 44,
    backgroundColor: '#BB5811',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 47
  },
  textBox: {
    minWidth: 325,
    height: 52,
    marginTop: 47,
    borderRadius: 1,
    fontSize: 14
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  emailAndPrintButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#000',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  printReceiptButton: {
    width: 325,
    height: 44,
    backgroundColor: '#BB5811',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 47
  },
  emailAndPrintReceiptButton: {
    width: 325,
    height: 44,
    borderColor: 'black',
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 47
  },
  buttonDisabled: {
    backgroundColor: '#C8C8C8'
  }
})

export default ReceiptCard
