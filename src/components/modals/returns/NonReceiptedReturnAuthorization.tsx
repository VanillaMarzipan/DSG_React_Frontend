import { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { authorizeReturn } from '../../../actions/returnActions'
import { ReturnDataType } from '../../../reducers/returnData'
import { Modals } from '../../../reducers/uiData'
import { formatDateString } from '../../../utils/formatters'
import BackButton from '../../BackButton'
import IdentificationPicker from '../../IdentificationPicker'
import SubmitButton from '../../reusable/SubmitButton'
import Text from '../../StyledText'
import BarcodeSvg from '../../svg/BarcodeSvg'
import TextInput from '../../TextInput'

interface NonReceiptedReturnAuthorizationProps {
  returnData: ReturnDataType
  grandTotal: number
  showModal: Modals
}

const NonReceiptedReturnAuthorization = ({ returnData, grandTotal, showModal }: NonReceiptedReturnAuthorizationProps): JSX.Element => {
  const [manualIdEntry, setManualIdEntry] = useState(false)

  useEffect(() => {
    if (returnData?.returnAuthorizationData?.action === 'manual-entry') {
      console.info('nonReceiptedReturnsAuth > Modal > manualEntry auto-triggered')
      setManualIdEntry(true)
    }
  }, [returnData])
  const dispatch = useDispatch()

  const [idNumInput, setIdNumInput] = useState('')
  const [issuingStateInput, setIssuingStateInput] = useState('')
  const [expDateInput, setExpDateInput] = useState('')

  const [firstNameInput, setFirstNameInput] = useState('')
  const [lastNameInput, setLastNameInput] = useState('')
  const [birthdateInput, setBirthdateInput] = useState('')

  const [streetAddress1Input, setStreetAddress1Input] = useState('')
  const [streetAddress2Input, setStreetAddress2Input] = useState('')
  const [cityStateInput, setCityStateInput] = useState('')
  const [zipCodeInput, setZipCodeInput] = useState('')

  const [idCollectionStep, setIdCollectionStep] = useState(1)
  const [idType, setIdType] = useState('-1')
  const idTypeTextLabels = {
    0: "Driver's License",
    4: 'State ID'
  }

  const idNumInputRef = useRef(null)
  const issuingStateInputRef = useRef(null)
  const expDateInputRef = useRef(null)

  const firstNameInputRef = useRef(null)
  const lastNameInputRef = useRef(null)
  const birthdateInputRef = useRef(null)

  const streetAddress1InputRef = useRef(null)
  const streetAddress2InputRef = useRef(null)
  const cityStateInputRef = useRef(null)
  const zipCodeInputRef = useRef(null)

  const [disableNextButton, setDisableNextButton] = useState(true)

  useEffect(() => {
    if (
      (idCollectionStep === 1 && (idNumInput.length === 0 || issuingStateInput.length !== 2 || expDateInput.length !== 10)) ||
      (idCollectionStep === 2 && (firstNameInput.length === 0 || lastNameInput.length === 0 || birthdateInput.length !== 10)) ||
      (idCollectionStep === 3 && (streetAddress1Input.length === 0 || cityStateInput.length === 0 || zipCodeInput.length === 0))
    ) {
      setDisableNextButton(true)
    } else {
      setDisableNextButton(false)
    }
  }, [idCollectionStep, idNumInput, issuingStateInput, expDateInput, firstNameInput, lastNameInput, birthdateInput, streetAddress1Input, cityStateInput, zipCodeInput])

  const onClickNextButton = () => {
    if (disableNextButton) return
    console.info('OnPress > ReturnsAuth-NoReceipt-ManualID > NextButton > Step: ', idCollectionStep)
    setIdCollectionStep(idCollectionStep + 1)
    if (idCollectionStep < 4) {
      firstTextInputHandlerDictionary[idCollectionStep].ref?.current?.focus()
    }
    if (idCollectionStep === 4) {
      dispatch(authorizeReturn(grandTotal === 0, showModal, {
        idType: 1, // we only accept state or driver's license, so this is hard-coded
        idNumber: idNumInput,
        issuingStateOrProvince: issuingStateInput,
        state: cityStateInput.slice(cityStateInput.indexOf(',') + 1),
        firstName: firstNameInput,
        lastName: lastNameInput,
        address1: streetAddress1Input,
        address2: streetAddress2Input,
        city: cityStateInput.slice(0, cityStateInput.indexOf(',')),
        zip: zipCodeInput,
        expiryDate: expDateInput,
        birthdate: birthdateInput
      }))
    }
  }

  const firstTextInputHandlerDictionary = {
    1: {
      value: idNumInput,
      setValue: setIdNumInput,
      label: idTypeTextLabels[idType] + ' Number',
      testID: 'nonReceiptedAuth-idNumTextInput',
      ref: idNumInputRef,
      inLineTextInput: null
    },
    2: {
      value: firstNameInput,
      setValue: setFirstNameInput,
      label: 'First Name',
      testID: 'nonReceiptedAuth-firstNameInput',
      ref: firstNameInputRef,
      inLineTextInput: null
    },
    3: {
      value: streetAddress1Input,
      setValue: setStreetAddress1Input,
      label: 'Address 1',
      testID: 'nonReceiptedAuth-address1Input',
      streetAddress1InputRef,
      inLineTextInput: {
        value: streetAddress2Input,
        setValue: setStreetAddress2Input,
        label: 'Address 2',
        testID: 'nonReceiptedAuth-address2Input',
        ref: streetAddress2InputRef
      }
    }
  }

  const secondTextInputHandlerDictionary = {
    1: {
      value: issuingStateInput,
      setValue: setIssuingStateInput,
      label: 'Issuing State',
      testID: 'nonReceiptedAuth-stateTextInput',
      ref: issuingStateInputRef
    },
    2: {
      value: lastNameInput,
      setValue: setLastNameInput,
      label: 'Last Name',
      testID: 'nonReceiptedAuth-lastNameInput',
      ref: lastNameInputRef
    },
    3: {
      value: cityStateInput,
      setValue: setCityStateInput,
      label: 'City, State',
      testID: 'nonReceiptedAuth-cityStateInput',
      ref: cityStateInputRef
    }
  }

  const thirdTextInputHandlerDictionary = {
    1: {
      value: expDateInput,
      setValue: setExpDateInput,
      label: 'Expiration Date',
      testID: 'nonReceiptedAuth-expDateInput',
      ref: expDateInputRef
    },
    2: {
      value: birthdateInput,
      setValue: setBirthdateInput,
      label: 'Birthdate',
      testID: 'nonReceiptedAuth-birthDateInput',
      ref: birthdateInputRef
    },
    3: {
      value: zipCodeInput,
      setValue: setZipCodeInput,
      label: 'Zip Code',
      testID: 'nonReceiptedAuth-zipCodeInput',
      ref: zipCodeInputRef
    }
  }

  const thirdTextInputValue = thirdTextInputHandlerDictionary[idCollectionStep]?.value
  let subHeading = "Verify the athlete's identification"
  if (idType !== '-1' && idCollectionStep === 1 && idCollectionStep < 4) subHeading = "Input Athlete's Information"
  else if (idCollectionStep === 4) subHeading = "Confirm Athlete's Information is correct"

  return (
    <View style={{ alignItems: 'center' }}>
      {
        manualIdEntry
          ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ marginBottom: 9, marginTop: 28 }}>
                {subHeading}
              </Text>
              {idType === '-1' && (
                <IdentificationPicker
                  identificationType={idType}
                  setIdentificationType={setIdType}
                  idTypeTextLabels={idTypeTextLabels}
                />
              )}
              {idType !== '-1' && idCollectionStep < 4 && (
                <View style={[{ width: idCollectionStep === 1 ? '90%' : 300 }, idCollectionStep === 3 && { display: 'flex', flexDirection: 'row' }]}>
                  <TextInput
                    ref={firstTextInputHandlerDictionary[idCollectionStep].ref}
                    nativeID={firstTextInputHandlerDictionary[idCollectionStep].testID}
                    testID={firstTextInputHandlerDictionary[idCollectionStep].testID}
                    labelBackgroundColor='white'
                    label={firstTextInputHandlerDictionary[idCollectionStep].label}
                    style={[styles.textInput, idCollectionStep === 3 && { flex: 3, marginRight: 16 }]}
                    value={firstTextInputHandlerDictionary[idCollectionStep].value}
                    autoFocus={true}
                    onChangeText={text => {
                      firstTextInputHandlerDictionary[idCollectionStep].setValue(text.toUpperCase())
                    }}
                    mode='outlined'
                    onSubmitEditing={() => {
                      idCollectionStep === 3 ? streetAddress2InputRef.current?.focus() : secondTextInputHandlerDictionary[idCollectionStep].ref.current?.focus()
                    }}
                  />
                  {idCollectionStep === 3 && (
                    <TextInput
                      ref={firstTextInputHandlerDictionary[idCollectionStep].inLineTextInput.ref}
                      nativeID={firstTextInputHandlerDictionary[idCollectionStep].inLineTextInput.testID}
                      testID={firstTextInputHandlerDictionary[idCollectionStep].inLineTextInput.testID}
                      labelBackgroundColor='white'
                      label={firstTextInputHandlerDictionary[idCollectionStep].inLineTextInput.label}
                      style={[styles.textInput, { flex: 2 }]}
                      value={firstTextInputHandlerDictionary[idCollectionStep].inLineTextInput.value}
                      onChangeText={text => {
                        firstTextInputHandlerDictionary[idCollectionStep].inLineTextInput.setValue(text.toUpperCase())
                      }}
                      mode='outlined'
                      onSubmitEditing={() => secondTextInputHandlerDictionary[idCollectionStep].ref.current?.focus()}
                    />
                  )}
                </View>
              )}
              {
                idType !== '-1' && idCollectionStep < 4 && (
                  <View style={[idCollectionStep === 1 && { display: 'flex', flexDirection: 'row', width: '90%' }]} >
                    <TextInput
                      ref={secondTextInputHandlerDictionary[idCollectionStep].ref}
                      nativeID={secondTextInputHandlerDictionary[idCollectionStep].testID}
                      testID={secondTextInputHandlerDictionary[idCollectionStep].testID}
                      labelBackgroundColor='white'
                      label={secondTextInputHandlerDictionary[idCollectionStep].label}
                      style={[styles.textInput, idCollectionStep === 1 ? { flex: 4 } : { width: 300 }]}
                      value={secondTextInputHandlerDictionary[idCollectionStep].value}
                      onChangeText={text => {
                        const reg = /^[0-9\b]+$/
                        if (idCollectionStep === 1 && reg.test(text[text.length - 1])) return
                        secondTextInputHandlerDictionary[idCollectionStep].setValue(text.toUpperCase())
                      }}
                      onSubmitEditing={() => thirdTextInputHandlerDictionary[idCollectionStep].ref.current?.focus()}
                      maxLength={idCollectionStep === 1 ? 2 : null}
                      mode='outlined'
                    />
                    {idCollectionStep === 1 && (
                      <View style={{ flex: 1 }}/>
                    )}
                    <TextInput
                      ref={thirdTextInputHandlerDictionary[idCollectionStep].ref}
                      nativeID={thirdTextInputHandlerDictionary[idCollectionStep].testId}
                      testID={thirdTextInputHandlerDictionary[idCollectionStep].testID}
                      labelBackgroundColor='white'
                      label={thirdTextInputHandlerDictionary[idCollectionStep].label}
                      style={[styles.textInput, idCollectionStep === 1 ? { flex: 6 } : { width: 300 }]}
                      value={thirdTextInputHandlerDictionary[idCollectionStep].value}
                      onChangeText={text => {
                        thirdTextInputHandlerDictionary[idCollectionStep].setValue(text.toUpperCase())
                      }}
                      maxLength={idCollectionStep < 3 ? 10 : null}
                      onKeyPress={e => {
                        if (e.key !== 'Backspace' && idCollectionStep < 3) {
                          thirdTextInputHandlerDictionary[idCollectionStep].setValue(formatDateString(thirdTextInputValue))
                        }
                      }}
                      onSubmitEditing={() => onClickNextButton()}
                      mode='outlined'
                    />
                  </View>
                )
              }
              {idCollectionStep === 4 && (
                <Text style={ styles.confirmAthleteInfo }>
                  <Text>
                    {`${firstNameInput} ${lastNameInput}`}
                  </Text>
                  <Text>
                    {`ID Number ${idNumInput}`}
                  </Text>
                  <Text>
                    {`Issuing State ${issuingStateInput}`}
                  </Text>
                  <Text>
                    {`Expiration ${expDateInput}`}
                  </Text>
                  <Text>
                    {`DOB ${birthdateInput}`}
                  </Text>
                  <Text >
                    {streetAddress1Input}
                  </Text>
                  {streetAddress2Input && (
                    <Text>
                      {streetAddress2Input}
                    </Text>)}
                  <Text style={{ marginBottom: 34 }}>
                    {`${cityStateInput} ${zipCodeInput}`}
                  </Text>
                </Text>
              )}
              <View style={{ width: idCollectionStep === 1 ? '100%' : '150%', alignItems: 'flex-end' }}>
                <SubmitButton
                  testID='non-receipted-return-submit'
                  disabled={disableNextButton}
                  onSubmit={() => onClickNextButton()}
                  loading={false}
                  buttonLabel='NEXT'
                  customStyles={{ marginBottom: 12 }}
                />
              </View>
            </View>
          )
          : (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ marginBottom: 11, marginTop: 23 }}>
                A return with no receipt requires additional customer information.
              </Text>
              <Text style={{ marginBottom: 48 }}>
                Please ask the Athlete for a government issued identification.
              </Text>
              <Text style={{ marginBottom: 19 }}>
                Please scan the barcode on the Athlete&apos;s ID
              </Text>
              <View style={{ marginBottom: 42 }}>
                <BarcodeSvg />
              </View>
              <TouchableOpacity
                style={{ marginBottom: 32 }}
                onPress={() => {
                  console.info('NonReceiptedReturnsAuth > toggle manual id entry')
                  setManualIdEntry(true)
                }}
              >
                <Text style={{ textDecorationLine: 'underline' }}>
                  no barcode available
                </Text>
              </TouchableOpacity>
            </View>
          )
      }
      {idCollectionStep > 1 && <BackButton
        testID='nrrAuth-back-button'
        back={() => setIdCollectionStep(idCollectionStep - 1)}
        style={{ bottom: 10 }}
        position='top'
        size='small'
      />}
    </View>
  )
}

const styles = StyleSheet.create({
  textInput: {
    marginBottom: 12,
    height: 60
  },
  confirmAthleteInfo: {
    fontWeight: '700',
    lineHeight: 24,
    display: 'flex',
    flexDirection: 'column'
  }
})

export default NonReceiptedReturnAuthorization
