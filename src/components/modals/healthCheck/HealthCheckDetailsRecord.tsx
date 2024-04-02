import { View, Text, StyleSheet } from 'react-native'
import { HealthCheckType } from '../../../reducers/healthCheckData'

interface HealthCheckDetailsRecordProps {
  healthCheckType: HealthCheckType
}

const HealthCheckDetailsRecord = ({
  healthCheckType
}: HealthCheckDetailsRecordProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={{ marginRight: 10 }}>{'\u2022'}</Text>
      <Text style={styles.messageText}>Result Code {healthCheckType.ResultCode} ({healthCheckType.Type}){'\n'}{healthCheckType.Message}</Text>
    </View>
  )
}

export default HealthCheckDetailsRecord

const styles = StyleSheet.create({
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
