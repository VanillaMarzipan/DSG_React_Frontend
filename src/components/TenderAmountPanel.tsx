import { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import TextInput from './TextInput'
import { formatNumber } from '../utils/formatters'
import PropTypes from 'prop-types'
import { TransactionDataTypes } from '../reducers/transactionData'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../actions/uiActions'
import ErrorSvg from './svg/ErrorSvg'

const isWeb = Platform.OS === 'web'

interface TenderAmountPanelProps {
  transactionData: TransactionDataTypes
  cashError: boolean
  showModal: string | boolean
  initiateTender: (string) => void
  tenderAmountInput: string
  setTenderAmountInput: (remainingBalance: string) => void
}

const TenderAmountPanel = ({
  transactionData,
  cashError,
  showModal,
  initiateTender,
  tenderAmountInput,
  setTenderAmountInput
}: TenderAmountPanelProps) => {
  const dispatch = useDispatch()
  const [error, setError] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  let _focused = false
  const _texttenderAmountInput = useRef(null)
  // This is needed on web to auto-focus the tenderAmountInput
  useEffect(() => {
    if (isWeb && !showModal) {
      dispatch(receiveUiData({ autofocusTextbox: 'CashTender' }))
      _texttenderAmountInput && _texttenderAmountInput.current && _texttenderAmountInput.current.focus()
      !_focused &&
      setTimeout(() => {
        _texttenderAmountInput && _texttenderAmountInput.current && _texttenderAmountInput.current.focus()
        _focused = true
      }, 10)
    }
  }, [showModal])

  useEffect(() => {
    if (transactionData?.tenders?.length > 0) {
      setTenderAmountInput(transactionData.total.remainingBalance.toString())
    }
  }, [transactionData?.tenders])

  const handleTenderAmountInput = (tenderAmount: string): void => {
    setTenderAmountInput(tenderAmount)
    if (error) {
      setError(false)
    }
  }

  useEffect(() => {
    dispatch(receiveUiData({ autofocusTextbox: 'CashTender' }))
  }, [])

  const handleSubmitCreditTender = (): void => {
    console.info('ACTION: components > TenderAmountPanel > onPress', { submitted: submitted })
    if (!submitted && tenderAmountInput !== '0.00' && !(parseFloat(formatNumber(tenderAmountInput)) > transactionData.total.remainingBalance)) {
      setError(false)
      setSubmitted(true)
      initiateTender(tenderAmountInput)
    } else {
      setError(true)
    }
  }

  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 72
      }}
    >
      <View style={styles.formContainer}>
        <Text
          style={styles.text}>{'How much would you like to put on the '}{(transactionData?.tenders?.length > 0) ? 'next' : 'first'}{' card?'}</Text>
        <TextInput
          nativeID='tender-amount-tenderAmountInput'
          ref={_texttenderAmountInput}
          labelBackgroundColor='#ffffff'
          label='Dollar Amount'
          style={styles.textField}
          value={tenderAmountInput}
          onChangeText={(text: string): void => {
            if (!submitted) {
              handleTenderAmountInput(formatNumber(text))
            }
          }}
          mode='outlined'
          type='number'
          onSubmitEditing={() => {
            handleSubmitCreditTender()
          }}
          autoFocus={true}
          error={error || cashError}
          selection={{ start: tenderAmountInput.length, end: tenderAmountInput.length }}
        />
        {error && (
          <>
            <View style={{ position: 'absolute', right: 34, bottom: 112 }}>
              <ErrorSvg height={22} width={22} color={'#B80818'}/>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <Text testID='split-tender-error' style={styles.errorMessage}>
                Amount entered cannot be greater than remaining due
              </Text>
            </View>
          </>
        )}
        <TouchableOpacity
          disabled={tenderAmountInput === '0.00'}
          testID='amount-enter-button'
          onPress={() => {
            handleSubmitCreditTender()
          }}
        >
          <View style={[styles.button, tenderAmountInput === '0.00' && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>Enter</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center'
  },
  text: { alignSelf: 'center', fontSize: 16, marginBottom: 32 },
  textField: {
    width: 303,
    marginBottom: 32,
    borderRadius: 0
  },
  button: {
    width: 300,
    height: 45,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600',
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 32,
    marginTop: -28,
    color: '#B80818'
  },
  buttonDisabled: {
    backgroundColor: '#BABCBB',
    ...Platform.select({
      web: {
        cursor: 'not-allowed'
      }
    })
  }
})

TenderAmountPanel.propTypes = {
  transactionData: PropTypes.object,
  cashError: PropTypes.bool,
  calculateChange: PropTypes.func,
  printerString: PropTypes.object,
  associateData: PropTypes.object,
  selectedLoyaltyCustomer: PropTypes.object
}

export default TenderAmountPanel
