import { FeatureFlagDataTypes } from './src/reducers/featureFlagData'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

export declare global {
  import Timeout = NodeJS.Timeout;

  interface Window {
    reduxStore: any
    pinPadAsync: {
      ShowIdleScreen: Function
      ShowScrollingReceipt: Function
      EndSurvey: Function
      GetSurveyResults: Function
      ShowProcessing: Function
      TenderWithTemporaryShoppingPass: Function
      TenderWithCreditAccountLookup: Function
      GiftCardActivationReversal: Function
      GiftCardActivationReversalWithTransactionNumber: Function
      BeginCreditAccountLookup: Function
      AbortCreditAccountLookup: Function
      BeginGiftCardBalanceInquiry: Function
      AbortGiftCardOperation: Function
      InitiatePinpadSurvey: Function
      PromptForDonation: Function
      InitiatePhoneNumberInput: Function
      CancelPhoneNumberInput: Function
      InitiateReceiptTypePrompt: Function
      CancelReceiptTypePrompt: Function
      InitiateEmailConfirmationPrompt: Function
      GetRefundMethods: Function
      GetReferencedRefund: Function
    }
    printerAsync: {
      OpenCashDrawer: Function
      PrintSalesReceipt: Function
      PrintGiftReceipts: Function
      PrintStoreCopyReceipt: Function
      PrintRegisterCloseReceipt: Function
      PrintEnrollmentConfirmationReceipt: Function
      PrintSuspendReceipt: Function
      PrintTemporaryShoppingPass: Function
      PrintReturnAuthorizationReceipt: Function
      WaitForCashDrawerToClose: Function
      IsCashDrawerOpen: Function
      PrintEnrollmentDeniedChit: Function
      PrintProductDetailChit: Function
      PrintGiftCardBalanceInquiryChit: Function
      PrintComplimentaryGiftCardChit: Function
      PrintNikeConnectedChit: Function
    }
    transactionMonitorAsync: {
      BeginTransaction: Function
      EndTransaction: Function
    }
    storeInformationAsync: {
      GetStoreInformation: Function
    }
    registerInformationAsync: {
      GetRegisterMacAddress: Function
    }
    applicationAsync: {
      GetVersionNumber: Function
      ActivatePinpadConfigurationScanHandler: Function
      DeactivatePinpadConfigurationScanHandler: Function
    }
    fipayAsync: {
      BeginTender: Function
      BeginGiftCardTender: Function
      SetRegisterNumber: Function
      BeginCreditApplication: Function
      TenderWithTemporaryShoppingPass: Function
      BeginGiftCardActivation: Function
      BeginGiftCardActivationWithTransactionNumber: Function
      BeginPostVoid: Function
      GetPinpadType: Function
    }
    CefSharp?: {
      BindObjectAsync: Function
    }
    scannerAsync: {
      ScanningEnabled: Function
    }
    healthCheckAsync: {
      PerformHealthExam: Function
    }
    featureFlagData: FeatureFlagDataTypes,
    pinpadStressTestInterval: Timeout,
    appInsights: ApplicationInsights
  }
}
