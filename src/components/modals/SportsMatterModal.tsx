import { StyleSheet, Text, View, Image } from 'react-native'
import ModalBase from './Modal'
import { addSportsMatterRoundUp } from '../../actions/transactionActions'
import { getRoundUpAmount } from '../../utils/transactionHelpers'
import * as UiActions from '../../actions/uiActions'
import { useDispatch } from 'react-redux'
import sportsMatterLogo from '../../img/sports-matter.png'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import SubmitButton from '../reusable/SubmitButton'
import { getConfigurationValue } from '../../actions/configurationActions'
import { ConfigurationDataType } from '../../reducers/configurationData'
import { sendAppInsightsEvent } from '../../utils/appInsights'

interface SportsMatterModelProps {
  configurationData: ConfigurationDataType
  associateId: string
  grandTotal: number
}
const SportsMatterModal = ({ associateId, grandTotal }: SportsMatterModelProps): JSX.Element => {
  const dispatch = useDispatch()
  const loadingStates = useSelector(state => state.uiData.loadingStates)
  const sportsMatterConfigurations = getConfigurationValue('sportsmattercampaign')
  const restrictDonationOptionToOneDollar = sportsMatterConfigurations?.donationOptions === 'dollarExclusive'
  return (
    <ModalBase
      modalName={'sportsMatterRoundUp'}
      modalHeading=''
      headingSize={32}
      modalWidth={636}
      dismissable={false}
      onDismiss={() => {
        dispatch(UiActions.receiveUiData({ customerRespondedToSportsMatter: true, error: false }))
        dispatch(UiActions.updateLoadingStates({ addSportsMatterRoundUp: false }))
      }}
    >
      <View
        style={styles.outerContainer}
        testID='sports-matter-modal'>
        <Image
          testID='sports-matter-logo'
          style={styles.mainImage}
          source={{ uri: sportsMatterLogo }}
        />
        <View style={[styles.mainHeaderContainer, restrictDonationOptionToOneDollar && styles.oneDollarPromptText]}>
          <Text testID='' style={styles.mainHeading}>
            Would you like to{' '}
            {restrictDonationOptionToOneDollar ? '' : <><Text style={styles.boldText}>round up</Text>{' or '}</>}
            <Text style={styles.boldText}>donate $1</Text>
          </Text>
          <Text style={styles.mainHeading}>
            to help youth sports?
          </Text>
        </View>
        {!restrictDonationOptionToOneDollar && (
          <>
            <View style={styles.buttonsContainer}>
              <SubmitButton
                testID='sports-matter-round-up-button'
                buttonLabel='ROUND UP*'
                customStyles={styles.mainButton}
                loading={loadingStates.addSportsMatterRoundUp === 'round-up'}
                customTextStyles={styles.mainButtonText}
                disabled={loadingStates.addSportsMatterRoundUp !== false}
                onSubmit={() => dispatch(addSportsMatterRoundUp(sportsMatterConfigurations.upc, associateId))}
              />
              <SubmitButton
                testID='sports-matter-add-one-dollar-button'
                buttonLabel='$1'
                customStyles={styles.mainButton}
                loading={loadingStates.addSportsMatterRoundUp === '1.00'}
                customTextStyles={styles.mainButtonText}
                disabled={loadingStates.addSportsMatterRoundUp !== false}
                onSubmit={() => dispatch(addSportsMatterRoundUp(sportsMatterConfigurations.upc, associateId, '1.00'))}
              />
            </View>
            <Text style={styles.secondaryHeading}>
              *Rounds up <Text style={styles.boldText}>${getRoundUpAmount(grandTotal)} </Text>
              to the next full dollar.
            </Text>
          </>
        )}
        <View style={[styles.footerButtonContainer, { justifyContent: restrictDonationOptionToOneDollar ? 'space-between' : 'center' }]}>
          <SubmitButton
            testID='sports-matter-no-thanks-button'
            buttonLabel='NO THANKS'
            customStyles={styles.cancelButton}
            customTextStyles={styles.cancelButtonText}
            disabled={loadingStates.addSportsMatterRoundUp !== false}
            onSubmit={() => {
              dispatch(UiActions.receiveUiData({ showModal: false }))
              sendAppInsightsEvent('SportsMatterSelection', {
                selection: 'no',
                amount: '0.00'
              })
            }}
          />
          {restrictDonationOptionToOneDollar && (
            <SubmitButton
              testID='sports-matter-add-one-dollar-button'
              buttonLabel='YES, DONATE $1'
              customStyles={[styles.mainButton, { width: 200 }]}
              loading={loadingStates.addSportsMatterRoundUp === '1.00'}
              customTextStyles={[styles.mainButtonText, { fontSize: 16 }]}
              disabled={loadingStates.addSportsMatterRoundUp !== false}
              onSubmit={() => dispatch(addSportsMatterRoundUp(sportsMatterConfigurations.upc, associateId, '1.00'))}
            />
          )}
        </View>
      </View>
    </ModalBase>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  mainImage: {
    width: 290,
    height: 60,
    marginBottom: 20,
    marginTop: -25
  },
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
    marginBottom: 20
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
  },
  cancelButton: {
    backgroundColor: 'white',
    width: 200,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#191f1c',
    borderWidth: 1.5,
    marginBottom: 35
  },
  cancelButtonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#191F1C'
  },
  boldText: {
    fontWeight: '600'
  },
  oneDollarPromptText: {
    marginBottom: 60,
    marginTop: 40
  },
  footerButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: 435,
    justifyContent: 'center'
  }
})

export default SportsMatterModal
