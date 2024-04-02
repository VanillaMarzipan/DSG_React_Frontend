import { getConfigurationValue } from '../../actions/configurationActions'
import NikeSwooshLogo from '../svg/NikeSwooshLogo'
import TagWithIconAndPopupText from './TagWithIconAndPopupText'

interface NikeConnectedLoyaltyTagProps {
  popupPosition: 'top' | 'bottom'
}

const NikeConnectedLoyaltyTag = ({ popupPosition }: NikeConnectedLoyaltyTagProps): JSX.Element => (
  getConfigurationValue('nikeconnectcampaign', 'enableLoyaltyTags')
    ? (
      <TagWithIconAndPopupText
        tagLabel='Nike Connected Member'
        popupTextLineOne='This athlete has Nike Connect and can purchase Nike Connect Members Access items.'
        tagIcon={<NikeSwooshLogo/>}
        popupPosition={popupPosition}
      />
    )
    : null
)

export default NikeConnectedLoyaltyTag
