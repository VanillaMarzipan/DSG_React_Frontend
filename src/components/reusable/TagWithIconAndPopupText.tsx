import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../actions/uiActions'
import Text from '../StyledText'
import CloseModalButtonSvg from '../svg/CloseModalSvg'
import MoreInfoIcon from '../svg/MoreInfoIcon'
import TriangleSvg from '../svg/TriangleSvg'

interface TagWithIconAndPopupTextProps {
  tagLabel: string
  tagIcon: JSX.Element
  popupTextLineOne: string
  popupTextLineTwo?: string
  popupPosition: 'top' | 'bottom'
  additionalOnPressFunctionality?
}

const TagWithIconAndPopupText = ({
  tagLabel,
  tagIcon,
  popupTextLineOne,
  popupTextLineTwo,
  popupPosition,
  additionalOnPressFunctionality
}: TagWithIconAndPopupTextProps): JSX.Element => {
  const dispatch = useDispatch()
  const [displayPopupText, setDisplayPopupText] = useState(false)

  const popup = position => (
    <View style={[styles.popupContainer, { top: position === 'bottom' ? 34 : -110 }]}>
      {position === 'bottom' && <TriangleSvg pointDirection='up'/>}
      <View style={styles.popupTextContainer}>
        <TouchableOpacity
          testID='popup-close-button'
          style={styles.closeButton}
          onPress={() => {
            setDisplayPopupText(false)
            dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
          }}
        >
          <CloseModalButtonSvg
            height={14}
            width={14}
            color={'#FFFFFF'}
          />
        </TouchableOpacity>
        <Text style={styles.standardText}>
          {popupTextLineOne}
        </Text>
        <Text style={[styles.standardText, styles.lineTwoText]}>
          {popupTextLineTwo}
        </Text>
      </View>
      {position === 'top' && <TriangleSvg pointDirection='down' />}
    </View>
  )
  return (
    <View style={styles.mainContainer}>
      {displayPopupText && popup(popupPosition)}
      <TouchableOpacity
        testID='nike-connect-tag'
        style={styles.tagContainer}
        disabled={displayPopupText}
        onPress={() => {
          setDisplayPopupText(true)
          dispatch(receiveUiData({ autofocusTextbox: 'None' }))
          if (additionalOnPressFunctionality) {
            setTimeout(() => additionalOnPressFunctionality(), 100)
          }
        }}
      >
        {tagIcon}
        <Text style={styles.tagLabel}>{tagLabel}</Text>
        <MoreInfoIcon />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    alignSelf: 'baseline'
  },
  tagContainer: {
    height: 27,
    alignSelf: 'baseline',
    paddingHorizontal: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  tagLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 6
  },
  popupContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 230
  },
  closeButton: {
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    paddingRight: 10,
    height: 30,
    marginTop: -12
  },
  popupTextContainer: {
    backgroundColor: '#000000',
    width: 251,
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 16
  },
  standardText: {
    color: '#FFFFFF',
    fontSize: 12,
    width: '82%',
    marginLeft: 16
  },
  lineTwoText: {
    fontWeight: '700'
  }
})

export default TagWithIconAndPopupText
