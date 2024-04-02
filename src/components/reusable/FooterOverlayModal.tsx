import { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import Text from '../StyledText'
import CloseButton from '../reusable/CloseButton'

interface FooterOverlayModalProps {
  modalName: string | boolean
  modalHeading: string
  children: ReactNode
  headingSize?: number
  onClickClose?: () => void
  dismissable?: boolean
  minModalHeight?: number
  centerChildren?: boolean
  anchorToFooter?: boolean
  mainContentWidth?: number
}

const FooterOverlayModal = ({ dismissable = true, centerChildren = true, anchorToFooter, mainContentWidth = 636, ...props }: FooterOverlayModalProps) => {
  const styles = StyleSheet.create({
    mainContainer: {
      height: '100vh',
      width: '100%',
      zIndex: 2,
      position: 'absolute',
      bottom: 98,
      left: 0,
      justifyContent: anchorToFooter ? 'flex-end' : 'center',
      alignItems: 'center'
    },
    mainContent: {
      justifyContent: centerChildren ? 'center' : 'flex-start',
      alignItems: centerChildren ? 'center' : 'flex-start',
      width: mainContentWidth
    },
    modalPanel: {
      backgroundColor: '#EDEDED'
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

  return (
    <View style={styles.mainContainer}>
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
                dismisser={() => props.onClickClose()}
                dismissable={dismissable}
              />
            )
            : <View style={{ minWidth: 59.8, minHeight: 58 }} />}
        </View>
        <View style={styles.mainContent}>
          {props.children}
        </View>
      </View>
    </View>
  )
}

export default FooterOverlayModal
