import { useEffect, useRef } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import TextInput from './TextInput'
import { UiDataTypes } from '../reducers/uiData'
import { cleanseNonIntegers, onKeyPressPhoneNumber } from '../utils/formatters'
import { AsYouType } from 'libphonenumber-js'
import BackButton from './BackButton'
import { useDispatch } from 'react-redux'
import { clearCustomer, fetchLoyalty } from '../actions/loyaltyActions'
import { receiveCreditEnrollmentData } from '../actions/creditEnrollmentActions'

export interface CreditEnrollmentLookupProps {
  uiData: UiDataTypes
  lookupTextInput: string
  setLookupTextInput: (input: string) => void
  enrollmentLookupStep: number
}

const CreditEnrollmentLookup = ({
  uiData,
  lookupTextInput,
  setLookupTextInput,
  enrollmentLookupStep
}: CreditEnrollmentLookupProps) => {
  const lookupRef = useRef(null)
  const dispatch = useDispatch()
  const selectedLoyaltyCustomer = useSelector(state => state.loyaltyData.selectedLoyaltyCustomer)
  const { loyaltyLookupStatus } = useSelector(state => state.creditEnrollmentData)
  const asYouType = new AsYouType('US')
  const handleTextInput = (input) => {
    const reg = /^[0-9\b]+$/
    if (
      // allows only numbers to be typed, deletion of single digit & no leading 0's
      (reg.test(input) || input === '')
    ) return setLookupTextInput(input)
  }
  const proceedToNextStep = () => {
    console.info(
      'ACTION: components > CreditEnrollmentLookup > onPress NEXT BUTTON',
      JSON.stringify({
        enrollmentLookupStep: enrollmentLookupStep, lookupTextInput: lookupTextInput
      })
    )
    if (enrollmentLookupStep === 2 && !selectedLoyaltyCustomer) {
      dispatch(fetchLoyalty(cleanseNonIntegers(lookupTextInput), 'creditEnrollment', enrollmentLookupStep))
    } else {
      dispatch(receiveCreditEnrollmentData({ enrollmentLookupStep: enrollmentLookupStep + 1 }))
    }
    if (enrollmentLookupStep === 1) {
      dispatch(receiveCreditEnrollmentData({ enrollingAssociateId: lookupTextInput }))
      setLookupTextInput('')
      if (selectedLoyaltyCustomer) {
        dispatch(receiveCreditEnrollmentData({ enrollmentLookupStep: 4 }))
      }
    }
  }
  const submitButtonDisabled = !(lookupTextInput.length === 7 || lookupTextInput.length === 14) && enrollmentLookupStep <= 2
  const loyaltyLookupSubheadings = {
    default: "Enter the athlete's phone number to lookup their scorecard",
    noAccountFound: 'No account found, please try again',
    successMultipleAccounts: 'Multiple accounts found, please close this window and add a loyalty account to the transaction',
    generalError: 'Sorry, something went wrong. Please try again'
  }
  const enrollmentLookupValues = {
    1: {
      subHeadingText: (<>
        <Text style={styles.textLine1}>
          This is the application for{' '}
          <Text style={[styles.boldText, styles.underlinedText]}>
            DSG’s ScoreRewards Credit Card.
          </Text>
        </Text>

        <Text style={styles.textLine2}>
          Enter the DKS number of the associate opening this account to continue
        </Text>
      </>),
      textInputLabel: 'DKS Number'
    },
    2: {
      subHeadingText: (
        <Text style={[styles.textLine1, loyaltyLookupStatus !== 'default' && {
          width: '80%',
          color: '#AB2635',
          textAlign: 'center'
        }]}>
          {loyaltyLookupSubheadings[loyaltyLookupStatus]}
        </Text>),
      textInputLabel: 'Phone Number'
    },
    3: {
      subHeadingText: (
        <>
          <Text style={styles.textLine1}>
            <Text style={styles.boldText}>
              Great!
            </Text>
            {' '}We’ve found a Scorecard associated with this account.
          </Text>
          <Text style={styles.textLine3}>
            Have the Athlete review the information displayed on the PinPad
          </Text>
        </>
      )
    }
  }

  useEffect(() => {
    if (selectedLoyaltyCustomer && enrollmentLookupStep === 2) {
      setLookupTextInput(asYouType.input(selectedLoyaltyCustomer.homePhone))
    }
    if (enrollmentLookupStep === 2) {
      if (lookupRef.current) {
        setTimeout(() => {
          lookupRef.current.focus()
        }, 100)
        setTimeout(() => lookupRef.current.setNativeProps({ end: 5 }), 500)
      }
    }
  }, [
    enrollmentLookupStep
  ])
  useEffect(() => {
    if (uiData.showModal === 'creditEnrollment') {
      setTimeout(() => lookupRef.current?.focus(), 100)
    }
  }, [uiData.showModal])
  return (
    <View style={styles.container} testID='enrollment-container'>
      {enrollmentLookupValues[enrollmentLookupStep]?.subHeadingText}
      {
        enrollmentLookupStep < 3
          ? (<TextInput
            ref={lookupRef}
            nativeID='credit-enrollment-lookup-input'
            testID='credit-enrollment-lookup-input'
            labelBackgroundColor='white'
            label={enrollmentLookupStep === 1 ? 'DKS Number' : 'Phone Number'}
            style={styles.textInput}
            onKeyPress={(e) => {
              if (enrollmentLookupStep === 2) {
                onKeyPressPhoneNumber(e, lookupTextInput, setLookupTextInput, asYouType)
              }
            }}
            value={lookupTextInput}
            onChangeText={text => {
              if (text.length < 15) {
                enrollmentLookupStep === 1 ? handleTextInput(text) : setLookupTextInput(text)
              }
            }}
            mode='outlined'
            maxLength={enrollmentLookupStep === 1 ? 7 : 14}
            onSubmitEditing={() => {
              proceedToNextStep()
            }}
          />)
          : selectedLoyaltyCustomer
            ? (
              <View style={{ marginBottom: 47 }}>
                <Text style={[styles.textLeft, styles.athleteAddress, styles.boldText]}>
                  {selectedLoyaltyCustomer?.firstName + ' ' + selectedLoyaltyCustomer?.lastName}
                </Text>
                <Text style={[styles.textLeft, styles.athleteAddress, styles.boldText]}>
                  {selectedLoyaltyCustomer?.street + ' ' + selectedLoyaltyCustomer?.city + ' ' + selectedLoyaltyCustomer?.state}
                </Text>
                <Text style={[styles.textLeft, styles.athleteAddress, styles.boldText]}>
                  {selectedLoyaltyCustomer?.emailAddress}
                </Text>
              </View>
            )
            : null
      }
      <TouchableOpacity
        testID={'credit-enrollment-lookup-submit'}
        disabled={submitButtonDisabled}
        style={[styles.submitButton, submitButtonDisabled && { backgroundColor: '#c8c8c8' }]}
        onPress={() => {
          proceedToNextStep()
        }}
      >
        <Text style={styles.submitButtonText}>
          {(uiData.loadingStates.creditEnrollment)
            ? <ActivityIndicator color={'#FFFFFF'}/>
            : (
              enrollmentLookupStep < 3 ? 'Enter' : 'Continue'
            )}
        </Text>
      </TouchableOpacity>
      {enrollmentLookupStep === 3 && (
        <BackButton
          size='small'
          position='bottom'
          back={() => {
            dispatch(receiveCreditEnrollmentData({ enrollmentLookupStep: 2, loyaltyLookupStatus: 'default' }))
            if (enrollmentLookupStep === 3) dispatch(clearCustomer())
          }}
          style={{
            marginBottom: -16
          }}
        />
      )}
    </View>
  )
}

export const styles = StyleSheet.create({
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
  athleteAddress: {
    marginBottom: 8,
    textAlign: 'center',
    display: 'flex'
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
  submitButton: {
    width: 230,
    height: 44,
    backgroundColor: '#C57135',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 45
  },
  submitButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }
})

export default CreditEnrollmentLookup
