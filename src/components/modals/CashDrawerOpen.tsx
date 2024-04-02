import { Platform, StyleSheet, View } from 'react-native'
import Text from '../StyledText'
import ModalBase from './Modal'

const CashDrawerOpen = (): JSX.Element => {
  return (
    <ModalBase
      modalName='cashDrawerOpen'
      modalHeading='Cash Drawer Open'
      headingSize={32}
      modalWidth={636}
      dismissable={false}
    >
      <View testID='cash-drawer-open-modal' style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            The cash drawer is open
          </Text>
          <Text style={styles.boldText}>
            PLEASE CLOSE THE CASH DRAWER TO CONTINUE
          </Text>
          <View style={{ height: '40px' }}><Text>{''}</Text></View>
        </View>
      </View>
    </ModalBase>
  )
}

export default CashDrawerOpen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'center'
  },
  text: {
    fontSize: 14,
    marginTop: 50
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B10216',
    marginTop: 25
  },
  button: {
    width: 230,
    height: 44,
    backgroundColor: '#BB5811',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    ...Platform.select({
      web: {
        cursor: 'pointer'
      }
    })
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center'
  }
})
