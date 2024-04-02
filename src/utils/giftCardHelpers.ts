import { getConfigurationValue } from '../actions/configurationActions'

export const getGiftCardMinimumAmount = (): number => {
  return getConfigurationValue('giftcards', 'minimumAmountAllowed') || 5
}
