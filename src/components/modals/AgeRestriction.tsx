/* eslint-disable @typescript-eslint/no-var-requires */
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import ModalBase from './Modal'
import TextInput from '../TextInput'
import * as Storage from '../../utils/asyncStorage'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { omniSearch, removeTemporaryTransactionDataKey } from '../../actions/transactionActions'
import { TransactionDataTypes } from '../../reducers/transactionData'
import { UiDataTypes } from '../../reducers/uiData'
import Queue from '../../utils/queue'
import { SellingAssociateType } from '../../reducers/associateData'
import { receiveUiData } from '../../actions/uiActions'

const moment = require('moment')

interface AgeRestrictionProps {
  storeNumber: number
  registerNumber: number
  associateId: string
  uiData: UiDataTypes
  transactionData: TransactionDataTypes
  itemLevelSapAssociate: SellingAssociateType
}

const AgeRestriction = (props: AgeRestrictionProps): JSX.Element => {
  const [input, handleChange] = useState('')
  const [wrongFormat, updateFormatError] = useState(false)
  const dispatch = useDispatch()
  const upc = useSelector(state => state.transactionData.tempUpc)
  const _textInput = useRef(null)

  const [autofocus, setAutofocus] = useState(false)

  const isInputInvalid = wrongFormat || input.length !== 10
  const isScanOngoing = (
    props.uiData.loadingStates.omniSearch !== null ||
    Queue.queueOperation.length !== 0 ||
    upc !== undefined
  )
  const disableEnterButton = (
    (!Queue.allowDequeue && isInputInvalid) ||
    (Queue.allowDequeue && isScanOngoing)
  )
  const showIndicator = Queue.allowDequeue && isScanOngoing

  // Update input state when upc changes
  useEffect(() => handleChange(''), [upc])
  const showModal = useSelector(state => state.uiData.showModal)
  useEffect(() => {
    if (showModal === 'ageRestriction') {
      Queue.setAllowDequeue(false)
      if (props.uiData.autofocusTextbox === 'Modal') {
        setTimeout(() => {
          setAutofocus(true)
          _textInput.current.focus()
        }, 10)
      }
    }
  }, [showModal])
  /**
   * Format date as MM/DD/YYYY
   * @param e Input event
   */
  const formatInput = (e: {
    target: { value: string }
    nativeEvent: { inputType: string }
  }): void => {
    const text = e.target.value.replace(/[^0-9/]/g, '')
    // https://stackoverflow.com/a/31109657/4718107
    if (text.length < 11) {
      updateFormatError(false)
      dispatch({ type: 'UPDATE_UI_DATA', data: { modalErrorMessage: false } })
      if (e.nativeEvent.inputType !== 'deleteContentBackward') {
        if (text.match(/^\d{2}$/) !== null) {
          handleChange(text + '/')
        } else if (text.match(/^\d{2}\/\d{2}$/) !== null) {
          handleChange(text + '/')
        } else {
          handleChange(text)
        }
      } else {
        handleChange(text)
      }
    }
  }

  /**
   * Calculate age from given date of birth, save to localStorage, call omnisearch with age param
   * @param {string} birthday Date of birth
   */
  const calculateAge = (birthday: string): void => {
    if (birthday.length !== 10) {
      updateFormatError(true)
    } else {
      const age = moment(new Date()).diff(moment(birthday), 'years')
      const ageNum: number = parseInt(age, 10)
      if (ageNum > 0 && ageNum < 150) {
        Storage.storeData('age', age)
        Queue.setAllowDequeue(true)
        dispatch(
          omniSearch(upc, props.associateId, 'scan', age, props.itemLevelSapAssociate?.associateId)
        )
      } else {
        updateFormatError(true)
      }
    }
  }

  /**
   * Check to see if there are any items in the transaction. If not, remove age from localstorage. Clear upc.
   */
  const onClose = (): void => {
    if (
      !props.transactionData.items ||
      props.transactionData.items.length === 0
    ) {
      Storage.removeItems(['age'])
    }
    dispatch(removeTemporaryTransactionDataKey(props.transactionData, 'tempUpc'))
    dispatch(receiveUiData({ clearUpc: true }))
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    textContainer: {
      alignItems: 'center',
      marginTop: 24
    },
    textField: {
      width: 440,
      marginBottom: 8,
      borderRadius: 0
    },
    button: {
      width: 213,
      height: 45,
      backgroundColor: disableEnterButton ? '#E3E4E4' : '#BB5811',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowRadius: 4,
      shadowOpacity: 1,
      marginBottom: 50,
      ...Platform.select({
        web: {
          cursor: disableEnterButton ? 'not-allowed' : 'pointer'
        }
      })
    },
    buttonText: {
      fontSize: 16,
      letterSpacing: 0.3,
      color: disableEnterButton ? '#8C8F8E' : '#f9f9f9',
      textTransform: 'uppercase',
      fontWeight: '600',
      textAlign: 'center'
    }
  })
  return (
    <>
      <ModalBase
        modalHeading='AGE RESTRICTED ITEM'
        modalName='ageRestriction'
        headingSize={32}
        onDismiss={(): void => {
          handleChange('')
          updateFormatError(false)
          onClose()
        }}
      >
        <View testID='age-restriction-modal' style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={{ marginBottom: 24 }}>
              This is an age restricted item.
            </Text>
            <Text style={{ marginBottom: 16 }}>
              {
                "Please review Athlete's identification and input birthdate below."
              }
            </Text>
          </View>
          <View>
            <TextInput
              ref={_textInput}
              nativeID='age-input'
              labelBackgroundColor='#ffffff'
              style={styles.textField}
              value={input}
              onChange={formatInput}
              mode='outlined'
              type='number'
              onSubmitEditing={(): void => calculateAge(input)}
              autoFocus={autofocus}
              error={false}
              label='Birthdate'
            />
            <View style={{ alignSelf: 'flex-start', flex: 1 }}>
              <Text
                style={{
                  color:
                    wrongFormat || props.uiData.modalErrorMessage
                      ? '#C50C21'
                      : 'rgba(0,0,0,.54)',
                  marginLeft: 16,
                  fontSize: 11,
                  marginTop: 10,
                  marginBottom: 20
                }}
              >
                {wrongFormat
                  ? 'Incorrect formatting.  Please input birthdate MM/DD/YYYY.'
                  : props.uiData.modalErrorMessage
                    ? props.uiData.modalErrorMessage
                    : 'MM/DD/YYYY'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            testID='age-button'
            onPress={(): void => calculateAge(input)}
            disabled={disableEnterButton}
          >
            <View style={styles.button}>
              {showIndicator
                ? (
                  <ActivityIndicator color='#ffffff'/>
                )
                : (
                  <Text style={styles.buttonText}>Enter</Text>
                )}
            </View>
          </TouchableOpacity>
        </View>
      </ModalBase>
      <ModalBase
        modalHeading='AGE RESTRICTED ITEM'
        modalName='athleteIsAgeRestricted'
        headingSize={32}
        onDismiss={(): void => {
          handleChange('')
          updateFormatError(false)
          onClose()
        }}
      >
        <View testID='athlete-is-age-restricted-modal' style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={{ marginBottom: 24 }}>
              This is an age restricted item.
            </Text>
            <Text testID='athlete-ineligible' style={{ marginBottom: 57 }}>
              This athlete is not eligible to purchase this item, based on age.
            </Text>
            <Text style={{ marginBottom: 22, fontSize: 16 }}>
              Please inform the athlete.
            </Text>
            <Text
              style={{
                color: '#B10216',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            >
              This item will not be added to the transaction
            </Text>
          </View>
        </View>
        <View style={{ height: '40px' }}><Text>{''}</Text></View>
      </ModalBase>
    </>
  )
}

export default AgeRestriction
