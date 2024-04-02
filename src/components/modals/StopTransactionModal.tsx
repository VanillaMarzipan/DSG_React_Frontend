import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import { useDispatch } from 'react-redux'
import { abortOutstandingRequestsOnVoid, sendSuspendFeedback, sendVoidFeedback } from '../../utils/coordinatorAPI'
import PropTypes from 'prop-types'
import ModalBase from './Modal'
import { suspendTransaction, voidTransaction } from '../../actions/transactionActions'
import { updateAnalyticsData } from '../../actions/analyticsActions'
import { ModalStates } from '../../reducers/analyticsData'
import { TransactionDataTypes } from '../../reducers/transactionData'
import { ReturnDataType } from '../../reducers/returnData'
import { UiDataTypes } from '../../reducers/uiData'
import { receiveUiData, updateLoadingStates } from '../../actions/uiActions'
import { ConfigurationDataType } from '../../reducers/configurationData'
import { getConfigurationValue } from '../../actions/configurationActions'
import BackButton from '../BackButton'
import FeedbackError from '../reusable/FeedbackError'
import FeedbackSuccess from '../reusable/FeedbackSuccess'
import { sendAppInsightsEvent } from '../../utils/appInsights'

let associateId, transactionNumber, associateFirstName

interface StopTransactionProps {
  transactionData: TransactionDataTypes
  associateFirstName: string
  returnData: ReturnDataType
  activePanel: string
  uiData: UiDataTypes
  modalName: 'void' | 'suspend'
  storeNumber: number
  configurationData: ConfigurationDataType
}

const voidTypes = ['credit card lookup', 'pin pad', 'athlete\'s decision', 'price lookup', 'returns', 'other'] as const
type VoidType = typeof voidTypes[number]

