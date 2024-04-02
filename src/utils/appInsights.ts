import { ApplicationInsights, IMetricTelemetry, SeverityLevel } from '@microsoft/applicationinsights-web'
import { ReactNativePlugin } from '@microsoft/applicationinsights-react-native'

export const initAppInsights = (enabled: boolean) => {
  if (window && enabled && !window.appInsights) {
    const RNPlugin = new ReactNativePlugin()
    const connectionString = (process.env.NODE_ENV === 'development')
      ? 'InstrumentationKey=b399d4be-8ae9-467b-b197-a1aa5b9d4047;IngestionEndpoint=https://eastus2-0.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus2.livediagnostics.monitor.azure.com/'
      : "'#{PosAppInsightsConnectionString}#'"
    try {
      window.appInsights = new ApplicationInsights({
        config: {
          connectionString,
          extensions: [RNPlugin]
        }
      })

      window.appInsights.loadAppInsights()
      window.appInsights.addTelemetryInitializer((envelope) => {
        if (envelope.baseData?.target && envelope.baseData.target.includes('localhost')) {
          return false
        }
        return true
      })
      console.info('Initialized app insights')
    } catch (appInsightsError) {
      console.error('Error initializing app insights: ', appInsightsError?.message)
    }
  }
}

export interface TraceData {
  // The value can be anything that JSON.stringify can accept, which is 'any', so 'any' is the right choice here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface MappedProperties {
  [key: string]: string
}

const mapToProperties = (data: TraceData): MappedProperties => {
  const mappedData: MappedProperties = {}
  if (data) {
    Object.keys(data).forEach((key) => {
      if (typeof data[key] !== 'string') {
        mappedData[key] = JSON.stringify(data[key])
      } else {
        mappedData[key] = data[key]
      }
    })
  }

  const state = window?.reduxStore?.getState()

  return {
    associateId: state?.associateData?.associateId,
    registerNumber: String(state?.registerData?.registerNumber),
    registerId: state?.registerData?.macAddress,
    storeNumber: String(state?.registerData?.storeNumber),
    ...mappedData
  }
}

export interface MeasurementData {
  [key: string]: number
}

export const sendAppInsightsTrace = async (message: string, data: TraceData = {}) => {
  if (window && window.appInsights) {
    window.appInsights.trackTrace({
      message,
      severityLevel: SeverityLevel.Information
    }, mapToProperties(data))
  }
}

export const sendAppInsightsPageView = async (
  featureName: string,
  pageName: string,
  data: TraceData = {}
) => {
  if (window && window.appInsights) {
    const state = window.reduxStore.getState()
    window.appInsights.trackPageView({
      pageType: featureName,
      name: pageName,
      isLoggedIn: state.associateData.authenticated,
      properties: mapToProperties(data)
    })
  }
}

export const startAppInsightsPageViewTiming = async (
  pageName: string
) => {
  if (window && window.appInsights) {
    window.appInsights.startTrackPage(pageName)
  }
}

export const stopAppInsightsPageViewTiming = async (
  featureName: string,
  pageName: string,
  data: TraceData = {},
  measurements: MeasurementData = null
) => {
  if (window && window.appInsights) {
    window.appInsights.stopTrackPage(
      pageName,
      null,
      mapToProperties({
        ...data,
        pageType: featureName
      }),
      measurements
    )
  }
}

/* Smallest unit of a user flow diagram */
export const sendAppInsightsEvent = async (eventName: string, data: TraceData = {}) => {
  if (window && window.appInsights) {
    console.info(`SENDING EVENT: ${eventName}; DATA: ${data}`)
    window.appInsights.trackEvent({
      name: eventName,
      properties: mapToProperties(data)
    })
  }
}

/* For timing user events */
export const startAppInsightsEventTiming = async (eventName: string) => {
  if (window && window.appInsights) {
    window.appInsights.startTrackEvent(eventName)
  }
}

export const stopAppInsightsEventTimingAndSend = async (
  eventName: string,
  data: TraceData = {}
) => {
  if (window && window.appInsights) {
    window.appInsights.stopTrackEvent(eventName, mapToProperties(data))
  }
}

/* Metrics */
export const sendAppInsightsMetric = (
  name: string,
  value: number,
  data: TraceData = {}
) => {
  if (window && window.appInsights) {
    const metric: IMetricTelemetry = {
      name,
      average: value
    }

    window.appInsights.trackMetric(
      metric,
      mapToProperties(data)
    )
  }
}
