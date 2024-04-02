import { buildNumber } from '../utils/coordinatorAPI'
import { sendAppInsightsEvent } from './appInsights'
import { sendSurveyResponse } from '../actions/surveyActions'
import { fetchLoyalty, receiveLoyaltyData } from '../actions/loyaltyActions'
import { checkForLoading, receiveUiData } from '../actions/uiActions'
import { EmailConfirmationChoice } from '../reducers/loyaltyData'
import { sendTransactionToPinPad } from './cefSharp'

/**
 * Setup listener for barcode scan events from Launcher.
 */
export const setupScanEventWatcher = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.scanEvent = (data: string) => {
    console.info('BARCODE SCAN EVENT: ', data)
    sendAppInsightsEvent('ScanEvent', { scanData: data })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        scanEvent: {
          scanValue: data,
          scanTime: (new Date()).getTime()
        }
      }
    })
  }
}

export const setupGetCardDataEventWatcher = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getCardDataEvent = (data: string) => {
    console.info('GET CARD DATA EVENT: ', data)
    const cardData = JSON.parse(data)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        getCardDataEvent: {
          cardBrand: cardData.CardBrand,
          lastFour: cardData.LastFour
        }
      }
    })
  }
}

export const setupHealthCheckEventWatcher = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.healthCheckResponse = (data: string) => {
    console.info('GET HEALTH CHECK EVENT: ', data)
    try {
      const healthCheck = JSON.parse(data)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.reduxStore.dispatch({
        type: 'UPDATE_HEALTH_CHECK_DATA',
        data: healthCheck
      })
    } catch (e) {
      console.error('Error parsing health check: ' + e)
    }
  }
}

export const setupGetReactStatusFunctions = () : void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getReactVersionNumber = () => {
    return buildNumber
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getReactErrorState = () => {
    let error = null
    if (window.reduxStore) {
      const uiData = window.reduxStore.getState().uiData
      if (uiData.showModal === 'retryFailedOperation') {
        error = { state: 'retry operation', detail: uiData.failedOperation }
      } else {
        error = uiData.applicationError
      }
    }
    return error
  }
}

export const setupGetMsrDataEventWatcher = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getMsrDataEvent = (data: string) => {
    console.info('GET MSR DATA EVENT: ', data)
    const cardData = JSON.parse(data)
    const uiData = window.reduxStore.getState().uiData
    if ((!uiData.showModal || uiData.showModal === 'sellGiftCard' || uiData.showModal === 'createGiftCard') && (uiData.footerOverlayActive === 'Register' || uiData.footerOverlayActive === 'None' || uiData.footerOverlayActive === 'GiftCard')) {
      if (!cardData.IsValid) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.reduxStore.dispatch({
          type: 'UPDATE_UI_DATA',
          data: {
            scanError: true,
            scanErrorMessage: cardData.ErrorMessage,
            storeCreditError: false
          }
        })
      } else if (cardData.IsStoreCredit === true && uiData.activePanel !== 'creditPanel') {
        window.reduxStore.dispatch({
          type: 'UPDATE_UI_DATA',
          data: {
            scanError: true,
            scanErrorMessage: 'Sorry, store credit cannot be activated for sale. Please use another gift card to continue.',
            storeCreditError: true
          }
        })
      } else if (!checkForLoading(uiData.loadingStates) && uiData.autofocusTextbox !== 'PriceEdit') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.reduxStore.dispatch({
          type: 'UPDATE_UI_DATA',
          data: {
            giftCardAccountNumber: cardData.AccountNumber,
            giftCardExpirationDate: cardData.Expiration,
            giftCardError: null
          }
        })
      }
    }
  }
}

export const setupGiftCardTenderResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.giftCardTenderResponse = (data: string) => {
    console.info('window.giftCardTenderResponse: ' + data)

    const _giftCardTenderResponse = (!data || data === 'abort') ? null : data

    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        giftCardTenderResponse: _giftCardTenderResponse
      }
    })
  }
}

export const setupGiftCardBalanceInquiryResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.giftCardBalanceInquiryResponse = (data: string) => {
    console.info('window.giftCardBalanceInquiryResponse: ' + data)

    const _giftCardInquiryResponse = (!data || data === 'abort') ? null : data

    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        giftCardBalanceInquiryResponse: _giftCardInquiryResponse
      }
    })
  }
}

export const setupConfigurePinpadResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.configurePinpadResponse = (data: string) => {
    console.info('window.configurePinpadResponse: ' + data)
    const configurePinpadResponse = JSON.parse(data)
    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        configurePinpadSuccess: configurePinpadResponse.Success,
        configurePinpadMessage: configurePinpadResponse.ErrorMessage
      }
    })
  }
}

export const setupSurveyResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.surveyResponse = async (data: string, surveyConfiguration: string) => {
    console.info('window.surveyResponse: ' + data)
    await sendSurveyResponse(data, surveyConfiguration)
  }
}

export const setupLoyaltyPhoneNumberInputResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getLoyaltyLookupPhoneNumberEvent = async (phoneInput: string) => {
    console.info('window.getLoyaltyLookupPhoneNumberEvent: ' + phoneInput)
    const uiData = window.reduxStore.getState().uiData
    const transactionData = window.reduxStore.getState().transactionData
    window.reduxStore.dispatch(receiveUiData({ pinpadPhoneEntryEnabled: false }))

    if (
      (transactionData.total && transactionData.header) &&
      (transactionData.total.subTotal !== 0 || transactionData.header.transactionType === 4)
    ) {
      sendTransactionToPinPad(transactionData)
    }

    if (phoneInput === '') {
      if (uiData.selectedItem === 'loyaltyPinpadPhoneLookup') {
        window.reduxStore.dispatch(receiveUiData({ selectedItem: null }))
      }

      return
    }
    window.reduxStore.dispatch(fetchLoyalty(phoneInput))
  }
}

export const setupReceiptTypeResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getReceiptTypeResponse = async (receiptType: number) => {
    console.info('window.getReceiptTypeResponse: ' + receiptType)

    switch (receiptType) {
    case 1: {
      window.reduxStore.dispatch(receiveLoyaltyData({ pinpadReceiptChoice: 'print' }))
      break
    }
    case 2: {
      window.reduxStore.dispatch(receiveLoyaltyData({ pinpadReceiptChoice: 'eReceiptOnly' }))
      break
    }
    case 3: {
      window.reduxStore.dispatch(receiveLoyaltyData({ pinpadReceiptChoice: 'eReceiptAndPrint' }))
      break
    }
    }
  }
}

export const setupEmailConfirmationResponse = (): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getEmailConfirmationResponse = async (emailConfirmationResponse: EmailConfirmationChoice) => {
    console.info('window.getEmailConfirmationResponse: ' + EmailConfirmationChoice[emailConfirmationResponse])

    if (emailConfirmationResponse === EmailConfirmationChoice.Yes) {
      window.reduxStore.dispatch(receiveLoyaltyData({ emailConfirmationChoice: EmailConfirmationChoice.Yes }))
    } else {
      window.reduxStore.dispatch(receiveLoyaltyData({ emailConfirmationChoice: EmailConfirmationChoice.No }))
    }
  }
}
