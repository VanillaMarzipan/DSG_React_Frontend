import { Action, combineReducers } from 'redux'
import storeInfo from './storeInformation'
import registerData from './registerData'
import associateData from './associateData'
import theme from './theme'
import printerString from './printerString'
import transactionData from './transactionData'
import uiData from './uiData'
import loyaltyData from './loyaltyData'
import featureFlagData from './featureFlagData'
import configurationData from './configurationData'
import analyticsData from './analyticsData'
import warrantyData from './warrantyData'
import healthCheckData from './healthCheckData'
import printReceiptData from './printReceiptData'
import returnData from './returnData'
import creditEnrollmentData from './creditEnrollmentData'
import productLookupData from './productLookupData'
import pendingManagerOverrideData from '../reducers/managerOverrideData'
import refundsData from './refundsData'
import alternateRefundData from './alternateRefundData'

import { ThunkAction } from 'redux-thunk'

export const rootReducer = combineReducers({
  storeInfo,
  registerData,
  associateData,
  theme,
  printerString,
  transactionData,
  uiData,
  loyaltyData,
  featureFlagData,
  analyticsData,
  warrantyData,
  healthCheckData,
  printReceiptData,
  returnData,
  configurationData,
  creditEnrollmentData,
  productLookupData,
  pendingManagerOverrideData,
  refundsData,
  alternateRefundData
})

export type RootState = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>
