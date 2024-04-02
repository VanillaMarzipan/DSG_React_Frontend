import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import TextInput from '../TextInput'
import PropTypes from 'prop-types'
import { formatPhoneNumber } from '../../utils/formatters'
import { ThemeTypes } from '../../reducers/theme'
import { SelectedItems } from '../../reducers/uiData'
import { fetchLoyaltyByAccountNumber } from '../../actions/loyaltyActions'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../actions/uiActions'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import PinpadEntrySvg from '../svg/PinpadEntrySvg'
import * as CefSharp from '../../utils/cefSharp'
import { featureFlagEnabled } from '../../reducers/featureFlagData'

interface LoyaltyPhoneLookupProps {
  selectedItem: SelectedItems
  altScreenName: string
  theme: ThemeTypes
  fetchLoyalty: (phoneNumber: string) => void
}

const LoyaltyPhoneLookup = ({
  theme,
  fetchLoyalty
}: LoyaltyPhoneLookupProps): JSX.Element => {
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneOutput, setPhoneOutput] = useState('')

  const dispatch = useDispatch()
  const { autofocusTextbox, priceEditActive, pinpadPhoneEntryEnabled, loadingStates } = useSelector(state => state.uiData)
  const isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
  /**
   * Formats phone input and updates state
   * @param {string} value Latest character entered
   * @param {string} phoneInput Un-formatted phone number
   */
  const handlePhoneInput = (value: string, phoneInput: string): void => {
    if (!isNaN(parseInt(value, 10)) && phoneInput.length < 10) {
      setPhoneInput(phoneInput + value)
      setPhoneOutput(formatPhoneNumber(phoneInput + value))
    } else if (!isNaN(parseInt(value, 10)) && phoneInput.length < 12) {
      setPhoneInput(phoneInput + value)
      setPhoneOutput(phoneInput + value)
    } else if (value === 'Backspace') {
      const newPhoneNumber = phoneInput.slice(0, phoneInput.length - 1)
      setPhoneInput(newPhoneNumber)
      if (newPhoneNumber.length < 11) {
        setPhoneOutput(formatPhoneNumber(newPhoneNumber))
      } else {
        setPhoneOutput(newPhoneNumber)
      }
    } else if (value === 'Enter') {
      if (phoneInput.length === 10) {
        fetchLoyalty(phoneInput)
      } else if (phoneInput.length === 12) {
        dispatch(fetchLoyaltyByAccountNumber(phoneInput))
      }
    }
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <TextInput
        testID='loyalty-phone-lookup'
        labelBackgroundColor={theme.transactionCardBackground}
        label={pinpadPhoneEntryEnabled ? 'PIN Pad Entry is currently enabled' : 'Phone Number or Scan Scorecard'}
        style={loyaltyPhoneLookupStyles.textInput}
        color={theme.fontColor}
        value={phoneOutput}
        mode='outlined'
        disabled={priceEditActive || pinpadPhoneEntryEnabled}
        paddingMode={'less'}
        onKeyPress={e => {
          if (!priceEditActive) {
            handlePhoneInput(e.key, phoneInput)
          }
        }}
        autoFocus={
          autofocusTextbox === 'LoyaltyMiniViewController'
        }
        onFocus={() => {
          dispatch(receiveUiData({
            selectedItem: 'SCORECARD_TEXTBOX',
            autofocusTextbox: 'LoyaltyMiniViewController'
          }))
        }}
        onBlur={() => {
          dispatch(receiveUiData({
            autofocusTextbox: 'OmniSearch'
          }))
        }}
      />
      {featureFlagEnabled('LoyaltyPhonePinpadEntry') &&
      (
        <TouchableOpacity
          disabled={pinpadPhoneEntryEnabled || loadingStates.loyaltyLookup}
          onPress={() => {
            if (isCefSharp) {
              dispatch(receiveUiData({
                selectedItem: 'loyaltyPinpadPhoneLookup',
                pinpadPhoneEntryEnabled: true
              }))
              CefSharp.initiateLoyaltyPhoneInput()
            }
          }}>
          <PinpadEntrySvg disabled={pinpadPhoneEntryEnabled || loadingStates.loyaltyLookup}/>
        </TouchableOpacity>
      )}
    </View>
  )
}

const loyaltyPhoneLookupStyles = StyleSheet.create({
  textInput: {
    marginRight: 10,
    flex: 1,
    height: 50
  }
})

LoyaltyPhoneLookup.propTypes = {
  selectedItem: PropTypes.any,
  altScreenName: PropTypes.string,
  phoneInput: PropTypes.string,
  phoneOutput: PropTypes.string,
  theme: PropTypes.object,
  fetchLoyalty: PropTypes.func
}

export default LoyaltyPhoneLookup
