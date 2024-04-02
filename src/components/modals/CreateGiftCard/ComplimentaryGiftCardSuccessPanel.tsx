import { View, Text } from 'react-native'
import SubmitButton from '../../reusable/SubmitButton'
import GiftCardStyles from './GiftCardModalStyles'

interface ConfirmCardCreationPanelProps{
  complimentaryCardTypeDescription: string
  amount: number
  completeCardCreation: () => void
}

const ComplimentaryGiftCardSuccessPanel = ({
  complimentaryCardTypeDescription,
  amount,
  completeCardCreation
}: ConfirmCardCreationPanelProps) => {
  return (
    <View style={GiftCardStyles.container}>
      <Text testID='complimentary-giftcard-sub-header' style={GiftCardStyles.complimentaryCardTypeSubHeader}>{complimentaryCardTypeDescription}</Text>
      <Text testID='complimentary-giftcard-amount' style={GiftCardStyles.amountConfirm}>${amount.toFixed(2)}</Text>
      <Text style={GiftCardStyles.confirmText}>Gift card was successfully created.</Text>
      <SubmitButton
        testID='complete-complimentary-giftcard'
        buttonLabel='COMPLETE'
        onSubmit={completeCardCreation}
        customStyles={GiftCardStyles.confirmButton}
      />
    </View>
  )
}

export default ComplimentaryGiftCardSuccessPanel
