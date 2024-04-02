import { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import TextInput from './TextInput'
import { formatNumber } from '../utils/formatters'
import PropTypes from 'prop-types'
import { TransactionDataTypes } from '../reducers/transactionData'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../actions/uiActions'
import { ReturnDataType } from '../reducers/returnData'
import { PrinterStringData } from '../reducers/printerString'
import { AssociateDataTypes } from '../reducers/associateData'
import { Customer } from '../reducers/loyaltyData'
import { WarrantyDataTypes } from '../reducers/warrantyData'
import { getConfigurationValue } from '../actions/configurationActions'

const isWeb = Platform.OS === 'web'

interface CashPanelProps {
  transactionData: TransactionDataTypes
  cashError: boolean
  calculateChange: (input: string, remainingBalance: number, printerString: PrinterStringData, associateData: AssociateDataTypes, selectedLoyaltyCustomer: Customer, returnData: ReturnDataType, warrantyData: WarrantyDataTypes) => void
  printerString: PrinterStringData
  associateData: AssociateDataTypes
  selectedLoyaltyCustomer: Customer
  returnData: ReturnDataType
  warrantyData: WarrantyDataTypes
  showModal: string | boolean
}

const CashPanel = ({
  transactionData,
  cashError,
  calculateChange,
  printerString,
  associateData,
  selectedLoyaltyCustomer,
  returnData,
  warrantyData,
  showModal
}: CashPanelProps) => {
  const dispatch = useDispatch()
  const [input, setInput] = useState<string>('0.00')
  const [submitted, setSubmitted] = useState<boolean>(false)
  let _focused = false
  const _textInput = useRef(null)
  // This is needed on web to auto-focus the input
  useEffect(() => {
    if (isWeb && !showModal) {
      dispatch(receiveUiData({ autofocusTextbox: 'CashTender' }))
      _textInput && _textInput.current && _textInput.current.focus()
      !_focused &&
      setTimeout(() => {
        _textInput && _textInput.current && _textInput.current.focus()
        _focused = true
      }, 10)
    }
  }, [showModal])

  /**
   * Sets input state. Checks that cash amount isn't greater than remaining balance
   * @param {number} cash input value
   */
  const handleCashInput = (cash: string): void => {
    setInput(cash)
  }

  useEffect(() => {
    dispatch(receiveUiData({ autofocusTextbox: 'CashTender' }))
  }, [])

  useEffect(() => {
    if (transactionData?.tenders?.length > 0) {
      setInput(transactionData.total.remainingBalance.toString())
    }
  }, [transactionData?.tenders])

  const handleSubmitCashTender = (): void => {
    if (!submitted && input !== '0.00') {
      setSubmitted(true)
      calculateChange(
        input,
        transactionData.total.remainingBalance,
        printerString,
        associateData,
        selectedLoyaltyCustomer,
        returnData,
        warrantyData
      )
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
        <Text style={styles.text}>How much cash did you receive?</Text>
        <TextInput
          maxLength={getConfigurationValue('frontendinputlimits', 'cashTenderInputLengthCap')}
          nativeID='cash-input'
          ref={_textInput}
          labelBackgroundColor='#ffffff'
          label='Dollar Amount'
          style={styles.textField}
          value={input}
          onChangeText={(text: string): void => {
            if (!submitted) {
              handleCashInput(formatNumber(text))
            }
          }}
          mode='outlined'
          type='number'
          onSubmitEditing={() => {
            handleSubmitCashTender()
          }}
          autoFocus={true}
          error={cashError}
          selection={{ start: input.length, end: input.length }}
        />
        <TouchableOpacity
          disabled={input === '0.00'}
          testID='cash-enter-button'
          onPress={() => {
            handleSubmitCashTender()
          }}
        >
          <View style={[styles.button, input === '0.00' && styles.buttonDisabled]}>
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
  buttonDisabled: {
    backgroundColor: '#BABCBB',
    ...Platform.select({
      web: {
        cursor: 'not-allowed'
      }
    })
  }
})

CashPanel.propTypes = {
  transactionData: PropTypes.object,
  cashError: PropTypes.bool,
  calculateChange: PropTypes.func,
  printerString: PropTypes.object,
  associateData: PropTypes.object,
  selectedLoyaltyCustomer: PropTypes.object
}

export default CashPanel
