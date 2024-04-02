import { addSportsMatterRoundUp } from '../actions/transactionActions'
import { DonationOption, SportsMatterConfigValueType } from '../reducers/configurationData'
import * as UiActions from '../actions/uiActions'
import { Dispatch } from 'redux'
import { AppDispatch } from '../Main'
import { sendTransactionToPinPad } from '../utils/cefSharp'
import { TransactionDataTypes } from '../reducers/transactionData'

export const isConfigurationValid = (campaignConfiguration: SportsMatterConfigValueType): boolean => {
  let isValid = campaignConfiguration?.upc && campaignConfiguration?.options?.findIndex(option => option.key === 'none') > -1 && campaignConfiguration?.options?.length > 1
  const duplicates = []
  if (isValid) {
    campaignConfiguration.options.forEach(option => {
      if (option.key?.length > 0) {
        if (duplicates.indexOf(option.key) > -1) {
          console.warn('Sports Matter campaign configuration: duplicate key found in DonationOptions array: ' + option.key)
          isValid = false
        } else {
          duplicates.push(option.key)
        }
      } else {
        console.warn('Sports Matter campaign configuration: bad key found in DonationOptions array')
      }
    })
    if (isValid) {
      console.info('Sports Matter campaign configuration is valid')
    }
  } else {
    console.error('Sports Matter campaign configuration is invalid', campaignConfiguration)
  }
  return isValid
}

export const getOptions = (campaignConfiguration: SportsMatterConfigValueType, grandTotal: number): Array<DonationOption> => {
  const clonedOptions = []
  if (!(campaignConfiguration?.options)) {
    return clonedOptions
  }
  const roundupAmount = parseFloat((1 - (grandTotal % 1)).toFixed(2))
  for (const configOption of campaignConfiguration.options) {
    const option: DonationOption = {
      key: configOption.key,
      display: configOption.display,
      value: configOption.value
    }
    if (configOption.key === 'roundup') {
      if (roundupAmount > 0 && roundupAmount < 1) {
        option.value = roundupAmount
        option.display = 'Round-up $' + roundupAmount.toFixed(2)
        clonedOptions.push(option)
      }
    } else {
      clonedOptions.push(option)
    }
  }
  return clonedOptions
}

export const handleSelection = (upc: string, associateId: string, optionSelected: DonationOption, transactionData: TransactionDataTypes) => (dispatch: Dispatch<AppDispatch>) => {
  console.info('handleSelection called', optionSelected)
  // option response
  if (optionSelected.value > 0) {
    dispatch(addSportsMatterRoundUp(upc, associateId, optionSelected.value.toFixed(2)))
    sendTransactionToPinPad(transactionData)
  } else if (optionSelected.key === 'none' || optionSelected.value === 0) {
    sendTransactionToPinPad(transactionData)
  } else if (optionSelected.key === 'error') {
    console.error('Error during prompting: ' + optionSelected.display)
    sendTransactionToPinPad(transactionData)
  }
  if (optionSelected.key === 'other' && !(optionSelected.value > 0)) {
    dispatch(UiActions.receiveUiData({ sportsMatterCampaignModalDisplay: 'otherAmount' }))
  } else if (optionSelected.key === 'none' || optionSelected.key === 'error') {
    dispatch(UiActions.receiveUiData({ showModal: false }))
  }
}
