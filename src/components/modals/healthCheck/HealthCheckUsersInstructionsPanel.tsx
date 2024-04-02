import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import {
  updateLoadingStates,
  updateUiData,
  UPDATE_UI_DATA
} from '../../../actions/uiActions'
import { useDispatch } from 'react-redux'
import { performHealthExam } from '../../../utils/healthChecks'

interface HealthCheckUserInstructionsPanelProps {
  showCloseAndRetry: boolean
  isHealthy: boolean
}

const HealthCheckUserInstructionsPanel = (
  props: HealthCheckUserInstructionsPanelProps
): JSX.Element => {
  const dispatch = useDispatch()
  const onClose = () => {
    dispatch(updateUiData({ showModal: false }, UPDATE_UI_DATA))
  }
  return (
    <View style={styles.container}>
      {!props.showCloseAndRetry && (
        <>
          <Text style={styles.largeText}>
            Please Call the Service Desk at{'\n'}866-418-3456
          </Text>
          <Text style={styles.subtext}>
            This window cannot be closed until all critical issues are resolved
          </Text>
        </>
      )}
      {props.showCloseAndRetry && <>
        {props.isHealthy
          ? (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.userMessage}>
              You may close this pop up now.
              </Text>
            </View>
          )
          : (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.userMessage}>
              You may continue to use the register at this time.
              </Text>
              <Text style={styles.userMessage}>
              Tap refresh to restart the system health check.
              </Text>
            </View>
          )}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            testID='health-check-close-button'
            style={styles.closeButton}
            onPress={() => onClose()}
          >
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID='health-check-refresh-button'
            style={styles.refreshButton}
            onPress={() => {
              console.info('ACTION: refresh SYSTEM HEALTH CHECK')
              dispatch(updateLoadingStates({ healthCheckLoading: true }))
              dispatch(performHealthExam())
            }}
          >
            <Text style={styles.refreshButtonText}>REFRESH</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 16 }}>
          <Text style={styles.svcDeskMessage}>
          If the problem persists, please call the Service Desk at
          866-418-3456
          </Text>
        </View></>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 556,
    maxHeight: 150,
    textAlign: 'center'
  },
  largeText: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 30
  },
  subtext: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#B10216'
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  refreshButton: {
    width: 200,
    height: 44,
    backgroundColor: '#BB5811',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginLeft: 20
  },
  closeButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#333',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  refreshButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  closeButton: {
    width: 200,
    height: 44,
    borderColor: 'black',
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  userMessage: {
    fontFamily: 'Archivo',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
    color: '#B10216'
  },
  svcDeskMessage: {
    fontFamily: 'Archivo',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    color: '#000000'
  }
})

export default HealthCheckUserInstructionsPanel