const StopTransactionModal = ({ ...props }: StopTransactionProps): JSX.Element => {
  const dispatch = useDispatch()
  const [panel, setPanel] = useState<ModalStates>('main')
  const [input, setInput] = useState<string>('')
  const [voidType, setVoidType] = useState<VoidType | ''>('')

  // On mount, updates analytics data in redux with name of modal panel
  useEffect(() => {
    dispatch(
      updateAnalyticsData(
        {
          modalState: panel,
          feedback: false
        },
        'UPDATE_ANALYTICS_DATA'
      )
    )
  }, [])

  useEffect(() => {
    if (!props.uiData.suspendMessage) {
      return
    }
    if (props.uiData.suspendMessage === 'ok') {
      if (!props.uiData.loadingStates.void) {
        dispatch(receiveUiData({ suspendMessage: null }))
      }
      if (promptForFeedback) {
        const newModalState = props.modalName === 'void' ? 'voidReason' : 'textInput'
        setPanel(newModalState)

        dispatch(
          updateAnalyticsData(
            {
              modalState: newModalState
            },
            'UPDATE_ANALYTICS_DATA'
          )
        )
      }
    } else {
      setPanel('main')
      setInput('')
    }
  }, [props.uiData])

  /**
   * Set modal to main panel and clear input
   */
  const onShow = () => {
    setPanel('main')
    setInput('')
    setVoidType('')
  }

  /**
   * Dispatch redux void or suspend transaction action
   * @param {'void' | 'suspend'} on Panel name
   */
  const setOnPanel = (on: 'void' | 'suspend'): void => {
    associateId = props.transactionData.header.associateId
    transactionNumber = props.transactionData.header.transactionNumber
    associateFirstName = props.associateFirstName

    abortOutstandingRequestsOnVoid()
    if (on === 'void') {
      dispatch(
        voidTransaction(
          props.transactionData,
          props.returnData,
          props.uiData.loadingStates.void,
          promptForFeedback
        )
      )
    } else {
      dispatch(
        suspendTransaction(
          props.transactionData.header.storeNumber,
          props.transactionData.header.registerNumber,
          props.uiData.loadingStates.void,
          promptForFeedback
        )
      )
    }
  }

  /**
   * Send void or suspend feedback. Update analytics and ui data
   */
  const send = () => {
    dispatch(
      updateAnalyticsData(
        {
          feedback: true
        },
        'UPDATE_ANALYTICS_DATA'
      )
    )
    const fnFeedback = props.modalName === 'void' ? sendVoidFeedback : sendSuspendFeedback
    const message = props.modalName === 'void' ? `Type: ${voidType}\n\n${input}` : input
    dispatch(updateLoadingStates({ feedback: true }))
    fnFeedback(associateId, associateFirstName, transactionNumber, message)
      .then(response => {
        if (!response.ok) {
          throw new Error('Sorry, something went wrong and feedback failed to submit.')
        }
        dispatch({
          type: 'UPDATE_UI_DATA',
          data: { modalErrorMessage: false }
        })
        setPanel('success')
        dispatch(updateLoadingStates({ feedback: false }))
      })
      .catch(e => {
        console.info('Error sending void/suspend feedback: ', JSON.stringify(e))
        dispatch({
          type: 'UPDATE_UI_DATA',
          data: { modalErrorMessage: e.message }
        })
        setPanel('error')
        dispatch(updateLoadingStates({ feedback: false }))
      })
  }
  const textInputRef = useRef(null)
  /* Force focuses on the text input when the main panel mounts behind the modal */
  useEffect(() => {
    if (props.activePanel === 'initialScanPanel' && panel === 'textInput') {
      setTimeout(() => textInputRef.current?.focus(), 10)
    }
  }, [props.activePanel])
  const modalTitle = `${props.modalName[0].toUpperCase() + props.modalName.substring(1)}`

  const feedbackIsMandatory = (
    getConfigurationValue(
      'mandatoryvoidfeedback',
      'mandatoryVoidFeedback') === true ||
    getConfigurationValue(
      'voidfeedback',
      'mandatoryVoidFeedback') === true
  )
  const promptForFeedback = (
    getConfigurationValue(
      'voidfeedback',
      'doNotPrompt'
    ) !== true
  )
  const messageIsRequired = (
    voidType === 'other' ||
    props.modalName === 'suspend'
  )
  const disableSendFeedback = (
    props.uiData.loadingStates.void ||
    props.uiData.loadingStates.feedback ||
    (messageIsRequired && input.length === 0)
  )
  const disableButton = (
    props.uiData.loadingStates.void ||
    props.uiData.suspendMessage === 'ok' ||
    props.uiData.showModal === false
  )
  const setOnVoidType = (type: VoidType) => {
    setPanel('textInput')
    setVoidType(type)
  }

  const dismissModal = () => {
    dispatch(receiveUiData({
      showModal: false,
      modalErrorMessage: null,
      autofocusTextbox: 'OmniSearch',
      suspendMessage: null
    }))
  }

  return (
    <ModalBase
      modalHeading={
        panel === 'main'
          ? `${modalTitle} Transaction`
          : voidType
            ? `${modalTitle} Feedback: ${voidType}`
            : `${modalTitle} Feedback`
      }
      modalName={props.modalName}
      headingSize={32}
      onShow={onShow}
      onDismiss={() => {
        dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
      }}
      dismissable={
        !disableButton &&
        (panel === 'main' || !feedbackIsMandatory)
      }
    >
      {panel === 'main' &&
        <>
          <Text style={styles.subHeading}>
            Are you sure you want to {props.modalName} this transaction?
          </Text>
          <View
            testID='void-modal'
            style={{
              marginTop: 100,
              marginBottom: 100,
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              testID={`confirm-${props.modalName}-button`}
              disabled={disableButton}
              onPress={() => {
                setOnPanel(props.modalName)
              }}
            >
              {disableButton
                ? <ActivityIndicator/>
                : <Text style={styles.confirmButtonText}>CONFIRM</Text>
              }
            </TouchableOpacity>
            <View style={{ top: 40 }}>
              <Text style={styles.pleaseWaitText}>
                Please wait, this may take some time.
              </Text>
            </View>
            {props.uiData.suspendMessage?.length > 0 && props.uiData.suspendMessage !== 'ok' &&
              <Text style={{ marginTop: 25, color: '#B10216' }}>
                {props.uiData.suspendMessage}
              </Text>
            }
          </View>
        </>
      }
      {panel === 'voidReason' &&
        <>
          <Text style={styles.subHeading}>
            Please select a reason for voiding the transaction.
          </Text>
          <View style={styles.reasonButtons}>
            {
              voidTypes.map((type, index) => {
                return (
                  <TouchableOpacity
                    style={styles.reasonButton}
                    onPress={() => setOnVoidType(type)}
                    key={type}
                    testID={`void-reason-button-${index}`}
                  >
                    <Text style={styles.buttonText}>{type}</Text>
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </>
      }
      {panel === 'textInput' &&
        <>
          <Text style={styles.subHeading}>
            {!messageIsRequired && 'Any additional information?'}
          </Text>
          <View style={styles.feedbackContainer}>
            <TextInput
              style={styles.textInput}
              multiline={true}
              value={input}
              autoFocus={true}
              onChangeText={text => setInput(text)}
              ref={textInputRef}
              placeholder={`${(messageIsRequired) ? '' : '(Optional) '}Please provide more detail to your feedback.`}
              testID={'transaction-feedback-input'}
            />
            <View style={ [styles.feedbackInputButtons, (props.modalName === 'suspend') && { justifyContent: 'flex-end' }] }>
              {(props.modalName === 'void') &&
                <BackButton
                  style={{ position: 'relative', marginLeft: -29 }}
                  back={() => {
                    setPanel('voidReason')
                    setVoidType('')
                  }}
                />
              }
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.sendButton,
                  disableSendFeedback && { backgroundColor: '#C8C8C8' }
                ]}
                disabled={disableSendFeedback}
                onPress={() => {
                  send()
                  if (props.modalName === 'void') {
                    sendAppInsightsEvent('VoidTransactionReason', {
                      reason: voidType
                    })
                  }
                }}
                testID={'transaction-feedback-input-send'}
              >
                {
                  props.uiData.loadingStates.feedback
                    ? <ActivityIndicator/>
                    : <Text style={styles.sendButtonText}>SEND</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </>
      }
      {panel === 'success' &&
        <FeedbackSuccess
          onClose={dismissModal}
        />
      }
      {panel === 'error' &&
        <FeedbackError
          errorMessage={props.uiData.modalErrorMessage}
          onClose={dismissModal}
          onRetry={send}
        />
      }
    </ModalBase>
  )
}

export default StopTransactionModal

const styles = StyleSheet.create({
  modalPanel: {
    width: 603,
    height: 384,
    marginTop: 159,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingLeft: 20,
    borderRadius: 5
  },
  subHeading: {
    marginLeft: 32,
    marginTop: 8,
    fontSize: 16,
    color: '#666666'
  },
  pleaseWaitText: {
    marginTop: 5,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center'
  },
  button: {
    height: 52,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirmButton: {
    borderWidth: 2,
    borderColor: '#191F1C'
  },
  confirmButtonText: {
    color: '#191F1C',
    fontSize: 16,
    fontWeight: 'bold'
  },
  suspendButton: {
    backgroundColor: '#BB5811'
  },
  suspendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  sendButton: {
    backgroundColor: '#BB5811',
    marginTop: 15,
    alignSelf: 'flex-end',
    marginBottom: 15
  },
  sendButtonDisabled: {
    backgroundColor: '#666666'
  },
  sendButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Archivo-Bold',
    letterSpacing: 1.5
  },
  reasonButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 36,
    marginVertical: 16,
    justifyContent: 'center'
  },
  reasonButton: {
    margin: 16,
    width: 250,
    borderWidth: 1,
    borderColor: '#BB5811',
    textAlign: 'center',
    paddingVertical: 14
  },
  buttonText: {
    textTransform: 'uppercase',
    fontFamily: 'Archivo-Bold',
    color: '#BB5811',
    letterSpacing: 1.5
  },
  textInput: {
    marginTop: 24,
    width: '100%',
    height: 147,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111111',
    fontSize: 16,
    backgroundColor: 'white',
    padding: 16,
    alignSelf: 'center'
  },
  feedbackContainer: {
    width: 572,
    alignSelf: 'center'
  },
  feedbackInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13
  }
})

StopTransactionModal.propTypes = {
  transactionData: PropTypes.object
}
