import { useState } from 'react'
import { NativeSyntheticEvent, StyleSheet, View, TextInputChangeEventData } from 'react-native'
import TextInput from '../../TextInput'
import Text from '../../StyledText'
import SubmitButton from '../../reusable/SubmitButton'
import { handleSelection } from '../../../utils/sportsMatterCampaign'
import { useDispatch } from 'react-redux'
import { DonationOption } from '../../../reducers/configurationData'
import { TransactionDataTypes } from '../../../reducers/transactionData'
import { UiDataErrorTypes } from '../../../reducers/uiData'
import { generalErrorMessage } from '../../../utils/reusableStrings'

export interface SportsMatterCampaignModalOtherAmountPanelProps {
  upc: string
  associateId: string
  transactionData: TransactionDataTypes
  addSportsMatterLoading: boolean
  error: UiDataErrorTypes
}

export const SportsMatterCampaignModalOtherAmountPanel = ({
  upc,
  associateId,
  transactionData,
  addSportsMatterLoading,
  error
}: SportsMatterCampaignModalOtherAmountPanelProps): JSX.Element => {
  const [input, setInput] = useState('')
  const [acceptOn, setAcceptOn] = useState(false)
  const dispatch = useDispatch()

  const formatInput = (event: NativeSyntheticEvent<TextInputChangeEventData>): void => {
    let numeric = parseInt(event.nativeEvent.text.replace(/[^0-9]/g, ''))
    if (Number.isNaN(numeric)) {
      numeric = 0
    }
    const entries = numeric.toString()
    setAcceptOn(numeric > 0)
    setInput('$' + (entries.length < 2 ? '0.0' + entries : (entries.length < 3 ? '0.' + entries : entries.substring(0, entries.length - 2) + '.' + (entries.substring(entries.length - 2)))))
  }

  const submitAmount = () => {
    if (addSportsMatterLoading) return
    const amount = parseFloat(input.substring(1))
    const otherSelection: DonationOption = {
      key: 'other',
      display: 'Other',
      value: amount
    }
    dispatch(handleSelection(upc, associateId, otherSelection, transactionData))
  }

  const noThanks = () => {
    const noThanksSelection: DonationOption = {
      key: 'none',
      display: 'No Thanks',
      value: 0
    }
    dispatch(handleSelection(upc, associateId, noThanksSelection, transactionData))
  }

  const disableAcceptButton = !acceptOn || addSportsMatterLoading
  return (
    <>
      <Text style={styles.primaryText}>
      How much would the athlete like to donate?
      </Text>
      {error &&
        <Text style={[styles.primaryText, styles.errorStyling]}>
          {generalErrorMessage}
        </Text>}
      <TextInput
        nativeID='donation-input'
        labelBackgroundColor='#ffffff'
        style={styles.textField}
        disabled={addSportsMatterLoading}
        value={input}
        onChange={formatInput}
        mode='outlined'
        type='number'
        onSubmitEditing={(): void => submitAmount()}
        autoFocus={true}
        error={false}
        maxLength={9}
        label='Donation amount'
      />
      <View style={{ flexDirection: 'row' }}>
        <SubmitButton
          testID='sports-matter-campaign-other-nothanks-button'
          disabled={addSportsMatterLoading}
          buttonLabel='NO THANKS'
          customStyles={styles.mainButton}
          customTextStyles={styles.mainButtonText}
          onSubmit={(): void => noThanks()}
        />
        <SubmitButton
          testID='sports-matter-campaign-other-accept-button'
          buttonLabel='ACCEPT'
          customStyles={[styles.mainButton, disableAcceptButton ? styles.buttonDisabled : styles.buttonEnabled, { marginLeft: 40 }]}
          loading={addSportsMatterLoading}
          customTextStyles={[!acceptOn && styles.mainButtonText, acceptOn && { color: 'white', fontWeight: '600' }]}
          disabled={disableAcceptButton}
          onSubmit={(): void => submitAmount()}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  textField: {
    width: 250,
    marginTop: 24,
    marginBottom: 52,
    borderRadius: 0
  },
  primaryText: {
    marginTop: 20,
    fontSize: 20,
    lineHeight: 24,
    minWidth: 277,
    maxWidth: 277,
    textAlign: 'center'
  },
  errorStyling: {
    maxWidth: null,
    color: '#B10216'
  },
  mainButton: {
    backgroundColor: 'white',
    width: 200,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  mainButtonText: {
    color: '#1a1a1a',
    fontWeight: '600'
  },
  buttonDisabled: {
    backgroundColor: '#c0c0c0',
    borderColor: '#c0c0c0'
  },
  buttonEnabled: {
    backgroundColor: '#BB5811',
    borderColor: '#BB5811'
  }
})
