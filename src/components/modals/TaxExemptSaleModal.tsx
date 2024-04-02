import { useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import TextInput from '../TextInput'
import ModalBase from './Modal'
import Text from '../StyledText'
import BarcodeSvg from '../svg/BarcodeSvg'
import SubmitButton from '../reusable/SubmitButton'
import { addTaxExemptInformation } from '../../actions/transactionActions'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../actions/uiActions'

interface TaxExemptSaleModalProps{
  uiData
}

const TaxExemptSaleModal = ({ uiData }: TaxExemptSaleModalProps) : JSX.Element => {
  const dispatch = useDispatch()
  const [customerNumber, setCustomerNumber] = useState('')
  const [autofocus, setAutofocus] = useState(false)
  const _textInput = useRef(null)

  useEffect(() => {
    if (uiData.showModal === 'taxExemptSale') {
      if (uiData.autofocusTextbox === 'Modal') {
        setTimeout(() => {
          setAutofocus(true)
          _textInput.current.focus()
        }, 10)
      }
    }
  }, [uiData.showModal])

  const handleSubmit = () => {
    if (customerNumber.length > 0) {
      dispatch(addTaxExemptInformation(customerNumber))
    }
  }

  const handleClose = () => {
    setCustomerNumber('')
    dispatch(
      receiveUiData({
        taxExemptError: null,
        scanEvent: null,
        footerOverlayActive: 'None'
      })
    )
  }

  useEffect(() => {
    if (
      uiData.scanEvent &&
      uiData.showModal === 'taxExemptSale' &&
      !uiData.loadingStates.taxExemptLookup
    ) {
      setCustomerNumber(uiData.scanEvent.scanValue)
    }
  }, [uiData.scanEvent?.scanTime])

  useEffect(() => {
    if (uiData.taxExemptError === 'invalidCustomerNumber') {
      _textInput?.current?.focus()
    }
  }, uiData.taxExemptError)

  return (
    <ModalBase
      modalName='taxExemptSale'
      modalHeading='Tax Exempt Sale'
      headingSize={20}
      modalWidth={525}
      backgroundColor='#EDEDED'
      onDismiss={ handleClose }
      dismissable={!uiData.loadingStates.taxExemptLookup}
    >
      <View style={ styles.container }>
        <Text>
          The athlete can use the self-service kiosk to create<br/>
          a new customer number, or to search for an exisiting number.
        </Text>
        <TextInput
          ref={_textInput}
          autoFocus={autofocus}
          style={styles.textInput}
          testID={'tax-exempt-customer-number-input'}
          nativeId={'tax-exempt-customer-number-input'}
          mode='outlined'
          value={customerNumber}
          labelBackgroundColor='white'
          onChangeText={text => {
            if (uiData.taxExemptError !== null) {
              dispatch(receiveUiData({
                taxExemptError: null
              }))
            }
            setCustomerNumber(text)
          }}
          label={'Customer Number'}
          error={uiData.taxExemptError !== null}
          onSubmitEditing={ handleSubmit }
        />
        {uiData.taxExemptError === 'invalidCustomerNumber' && (
          <>
            <Text style={styles.error}>
              Sorry, this customer number was not found in our system.<br/>
              Please check the number and try again.
            </Text>
          </>
        )}
        <View style={styles.midLine}>
          <Text style={styles.midLineText}>
            or
          </Text>
        </View>
        <View style={{ marginTop: 23 }}>
          <BarcodeSvg />
        </View>
        <Text style={{ marginTop: 23 }}>
          Scan the QR Code
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <SubmitButton
          testID={'tax-exempt-sale-enter-button'}
          onSubmit={ handleSubmit }
          buttonLabel={ 'Enter' }
          loading={uiData.loadingStates.taxExemptLookup}
          customStyles={styles.submitButton}
          disabled={ uiData.loadingStates.taxExemptLookup || customerNumber.length === 0 || uiData.taxExemptError === 'invalidCustomerNumber' }
        />
      </View>
    </ModalBase>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 140,
    marginLeft: 24,
    marginRight: 24,
    marginTop: 75,
    height: 343,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput: {
    height: 60,
    width: 343,
    marginBottom: 11,
    marginTop: 60,
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    backgroundColor: 'white'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
    width: '100%'
  },
  submitButton: {
    width: '100%',
    height: 62,
    marginBottom: 0
  },
  submitButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  midLine: {
    width: 288,
    height: 9,
    marginTop: 23,
    borderBottomWidth: 1,
    borderBottomColor: '#C5C5C5',
    alignItems: 'center'
  },
  midLineText: {
    backgroundColor: '#EDEDED',
    width: 36
  },
  error: {
    color: '#B10216'
  }
})

export default TaxExemptSaleModal
