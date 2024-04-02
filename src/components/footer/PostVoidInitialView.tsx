import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { receivePrintReceiptData } from '../../actions/printReceiptActions'
import { transactionByBarcode } from '../../actions/transactionActions'
import { receiveUiData } from '../../actions/uiActions'
import DecoratorLine from '../reusable/DecoratorLine'
import SubmitButton from '../reusable/SubmitButton'
import Text from '../StyledText'
import BarcodeSvg from '../svg/BarcodeSvg'
import TextInput from '../TextInput'

interface PostVoidInitialViewProps {
  setPostVoidLastTransactionSelected: (boolean) => void
  transactionByBarcodeLoading: boolean
  scanEvent
  transactionByBarcodeError
  serializedTransaction
}

const PostVoidInitialView = ({
  setPostVoidLastTransactionSelected,
  transactionByBarcodeLoading,
  scanEvent,
  transactionByBarcodeError,
  serializedTransaction
}: PostVoidInitialViewProps): JSX.Element => {
  const dispatch = useDispatch()
  const [postVoidReceiptNumber, setPostVoidReceiptNumber] = useState('')
  const handlePostVoidReceiptBarcodeLookup = (receiptNumber, inputMethod) => {
    console.info(`PostVoidInitialView > handlePostVoidReceiptBarcodeLookup > receiptBarcode: ${receiptNumber}, inputMethod: ${inputMethod}`)
    dispatch(transactionByBarcode(receiptNumber, 'postVoid', true))
  }

  const deserializedTransaction = serializedTransaction ? JSON.parse(serializedTransaction) : undefined
  const disablePostVoid = deserializedTransaction?.header?.transactionType !== 1
  useEffect(() => {
    dispatch(receiveUiData({ autofocusTextbox: 'Modal' }))
  }, [])

  const stringIsNotPurelyNumeric = (text: string): boolean => {
    const reg = /^[0-9\b]+$/
    return (text.length >= 1 && !reg.test(text))
  }

  useEffect(() => {
    if (scanEvent && scanEvent.scanValue) {
      if (stringIsNotPurelyNumeric(scanEvent.scanValue)) {
        dispatch(receivePrintReceiptData({ transactionByBarcodeError: 'invalidBarcode' }))
        return
      }
      setPostVoidReceiptNumber(scanEvent.scanValue)
      handlePostVoidReceiptBarcodeLookup(scanEvent.scanValue, 'scan')
    }
  }, [scanEvent?.scanTime])
  const decoratorLine = (
    <DecoratorLine customStyles={{ width: 126 }} />
  )

  const postVoidLookupErrorMessages = {
    701: 'Cannot post-void transaction from a different store',
    702: 'Can only post-void transactions from the same day',
    703: 'Sorry, this type of transaction is unable to be post-voided',
    704: 'Can only post-void transactions from the original register',
    705: 'Transaction not found',
    noSaleItems: 'Sorry, this type of transaction is unable to be post-voided',
    invalidBarcode: 'Sorry, the scanned barcode is invalid'
  }
  return (
    <View style={styles.container}>
      <SubmitButton
        testID={''}
        onSubmit={() => {
          setPostVoidLastTransactionSelected(true)
        }}
        disabled={disablePostVoid}
        customStyles={styles.selectLastTransaction}
        customTextStyles={styles.selectLastTransactionText}
        buttonLabel={'POST-VOID LAST TRANSACTION'}
      />
      <View style={styles.orLine}>
        {decoratorLine}
        <Text style={{ marginHorizontal: 5 }}>or</Text>
        {decoratorLine}
      </View>
      <Text style={{ marginBottom: 53 }}>Scan/Input the receipt number, located on the customer&apos;s receipt</Text>
      {
        transactionByBarcodeError && (
          postVoidLookupErrorMessages[transactionByBarcodeError]
            ? <Text style={{ marginTop: -32, marginBottom: 17, color: '#B10216' }}>{postVoidLookupErrorMessages[transactionByBarcodeError]}</Text>
            : <Text style={{ marginTop: -32, marginBottom: 17, color: '#B10216' }}>Sorry, something went wrong. Please try again.</Text>
        )
      }
      <TextInput
        nativeID='credit-enrollment-lookup-input'
        testID='credit-enrollment-lookup-input'
        labelBackgroundColor='white'
        label={'Receipt Number'}
        error={transactionByBarcodeError !== null}
        autoFocus={true}
        style={styles.textInput}
        value={postVoidReceiptNumber}
        onChangeText={text => {
          if (stringIsNotPurelyNumeric(text)) return
          setPostVoidReceiptNumber(text)
        }}
        mode='outlined'
        onSubmitEditing={() => {
          handlePostVoidReceiptBarcodeLookup(postVoidReceiptNumber, 'onPress Enter key')
        }}
      />
      <BarcodeSvg />
      <Text style={{ marginTop: 12 }}>
        Scan the receipt barcode
      </Text>
      <View style={styles.submitContainer}>
        <SubmitButton
          testID=''
          buttonLabel='NEXT'
          disabled={transactionByBarcodeLoading}
          loading={transactionByBarcodeLoading}
          customStyles={[styles.nextButton, postVoidReceiptNumber.length < 22 && { backgroundColor: '#C8C8C8' }]}
          onSubmit={() => {
            handlePostVoidReceiptBarcodeLookup(postVoidReceiptNumber, 'onPress NEXT')
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    width: 343,
    marginBottom: 32
  },
  orLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32
  },
  selectLastTransaction: {
    width: 341,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2C2C2C',
    marginTop: 69,
    marginBottom: 0
  },
  nextButton: {
    marginBottom: 0,
    bottom: -110,
    width: 'inherit',
    height: 62
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  selectLastTransactionText: {
    textAlign: 'center',
    color: '#2C2C2C'
  }
})

export default PostVoidInitialView
