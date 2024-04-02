import { ActivityIndicator, StyleSheet, View } from 'react-native'
import ModalBase from '../Modal'
import HealthCheckDetailsPanel from './HealthCheckDetailsPanel'
import HealthCheckUserInstructionsPanel from './HealthCheckUsersInstructionsPanel'
import { connect } from 'react-redux'
import { UiDataTypes } from '../../../reducers/uiData'
import PropTypes from 'prop-types'
import { HealthCheckResults } from '../../../reducers/healthCheckData'
import { useState } from 'react'

const HealthCheckModal = ({ healthCheckData, uiData }): JSX.Element => {
  const [isHealthy, setIsHealthy] = useState(false)

  return (
    <ModalBase
      modalName='healthCheck'
      modalHeading={'System Health Check'}
      headingSize={32}
      minModalHeight={570}
      modalWidth={642}
      dismissable={false}
    >
      <View testID='health-check-modal' style={styles.container}>
        {uiData.loadingStates.healthCheckLoading && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator color='#2E2E2E' size='large' />
          </View>
        )}
        {!uiData.loadingStates.healthCheckLoading && (
          <HealthCheckDetailsPanel
            healthCheckData={healthCheckData}
            setIsHealthy={setIsHealthy}
          />
        )}
        <HealthCheckUserInstructionsPanel
          showCloseAndRetry={uiData.healthCheckCloseAndRetryPanel}
          isHealthy={isHealthy}
        />
      </View>
    </ModalBase>
  )
}

HealthCheckModal.propTypes = {
  healthCheckData: PropTypes.object,
  uiData: PropTypes.object
}

export default connect(
  (globalState: {
    healthCheckData: HealthCheckResults
    uiData: UiDataTypes
  }) => ({
    healthCheckData: globalState.healthCheckData,
    uiData: globalState.uiData
  })
)(HealthCheckModal)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  activityIndicatorContainer: {
    width: 556,
    minHeight: 300,
    paddingTop: 136,
    marginTop: 20
  }
})
