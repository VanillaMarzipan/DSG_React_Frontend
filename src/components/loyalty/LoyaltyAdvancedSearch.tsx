import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import TextInput from '../TextInput'
import PropTypes from 'prop-types'
import { ThemeTypes } from '../../reducers/theme'
import { UiDataTypes } from '../../reducers/uiData'
import { LoyaltyDataTypes } from '../../reducers/loyaltyData'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import SubmitButton from '../reusable/SubmitButton'
import { sendAppInsightsEvent } from '../../utils/appInsights'

interface LoyaltyAdvancedSearchProps {
  theme: ThemeTypes
  fetchLoyaltyAdvanced: (firstName: string, lastName: string, zip: string, lastItem: string | number) => void
  setEnrollment: () => void
  lastItem: string | number
  loyaltyData: LoyaltyDataTypes
  uiData: UiDataTypes
}

const LoyaltyAdvancedSearch = ({
  theme,
  setEnrollment,
  fetchLoyaltyAdvanced,
  lastItem,
  loyaltyData,
  uiData
}: LoyaltyAdvancedSearchProps): JSX.Element => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [zip, setZip] = useState('')
  const [valid, setValid] = useState(false)

  const firstNameInput = useRef(null)
  const lastNameInput = useRef(null)
  const zipInput = useRef(null)
  let _focused = false

  const refs = [firstNameInput, lastNameInput, zipInput]

  useEffect(() => {
    firstNameInput?.current && firstNameInput.current.focus()
    !_focused &&
    // This set timeout is necessary to make sure the input actually gets focused. Without it, the focus doesn't always happen
    setTimeout(() => {
      firstNameInput?.current && firstNameInput.current.focus()
      _focused = true
    }, 10)
  }, [loyaltyData.altScreenName])

  // TODO: refactor this as a util that accepts an event, a ref, and an array of refs
  // figure out a way of making this work without having to use an id on each input
  /**
   * Makes the enter key behave like a tab by focusing the next input
   * @param e Keyboard event
   * @param ref Input ref
   * @returns true if form is valid and currently focused input is input 3, otherwise does not return a value
   */
  const handleAdvancedKeyPress = (e: KeyboardEvent, ref): true | void => {
    if (e.key === 'Enter') {
      if (valid && ref.current.props.id === 3) {
        sendRumRunnerEvent('Scorecard Advanced Lookup', {
          lookup: 1
        })
        sendAppInsightsEvent('ScorecardAdvancedLookup', {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          zip
        })
        return true
      } else if (ref.current.props.id === 3) {
        // focus back to first input
        refs[0].current.focus()
      } else {
        // focus next input
        refs[ref.current.props.id].current.focus()
      }
    }
  }

  /**
   * Validates that something has been entered for the firstName and lastName inputs. That the zip is 5 characters long. Runs every time there is a change to any of those inputs.
   */
  useEffect(() => {
    if (firstName && lastName && zip.trim().length === 5) {
      setValid(true)
    } else {
      setValid(false)
    }
  }, [firstName, lastName, zip])

  /**
   * Removes alpha characters from the zip code field and updates the zip state.
   * @param {string} text Zip code
   */
  const handleZip = (text: string): void => {
    const zip = text
    setZip(zip.replace(/[^0-9]/g, ''))
  }

  return (
    <View testID='loyalty-advanced-search' style={styles.panel}>
      <View style={styles.inputs}>
        <View>
          <Text style={styles.title}>Advanced Search</Text>
          <Text style={styles.subTitle}>search by name and zip code</Text>
        </View>
        <TextInput
          ref={firstNameInput}
          testID='first-name-input'
          paddingMode={'less'}
          onChangeText={text =>
            setFirstName(text.replace(/([^a-zA-Z\s'-])/g, ''))
          }
          onKeyPress={e =>
            handleAdvancedKeyPress(e, firstNameInput)
              ? fetchLoyaltyAdvanced(
                firstName.trim(),
                lastName.trim(),
                zip,
                lastItem
              )
              : null
          }
          style={styles.advancedInput}
          labelBackgroundColor={'white'}
          label='First Name'
          value={firstName}
          color={theme.fontColor}
          mode='outlined'
          id={1}
          maxLength={40}
          autoFocus={uiData.autofocusTextbox === 'LoyaltyAdvancedSearch'}
        />
        <TextInput
          ref={lastNameInput}
          testID='last-name-input'
          paddingMode={'less'}
          onChangeText={text =>
            setLastName(text.replace(/([^a-zA-Z\s'-])/g, ''))
          }
          onKeyPress={e =>
            handleAdvancedKeyPress(e, lastNameInput)
              ? fetchLoyaltyAdvanced(
                firstName.trim(),
                lastName.trim(),
                zip,
                lastItem
              )
              : null
          }
          style={styles.advancedInput}
          labelBackgroundColor={'white'}
          label='Last Name'
          value={lastName}
          color={theme.fontColor}
          mode='outlined'
          id={2}
          maxLength={40}
        />
        <TextInput
          ref={zipInput}
          testID='zip-input'
          paddingMode={'less'}
          onChangeText={text => handleZip(text)}
          onKeyPress={e =>
            handleAdvancedKeyPress(e, zipInput)
              ? fetchLoyaltyAdvanced(
                firstName.trim(),
                lastName.trim(),
                zip,
                lastItem
              )
              : null
          }
          style={styles.advancedInput}
          labelBackgroundColor={'white'}
          maxLength={5}
          label='Zip Code'
          value={zip}
          color={theme.fontColor}
          mode='outlined'
          id={3}
        />
        <TouchableOpacity
          style={styles.buttonContainer}
          testID='name-zip-search'
          disabled={!valid}
          onPress={() => {
            console.info('ACTION: components > loyalty > LoyaltyAdvancedSearch > onPress (fetchLoyaltyAdvanced)')
            fetchLoyaltyAdvanced(firstName, lastName, zip, lastItem)
          }}
        >
          <View style={styles.button}>
            {uiData.loadingStates.loyaltyAdvanced
              ? (
                <ActivityIndicator/>
              )
              : (
                <Text style={styles.buttonText}>Search</Text>
              )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.verticalLine}/>
      <View style={styles.enrollment}>
        <Text style={styles.questionText}>Not a Scorecard Holder?</Text>
        <SubmitButton
          testID='enroll-now'
          buttonLabel='ENROLL NOW'
          customStyles={styles.enrollButton}
          customTextStyles={styles.enrollText}
          onSubmit={() => {
            console.info('ACTION: components > loyalty > LoyaltyAdvancedSearch > onPress (setEnrollment)')
            setEnrollment()
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  advancedInput: {
    width: 303,
    height: 46
  },
  enrollment: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 64,
    alignSelf: 'stretch'
  },
  buttonContainer: {
    marginTop: 8
  },
  button: {
    width: 303,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#191F1C'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#191F1C',
    fontWeight: 'bold'
  },
  enrollButton: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#191F1C',
    backgroundColor: '#FFFFFF'
  },
  enrollText: {
    color: '#191F1C',
    fontWeight: 'bold'
  },
  inputs: {
    display: 'flex',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 32,
    paddingRight: 32
  },
  panel: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 325
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subTitle: {
    fontSize: 16
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  verticalLine: {
    width: 2,
    backgroundColor: '#A7A7A7',
    height: 270
  }
})

LoyaltyAdvancedSearch.propTypes = {
  theme: PropTypes.object,
  fetchLoyaltyAdvanced: PropTypes.func,
  setEnrollment: PropTypes.func,
  lastItem: PropTypes.any,
  loyaltyData: PropTypes.object
}
export default LoyaltyAdvancedSearch
