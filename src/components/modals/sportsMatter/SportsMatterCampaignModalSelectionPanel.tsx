import { StyleSheet, Text, View } from 'react-native'
import { DonationOption } from '../../../reducers/configurationData'
import { useDispatch } from 'react-redux'
import SubmitButton from '../../reusable/SubmitButton'
import { handleSelection } from '../../../utils/sportsMatterCampaign'
import { TransactionDataTypes } from '../../../reducers/transactionData'
import { UiDataErrorTypes } from '../../../reducers/uiData'
import { generalErrorMessage } from '../../../utils/reusableStrings'
import { receiveUiData } from '../../../actions/uiActions'

export interface SportsMatterCampaignModalSelectionPanelProps {
  options: Array<DonationOption>
  upc: string
  associateId: string
  transactionData: TransactionDataTypes
  addSportsMatterLoading: boolean | string
  error: UiDataErrorTypes
}

export const SportsMatterCampaignModalSelectionPanel = ({
  options,
  upc,
  associateId,
  transactionData,
  addSportsMatterLoading,
  error
}: SportsMatterCampaignModalSelectionPanelProps): JSX.Element => {
  const dispatch = useDispatch()
  const optionButtons = []
  const optionSelected = (option: DonationOption) => {
    if (option.key === 'other') {
      dispatch(receiveUiData({
        error: false
      }))
    }
    dispatch(handleSelection(upc, associateId, option, transactionData))
  }
  let roundUpAmountDisplay = ''

  if (options) {
    for (const option of options) {
      if (option.key === 'roundup') {
        roundUpAmountDisplay = option.display
        option.display = 'ROUND UP*'
      }
      optionButtons.push(
        <SubmitButton
          testID={`sports-matter-campaign-${option.key}-button`}
          disabled={addSportsMatterLoading !== false}
          loading={addSportsMatterLoading === option.value.toFixed(2)}
          buttonLabel={option.display}
          customStyles={styles.mainButton}
          customTextStyles={styles.mainButtonText}
          onSubmit={() => optionSelected(option)}
        />
      )
    }
  }
  return <>
    <View style={styles.mainHeaderContainer}>
      <Text style={styles.mainHeading}>
        Would you like to make a donation to help youth sports?
      </Text>
      {error &&
        <Text style={[styles.mainHeading, styles.errorStyling]}>
          {generalErrorMessage}
        </Text>}
    </View>
    <View style={styles.buttonsContainer}>
      {optionButtons[0]}
      {optionButtons[1]}
    </View>
    {optionButtons.length > 2 &&
    <View style={styles.buttonsContainer}>
      {optionButtons[2]}
      {optionButtons[3]}
    </View>}
    {optionButtons.length > 4 &&
    <View style={styles.buttonsContainer}>
      {optionButtons[4]}
      {optionButtons[5]}
    </View>}
    {roundUpAmountDisplay.length > 0 &&
    <Text style={styles.secondaryHeading}>
      *Rounds up <Text style={styles.boldText}>{roundUpAmountDisplay} </Text>
      to the next full dollar.
    </Text>
    }
  </>
}

const styles = StyleSheet.create({
  mainHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 35
  },
  mainHeading: {
    fontFamily: 'Archivo',
    fontStyle: 'normal',
    letterSpacing: 0.3,
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 24
  },
  errorStyling: {
    width: '100%',
    marginTop: 24,
    textAlign: 'center',
    color: '#B10216'
  },
  secondaryHeading: {
    fontFamily: 'Archivo',
    fontStyle: 'normal',
    letterSpacing: 0.3,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20
  },
  buttonsContainer: {
    display: 'flex',
    width: 400,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 5
  },
  boldText: {
    fontWeight: '600'
  },
  mainButton: {
    backgroundColor: '#006554',
    width: 150,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3
  },
  mainButtonText: {
    fontSize: 20,
    color: 'white',
    textTransform: 'uppercase',
    fontWeight: '600'
  }
})
