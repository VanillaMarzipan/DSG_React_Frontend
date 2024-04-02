import { StyleSheet, View, Text, ScrollView, TextStyle } from 'react-native'
import TextInput from '../../components/TextInput'
import { ThemeTypes } from '../../reducers/theme'
import SubmitButton from '../reusable/SubmitButton'
import { useState, useEffect, useRef } from 'react'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { checkForLoading } from '../../actions/uiActions'

interface ManaverOverridePanelHeaderProps {
  mainHeader: string
  subHeader: string
  mainText: string
}

interface ManagerOverridePanelProps {
  theme: ThemeTypes
  headers: ManaverOverridePanelHeaderProps
  onSubmitManagerCredentials: (associateNum: string, associatePin: string) => void
  handleDecline: () => void
  errorMessage: string
  setErrorMessage: (string) => void
}

const ManagerOverridePanel = ({ theme, headers, onSubmitManagerCredentials, handleDecline, errorMessage, setErrorMessage }: ManagerOverridePanelProps) => {
  const [associateNum, setAssociateNum] = useState('')
  const [associatePin, setAssociatePin] = useState('')
  const [associateNumError, setAssociateNumError] = useState(false)
  const [pinError, setPinError] = useState(false)
  const { uiData } = useSelector(state => ({
    uiData: state.uiData
  }))
  const managerPinRef = useRef(null)
  const {
    loadingStates
  } = useSelector(
    state => ({
      loadingStates: state.uiData.loadingStates
    })
  )

  const associateIdField = useRef(null)
  useEffect(() => {
    if (uiData.showModal === 'managerOverride' || uiData.showModal === 'alternateRefundTender') {
      setTimeout(() => associateIdField?.current?.focus(), 500)
    }
  }, [uiData.autofocusTextbox])

  const onAssociateIdInput = (text: string): void => {
    const cleanText = text.trim()
    const textLength = cleanText.length
    const regEx = /^\d*$/
    if (regEx.test(cleanText) && textLength < 8) {
      setAssociateNum(cleanText)
      setAssociateNumError(!/^\d{7}$/.test(cleanText) && textLength > 0)
    }
  }

  const resetFormData = () => {
    setErrorMessage('')
    setPinError(false)
    setAssociateNum('')
    setAssociatePin('')
    setTimeout(() => associateIdField?.current?.focus(), 100)
  }

  const onPinInput = (text: string): void => {
    setAssociatePin(/^\d*$/.test(text) ? text : '')
    setPinError(!/^\d{6}$/.test(text) && text.trim().length > 0)
  }

  const processOverride = () => {
    onSubmitManagerCredentials(associateNum, associatePin)
    resetFormData()
  }

  const nonZeroApiCallsInProgress = checkForLoading(uiData.loadingStates)
  return (
    <View>
      <Text style={ styles.subheadingText }>A manager number is required for the following reasons:</Text>
      <View testID='manager-override-modal' style={ styles.container }>
        <ScrollView style={ styles.scrollViewStyle }>
          <Text style={[styles.dialogBoxText, styles.dialogBoxHeaderText as TextStyle]}>{headers.mainHeader}</Text>
          <Text style={styles.dialogBoxText}>{headers.subHeader}</Text>
          <Text style={[styles.dialogBoxText, styles.dialogBoxErrorText as TextStyle]}>{headers.mainText}</Text>
        </ScrollView>
        <View style={ styles.textInputContainer }>
          <TextInput
            onKeyPress={e => {
              if (e.key === 'Enter' && !pinError && !associateNumError && associateNum !== '' && associatePin !== '') {
                processOverride()
              }
            }}
            ref={associateIdField}
            nativeID='managerOverrideAssociateId'
            style={ styles.textInput }
            labelBackgroundColor={ theme.backgroundColor }
            testID='associate-id'
            label='Associate ID'
            error={associateNumError}
            value={associateNum}
            onChangeText={text => onAssociateIdInput(text)}
            onSubmitEditing={() => {
              setTimeout(() => managerPinRef?.current?.focus(), 0)
            }}
            mode='outlined'
            autoFocus={true}
            color={theme.fontColor}
            maxLength={7}
          />
          <TextInput
            ref={managerPinRef}
            onKeyPress={e => {
              if (e.key === 'Enter' && !pinError && !associateNumError && associateNum !== '' && associatePin !== '') {
                processOverride()
              }
            }}
            style={styles.textInput}
            secureTextEntry={true}
            textContentType='password'
            labelBackgroundColor={theme.backgroundColor}
            testID='associate-pin'
            label='PIN'
            error={pinError}
            value={associatePin}
            onChangeText={text => onPinInput(text)}
            mode='outlined'
            color={theme.fontColor}
            maxLength={6}
          />
        </View>
        {errorMessage ? <Text style={[styles.dialogBoxText, styles.dialogBoxMainErrorText as TextStyle]}>{errorMessage}</Text> : <Text style={[styles.errorPlaceholder]}></Text>}
        {loadingStates.postVoid && <Text style={styles.dialogBoxText}>Please wait while the post-void is processing...</Text>}
        <View style={{ flexDirection: 'row', marginTop: errorMessage ? 10 : 35, width: 432, justifyContent: 'space-between' }}>
          <SubmitButton
            testID='decline-manager-override'
            disabled={nonZeroApiCallsInProgress}
            onSubmit={() => {
              resetFormData()
              handleDecline()
            }}
            loading={ loadingStates.removeCoupon || loadingStates.void || loadingStates.alternateRefundOverride }
            buttonLabel='Decline'
            customStyles={ styles.declineButton }
            customTextStyles= { styles.declineButtonText }
          />
          <SubmitButton
            testID='apply-manager-override'
            disabled={(associateNumError || pinError || associateNum === '' || associatePin === '') || nonZeroApiCallsInProgress}
            onSubmit={processOverride}
            loading={nonZeroApiCallsInProgress}
            buttonLabel='Apply'
            customStyles={[styles.declineButton, { backgroundColor: '#006554' }]}
            customTextStyles= { styles.declineButtonText }
          />
        </View>
      </View>
    </View>
  )
}

export default ManagerOverridePanel

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  subheadingText: {
    justifyContent: 'flex-start',
    fontSize: 16,
    marginTop: 12,
    marginLeft: 34
  },
  scrollViewStyle: {
    marginTop: 20,
    backgroundColor: '#F4F4F4',
    width: 578,
    minHeight: 200,
    paddingRight: 20
  },
  textInputContainer: {
    height: 60,
    width: 578,
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignVertical: 'center'
  },
  textInput: {
    minWidth: 240,
    height: 60,
    borderRadius: 0
  },
  declineButton: {
    backgroundColor: '#BB5811',
    width: 200,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  declineButtonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  dialogBoxText: {
    marginLeft: 20,
    marginBottom: 10
  },
  dialogBoxHeaderText: {
    fontWeight: '600',
    marginTop: 20
  },
  dialogBoxMainErrorText: {
    fontWeight: '400',
    marginTop: 20,
    marginRight: 18,
    color: '#B80818'
  },
  dialogBoxErrorText: {
    color: '#B80818'
  },
  errorPlaceholder: {
    height: 23
  }
})
