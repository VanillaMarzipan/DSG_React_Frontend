import { HealthCheckResults, HealthCheckType } from '../reducers/healthCheckData'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { TransactionDataTypes } from '../reducers/transactionData'
import { sendTransactionToPinPad, showPPScreenSaver, performHealthExam as doHealthExam } from '../utils/cefSharp'
import { updateLoadingStates } from '../actions/uiActions'

const isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
export const performHealthExam = () => (dispatch) => {
  const healthChecksEnabled = featureFlagEnabled('LauncherHealthChecks')
  if (!healthChecksEnabled) {
    console.info('Health checks feature flag off.  Skipping checks.')
    return
  }

  if (isCefSharp) {
    console.info('Performing health check')
    doHealthExam()
      .then(() => {
        dispatch(updateLoadingStates({ healthCheckLoading: false }))
      })
  } else {
    console.info('No cefSharp available to perform health check')
  }
}

export interface healthCheckPriority {
  healthCheck: HealthCheckType
  healthCheckType: string
}

export const showCriticalStatusIndicator = (healthChecks: HealthCheckResults) => {
  if (!healthChecks) return false

  const keys = Object.keys(healthChecks)
  let anyCriticals = false
  keys.forEach(key => {
    if (healthChecks[key]?.OverallHealth > 1) {
      anyCriticals = true
    }
  })
  return anyCriticals
}

export const getCriticalHealthCheck = (healthChecks: HealthCheckResults, category: string): healthCheckPriority | null => {
  if (!healthChecks[category]) {
    return null
  }

  if (healthChecks[category]?.OverallHealth === 2) { // 2== unhealthy
    for (let i = 0; i < healthChecks[category]?.HealthChecks.length; i++) {
      const healthCheck = healthChecks[category].HealthChecks[i]
      if (healthCheck && healthCheck?.Severity === 3) { // 2 = High, 3 = Critical
        // if Adyen health check ResultCode indicates anything bad, show the error dialog
        if (healthCheck.ResultCode > 500 && healthCheck.ResultCode < 600) {
          return {
            healthCheck: healthCheck,
            healthCheckType: category
          }
        }
      }
    }
  }

  return null
}

export const runPinpadStressTest = () => {
  const fakeTransaction: TransactionDataTypes = {
    header: {
      storeNumber: 0,
      registerNumber: 0,
      transactionNumber: 0,
      startDateTime: '',
      timezoneOffset: 0,
      associateId: '1',
      transactionType: 1,
      transactionTypeDescription: 'Sale',
      transactionStatus: 1,
      transactionStatusDescription: 'Active',
      tenderIdentifier: 'test',
      transactionKey: '123'
    },
    items: [
      {
        transactionItemIdentifier: 0,
        description: 'Test Item Description 1',
        returnPrice: 543.21
      },
      {
        transactionItemIdentifier: 0,
        description: 'Test Item Description 2',
        returnPrice: 123.45
      },
      {
        transactionItemIdentifier: 0,
        description: 'Test Item Description 3',
        returnPrice: 333.21
      }
    ],
    total: {
      subTotal: 12.34,
      tax: 12.34,
      grandTotal: 12.34,
      changeDue: 0,
      remainingBalance: 10
    }
  }

  const pinpadStressTestInterval = setInterval(() => {
    sendTransactionToPinPad(fakeTransaction)

    setTimeout(() => {
      showPPScreenSaver()
    }, 1000)
  }, 2000)

  return pinpadStressTestInterval
}
