import { useEffect, useState } from 'react'
import { Image, Text, StyleSheet } from 'react-native'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import dsgLogoFlatGreen from '../img/dsg-logo-flat-green.png'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { buildNumber } from '../utils/coordinatorAPI'
import * as Storage from '../utils/asyncStorage'

interface LogoInfoButtonProps {
  storeNumber: number
  registerNumber: number
}

const LogoInfoButton = ({ storeNumber, registerNumber }: LogoInfoButtonProps) => {
  const [launcherVersion, setLauncherVersion] = useState('local')
  const transactionNumber: number = useSelector(
    state => state.transactionData?.header?.transactionNumber
  )

  useEffect(() => {
    const getAppVersionNumFromLocalStorage = async () => {
      const applicationVersionNumber = await Storage.getData('applicationVersionNumber')
      setLauncherVersion(applicationVersionNumber)
    }
    getAppVersionNumFromLocalStorage()
  }, [])

  return (
    <Menu>
      <MenuTrigger>
        <Image
          testID='dsg-logo'
          style={styles.logo}
          source={{ uri: dsgLogoFlatGreen }}
        />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption>
          <Text testID='store-number'>Store: {storeNumber}</Text>
          <Text testID='register-number'>
            Register: {registerNumber}
          </Text>
          <Text testID='react-build-number'>React Build: {buildNumber}</Text>
          <Text testID='launcher-build-number'>Launcher Build: {launcherVersion}</Text>
          {transactionNumber && (
            <Text testID='transaction-number'>
              Transaction Number: {transactionNumber}
            </Text>
          )}
          <Text testID='pos-mode'>
            POS Mode:{' '}
            {process.env.REACT_APP_MODE === 'store-server'
              ? 'Store Server'
              : 'Online'}
          </Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 47
  }
})

export default LogoInfoButton
