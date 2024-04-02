import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemeTypes } from '../reducers/theme'
import Text from './StyledText'
import WarrantyItem from './WarrantyItem'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { back, receiveUiData } from '../actions/uiActions'
import { updateAnalyticsData } from '../actions/analyticsActions'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import TextInput from './TextInput'
import { getAssociateById, RECEIVE_ASSOCIATE_DATA, receiveAssociateData } from '../actions/associateActions'

interface WarrantyPanelProps {
  theme: ThemeTypes
}

const WarrantyPanel = ({ theme }: WarrantyPanelProps): JSX.Element => {
  const warrantyData = useSelector(state => state.warrantyData)
  const sellingAssociateInfo = useSelector(state => state.associateData.nsppSellingAssociate)
  const { loadingStates, error, errorMessage, showModal } = useSelector(state => state.uiData)
  const dispatch = useDispatch()
  const [sellingAssociateID, setSellingAssociateID] = useState('')
  const handleSellingAssociateID = (val) => {
    const reg = /^[0-9\b]+$/
    if (
      // allows only numbers to be typed, deletion of single digit & no leading 0's
      (reg.test(val) || val === '')
    ) setSellingAssociateID(val)
  }
  // Go back to scan Details panel if there are no warranties available
  useEffect(() => {
    !warrantyData.warranties && dispatch(back('scanDetailsPanel'))
  })

  const warrantyPanelViewed = useSelector(
    state => state.analyticsData.warrantyPanelViewed
  )
  const textInputRef = useRef(null)

  // On mount, save timestamp in redux for analytics
  useEffect(() => {
    dispatch(receiveUiData({ autofocusTextbox: 'NsppAssociateId' }))
    const warrantyPanelOnLoadTime = new Date().getTime() / 1000
    if (!warrantyPanelViewed) {
      dispatch(
        updateAnalyticsData(
          {
            warrantyPanelViewStartTime: warrantyPanelOnLoadTime
          },
          'UPDATE_ANALYTICS_DATA'
        )
      )
    }
    sendRumRunnerEvent('Warranty screen', { displayed: 1 })
    return () => {
      const warrantyPanelOnUnmountTime = new Date().getTime() / 1000
      sendRumRunnerEvent('Warranty screen time', { f_screenTime: Number(warrantyPanelOnUnmountTime - warrantyPanelOnLoadTime).toFixed(2) })
    }
  }, [])
  const enterButtonDisabled = sellingAssociateID.length !== 7
  const [sellingAssociateSubmitted, setSellingAssociateSubmitted] = useState(false)
  useEffect(() => {
    if (sellingAssociateInfo) setSellingAssociateSubmitted(true)
  }, [sellingAssociateInfo])

  const submitGetAssociateById = () => {
    dispatch(getAssociateById(sellingAssociateID))
    setSellingAssociateSubmitted(true)
    setSellingAssociateID('')
  }
  useEffect(() => {
    if (error) setSellingAssociateID(errorMessage)
  }, [error])
  useEffect(() => {
    if (!showModal) {
      dispatch(receiveUiData({ autofocusTextbox: 'NsppAssociateId' }))
      setTimeout(() => {
        const currentTextInput = textInputRef?.current
        currentTextInput && currentTextInput.focus()
      }, 10)
    }
  }, [showModal])
  return (
    <View testID='warranty-panel' style={styles.root}>
      <View>
        <Text style={styles.heading}>No Sweat Protection Plan</Text>
        <View style={styles.enterAssociateWrapper}>
          {sellingAssociateSubmitted && sellingAssociateInfo
            ? (
              <TouchableOpacity onPress={() => {
                console.info('ACTION: components > WarrantyPanel > onPress (nspp-sold-by)')
                dispatch(receiveAssociateData({ nsppSellingAssociate: null }, RECEIVE_ASSOCIATE_DATA))
              }}>
                <Text testID='nspp-sold-by'
                  style={styles.sellingAssociate}>{`Sold by: ${sellingAssociateInfo.firstName} ${sellingAssociateInfo.lastName}`}</Text>
              </TouchableOpacity>
            )
            : (
              <>
                {error && (
                  <svg style={{ position: 'absolute', top: 24, right: 32 }} width='20' height='20' viewBox='0 0 20 20'
                    fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path fillRule='evenodd' clipRule='evenodd'
                      d='M10.0001 1.66663C5.40008 1.66663 1.66675 5.39996 1.66675 9.99996C1.66675 14.6 5.40008 18.3333 10.0001 18.3333C14.6001 18.3333 18.3334 14.6 18.3334 9.99996C18.3334 5.39996 14.6001 1.66663 10.0001 1.66663ZM9.16675 14.1666V12.5H10.8334V14.1666H9.16675ZM9.16675 5.83329V10.8333H10.8334V5.83329H9.16675Z'
                      fill='#B80818'/>
                  </svg>
                )}
                <TextInput
                  ref={textInputRef}
                  nativeID='selling-associate-id'
                  testID='selling-associate-id'
                  labelBackgroundColor={'white'}
                  label='Selling Associate Number'
                  style={styles.textInput}
                  error={error}
                  value={sellingAssociateID}
                  onChangeText={text => handleSellingAssociateID(text)}
                  mode='outlined'
                  maxLength={7}
                  onFocus={() => setSellingAssociateID('')}
                  onSubmitEditing={() => {
                    if (sellingAssociateID.length === 7) submitGetAssociateById()
                  }}
                  onPress={() => setSellingAssociateID('')}
                  color={theme.fontColor}
                  autoFocus={true}
                />
                <TouchableOpacity
                  testID='nspp-enter'
                  style={[
                    styles.button,
                    enterButtonDisabled && styles.buttonDisabled
                  ]}
                  onPress={() => {
                    console.info('ACTION: components > WarrantyPanel > onPress (submitGetAssociateById)')
                    submitGetAssociateById()
                  }}
                  disabled={enterButtonDisabled}
                >
                  {loadingStates.getAssociateById
                    ? (
                      <ActivityIndicator/>
                    )
                    : (
                      <Text
                        style={[
                          styles.buttonText,
                          enterButtonDisabled && styles.buttonDisabledText
                        ]}
                      >
                    ENTER
                      </Text>
                    )}
                </TouchableOpacity>
              </>
            )}
        </View>
        <Text style={styles.subHeading}>
          The following items are eligible for a protection plan
        </Text>
      </View>
      <View style={[styles.associatedItem]}>
        {warrantyData.warranties &&
          warrantyData.warranties.map(item => (
            <WarrantyItem
              data={item.item}
              warrantyData={item.warranties}
              theme={theme}
              key={item.item.transactionItemIdentifier}
              warrantySelections={warrantyData.warrantySelections}
            />
          ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 0.5,
    lineHeight: 37,
    marginBottom: 18,
    marginTop: 20
  },
  subHeading: {
    fontSize: 16
  },
  associatedItem: {
    overflowY: 'auto',
    maxHeight: 268,
    width: '100%',
    marginTop: 40
  },
  enterAssociateWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: 343,
    height: 52,
    backgroundColor: '#BB5811',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Archivo-Bold',
    color: '#FFFFFF'
  },
  buttonDisabledText: {
    color: '#797979'
  },
  buttonDisabled: {
    backgroundColor: '#C8C8C8'
  },
  textInput: {
    height: 64,
    width: 343,
    marginBottom: 11,
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontSize: 16
  },
  sellingAssociate: {
    fontFamily: 'Archivo-Bold',
    textDecorationLine: 'underline',
    marginBottom: 27
  }
})

WarrantyPanel.propTypes = {
  warrantyData: PropTypes.object
}

export default WarrantyPanel
