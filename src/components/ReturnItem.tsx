import PropTypes from 'prop-types'
import { CheckBox, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import { ThemeTypes } from '../reducers/theme'
import { CheckedTrackerType } from '../actions/returnActions'

interface ReturnItemProps {
  itemName: string
  price: number
  itemUpc: string
  discount?: number
  complete?: boolean
  itemTransactionId: number
  index: number
  theme?: ThemeTypes
  everydayPrice?: number
  loading?: boolean | string
  itemAction?: 'edit' | 'checkBox' | null
  inReturnsPanel?: boolean
  itemNumsDamagedChecked?: CheckedTrackerType
  setItemNumsDamagedChecked?: () => void
  itemNumsReturnChecked?: CheckedTrackerType
  setItemNumsReturnChecked?: (object) => void
}

const ReturnItem = ({
  index,
  itemName,
  price,
  itemUpc,
  complete,
  itemTransactionId,
  theme,
  itemAction,
  inReturnsPanel,
  itemNumsDamagedChecked,
  setItemNumsDamagedChecked,
  itemNumsReturnChecked,
  setItemNumsReturnChecked
}: ReturnItemProps): JSX.Element => {
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
  return (
    <View
      testID='item-row'
      style={[
        styles.itemRow,
        { marginLeft: complete ? 20 : 0 },
        itemAction === 'checkBox' && inReturnsPanel && { paddingLeft: 35 },
        itemAction === 'checkBox' && itemNumsReturnChecked && itemNumsReturnChecked[itemTransactionId] && { backgroundColor: '#C4C4C4' }
      ]}
    >
      <View
        style={[styles.item, { marginLeft: !complete ? -8 : 0 }]}
      >
        {itemAction === 'checkBox'
          ? (
            <TouchableOpacity
              onPress={() => {
                console.info(`ACTION: components > ReturnItem  > onPress: checkItem (upc: ${itemUpc})`)
                handleReturnsCheckbox(itemTransactionId, itemNumsReturnChecked, setItemNumsReturnChecked)
              }}
              style={{
                justifyContent: 'center'
              }}>
              <CheckBox
                testID={'check-box-return' + itemTransactionId}
                value={itemNumsReturnChecked[itemTransactionId] === true}
              />
            </TouchableOpacity>
          )
          : (
            <View style={{ width: 52 }}/>
          )}
        <TouchableOpacity
          disabled={!itemAction}
          onPress={() => {
            console.info(`ACTION: components > ReturnItem  > onPress: checkItem (upc: ${itemUpc})`)
            handleReturnsCheckbox(itemTransactionId, itemNumsReturnChecked, setItemNumsReturnChecked)
          }}
          style={styles.itemInnerContainer}
        >
          <View style={styles.itemLine}>
            <Text
              numberOfLines={1}
              testID={`item-description${index}`}
              style={[styles.itemName, { color: fontColor }]}
            >
              {itemName && itemName}
            </Text>
            <Text
              testID={`item-price${index}`}
              style={[styles.itemPrice, { color: fontColor }]}
            >
              {price.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.itemLine, inReturnsPanel && { justifyContent: 'space-between' }]}>
            <Text
              testID={`item-upc${index}`}
              style={[styles.itemNum, { color: fontColor }]}
            >
              {itemUpc && itemUpc}
            </Text>
            {itemAction === 'checkBox' &&
              itemNumsDamagedChecked &&
              itemNumsReturnChecked &&
              Object.keys(itemNumsReturnChecked).length > 0 &&
              itemNumsReturnChecked[itemTransactionId] &&
              (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      console.info(`ACTION: components > ReturnItem  > onPress: checkItemDamaged (upc: ${itemUpc})`)
                      handleReturnsCheckbox(itemTransactionId, itemNumsDamagedChecked, setItemNumsDamagedChecked)
                    }}
                    style={styles.damagedItemClickArea}/>
                  <View style={{ flexDirection: 'row' }}>
                    <CheckBox
                      testID={'check-box-damaged-' + itemTransactionId}
                      value={itemNumsDamagedChecked[itemTransactionId] === true}
                    />
                    <Text style={{ paddingLeft: 8 }}>Blemished</Text>
                  </View>
                </>
              )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  itemRow: {
    marginBottom: 10,
    width: '100%'
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 59
  },
  itemInnerContainer: {
    display: 'flex',
    flex: 1,
    paddingLeft: 16,
    paddingRight: 28,
    paddingVertical: 8
  },
  itemLine: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 2
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
  damagedItemClickArea: {
    display: 'flex',
    flexDirection: 'row',
    zIndex: 4,
    height: 74,
    width: 60,
    position: 'absolute',
    right: 50,
    top: -30
  }
})

ReturnItem.propTypes = {
  itemName: PropTypes.string,
  price: PropTypes.number,
  originalUnitPrice: PropTypes.number,
  itemNum: PropTypes.any,
  quantity: PropTypes.number,
  discount: PropTypes.number,
  complete: PropTypes.bool,
  itemTransactionId: PropTypes.number,
  index: PropTypes.number,
  theme: PropTypes.object,
  everydayPrice: PropTypes.number
}

export default ReturnItem
