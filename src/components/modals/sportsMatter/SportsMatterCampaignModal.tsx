import { StyleSheet, View, Image } from 'react-native'
import ModalBase from '../Modal'
import sportsMatterLogo from '../../../img/sports-matter.png'
import { getConfigurationValue } from '../../../actions/configurationActions'
import { ConfigurationDataType, DonationOption, SportsMatterConfigValueType } from '../../../reducers/configurationData'
import { getOptions } from '../../../utils/sportsMatterCampaign'
import { SportsMatterCampaignModalSelectionPanel } from './SportsMatterCampaignModalSelectionPanel'
import { SportsMatterCampaignModalOtherAmountPanel } from './SportsMatterCampaignModalOtherAmountPanel'
import { SportsMatterCampaignModalPinpadPanel } from './SportsMatterCampaignModalPinpadPanel'
import { connect, useDispatch } from 'react-redux'
import { UiDataTypes } from '../../../reducers/uiData'
import { AssociateDataTypes } from '../../../reducers/associateData'
import { TransactionDataTypes } from '../../../reducers/transactionData'
import PropTypes from 'prop-types'
import { RegisterDataTypes } from '../../../reducers/registerData'
import { receiveUiData, updateLoadingStates } from '../../../actions/uiActions'
import { useTypedSelector } from '../../../reducers/reducer'

const SportsMatterCampaignModal = ({ sportsMatterCampaignModalDisplay, customerRespondedToSportsMatter, associateId, transactionData, registerData }): JSX.Element => {
  const dispatch = useDispatch()
  const campaignConfiguration: SportsMatterConfigValueType = getConfigurationValue('sportsmattercampaign')
  const grandTotal: number = transactionData?.total?.grandTotal
  const options: Array<DonationOption> = getOptions(campaignConfiguration, grandTotal)
  const isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
  const uiData = useTypedSelector(state => state.uiData)
  const addSportsMatterRoundUpLoading = uiData.loadingStates.addSportsMatterRoundUp !== false
  const addSportsMatterRoundUpError = uiData.error === 'addSportsMatterRoundUp'
  return (
    <ModalBase
      modalName={'sportsMatterCampaign'}
      modalHeading=''
      headingSize={32}
      modalWidth={636}
      dismissable={false}
      onDismiss={() => {
        dispatch(receiveUiData({ customerRespondedToSportsMatter: true, sportsMatterCampaignModalDisplay: 'selections', error: false }))
        dispatch(updateLoadingStates({ addSportsMatterRoundUp: false }))
      }}
    >
      <View
        style={styles.outerContainer}
        testID='sports-matter-campaign-modal'>
        <Image
          testID='sports-matter-logo'
          style={styles.mainImage}
          source={{ uri: sportsMatterLogo }}
        />
        {(!campaignConfiguration?.usePinpad || !registerData.isAdyen || !isCefSharp) && sportsMatterCampaignModalDisplay === 'selections' &&
        <SportsMatterCampaignModalSelectionPanel
          options={options}
          upc={campaignConfiguration?.upc}
          associateId={associateId}
          transactionData={transactionData}
          addSportsMatterLoading={addSportsMatterRoundUpLoading}
          error={addSportsMatterRoundUpError}
        />
        }
        {sportsMatterCampaignModalDisplay === 'otherAmount' &&
        <SportsMatterCampaignModalOtherAmountPanel
          upc={campaignConfiguration?.upc}
          associateId={associateId}
          transactionData={transactionData}
          addSportsMatterLoading={addSportsMatterRoundUpLoading}
          error={addSportsMatterRoundUpError}
        />
        }
        {campaignConfiguration?.usePinpad && isCefSharp && registerData.isAdyen && sportsMatterCampaignModalDisplay !== 'otherAmount' &&
        <SportsMatterCampaignModalPinpadPanel
          prompt={campaignConfiguration?.pinpadPrompt}
          options={options}
          upc={campaignConfiguration?.upc}
          associateId={associateId}
          transactionData={transactionData}
          customerRespondedToSportsMatter={customerRespondedToSportsMatter}
          error={addSportsMatterRoundUpError}
        />
        }
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
  }
})

SportsMatterCampaignModal.propTypes = {
  sportsMatterCampaignModalDisplay: PropTypes.string,
  customerRespondedToSportsMatter: PropTypes.bool,
  configurationData: PropTypes.object,
  associateId: PropTypes.string,
  transactionData: PropTypes.object,
  registerData: PropTypes.object
}

export default connect(
  (globalState: {
    uiData: UiDataTypes
    configurationData: ConfigurationDataType
    associateData: AssociateDataTypes
    transactionData: TransactionDataTypes
    registerData: RegisterDataTypes}) => ({
    sportsMatterCampaignModalDisplay: globalState.uiData.sportsMatterCampaignModalDisplay,
    customerRespondedToSportsMatter: globalState.uiData.customerRespondedToSportsMatter,
    configurationData: globalState.configurationData,
    associateId: globalState.associateData.associateId,
    transactionData: globalState.transactionData,
    registerData: globalState.registerData
  }))(SportsMatterCampaignModal)
