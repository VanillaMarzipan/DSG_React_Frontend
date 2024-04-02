import { RECEIVE_CONFIGURATION_DATA } from '../actions/configurationActions'

export interface ConfigurationDataType {
  settings?: Array<Setting>
}

interface PinpadConfigValueType {
  type: string
}

interface PrinterConfigValueType {
  RealTimePoints: {
    ShowRealTimePoints: boolean
    OfflinePointsUrl: string
  }
}

export interface DonationOption {
  key: string
  display: string
  value: number
}
export interface SportsMatterConfigValueType {
  campaignActive: boolean
  upc: string
  dontaionOptions?: string
  usePinpad?: boolean
  pinpadPrompt?: string
  options?: Array<DonationOption>
}

interface StoreCreditBinConfigValueType {
  binRanges: Array<{
    begin: string
    end: string
  }>
}

interface ExpiredCouponConfigValueType {
  thresholdPercent: number
  thresholdDisplay: string
}

export interface Setting {
  name?: string
  description?: string
  value?: PinpadConfigValueType | PrinterConfigValueType | SportsMatterConfigValueType | StoreCreditBinConfigValueType | ExpiredCouponConfigValueType
}

function configurationData (
  state: ConfigurationDataType = {},
  action
): ConfigurationDataType {
  switch (action.type) {
  case RECEIVE_CONFIGURATION_DATA:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default configurationData
