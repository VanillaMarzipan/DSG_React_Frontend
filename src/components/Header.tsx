import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import { getEnvironment } from '../utils/coordinatorAPI'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { ThemeTypes } from '../reducers/theme'
import DateTime from '../components/DateTime'
import HelpButton from './HelpButton'
import LogoInfoButton from './LogoInfoButton'
import SignOutButton from './SignOutButton'
import { featureFlagEnabled } from '../reducers/featureFlagData'

interface HeaderProps {
  text: string
  storeNumber: number
  registerNumber: number
  theme: ThemeTypes
  transactionCardShowing: boolean
}

const Header = ({ text, storeNumber, registerNumber, theme, transactionCardShowing }: HeaderProps) => {
  const { registerData, transactionData, associateData, uiData } = useSelector(state => ({
    registerData: state.registerData,
    transactionData: state.transactionData,
    associateData: state.associateData,
    uiData: state.uiData
  }))
  const { loadingStates, activePanel, pinpadPhoneEntryEnabled } = useSelector(state => state.uiData)
  const closeRegisterLoading = loadingStates.closeRegister
  const disableSignOut = closeRegisterLoading
  const noActiveTransaction = registerData.state === 1 &&
    transactionData?.header?.transactionStatus !== 1 &&
    !transactionData.customer
  const [environment, setEnvironment] = useState('')
  useEffect(() => {
    setEnvironment(getEnvironment())
  }, [])
  const showHelpButton = associateData?.associateId !== null && uiData.activePanel === 'initialScanPanel' && (registerData.isAdyen || registerData.isSimulator) && featureFlagEnabled('SettingsButton')
  return (
    <View style={[styles.root,
      environment === 'DEV'
        ? styles.dev
        : environment === 'STAGE'
          ? styles.stage
          : environment.includes('#')
            ? styles.local
            : null]}>
      <View style={[styles.flexRow, { alignItems: 'center' }, !associateData?.associateId && { width: '100%' }]}>
        <LogoInfoButton storeNumber={storeNumber} registerNumber={registerNumber} />
        {!associateData?.associateId
          ? (
            <>
              <Text style={[styles.greeting, { color: theme && theme.fontColor }]}>
                {text}
              </Text>
              <DateTime
                customStyles={{ marginRight: 28 }}
                transactionCardShowing={
                  transactionCardShowing ||
                  (noActiveTransaction &&
                  (associateData && typeof associateData.associateId === 'string'))
                }
              />
            </>
          )
          : (
            <View>
              <Text style={[styles.greeting, { color: theme && theme.fontColor }]}>
                {text}
              </Text>
              <DateTime transactionCardShowing={transactionCardShowing || (noActiveTransaction && associateData?.associateId !== null)} />
            </View>
          )}
      </View>
      <View style={styles.flexRow}>
        {showHelpButton &&
          <HelpButton showWarningIndicator={uiData.helpButtonWarningIndicator} />
        }
        {noActiveTransaction && associateData?.associateId && activePanel !== 'changePanel' && !pinpadPhoneEntryEnabled &&
          <SignOutButton disabled={disableSignOut} associateId={associateData?.associateId} />
        }
      </View>
    </View>
  )
}

Header.propTypes = {
  text: PropTypes.string,
  storeNumber: PropTypes.number,
  registerNumber: PropTypes.number,
  theme: PropTypes.object
}

export default Header

const styles = StyleSheet.create({
  root: {
    paddingTop: 28,
    paddingBottom: 20,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  flexRow: {
    flexDirection: 'row'
  },
  greeting: {
    letterSpacing: 0.4,
    fontSize: 24,
    marginLeft: 20,
    fontFamily: 'Archivo',
    fontWeight: 'bold'
  },
  dev: {
    backgroundColor: '#FFA194'
  },
  stage: {
    backgroundColor: '#ffffba'
  },
  local: {
    backgroundColor: '#bae1ff'
  }
})
