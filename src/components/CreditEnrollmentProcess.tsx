import { useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import Breadcrumbs from './Breadcrumbs'
import BackButton from './BackButton'
import TextInput from './TextInput'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { useDispatch } from 'react-redux'
import { cleanseNonIntegers, formatDateString } from '../utils/formatters'
import { receiveCreditEnrollmentData } from '../actions/creditEnrollmentActions'

import * as CefSharp from '../utils/cefSharp'
import { setCreditEnrollingAssociateId } from '../utils/coordinatorAPI'
import IdentificationPicker from './IdentificationPicker'

export interface CreditEnrollmentProcessProps {
  lookupTextInput: string
}

function CreditEnrollmentProcess ({
  lookupTextInput
}: CreditEnrollmentProcessProps) {
  const dispatch = useDispatch()
  const processTextRef = useRef(null)
  const idTypeTextLabels = {
    0: "Driver's License",
    1: 'Passport',
    2: 'Military ID',
    4: 'State ID'
  }
  const {
    enrollmentProcessStep,
    enrollmentStatus,
    enrollingAssociateId
  } = useSelector(state => state.creditEnrollmentData)
  const [identificationType, setIdentificationType] = useState('-1')
  const [idNumber, setIdNumber] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [creditEnrollmentResponse, setCreditEnrollmentResponse] = useState('')
  const [creditEnrollmentErrorMessage, setCreditEnrollmentErrorMessage] = useState('')
  const [creditCardApprovedType, setCreditCardApprovedType] = useState(null)
  const selectedLoyaltyCustomer = useSelector(state => state.loyaltyData.selectedLoyaltyCustomer)
  const enrollmentProcessValues = {
    1: {
      testId: 'credit-enrollment-identification-number',
      label: idTypeTextLabels[identificationType] + ' Number',
      textValue: idNumber,
      textHandler: setIdNumber,
      subHeadingText: identificationType === '0'
        ? `Verify ${selectedLoyaltyCustomer?.firstName + ' ' + selectedLoyaltyCustomer?.lastName}’s identification`
        : `Enter ${selectedLoyaltyCustomer?.firstName + ' ' + selectedLoyaltyCustomer?.lastName}’s identification number`
    },
    2: {
      testId: 'credit-enrollment-birthdate',
      label: 'Birthdate',
      textValue: birthdate,
      textHandler: setBirthdate,
      subHeadingText: `Verify ${selectedLoyaltyCustomer?.firstName + ' ' + selectedLoyaltyCustomer?.lastName}’s birthdate`
    },
    3: {
      testId: 'credit-enrollment-pinpad',
      subHeadingText: 'Instruct the athlete to complete the instructions on the Pinpad'
    }
  }
  const textValue = enrollmentProcessValues[enrollmentProcessStep]?.textValue
  const isDisabled = textValue === '' || (enrollmentProcessStep === 2 && textValue.length < 10)
  useEffect(() => {
    if (enrollmentProcessStep < 3) {
      const currentProcessTextRef = processTextRef.current
      currentProcessTextRef && currentProcessTextRef.focus()
    }
  }, [identificationType, enrollmentProcessStep])

  const transactionData = useSelector(state => state.transactionData)
  const storeInfo = useSelector(state => state.storeInfo)
  const associateData = useSelector(state => state.associateData)
  const customerDetails = {
    loyaltyCustomer: selectedLoyaltyCustomer,
    phoneNumber: lookupTextInput !== '' ? cleanseNonIntegers(lookupTextInput) : cleanseNonIntegers(selectedLoyaltyCustomer.homePhone),
    birthDate: birthdate,
    identificationType: identificationType,
    identificationNumber: idNumber
  }
  const handleCreditEnrollmentProgress = () => {
    console.info('ACTION: components > CreditEnrollmentProcess > onPress NEXT BUTTON', JSON.stringify({
      enrollmentProcessStep: enrollmentProcessStep
    }))
    if (enrollmentProcessStep === 1) {
      dispatch(receiveCreditEnrollmentData({ enrollmentProcessStep: 2 }))
    } else if (enrollmentProcessStep === 2) {
      dispatch(receiveCreditEnrollmentData({ enrollmentProcessStep: 3 }))
      console.info('CreditEnrollmentProcess > Cefsharp.beginCreditApplication > ENTER: CreditEnrollment', JSON.stringify({
        transactionData: transactionData,
        customerDetails: customerDetails
      }))
      CefSharp.beginCreditApplication(transactionData, customerDetails)
        .then(res => {
          console.info('CreditEnrollmentProcess > Cefsharp.beginCreditApplication > SUCCESS: CreditEnrollment', JSON.stringify({
            enrollingAssociateId: enrollingAssociateId
          }))
          const creditApplicationResponse = JSON.parse(res)
          dispatch(receiveCreditEnrollmentData({ enrollmentProcessStep: 4 }))
          if (creditApplicationResponse.Result.Status === 0) { // successful response
            setCreditEnrollingAssociateId(enrollingAssociateId, creditApplicationResponse.DecisionCode === '0010')
            if (creditApplicationResponse.ProductCode === '010') {
              setCreditCardApprovedType('ScoreRewards Mastercard')
            } else {
              setCreditCardApprovedType('ScoreRewards Credit Card')
            }
            if (creditApplicationResponse.DecisionCode === '0010') {
              console.info('Credit Enrollment Response: Approval')
              setCreditEnrollmentResponse(res)
              dispatch(receiveCreditEnrollmentData({ enrollmentStatus: 'approval' }))
              CefSharp.printTemporaryShoppingPass(res)
            } else {
              console.info('Credit Enrollment Response: Declined')
              dispatch(receiveCreditEnrollmentData({ enrollmentStatus: 'declined' }))
              const decCode = creditApplicationResponse.DecisionCode
              let chitType = null
              if (decCode === '0007' || decCode === '0012') chitType = 'A'
              else if (decCode === '0001' || decCode === '0006' || decCode === '0024') chitType = 'B'
              else if (decCode === '0016') chitType = 'C'
              if (chitType) {
                console.info('Credit Enrollment Response: Denial chit printed: ', JSON.stringify({
                  decisionCode: decCode,
                  chitType: chitType
                }))
                CefSharp.printEnrollmentDeniedChit(
                  JSON.stringify(transactionData),
                  JSON.stringify(storeInfo),
                  JSON.stringify(associateData),
                  chitType,
                  creditApplicationResponse.ApplicationId
                )
              } else {
                console.info('Credit Enrollment Response: Denial with no chit')
              }
            }
          } else { // No request made or no response
            if (creditApplicationResponse.Result.PaymentErrorResponse?.ErrorCondition === 2) {
              console.info('Credit Enrollment Error: customer canceled.')
              dispatch(receiveCreditEnrollmentData({ enrollmentStatus: 'canceled' }))
            } else if (creditApplicationResponse.Result.PaymentErrorResponse?.ErrorCondition === 8) {
              console.info('Credit Enrollment Error: pinpad timed out.')
              dispatch(receiveCreditEnrollmentData({ enrollmentStatus: 'timedOut' }))
            } else {
              console.info('Credit Enrollment Error: General Error.')
              setCreditEnrollmentErrorMessage(creditApplicationResponse.Result.PaymentErrorResponse?.RefusalReason)
              dispatch(receiveCreditEnrollmentData({ enrollmentStatus: 'generalError' }))
            }
          }
        })
        .catch(error => {
          dispatch(receiveCreditEnrollmentData({ enrollmentStatus: 'generalError' }))
          console.info('CreditEnrollmentProcess > Cefsharp.beginCreditApplication > ERROR: CreditEnrollment', error)
        })
    }
  }

  return (
    <View style={styles.container} testID='enrollment-container'>
      <Breadcrumbs currentProcessStep={enrollmentProcessStep} breadcrumbCount={3}
        error={enrollmentStatus !== 'approval' && enrollmentStatus !== 'none'}/>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          {enrollmentProcessStep < 4 && (
            <Text
              style={[
                styles.textLeft,
                styles.messageText,
                enrollmentProcessStep === 3 &&
                styles.subheadingStepThree]}
              testID={enrollmentProcessValues[enrollmentProcessStep].testID + '-subheading'}
            >
              {enrollmentProcessValues[enrollmentProcessStep].subHeadingText}
            </Text>
          )}
          {enrollmentProcessStep === 1
            ? (
              <IdentificationPicker
                identificationType={identificationType}
                setIdentificationType={setIdentificationType}
                idTypeTextLabels={idTypeTextLabels}
              />
            )
            : <View style={[styles.identificationPickerSpacer]}/>}
        </View>
      </View>

      {(identificationType !== '-1' && enrollmentProcessStep < 3)
        ? (<TextInput
          ref={processTextRef}
          nativeID={enrollmentProcessValues[enrollmentProcessStep].testId}
          testID={enrollmentProcessValues[enrollmentProcessStep].testId}
          labelBackgroundColor='white'
          label={enrollmentProcessValues[enrollmentProcessStep]?.label}
          style={styles.textInput}
          value={enrollmentProcessValues[enrollmentProcessStep]?.textValue}
          onKeyPress={e => {
            if (e.key !== 'Backspace' && enrollmentProcessStep === 2) {
              enrollmentProcessValues[enrollmentProcessStep].textHandler(formatDateString(textValue))
            }
          }}
          onChangeText={text => {
            const reg = /^[0-9\b]+$/
            if (enrollmentProcessStep === 2 && text.length === 1 && !reg.test(text)) return
            if (enrollmentProcessStep < 3) {
              enrollmentProcessValues[enrollmentProcessStep].textHandler(text)
            }
          }}
          mode='outlined'
          maxLength={enrollmentProcessStep === 2 ? 10 : undefined}
          onSubmitEditing={() => {
            if (enrollmentProcessStep < 3 && !isDisabled) handleCreditEnrollmentProgress()
          }}

        />)
        : (
          <View style={styles.textInput}/>
        )}
      {enrollmentProcessStep === 4 && enrollmentStatus !== null && (
        <View style={styles.decisionContainer}>
          {enrollmentStatus === 'approval'
            ? (
              <View testID='approval-message' style={{ alignItems: 'center' }}>
                <Text
                  style={styles.messageText}>Congratulations! {selectedLoyaltyCustomer.firstName + ' ' + selectedLoyaltyCustomer.lastName} has
                been approved for a </Text>
                <Text style={[styles.boldText, styles.messageText]}>{creditCardApprovedType}</Text>
              </View>
            )
            : enrollmentStatus === 'declined'
              ? (
                <View testID='declined-message' style={{ alignItems: 'center' }}>
                  <Text style={styles.messageText}>
                    {selectedLoyaltyCustomer.firstName + ' ' + selectedLoyaltyCustomer.lastName}&apos;s application was declined.
                  </Text>
                  <Text style={styles.messageText}>
                They will receive an explanation by mail in 7-10 business days.
                  </Text>
                  <Text style={styles.messageText}>
                If the athlete has any questions, they can reach Synchrony at 485-394-1998
                  </Text>
                </View>
              )
              : enrollmentStatus === 'canceled'
                ? (
                  <Text testID='canceled-message' style={styles.messageText}>Customer canceled the enrollment.</Text>
                )
                : enrollmentStatus === 'timedOut'
                  ? (
                    <Text testID='timed-out-message' style={styles.messageText}>Application process timed out.</Text>
                  )
                  : enrollmentStatus === 'generalError'
                    ? (
                      <View testID='general-error message'>
                        <Text style={styles.messageText}>
                Sorry, something went wrong.
                        </Text>
                        <Text style={styles.messageText}>
                          {creditEnrollmentErrorMessage}
                        </Text>
                      </View>)
                    : null
          }
        </View>
      )}
      {(enrollmentStatus === 'approval' && enrollmentProcessStep > 3) || (enrollmentStatus === 'none' && enrollmentProcessStep < 3)
        ? (
          <TouchableOpacity
            testID={'credit-enrollment-process-main-button'}
            onPress={() => {
              if (enrollmentProcessStep === 4) {
                CefSharp.printTemporaryShoppingPass(creditEnrollmentResponse)
              } else {
                handleCreditEnrollmentProgress()
              }
            }}
            style={[(enrollmentProcessStep <= 3 ? styles.nextButton : styles.printButton), !isDisabled && { backgroundColor: '#BB5811' }]}
            disabled={isDisabled}
          >
            <Text style={styles.nextButtonText}>
              {enrollmentProcessStep <= 3 ? 'NEXT' : 'REPRINT TEMPORARY CARD'}
            </Text>
          </TouchableOpacity>
        )
        : (
          <View style={[styles.nextButton, { backgroundColor: 'none' }]}/>
        )}
      {enrollmentProcessStep < 3 && (
        <BackButton
          testID='creditEnrollment-process-back-button'
          size='small'
          position='bottom'
          back={() => enrollmentProcessStep === 1
            ? dispatch(receiveCreditEnrollmentData({ enrollmentLookupStep: 1 }))
            : dispatch(receiveCreditEnrollmentData({ enrollmentProcessStep: enrollmentProcessStep - 1 }))
          }
          style={{
            marginBottom: -16
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 3
  },
  underlinedText: {
    textDecorationLine: 'underline'
  },
  boldText: {
    fontWeight: 'bold'
  },
  messageText: {
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column'
  },
  subheadingStepThree: {
    position: 'absolute',
    textAlign: 'center',
    top: 92,
    width: 400
  },
  textLeft: {
    textAlign: 'left'
  },
  text: {
    width: 116,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16
  },
  textInput: {
    marginBottom: 47,
    width: 331,
    height: 60
  },
  textLine1: {
    marginBottom: 26,
    marginTop: 42
  },
  textLine2: {
    marginBottom: 35
  },
  textLine3: {
    marginBottom: 24
  },
  decisionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 3,
    marginBottom: 58,
    marginTop: 38,
    position: 'absolute'
  },
  nextButton: {
    width: 230,
    height: 44,
    backgroundColor: '#797979',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 45
  },
  printButton: {
    width: 341,
    height: 44,
    backgroundColor: '#797979',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 45,
    marginTop: 24
  },
  nextButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  identificationPicker: {
    marginTop: 14,
    height: 52,
    minWidth: 343,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e3e4e4',
    fontSize: 18,
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5
  },
  identificationPickerSpacer: {
    marginTop: 14,
    height: 52,
    minWidth: 343,
    marginBottom: 20,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10
  },
  identificationInput: {
    marginBottom: 51
  }
})

export default CreditEnrollmentProcess
