import { Text, ScrollView, StyleSheet, View } from 'react-native'
import { HealthCheckResults } from '../../../reducers/healthCheckData'
import HealthCheckDetailsRecord from './HealthCheckDetailsRecord'

interface HealthCheckDetailsPanelProps {
  healthCheckData: HealthCheckResults
  setIsHealthy: (isHealthy: boolean) => void
}

const HealthCheckDetailsPanel = ({
  healthCheckData,
  setIsHealthy
}: HealthCheckDetailsPanelProps): JSX.Element => {
  const severityString = (severity: number) => {
    switch (severity) {
    case 1: return 'Medium'
    case 2: return 'High'
    case 3: return 'Critical'
    default: return 'Low'
    }
  }
  const severityColor = (severity: number) => {
    switch (severity) {
    case 1: return 'cornflowerblue'
    case 2: return 'orange'
    case 3: return 'red'
    default: return 'green'
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const compareHealthCheckSeverities = (a, b) => {
    if (a?.props?.healthCheckType && b?.props?.healthCheckType) {
      return a.props.healthCheckType.ResultCode < b.props.healthCheckType.ResultCode ? -1 : 1
    }
    return 0
  }

  const printOutDetails = () => {
    if (healthCheckData) {
      const details = []
      const criticalSeverity = []
      const highSeverity = []
      const mediumSeverity = []
      const lowSeverity = []
      Object.keys(healthCheckData).forEach((outerItem, outerIndex) => {
        if (healthCheckData[outerItem]) {
          healthCheckData[outerItem]?.HealthChecks?.forEach((innerItem, innerIndex) => {
            if (innerItem?.Message) {
              const record = <HealthCheckDetailsRecord key={`hc:${outerIndex}:${innerIndex}`} healthCheckType={innerItem}></HealthCheckDetailsRecord>
              switch (innerItem?.Severity) {
              case 1: {
                mediumSeverity.push(record)
                break
              }
              case 2: {
                highSeverity.push(record)
                break
              }
              case 3: {
                criticalSeverity.push(record)
                break
              }
              default: {
                lowSeverity.push(record)
                break
              }
              }
            }
          })
        }
      })
      if (criticalSeverity.length === 0 && highSeverity.length === 0 && mediumSeverity.length === 0) {
        setIsHealthy(true)
        details.push(
          <View style={styles.container}>
            <Text style={styles.messageText}>
              The system is currently healthy.
            </Text>
          </View>
        )
        return details
      }
      if (criticalSeverity.length > 0) {
        setIsHealthy(false)
        details.push(<Text style={ [styles.severityText, { color: severityColor(3) }] }>{severityString(3)}</Text>)
        criticalSeverity.sort(compareHealthCheckSeverities).forEach(i => details.push(i))
      }
      if (highSeverity.length > 0) {
        setIsHealthy(false)
        details.push(<Text style={ [styles.severityText, { color: severityColor(2) }] }>{severityString(2)}</Text>)
        highSeverity.sort(compareHealthCheckSeverities).forEach(i => details.push(i))
      }
      if (mediumSeverity.length > 0) {
        setIsHealthy(false)
        details.push(<Text style={ [styles.severityText, { color: severityColor(1) }] }>{severityString(1)}</Text>)
        mediumSeverity.sort(compareHealthCheckSeverities).forEach(i => details.push(i))
      }
      if (lowSeverity.length > 0) {
        details.push(<Text style={ [styles.severityText, { color: severityColor(0) }] }>{severityString(0)}</Text>)
        lowSeverity.sort(compareHealthCheckSeverities).forEach(i => details.push(i))
      }

      return details
    } else {
      console.error('No health data available')
    }
  }

  return (
    <ScrollView style={styles.scrollViewStyle}>{printOutDetails()}</ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollViewStyle: {
    marginTop: 20,
    backgroundColor: '#F4F4F4',
    width: 556,
    maxHeight: 300,
    paddingLeft: 16
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400'
  }
})

export default HealthCheckDetailsPanel
