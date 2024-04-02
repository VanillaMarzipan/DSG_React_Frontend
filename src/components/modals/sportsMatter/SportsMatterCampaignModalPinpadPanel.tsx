import { useEffect } from 'react'
import { DonationOption } from '../../../reducers/configurationData'
import Text from '../../StyledText'
import { StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { promptAthleteForDonation } from '../../../utils/cefSharp'
import { handleSelection } from '../../../utils/sportsMatterCampaign'
import { TransactionDataTypes } from '../../../reducers/transactionData'
import { receiveUiData } from '../../../actions/uiActions'
import { generalErrorMessage } from '../../../utils/reusableStrings'

export interface SportsMatterCampaignModalPinpadPanelProps {
  prompt: string
  options: Array<DonationOption>
  upc: string
  associateId: string
  transactionData: TransactionDataTypes
  customerRespondedToSportsMatter: boolean
  error: boolean
}

export const SportsMatterCampaignModalPinpadPanel = ({
  prompt,
  options,
  upc,
  associateId,
  transactionData,
  customerRespondedToSportsMatter,
  error
}: SportsMatterCampaignModalPinpadPanelProps): JSX.Element => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!customerRespondedToSportsMatter || error) {
      promptAthleteForDonation(prompt, options)
        .then(data => {
          const donationOption: DonationOption = JSON.parse(data)
          dispatch(handleSelection(upc, associateId, donationOption, transactionData))
        })
        .finally(() => {
          dispatch(receiveUiData({ customerRespondedToSportsMatter: true }))
        })
    }
  }, [customerRespondedToSportsMatter, error])

  return (
    <>
      <Text style={styles.primaryText}>
        Would the athlete like to donate to help youth sports?
      </Text>
      <Text style={[styles.secondaryText, error && styles.errorStyling]}>
        {error
          ? generalErrorMessage
          : 'Waiting for athlete to make a decision on the PIN Pad...'}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  primaryText: {
    marginTop: 20,
    fontSize: 20,
    lineHeight: 24,
    minWidth: 277,
    maxWidth: 277,
    textAlign: 'center'
  },
  secondaryText: {
    marginTop: 28,
    marginBottom: 60,
    color: '#066554',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    minWidth: 277,
    maxWidth: 277,
    textAlign: 'center'
  },
  errorStyling: {
    color: '#B10216',
    maxWidth: 380
  }
})
