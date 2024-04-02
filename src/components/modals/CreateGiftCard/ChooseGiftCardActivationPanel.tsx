import { View, TouchableOpacity, Text } from 'react-native'
import GiftCardStyles from './GiftCardModalStyles'

interface ChooseGiftCardActivationPanelProps {
  isInTransaction: boolean
  cardTypeSelected: (string) => void
}

const ChooseGiftCardActivationPanel = ({
  isInTransaction,
  cardTypeSelected
}: ChooseGiftCardActivationPanelProps) => {
  return (
    <View>
      <View style={GiftCardStyles.container}>
        <Text>First select a reason before swiping a card.</Text>
        <TouchableOpacity onPress={() => cardTypeSelected('sell')}>
          <View testID='sell-gift-card' style={GiftCardStyles.optionButton}>
            <Text style={GiftCardStyles.optionButtonText}>SELL GIFT CARD</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => cardTypeSelected('customer')} disabled={isInTransaction}>
          <View testID='customer-service' style={[GiftCardStyles.optionButton, isInTransaction && GiftCardStyles.optionButtonDisabled]}>
            <Text style={[GiftCardStyles.optionButtonText, isInTransaction && GiftCardStyles.optionButtonTextDisabled]}>CUSTOMER SERVICE</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => cardTypeSelected('high5')} disabled={isInTransaction}>
          <View testID='high-five' style={[GiftCardStyles.optionButton, isInTransaction && GiftCardStyles.optionButtonDisabled]}>
            <Text style={[GiftCardStyles.optionButtonText, isInTransaction && GiftCardStyles.optionButtonTextDisabled]}>HIGH FIVE CARD</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChooseGiftCardActivationPanel
