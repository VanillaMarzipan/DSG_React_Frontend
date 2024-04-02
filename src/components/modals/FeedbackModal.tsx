import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Picker, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as CoordinatorAPI from '../../utils/coordinatorAPI'
import ModalBase from './Modal'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import { useDispatch } from 'react-redux'
import { receiveUiData, updateLoadingStates } from '../../actions/uiActions'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import FeedbackSuccess from '../reusable/FeedbackSuccess'
import FeedbackError from '../reusable/FeedbackError'
import DecoratorLine from '../reusable/DecoratorLine'
import SubmitButton from '../reusable/SubmitButton'
import SpeechBubbleWithHeartSvg from '../svg/SpeechBubbleWithHeartSvg'
import { getConfigurationValue } from '../../actions/configurationActions'

interface FeedbackModalProps {
  associateFirstName: string
}

const FeedbackModal = ({ ...props }: FeedbackModalProps): JSX.Element => {
  const [feedbackType, setFeedbackType] = useState('0')
  const [feedbackInput, setFeedbackInput] = useState('')
  const [panel, setPanel] = useState<'main' | 'success' | 'error' | 'disabled'>('main')

  const _textInput = useRef(null)

  const dispatch = useDispatch()

  const feedbackLoading = useSelector(state => state.uiData.loadingStates.feedback)

  const { modalErrorMessage, showModal } = useSelector(state => state.uiData)

  /**
   * Close modal. Reset feedback rating and input
   */
  const clearEntry = () => {
    setFeedbackType('0')
    setFeedbackInput('')
    setPanel('main')
  }

  const dismissModal = () => {
    dispatch({
      type: 'UPDATE_UI_DATA',
      data: { showModal: false, modalErrorMessage: false, autofocusTextbox: 'OmniSearch' }
    })
    clearEntry()
  }

  /**
   * Send feedback to coordinator.
   * @param {string} feedbackType
   * @param {string} text
   */
  const submitFeedback = (feedbackType, text) => {
    dispatch(updateLoadingStates({ feedback: true }))
    CoordinatorAPI.submitFeedback(feedbackType, props.associateFirstName, text)
      .then(response => {
        if (!response.ok) {
          throw new Error()
        }
        dispatch(receiveUiData({ modalErrorMessage: '' }))
        dispatch(updateLoadingStates({ feedback: false }))
        setPanel('success')
      })
      .catch(e => {
        console.error('Error sending general feedback: ', JSON.stringify(e))
        dispatch(receiveUiData({ modalErrorMessage: 'Sorry, something went wrong and feedback failed to submit.' }))
        dispatch(updateLoadingStates({ feedback: false }))
        setPanel('error')
      })
  }

  const focusOnTextInput = () => {
    setTimeout(() => {
      _textInput &&
        _textInput.current &&
        _textInput.current.focus()
    }, 10)
  }

  const disableFeedbackSubmit = feedbackInput.length === 0 || feedbackType === '0' || feedbackLoading

  useEffect(() => {
    if (
      showModal === 'feedback' &&
      getConfigurationValue('disabledfeatures', 'submitFeedback') &&
      panel !== 'disabled'
    ) {
      setPanel('disabled')
    }
  }, [showModal])
  return (
    <ModalBase
      modalName={'feedback'}
      modalHeading='FEEDBACK'
      headingSize={32}
      modalWidth={636}
      dismissable={panel !== 'success' && panel !== 'error'}
      onDismiss={() => {
        clearEntry()
        dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
      }}
      onShow={focusOnTextInput}>
      <View testID='feedback-modal' style={styles.container}>
        {panel === 'disabled' &&
          <View style={styles.disabledFeedbackContainer}>
            <Text style={[styles.disabledFeedbackText, { marginBottom: 32 }]}>
              Sorry, this service is currently down or under maintenance.
            </Text>
            <Text style={styles.disabledFeedbackText}>
              We are working on it. Thank you for your patience.
            </Text>
          </View>
        }
        {panel === 'main' &&
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={styles.textContainer}>
              <View
                style={[
                  styles.feedbackTypesRow,
                  {
                    alignContent: 'center',
                    justifyContent: 'space-around',
                    width: '100%'
                  }
                ]}
              >
                <Picker
                  testID='feedback-picker'
                  onValueChange={value => {
                    setFeedbackType(value)
                    focusOnTextInput()
                  }}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  value={feedbackType}
                  style={styles.typePicker}
                >
                  <Picker.Item testID='feedback-default' key='0' label='Select Feedback Type' value='0'></Picker.Item>
                  <Picker.Item testID='feedback-technical-issue' key='3' label='Technical Issue' value='3'></Picker.Item>
                  <Picker.Item testID='feedback-feature-request' key='2' label='Feature Request' value='2'></Picker.Item>
                  <Picker.Item testID='feedback-feature-general' key='1' label='General Feedback' value='1'></Picker.Item>
                </Picker>
              </View>
              <TextInput
                editable={feedbackType !== '0'}
                testID='feedback-input'
                ref={_textInput}
                style={styles.feedbackTextInput}
                multiline={true}
                value={feedbackInput}
                placeholder='Please share some details here!'
                onChangeText={text =>
                  setFeedbackInput(text)
                }
              />

              <TouchableOpacity
                disabled={feedbackType === '0' || !feedbackInput || feedbackLoading}
                style={{ width: '95%' }}
                onPress={() => {
                  if (feedbackInput && feedbackInput.length > 0) {
                    submitFeedback(feedbackType, feedbackInput)
                    sendRumRunnerEvent('Feedback', { event: 'submitted' })
                  }
                }}
              >
                <View
                  testID='feedback-send-button'
                  style={[styles.button, styles.centerAllAxes, disableFeedbackSubmit && { backgroundColor: '#c8c8c8' }]}>
                  {feedbackLoading
                    ? <ActivityIndicator />
                    : <Text style={[styles.buttonText, disableFeedbackSubmit && { color: '#4F4F4F' }]}>Send</Text>
                  }
                </View>
              </TouchableOpacity>
            </View>
            <View style={[styles.rightPanelContainer, styles.centerAllAxes]}>
              <View style={{ marginHorizontal: 18 }}>
                <View style={{ flexDirection: 'row' }}>
                  <SpeechBubbleWithHeartSvg/>
                  <Text style={styles.rightPanelHeading}>YOUR FEEDBACK MATTERS!</Text>
                </View>
                <Text style={[styles.rightPanelInfoText, { marginTop: 12 }]}>We really appreciate hearing from you.</Text>
                <Text style={[styles.rightPanelInfoText, { marginBottom: 12 }]}>Here&apos;s a list of features in progress:</Text>
                {
                  getConfigurationValue('gettingstartedmodal', 'featuresInProgress')?.map((featureName, index) => {
                    return (
                      <View
                        key={`use-ncr-when-${index}`}
                        style={{ flexDirection: 'row' }}
                      >
                        <Text style={{ marginRight: 4 }}>{'\u2022'}</Text>
                        <Text style={styles.rightPanelInfoText}>{featureName}</Text>
                      </View>
                    )
                  })
                }
                <DecoratorLine customStyles={styles.customDecoratorLine}/>
                <Text style={styles.rightPanelInfoText}>If you want to learn more about Endzone, please follow the button below!</Text>
                <View style={{ alignItems: 'center' }}>
                  <SubmitButton
                    testID='feedback-getting-started-modal'
                    onSubmit={() => dispatch(receiveUiData({ showModal: 'gettingStarted' }))}
                    buttonLabel='LEARN MORE'
                    customStyles={styles.sendFeedback}
                    customTextStyles={{ color: '#2C2C2C' }}
                  />
                </View>
              </View>
            </View>
          </View>
        }
        {panel === 'success' &&
          <FeedbackSuccess
            onClose={dismissModal}
          />
        }
        {panel === 'error' &&
          <FeedbackError
            errorMessage={modalErrorMessage}
            onClose={dismissModal}
            onRetry={() => submitFeedback(feedbackType, feedbackInput)}
          />
        }
      </View>
    </ModalBase>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 26,
    marginBottom: 36
  },
  textContainer: {
    alignItems: 'center',
    width: '50%',
    marginRight: 8
  },
  button: {
    backgroundColor: '#BB5811',
    width: '100%',
    height: 44,
    marginTop: 15
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  feedbackTypesRow: {
    flexDirection: 'row'
  },
  feedbackTextInput: {
    width: '95%',
    minHeight: 207,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e3e4e4',
    fontSize: 18,
    backgroundColor: 'white',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    outlineWidth: 0
  },
  typePicker: {
    height: 52,
    width: '95%',
    marginBottom: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e3e4e4',
    fontSize: 18,
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  rightPanelContainer: {
    backgroundColor: '#EAEAEA',
    width: 287
  },
  centerAllAxes: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightPanelHeading: {
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'DSG-Sans-Bold',
    color: '#066554'
  },
  rightPanelInfoText: {
    fontSize: 12
  },
  customDecoratorLine: {
    marginVertical: 16,
    width: 250,
    backgroundColor: '#BABABA'
  },
  sendFeedback: {
    marginTop: 16,
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    borderColor: '#2C2C2C',
    borderWidth: 2
  },
  disabledFeedbackContainer: {
    height: 327,
    justifyContent: 'center'
  },
  disabledFeedbackText: {
    color: '#B10216',
    fontSize: 16,
    textAlign: 'center'
  }
})

export default FeedbackModal
