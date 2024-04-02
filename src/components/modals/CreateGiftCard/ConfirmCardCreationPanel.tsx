import { useState } from 'react'
import { View, Text } from 'react-native'
import SubmitButton from '../../reusable/SubmitButton'
import GiftCardStyles from './GiftCardModalStyles'

interface ConfirmCardCreationPanelProps{
  complimentaryCardTypeDescription: string
  amount: number
  transactionCreationError: boolean
  confirmCardCreation: () => void
}

const SwipeError = () => {
  return (
    <View style={GiftCardStyles.swipeError}>
      <Text style={[GiftCardStyles.errorText, GiftCardStyles.errorTextCramped]}>Sorry, something went wrong. Please try again. If problem persists, please try another gift card.</Text>
    </View>
  )
}

const ConfirmCardCreationPanel = ({
  complimentaryCardTypeDescription,
  amount,
  transactionCreationError,
  confirmCardCreation
}: ConfirmCardCreationPanelProps) => {
  const [confirmClicked, setConfirmClicked] = useState(false)

  const handleConfirm = () => {
    setConfirmClicked(true)
    confirmCardCreation()
  }

  return (
    <View style={GiftCardStyles.container}>
      <Text style={GiftCardStyles.complimentaryCardTypeSubHeader}>{complimentaryCardTypeDescription}</Text>
      <Text style={GiftCardStyles.amountConfirm}>${amount.toFixed(2)}</Text>
      <Text style={GiftCardStyles.confirmText}>Please confirm that the above amount is correct before continuing.</Text>
      {transactionCreationError && (<SwipeError/>)}
      {!transactionCreationError && (<SubmitButton
        testID='confirm-complimentary-giftcard'
        buttonLabel='CONFIRM'
        onSubmit={handleConfirm}
        customStyles={GiftCardStyles.confirmButton}
        loading={confirmClicked}
      />
      )}
    </View>
  )
}

export default ConfirmCardCreationPanel
