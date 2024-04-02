import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { View, Text, TextInput } from 'react-native'
import { UiDataTypes } from '../../../reducers/uiData'
import { updateUiData, UPDATE_UI_DATA } from '../../../actions/uiActions'
import GiftCardStyles from './GiftCardModalStyles'
import { getGiftCardMinimumAmount } from '../../../utils/giftCardHelpers'
import { giftcardMaximumAmount } from '../../../utils/reusableNumbers'

export interface ComplimentaryGiftCardProps {
  amount: number
  accountNumber: string
  expirationDate: string
}

interface SwipeGiftCardProps {
  complimentaryCardTypeDescription: string
  uiData: UiDataTypes
  receiveGiftCardInformation: (ComplimentaryGiftCardProps) => void
}

const SwipeGiftCardPanel = ({
  complimentaryCardTypeDescription,
  uiData,
  receiveGiftCardInformation
}: SwipeGiftCardProps) => {
  const errorTypes = ['nonNumerical', 'belowMinimumAmount', 'amountLimitExceeded']
  const [amount, setAmount] = useState(0)
  const [inputError, setInputError] = useState(errorTypes[1])
  const [isAmountInputEmpty, setIsAmountInputEmpty] = useState(true)
  const amountInput = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    amountInput.current.focus()
  }, [])

  useEffect(() => {
    if (!inputError && uiData.giftCardAccountNumber) {
      receiveGiftCardInformation({ amount: amount, accountNumber: uiData.giftCardAccountNumber, expirationDate: uiData.giftCardExpirationDate })
    } else {
      dispatch(updateUiData({
        giftCardAccountNumber: null,
        giftCardExpirationDate: null
      }, UPDATE_UI_DATA))
    }
  }, [uiData.giftCardAccountNumber])

  const giftcardMinimumAmount = getGiftCardMinimumAmount()

  const validateAmountInput = (input: string) => {
    const numericInput = parseFloat(input)
    setIsAmountInputEmpty(!(input && true))

    if (isNaN(numericInput)) {
      setAmountAndInputError(0, errorTypes[0])
    } else if (numericInput < giftcardMinimumAmount) {
      setAmountAndInputError(0, errorTypes[1])
    } else if (numericInput > giftcardMaximumAmount) {
      setAmountAndInputError(0, errorTypes[2])
    } else {
      setAmountAndInputError(numericInput, null)
    }
  }

  const setAmountAndInputError = (amount: number, inputError: string) => {
    setAmount(amount)
    setInputError(inputError)
  }

  const SwipeError = (): JSX.Element => {
    return (
      <View style={GiftCardStyles.swipeError}>
        <Text style={[GiftCardStyles.errorText, GiftCardStyles.errorTextCramped]}>Sorry, something went wrong. Please try again. If problem persists, please try another gift card.</Text>
      </View>
    )
  }

  const AmountInputBelowMinimumError = (): JSX.Element => {
    return (
      <View style={GiftCardStyles.swipeError}>
        <Text style={[GiftCardStyles.errorText, GiftCardStyles.errorTextCramped]}>Sorry, gift cards have a minimum of ${giftcardMinimumAmount.toFixed(2)} per card.</Text>
      </View>
    )
  }

  const AmountInputLimitExceededError = (): JSX.Element => {
    return (
      <View style={GiftCardStyles.swipeError}>
        <Text style={[GiftCardStyles.errorText, GiftCardStyles.errorTextCramped]}>Sorry, gift cards have a limit of ${giftcardMaximumAmount.toFixed(2)} per card.</Text>
      </View>
    )
  }

  let errorToDisplay: JSX.Element = null
  if (inputError === 'amountLimitExceeded') {
    errorToDisplay = (<AmountInputLimitExceededError/>)
  } else if (inputError === 'belowMinimumAmount') {
    errorToDisplay = (<AmountInputBelowMinimumError/>)
  } else if (uiData.scanError) {
    errorToDisplay = (<SwipeError/>)
  }

  return (
    <View style={GiftCardStyles.container}>
      <Text style={GiftCardStyles.complimentaryCardTypeSubHeader}>{complimentaryCardTypeDescription}</Text>
      <TextInput
        testID='giftCard-amount-inputBox'
        ref={amountInput}
        style={[GiftCardStyles.amountInput, inputError && GiftCardStyles.amountInputError, isAmountInputEmpty && GiftCardStyles.amountInputEmpty]}
        onChangeText={(text): void => {
          dispatch(updateUiData({
            scanError: false
          }, UPDATE_UI_DATA))
          validateAmountInput(text)
        }}
        placeholder='Input amount'
      />
      <View style={GiftCardStyles.textUnbroken}>
        <Text>Once entered, </Text><Text style={GiftCardStyles.textEmphasized}>please swipe the gift card </Text><Text>on the register.</Text>
      </View>
      {errorToDisplay}
    </View>
  )
}

export default SwipeGiftCardPanel
