import { Platform, StyleSheet, View } from 'react-native'
import Text from '../StyledText'
import { useDispatch } from 'react-redux'
import ModalBase from './Modal'
import { UPDATE_UI_DATA, updateUiData } from '../../actions/uiActions'

import Queue from '../../utils/queue'

/**
 *  Recall Modal
 *
 */
const Recall = (): JSX.Element => {
  const dispatch = useDispatch()

  return (
    <ModalBase
      modalName='recall'
      modalHeading='RECALLED'
      headingSize={32}
      modalWidth={636}
      dismissable={true}
      onDismiss={() => {
        dispatch(updateUiData({ clearUpc: true }, UPDATE_UI_DATA))
        Queue.dequeue()
      }}
    >
      <View testID='recall-modal' style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { paddingLeft: 60, paddingRight: 60 }]}>
            This item has been recalled by the manufacturer. Please follow your store guidelines for recalled
            merchandise.
          </Text>
          <Text style={styles.text}>
            Please inform the athlete.
          </Text>
          <Text style={styles.boldText}>
            THIS ITEM WILL NOT BE ADDED TO THE TRANSACTION
          </Text>
        </View>
      </View>
    </ModalBase>
  )
}

export default Recall

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
    marginTop: 50,
    lineHeight: 24,
    fontFamily: 'Archivo'
  },
  subheading: {
    fontSize: 16,
    marginTop: 50,
    lineHeight: 24,
    fontFamily: 'Archivo'
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B10216',
    marginTop: 25,
    marginBottom: 40
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
