import { StyleSheet, View, Image } from 'react-native'
import { useEffect } from 'react'
import Text from '../StyledText'
import ModalBase from './Modal'
import pinpadGif from '../../img/animated-adyen.gif'
import * as CefSharp from '../../utils/cefSharp'
import { useTypedSelector } from '../../reducers/reducer'
import { useDispatch } from 'react-redux'
import { updateUiData, UPDATE_UI_DATA } from '../../actions/uiActions'
import SubmitButton from '../reusable/SubmitButton'

const ConnectPinpad = (): JSX.Element => {
  const onDismiss = () => {
    dispatch(updateUiData({ configurePinpadSuccess: null, footerOverlayActive: 'None' }, UPDATE_UI_DATA))
    CefSharp.deactivatePinpadConfigurationScanHandler()
    CefSharp.setBarcodeScannerEnabled(true)
    console.info('Close ConnectPinpadModal')
  }

  const dispatch = useDispatch()

  const uiData = useTypedSelector(state => state.uiData)

  useEffect(() => {
    if (uiData.configurePinpadSuccess) {
      console.info('Configure Pinpad Success: ', uiData.configurePinpadSuccess)
      CefSharp.setBarcodeScannerEnabled(false)
    }
  }, [uiData.configurePinpadSuccess])

  return (
    <ModalBase
      modalName='connectPinpadModal'
      modalHeading={uiData.configurePinpadSuccess ? 'Pinpad is Connected' : 'Connect Pinpad'}
      headingSize={32}
      modalWidth={636}
      minModalHeight={384}
      dismissable={true}
      onDismiss={onDismiss}
    >
      <View testID='connect-pinpad-modal' style={styles.container}>
        {!uiData.configurePinpadSuccess
          ? (
            <View style={ { flexDirection: 'row', width: '100%' } }>
              <View style={styles.textContainer}>
                <Text style={styles.boldText}>
                  Follow these instructions using{'\n'}the Pinpad you want to connect:
                </Text>
                <Text style={styles.text}>
                  1.  Press 5 then the green &quot;O&quot;
                </Text>
                <Text style={styles.text}>
                  2.  Touch the blue QR code image
                </Text>
                <Text style={styles.text}>
                  3.  When QR code appears on{'\n'}     screen, scan with scanner
                </Text>
                <Text style={styles.errorText}>
                  {uiData.configurePinpadSuccess === false ? 'Unable to read scanned QR code' : ''}
                </Text>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  testID='pinpad-image'
                  style={styles.image}
                  source={{ uri: pinpadGif }}
                />
              </View>
            </View>
          )
          : (
            <View style={styles.container}>
              <Text style={[styles.text, { marginTop: 90 }]}>
                You have successfully connected the
              </Text>
              <Text style={[styles.text, { marginTop: 5 }]}>
                Pinpad to this register.
              </Text>
              <SubmitButton
                testID='finish-configuration-button'
                disabled={false}
                onSubmit={() => {
                  dispatch(updateUiData({ showModal: false }, UPDATE_UI_DATA))
                }}
                loading={false}
                buttonLabel={'Complete'}
                customStyles={ styles.button }
                customTextStyles={ styles.buttonText }
              />
            </View>
          )
        }
        <View>
        </View>
      </View>
    </ModalBase>
  )
}

export default ConnectPinpad

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'flex-start',
    paddingLeft: 50,
    width: '50%'
  },
  text: {
    fontSize: 16,
    marginTop: 30
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 30
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 42
  },
  imageContainer: {
    alignItems: 'center',
    width: '50%'
  },
  image: {
    width: 233,
    height: 301
  },
  button: {
    backgroundColor: '#BB5811',
    width: 181,
    height: 44,
    marginTop: 56,
    marginBottom: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  }
})
