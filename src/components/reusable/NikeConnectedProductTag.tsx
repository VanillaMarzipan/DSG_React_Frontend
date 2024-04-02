import { getConfigurationValue } from '../../actions/configurationActions'
import NikeSwooshLogo from '../svg/NikeSwooshLogo'
import TagWithIconAndPopupText from './TagWithIconAndPopupText'

interface NikeConnectedProductTagProps {
  popupPosition: 'top' | 'bottom'
  scrollToPopupInView?
}

const NikeConnectedProductTag = ({ popupPosition, scrollToPopupInView }: NikeConnectedProductTagProps): JSX.Element => (
  getConfigurationValue('nikeconnectcampaign', 'enableProductTags')
    ? (
      <TagWithIconAndPopupText
        tagLabel='Nike Connect Members Only'
        popupTextLineOne='This item is only to be sold to Nike Connect Members.'
        popupTextLineTwo='Please validate connected status of Athlete before purchase.'
        tagIcon={<NikeSwooshLogo/>}
        popupPosition={popupPosition}
        additionalOnPressFunctionality={scrollToPopupInView}
      />
    )
    : null
)

export default NikeConnectedProductTag
