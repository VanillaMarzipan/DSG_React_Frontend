import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import TextInput from '../../TextInput'
import { receiveReturnData, getReturns, lookupLoyaltyForReturns, updateReturnData } from '../../../actions/returnActions'
import { UiDataTypes } from '../../../reducers/uiData'
import { receiveUiData, updateUiData } from '../../../actions/uiActions'
import { useTypedSelector as useSelector } from '../../../reducers/reducer'
import SubmitButton from '../../reusable/SubmitButton'
import { LoyaltyAccountsFoundErrorType } from '../../../reducers/returnData'
import { featureFlagEnabled } from '../../../reducers/featureFlagData'
import DecoratorLine from '../../reusable/DecoratorLine'
import TradeInSvg from '../../svg/TradeInSvg'
import PinpadCreditCardSvg from '../../svg/PinpadCreditCardSvg'
import { AlternateReturnsViewType } from './ReturnsModal'

interface ReturnsLookupViewProps {
  returnsCode: string
  setReturnsCode: (string) => void
  uiData: UiDataTypes
  returnsLoyaltyAccountsFoundError: LoyaltyAccountsFoundErrorType
  setAlternateReturnsView: (view: AlternateReturnsViewType) => void
}

const ReturnsLookupView = ({
  returnsCode,
  setReturnsCode,
  uiData,
  returnsLoyaltyAccountsFoundError,
  setAlternateReturnsView
}: ReturnsLookupViewProps) => {
  const dispatch = useDispatch()
  const [hasReturnsError, setHasReturnsError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [prevReturnsCode, setPrevReturnsCode] = useState<string>('')

  const returnsCodeMinLength = 10
  const returnsCodeBelowMinLength = returnsCode.length > 0 && returnsCode.length < returnsCodeMinLength

  const formatLoyalty = (val: string): string => {
    return '(' + val.substring(0, 3) + ') ' + val.substring(3, 6) + '-' + val.substring(6) + '.'
  }

  const ORDER_NOT_FOUND = 'Order not found.'
  const GENERAL_ERROR_ORDER = 'Sorry, something went wrong. Please try again.'
  const NO_ACCOUNTS_FOUND = `No account found for ${formatLoyalty(returnsCode.toString())}`
  const NO_ORDERS_FOUND = `No orders found for ${formatLoyalty(returnsCode.toString())}`
  const GENERAL_ERROR_LOYALTY = 'Sorry, we could not communicate with the server. Please wait a moment and try again.'
  const RETURNS_CODE_BELOW_MIN_LENGTH = 'Input must be at least ' + returnsCodeMinLength + ' digits long.'

  const handleReturnsCode = (val) => {
    const reg = /^[0-9\b]+$/
    // allows only numbers to be typed, deletion of single digit & no leading 0's
    if (reg.test(val) || val === '') setReturnsCode(val)
  }

  const handleSubmitReturnsCode = (val) => {
    if (hasReturnsError) return
    if (returnsCodeBelowMinLength) {
      setHasReturnsError(true)
      setErrorMessage(RETURNS_CODE_BELOW_MIN_LENGTH)
    } else {
      if (val.length === returnsCodeMinLength) {
        setAlternateReturnsView('lookupOrderByLoyalty')
        dispatch(lookupLoyaltyForReturns(val))
      } else if (val.length > returnsCodeMinLength) {
        setAlternateReturnsView(null)
        dispatch(getReturns(val))
      }
    }
    setPrevReturnsCode(val)
  }

  useEffect(() => {
    if (uiData.returnsError || returnsLoyaltyAccountsFoundError) setHasReturnsError(true)
    else setHasReturnsError(false)
    if (hasReturnsError) {
      setTimeout(() => {
        dispatch(receiveUiData({ autofocusTextbox: 'Modal' }))
        const currentTextInput = textInputRef?.current
        currentTextInput && currentTextInput.focus()
      }, 10)
    }

    switch (uiData.returnsError) {
    case 'orderNotFound':
      setErrorMessage(ORDER_NOT_FOUND)
      break
    case 'generalError':
      setErrorMessage(GENERAL_ERROR_ORDER)
      break
    }

    switch (returnsLoyaltyAccountsFoundError) {
    case 'noAccountsFound':
      setErrorMessage(NO_ACCOUNTS_FOUND)
      break
    case 'noOrdersFound':
      setErrorMessage(NO_ORDERS_FOUND)
      break
    case 'generalError':
      setErrorMessage(GENERAL_ERROR_LOYALTY)
      break
    }
  }, [uiData.returnsError, returnsLoyaltyAccountsFoundError])

  useEffect(() => {
    if (returnsCode !== prevReturnsCode) {
      setHasReturnsError(false)
      setErrorMessage('')
      dispatch(updateUiData({
        returnsError: null
      }, 'UPDATE_UI_DATA'))
      dispatch(updateReturnData({
        returnsLoyaltyAccountsFound: null,
        returnsLoyaltyAccountsFoundError: null
      }, 'UPDATE_RETURN_DATA'))
    }
  }, [returnsCode, prevReturnsCode])

  useEffect(() => {
    if (uiData?.scanEvent?.scanTime) {
      if (uiData.showModal === 'returns') {
        setReturnsCode(uiData.scanEvent.scanValue)
        dispatch(getReturns(uiData.scanEvent.scanValue))
      }
    }
  }, [uiData.scanEvent?.scanTime])

  const textInputRef = useRef(null)
  useEffect(() => {
    if (uiData.showModal === 'returns') {
      setTimeout(() => {
        dispatch(receiveUiData({ autofocusTextbox: 'Modal' }))
        const currentTextInput = textInputRef?.current
        currentTextInput && currentTextInput.focus()
      }, 200)
    }
  }, [uiData.showModal])

  const featureFlags = useSelector(state => state.featureFlagData.features)
  const allowInStoreReturns = featureFlags?.includes('InStoreReturns')
  const lookupReturnsLoading = uiData.loadingStates.getReturns || uiData.loadingStates.loyaltyLookup

  return (
    <View style={styles.container}>
      {allowInStoreReturns
        ? (
          <Text style={[styles.lookupInstructions, styles.lookupInstructionsLineOne]}>
            Scan or type in a receipt or phone number.
          </Text>
        )
        : (
          <Text style={[styles.lookupInstructions, { marginVertical: 87 }]}>
            Input the athlete&apos;s order number
          </Text>
        )}
      <TextInput
        ref={textInputRef}
        nativeID='returns-re-ph-num'
        testID='returns-re-ph-num'
        labelBackgroundColor={'#EDEDED'}
        label={'Receipt or Phone number'}
        style={styles.textInput}
        error={hasReturnsError}
        value={returnsCode}
        onChangeText={text => handleReturnsCode(text)}
        mode='outlined'
        maxLength={allowInStoreReturns ? 22 : 12}
        onSubmitEditing={() => handleSubmitReturnsCode(returnsCode)}
      />

      {errorMessage.length > 0 && !lookupReturnsLoading && (
        <View style={styles.errorTextWrapper}>
          <Text
            testID='barcode-error'
            style={styles.scanErrorMessage}
          >
            {errorMessage}
          </Text>
        </View>
      )}
      <SubmitButton
        testID='lookup-return-generic-button'
        onSubmit={() => handleSubmitReturnsCode(returnsCode)}
        buttonLabel={'NEXT'}
        customStyles={styles.genericLookup}
        loading={lookupReturnsLoading}
        disabled={lookupReturnsLoading || hasReturnsError || (returnsCode.length < returnsCodeMinLength)}
      />
      <View style={styles.orContainer}>
        <DecoratorLine customStyles={styles.decoratorLine}/>
        <Text style={styles.lookupInstructionsLineTwo}>or</Text>
        <DecoratorLine customStyles={styles.decoratorLine}/>
      </View>
      <View style={styles.alternateReturnOptionsContainer}>
        <View style={styles.alternateReturnOptionsRowOneContainer}>
          {featureFlagEnabled('LookupByCreditCard') && (
            <TouchableOpacity
              onPress={() => {
                console.info('On Press > Return by credit card')
                setAlternateReturnsView('lookupOrderByCreditCard')
              }}
              style={styles.alternateReturnOptionsSquareButton}
            >
              <PinpadCreditCardSvg/>
              <Text style={styles.alternateReturnOptionsText}>RETURN BY<br/>CREDIT CARD</Text>
            </TouchableOpacity>
          )}
          {featureFlagEnabled('TradeIns') && (
            <TouchableOpacity
              onPress={() => {
                console.info('On Press > Start a Trade-In')
                setReturnsCode('')
                dispatch(receiveUiData({ scanEvent: null, returnsError: null }))
                setAlternateReturnsView('tradeIns')
              }}
              style={styles.alternateReturnOptionsSquareButton}
            >
              <TradeInSvg/>
              <Text style={styles.alternateReturnOptionsText}>START A<br/>TRADE-IN</Text>
            </TouchableOpacity>
          )}
        </View>
        {featureFlagEnabled('NonReceiptedReturns') && (
          <SubmitButton
            testID='initiate-non-receipted-return-from-order-lookup'
            buttonLabel='No Receipt Available'
            onSubmit={() => { dispatch(receiveReturnData({ nonReceiptedReturnActive: true })) }}
            customStyles={styles.noReceiptButton}
            customTextStyles={styles.noReceiptText}
            disabled={lookupReturnsLoading}
          />
        )}
      </View>
    </View>
  )
}

export default ReturnsLookupView

const styles = StyleSheet.create({
  container: {
    marginBottom: 80,
    alignItems: 'center'
  },
  textInput: {
    height: 64,
    width: 343,
    marginBottom: 16,
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontSize: 16
  },
  scanErrorMessage: {
    color: '#8d0d02',
    marginLeft: 83,
    maxWidth: 340,
    fontSize: 14
  },
  errorTextWrapper: {
    alignSelf: 'flex-start',
    marginBottom: -1,
    marginLeft: 12
  },
  lookupInstructions: {
    fontSize: 16,
    lineHeight: 24
  },
  lookupInstructionsLineOne: {
    marginTop: 60,
    marginBottom: 29
  },
  lookupInstructionsLineTwo: {
    marginHorizontal: 6,
    color: '#666666'
  },
  lookupInstructionsLineThree: {
    marginTop: 0,
    marginBottom: 0
  },
  manualReturnButton: {
    marginTop: 10,
    marginBottom: -30
  },
  noReceiptButton: {
    borderWidth: 2,
    borderColor: '#2C2C2C',
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    width: 303
  },
  noReceiptText: {
    color: '#191F1C',
    fontSize: 16
  },
  genericLookup: {
    height: 52,
    width: 343,
    marginBottom: 0
  },
  alternateReturnOptionsContainer: {
    alignItems: 'center'
  },
  alternateReturnOptionsRowOneContainer: {
    flexDirection: 'row',
    width: 304,
    justifyContent: 'center'
  },
  alternateReturnOptionsSquareButton: {
    height: 104,
    width: 140,
    borderColor: '#202124',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 10
  },
  alternateReturnOptionsText: {
    color: '#202124',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40
  },
  decoratorLine: {
    width: 126,
    backgroundColor: '#C5C5C5'
  }
})
