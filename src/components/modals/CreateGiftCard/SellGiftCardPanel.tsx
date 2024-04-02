import { View, ActivityIndicator, Text } from 'react-native'
import { UiDataTypes } from '../../../reducers/uiData'
import GiftCardStyles from './GiftCardModalStyles'

interface SellGiftCardPanelProps {
  uiData: UiDataTypes
}

const SellGiftCardPanel = ({
  uiData
}: SellGiftCardPanelProps) => {
  const defaultErrorView = () => {
    if (uiData.storeCreditError) {
      return (
        <View style={GiftCardStyles.errorContainer}>
          <Text style={GiftCardStyles.errorText}>Sorry, store credit cannot be activated for sale.</Text>
          <Text style={[GiftCardStyles.errorText, { marginTop: '1em' }]}>Please use another gift card to continue.</Text>
        </View>
      )
    } else if (uiData.scanError) {
      return (
        <View style={GiftCardStyles.errorContainer}>
          <Text style={GiftCardStyles.errorText}>Sorry, something went wrong.</Text>
          <Text style={GiftCardStyles.errorText}>Please wait a moment and try again.</Text>
          <Text style={[GiftCardStyles.errorText, { marginTop: '1em' }]}>If problem persists, please try another gift card.</Text>
        </View>
      )
    }
  }

  return (
    <View testID='sell-gift-card-modal' style={GiftCardStyles.container}>
      <View style={GiftCardStyles.textContainer}>
        <Text style={GiftCardStyles.textHeader}>Sell Gift Card</Text>
        <Text style={GiftCardStyles.textBody}>
          Swipe the gift card on the register.
        </Text>
        {
          uiData.loadingStates.sellGiftCard === true
            ? <ActivityIndicator color={'#000'} style={GiftCardStyles.activityIndicator} />
            : defaultErrorView()
        }
      </View>
    </View>
  )
}

export default SellGiftCardPanel
