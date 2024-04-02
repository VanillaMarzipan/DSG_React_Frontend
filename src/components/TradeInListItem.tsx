import PropTypes from 'prop-types'
import { CheckBox, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useRef, useState, useEffect } from 'react'
import { formatNumber } from '../utils/formatters'
import TextInput from './TextInput'
import Text from './StyledText'
import { ThemeTypes } from '../reducers/theme'
import { CheckedTrackerType } from '../actions/returnActions'
import PencilSvg from './svg/PencilSvg'

interface TradeInItemProps {
  itemName: string
  price: number
  itemUpc: string
  itemTransactionId: number
  index: number
  theme?: ThemeTypes
  loading?: boolean | string
  disableSelection: boolean
  setDisableSelection: (object) => void
  updateTradeInItemPrice: (index: number, price: number) => void
  itemNumsReturnChecked?: CheckedTrackerType
  setItemNumsReturnChecked?: (object) => void
}

const TradeInListItem = ({
  index,
  itemName,
  price,
  itemUpc,
  itemTransactionId,
  theme,
  disableSelection,
  setDisableSelection,
  updateTradeInItemPrice,
  itemNumsReturnChecked,
  setItemNumsReturnChecked
}: TradeInItemProps): JSX.Element => {
  const [input, setInput] = useState<string | number>('0.00')
  const fontColor = theme ? theme.fontColor : 'black'
  const handleReturnsCheckbox = (transItemId: number, checkedTrackerObject, setCheckedTrackerObject) => {
    const clone = { ...checkedTrackerObject }
    if (!checkedTrackerObject[transItemId]) {
      clone[transItemId] = true
    } else {
      clone[transItemId] = false
    }
    setCheckedTrackerObject(clone)
  }
  const _textInput = useRef(null)
  useEffect(() => {
    if (_textInput.current && _textInput.current.isFocused()) {
      setDisableSelection(true)
    } else {
      setDisableSelection(false)
    }
  }, [_textInput])
  return (
    <View
      testID='item-row'
      style={[
        styles.itemRow,
        itemNumsReturnChecked[itemTransactionId] && { backgroundColor: '#EDEDED' }
      ]}
    >
      <View
        style={[styles.item]}
      >
        <TouchableOpacity
          onPress={() => {
            console.info(`ACTION: components > ReturnItem  > onPress: checkItem (upc: ${itemUpc})`)
            handleReturnsCheckbox(itemTransactionId, itemNumsReturnChecked, setItemNumsReturnChecked)
          }}
          style={styles.checkBoxContainer}>
          <CheckBox
            disabled={disableSelection}
            testID={'check-box-return' + itemTransactionId}
            value={itemNumsReturnChecked[itemTransactionId]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={disableSelection}
          onPress={() => {
            console.info(`ACTION: components > ReturnItem  > onPress: checkItem (upc: ${itemUpc})`)
            handleReturnsCheckbox(itemTransactionId, itemNumsReturnChecked, setItemNumsReturnChecked)
          }}
          style={styles.itemInnerContainer}
        >
          <View style={styles.itemLine}>
            <Text
              numberOfLines={1}
              ellipsizeMode='tail'
              testID={`item-description${index}`}
              style={[styles.itemName, { color: fontColor }]}
            >
              {itemName && itemName}
            </Text>
            {price
              ? <TouchableOpacity
                disabled={disableSelection}
                onPress={() => {
                  setDisableSelection(true)
                  updateTradeInItemPrice(index, 0)
                }}>
                <View style={styles.priceContainer}>
                  <Text
                    testID={`item-price${index}`}
                    style={[styles.itemPrice, { color: fontColor }]}
                  >
                    {Math.abs(price).toFixed(2)}
                  </Text>
                  <PencilSvg style={styles.pencilIcon} disabled={disableSelection} />
                </View>
              </TouchableOpacity>
              : <View style={{}}>
                <TextInput
                  autoFocus={true}
                  maxLength={8}
                  paddingMode='none'
                  nativeID='item-price-input'
                  ref={_textInput}
                  labelBackgroundColor={theme.backgroundColor}
                  style={[styles.textField, { width: _textInput.current ? 50 + _textInput.current.state.value.length * 4.5 : 50 }]}
                  borderColor='#D76B00'
                  value={input}
                  onChangeText={(text) => setInput(formatNumber(text))}
                  mode='outlined'
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    if (input === '0.00') {
                      _textInput.current.focus()
                    } else {
                      setDisableSelection(false)
                      updateTradeInItemPrice(index, -parseFloat(input.toString()))
                    }
                  }}
                  onBlur={() => {
                    if (!price) {
                      _textInput.current.focus()
                    }
                  }}
                  color={theme.fontColor}
                  padding='none'
                />
              </View>
            }
          </View>
          <View style={[styles.itemLine, { justifyContent: 'space-between' }]}>
            <Text
              testID={`item-upc${index}`}
              style={[styles.itemNum, { color: fontColor }]}
            >
              {itemUpc}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  itemRow: {
    marginLeft: 0,
    marginBottom: 10,
    width: 500,
    paddingLeft: 35
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 59,
    marginLeft: -8
  },
  itemInnerContainer: {
    display: 'flex',
    flex: 1,
    paddingLeft: 16,
    paddingRight: 30,
    paddingVertical: 8
  },
  itemLine: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    maxHeight: 20
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingRight: 8
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16
  },
  itemNum: {
    fontSize: 14
  },
  checkBoxContainer: {
    justifyContent: 'center'
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: 85
  },
  textField: {
    position: 'relative',
    bottom: 6,
    left: 2,
    height: 30,
    justifyContent: 'center'
  },
  pencilIcon: {
    marginLeft: 7,
    marginTop: 2
  }
})

TradeInListItem.propTypes = {
  itemName: PropTypes.string,
  price: PropTypes.number,
  itemNum: PropTypes.any,
  itemTransactionId: PropTypes.number,
  index: PropTypes.number,
  theme: PropTypes.object
}

export default TradeInListItem
