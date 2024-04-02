import { Text, StyleSheet } from 'react-native'
import ModalBase from './Modal'
import { runPinpadStressTest } from '../../utils/healthChecks'
import { setBarcodeScannerEnabled } from '../../utils/cefSharp'
import { useState } from 'react'

const StressPinpadModal = (): JSX.Element => {
  const [pinpadStressTestInterval, setPinpadStressTestInterval] = useState(null)

  return (
    <ModalBase
      modalName='stressPinpadModal'
      modalHeading={'PINpad Stress Test'}
      headingSize={30}
      modalWidth={636}
      minModalHeight={384}
      dismissable={true}
      backdropDismissable={false}
      backgroundColor='#EDEDED'
      onDismiss={async () => {
        console.info('OnDismiss > StressPinpadModal')
        clearInterval(pinpadStressTestInterval)
        setPinpadStressTestInterval(null)
        await setBarcodeScannerEnabled(true)
      }}
      onShow={async () => {
        await setBarcodeScannerEnabled(false)
        setPinpadStressTestInterval(runPinpadStressTest())
      }}
    >
      <Text style={styles.displayTextStyle}>
        Performing operations on PINpad...press close to stop
      </Text>
    </ModalBase>
  )
}

export default StressPinpadModal

const styles = StyleSheet.create({
  displayTextStyle: {
    marginTop: 120,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '400'
  }
})
