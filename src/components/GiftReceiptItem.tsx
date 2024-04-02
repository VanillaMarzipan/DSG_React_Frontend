import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { CheckBox, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import { ThemeTypes } from '../reducers/theme'
import { ItemDiscount } from '../reducers/transactionData'
import { CssStyleType } from './BackButton'

interface GiftReceiptItemProps {
  itemName: string
  giftReceipt: boolean
  price: number
  itemNum: string
  complete: boolean
  itemTransactionId: number
  index: number
  theme?: ThemeTypes
  appliedDiscounts: Array<ItemDiscount>
  everydayPrice: number
  overridePrice: number
  priceOverridden: boolean
  setItemsSelected?: (items: Array<number>) => void
  itemsSelected?:Array<number>
  selected?: boolean
  customStyles?: CssStyleType
}

const GiftReceiptItem = ({
  index,
  itemName,
  giftReceipt,
  price,
  itemNum,
  complete,
  itemTransactionId,
  theme,
  appliedDiscounts,
  everydayPrice,
  overridePrice,
  priceOverridden,
  setItemsSelected,
  itemsSelected,
  selected,
  customStyles
}: GiftReceiptItemProps): JSX.Element => {
  // Loop thru provided discount list and create new list w/o $0 promos
  const filteredDiscounts = []
  appliedDiscounts && appliedDiscounts.forEach((d) => {
    if (d.discountAmount < 0) filteredDiscounts.push(d)
  })
  const fontColor = theme ? theme.fontColor : 'black'
  const [boxChecked, setBoxChecked] = useState(giftReceipt)
  const handleGiftReceiptCheckbox = (val) => {
    if (val === null) val = !boxChecked
    const newArray = itemsSelected.slice(0)
    const selectedItemIndex = itemsSelected.indexOf(itemTransactionId)
    if (!val && itemsSelected.indexOf(itemTransactionId) > -1) {
      newArray.splice(selectedItemIndex, 1)
    } else if (val) {
      newArray.push(itemTransactionId)
    }
    setItemsSelected(newArray)
    setBoxChecked(!boxChecked)
  }

  useEffect(() => {
    setBoxChecked(selected)
  }, [selected])

  return (
    <View
      testID='item-row'
      style={[
        styles.itemRow,
        { marginLeft: complete ? 20 : 0 },
        customStyles
      ]}
    >
      <View
        style={[styles.item, { marginLeft: 0 }]}
      >
        <View style={{ justifyContent: 'center' }}>
          <CheckBox
            testID={'check-box-' + itemTransactionId}
            value={boxChecked}
            onValueChange={val => handleGiftReceiptCheckbox(val)}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            console.info('ACTION: components > Item > onPress')
            handleGiftReceiptCheckbox(null)
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
            {price !== undefined && (
              <Text
                testID={`item-price${index}`}
                style={[styles.itemPrice, { color: fontColor }]}
              >
                {price.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.itemLine}>
            <Text
              testID={`item-upc${index}`}
              style={[styles.itemNum, { color: fontColor }]}
            >
              {itemNum && itemNum}
            </Text>
          </View>
          {(filteredDiscounts && filteredDiscounts.length > 0 && everydayPrice) || (
            priceOverridden
          )
            ? (
              <Text style={styles.itemLine} testID={`everydayPrice${index}`}>
                {'Price $' + everydayPrice.toFixed(2)}
              </Text>
            )
            : null}
          {priceOverridden && (
            <Text style={styles.itemLine} testID={`overridePrice${index}`}>
              {`Price Override $${overridePrice.toFixed(2)}`}
            </Text>
          )}

        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  itemRow: {
    marginBottom: 10
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
  }
})

GiftReceiptItem.propTypes = {
  itemName: PropTypes.string,
  price: PropTypes.number,
  originalUnitPrice: PropTypes.number,
  itemNum: PropTypes.any,
  discount: PropTypes.number,
  complete: PropTypes.bool,
  nextSelectionId: PropTypes.any,
  itemTransactionId: PropTypes.number,
  index: PropTypes.number,
  theme: PropTypes.object,
  everydayPrice: PropTypes.number,
  overridePrice: PropTypes.number,
  setItemsSelected: PropTypes.func,
  itemsSelected: PropTypes.array,
  selected: PropTypes.bool
}

export default GiftReceiptItem
