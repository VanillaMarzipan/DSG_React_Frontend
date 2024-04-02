import { ReactNode, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { Platform, StyleSheet, View } from 'react-native'
import Text from '../StyledText'
import Modal from 'modal-enhanced-react-native-web'
import { ThemeTypes } from '../../reducers/theme'
import Queue from '../../utils/queue'
import CloseButton from '../reusable/CloseButton'

interface ModalProps {
  modalName: string | boolean
  modalHeading: string
  children: ReactNode
  theme?: ThemeTypes
  headingSize?: number
  modalWidth?: number
  onShow?: () => void
  onDismiss?: () => void
  dismissable?: boolean
  backgroundColor?: string
  minModalHeight?: number
  backdropDismissable?: boolean
}

const ModalBase = ({ dismissable = true, backdropDismissable = true, backgroundColor, ...props }: ModalProps) => {
  const { uiData } = useSelector(state => ({
    uiData: state.uiData
  }))

  const [modalIsOpened, setModalIsOpened] = useState(false)

  const dispatch = useDispatch()

  const styles = StyleSheet.create({
    modalPanel: {
      width: props.modalWidth || 636,
      margin: 'auto',
      backgroundColor: backgroundColor ? '#EDEDED' : 'white',
      borderRadius: 5,
      ...Platform.select({
        web: {
          cursor: 'default'
        }
      }),
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: {
        width: 2,
        height: 4
      },
      shadowRadius: 8
    },
    heading: {
      fontSize: props.headingSize || 24,
      fontWeight: 'bold',
      fontFamily: 'DSG-Sans-Bold',
      marginLeft: 34,
      marginTop: 28,
      textTransform: 'uppercase'
    },
    closeContainer: {
      marginTop: 19,
      marginRight: 24,
      alignItems: 'center'
    },
    closeText: {
      fontSize: 14,
      textTransform: 'uppercase'
    }
  })

  const dismissModal = () => {
    if (uiData.showModal === 'ageRestriction') {
      Queue.dequeue()
      Queue.setAllowDequeue(true)
    }
    dispatch({
      type: 'UPDATE_UI_DATA',
      data: { showModal: false, modalErrorMessage: false, modalClosedByUser: uiData.showModal }
    })
  }

  if (uiData.showModal === props.modalName || modalIsOpened) {
    return (
      <Modal
        isVisible={uiData.showModal === props.modalName}
        onBackdropPress={() => {
          dismissable && backdropDismissable && dismissModal()
        }}
        onDismiss={() => {
          setModalIsOpened(false)
          props.onDismiss && props.onDismiss()
        }}
        onShow={() => {
          setModalIsOpened(true)
          props.onShow && props.onShow()
        }}
        animationInTiming={300}
        animationOutTiming={400}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={400}
      >
        <View style={[styles.modalPanel, props.minModalHeight && { minHeight: props.minModalHeight }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
            <Text
              style={styles.heading}
              testID={'modal-title-' + props.modalName}
            >
              {props.modalHeading || ''}
            </Text>
            {dismissable
              ? (
                <CloseButton
                  testID={`modal-close-button-${props.modalName}`}
                  dismisser={() => dismissModal()}
                  dismissable={dismissable}
                />
              )
              : <View style={{ minWidth: 59.8, minHeight: 58 }}/>}
          </View>
          {props.children}
        </View>
      </Modal>
    )
  } else {
    return null
  }
}

export default ModalBase
