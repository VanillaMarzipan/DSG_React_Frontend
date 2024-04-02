import { UPDATE_HEALTH_CHECK_DATA } from '../actions/healthCheckActions'

export interface HealthCheckResults {
  BarcodeScannerHealthInfo: BarcodeScannerHealthInfoType | null
  PinpadHealthInfo: PinpadHealthInfoType | null
  BackendConnectivityHealthInfo: BackendConnectivityHealthInfoType | null
  StoreInformationFileHealthInfo: StoreInformationFileHealthInfoType | null
  PrinterHealthInfo : PrinterHealthInfoType | null
}

export type HealthInfoType =
  | 'BarcodeScannerHealthInfo'
  | 'PinpadHealthInfo'
  | 'BackendConnectivityHealthInfo'
  | 'StoreInformationFileHealthInfo'
  | 'PrinterHealthInfo'

export interface HealthCheckType {
  ResultCode: string
  Type: string
  Severity: number | null
  Healthy: boolean
  Message: string
}

export interface StoreInformationFileHealthInfoType {
  HealthChecks: HealthCheckType[]
  HealthInfoType: HealthInfoType
  OverallHealth: number
}

export interface PrinterHealthInfoType {
  HealthChecks: HealthCheckType[]
  HealthInfoType: HealthInfoType
  OverallHealth: number
}

export interface BarcodeScannerHealthInfoType {
  ModelNumber: string | null
  DriverVersion: string | null
  HealthChecks: HealthCheckType[]
  HealthInfoType: HealthInfoType
  OverallHealth: number
}

export interface BackendConnectivityHealthInfoType {
  HealthChecks: HealthCheckType[]
  HealthInfoType: HealthInfoType
  OverallHealth: number
}
export interface PinpadHealthInfoType {
  CommunicationOkFlag: boolean
  ErrorCondition: string | null
  FirmwareVersion: string | null
  GlobalStatus: string | null
  HealthChecks: HealthCheckType[]
  HealthInfoType: HealthInfoType
  IpAddress: string | null
  IsHostReachableFLag: boolean
  MerchantAccount: string | null
  OverallHealth: number | null
  PinpadId: string | null
  StoreId: string | null
  UnconfirmedBatchCount: number | null
}

const healthCheckData = (
  state: (HealthCheckResults) = {
    BarcodeScannerHealthInfo: null,
    PinpadHealthInfo: null,
    BackendConnectivityHealthInfo: null,
    StoreInformationFileHealthInfo: null,
    PrinterHealthInfo: null
  },
  action
): HealthCheckResults => {
  switch (action.type) {
  case UPDATE_HEALTH_CHECK_DATA:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default healthCheckData
