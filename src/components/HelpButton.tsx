import { Text, View, StyleSheet } from 'react-native'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import HelpSvg from './svg/HelpSvg'
import ConnectPinpadSmallSvg from './svg/ConnectPinpadSmallSvg'
import SystemHealthCheckSvg from './svg/SystemHealthCheckSvg'
import * as CefSharp from '../utils/cefSharp'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { performHealthExam } from '../utils/healthChecks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../Main'
import * as UiActions from '../actions/uiActions'
import { receiveUiData } from '../actions/uiActions'
import GettingStartedGraduationCapSvg from './svg/GettingStartedGraduationCapSvg'

interface HelpButtonProps {
  showWarningIndicator: boolean
}

const HelpButton = ({ showWarningIndicator }: HelpButtonProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const buttonTextMarginTop = showWarningIndicator ? 5 : 7
  return (
    <View>
      <Menu>
        <MenuTrigger>
          <View style={{ alignItems: 'center' }}>
            <HelpSvg warning={showWarningIndicator} />
            <Text testID={'help-button'} style = {[styles.helpText, { marginTop: buttonTextMarginTop }]}>HELP</Text>
          </View>
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyle}>
          {
            featureFlagEnabled('GettingStartedModal') &&
            <MenuOption
              onSelect={() => {
                dispatch(receiveUiData({ showModal: 'gettingStarted' }))
              }}
            >
              <View style={styles.flexRow}>
                <GettingStartedGraduationCapSvg />
                <Text testID={'getting-started'} style={styles.textLabelPadding}>GETTING STARTED</Text>
              </View>
            </MenuOption>
          }
          {
            featureFlagEnabled('ConnectPinpad') &&
            <MenuOption
              onSelect={
                async () => {
                  console.info('ACTION: components > Header > Help > onSelect CONNECT PINPAD')
                  CefSharp.activatePinpadConfigurationScanHandler()
                  dispatch(
                    UiActions.receiveUiData({
                      showModal: 'connectPinpadModal'
                    })
                  )
                }
              }
            >
              <View style={styles.flexRow}>
                <ConnectPinpadSmallSvg />
                <Text style={styles.textLabelPadding}>CONNECT TO PINPAD</Text>
              </View>
            </MenuOption>
          }
          {
            featureFlagEnabled('LauncherHealthChecks') &&
            <MenuOption
              onSelect={
                async () => {
                  console.info('ACTION: components > Header > Help > onSelect SYSTEM HEALTH CHECK')
                  dispatch(receiveUiData({ showModal: 'healthCheck', healthCheckCloseAndRetryPanel: true }))
                  performHealthExam()
                }
              }
            >
              <View style={styles.flexRow}>
                <SystemHealthCheckSvg />
                <Text style={styles.textLabelPadding}>SYSTEM HEALTH CHECK</Text>
              </View>
            </MenuOption>
          }
          {
            featureFlagEnabled('PinpadStressTest') &&
            <MenuOption onSelect={
              async () => {
                console.info('ACTION: components > Header > Help > onSelect PINPAD STRESS TEST')
                dispatch(
                  UiActions.receiveUiData({
                    showModal: 'stressPinpadModal'
                  })
                )
              }
            }>
              <View style={styles.flexRow}>
                <SystemHealthCheckSvg />
                <Text style={styles.textLabelPadding}>PINPAD STRESS TEST</Text>
              </View>
            </MenuOption>
          }
        </MenuOptions>
      </Menu>
    </View>
  )
}

const styles = StyleSheet.create({
  helpText: {
    fontFamily: 'Archivo',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    textAlign: 'center'
  },
  textLabelPadding: {
    paddingLeft: 10
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  }
})

const optionsStyle = {
  optionsContainer: {
    backgroundColor: '#999',
    padding: 1,
    marginTop: 73,
    width: 220
  },
  optionsWrapper: {
    backgroundColor: 'white'
  },
  optionWrapper: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#999'
  },
  optionTouchable: {
    underlayColor: 'gold',
    activeOpacity: 70
  },
  optionText: {
    color: 'black'
  }
}

export default HelpButton
