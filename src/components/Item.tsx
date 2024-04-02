import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import PopupMenu from './PopupMenu'
import TextInput from './TextInput'
import { formatNumber } from '../utils/formatters'
import { useDispatch } from 'react-redux'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { ThemeTypes } from '../reducers/theme'
import { Item as ItemType, ItemDiscount } from '../reducers/transactionData'
import * as CefSharp from '../utils/cefSharp'
import Queue from '../utils/queue'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { receiveUiData } from '../actions/uiActions'
import { getAssociateById } from '../utils/coordinatorAPI'
import { receiveAssociateData, UPDATE_SAP_ASSOCIATE_DICTIONARY } from '../actions/associateActions'
import { SelectedWarrantyType } from '../reducers/warrantyData'
import { sendAppInsightsEvent } from '../utils/appInsights'
import NikeConnectedProductTag from './reusable/NikeConnectedProductTag'

interface ItemProps {
  itemName: string
  giftReceipt: boolean
  price: number
  originalUnitPrice: number
  upc: string
  quantity: number
  discount?: number
  complete: boolean
  addBorder: boolean
  isManager: boolean
  deleteItem: (transactionId: number) => void
  nextSelectionId: string | number
  itemTransactionId: number
  index: number
  editItemPrice: (transactionId: number, overridePrice: string | number, everydayPrice: string | number, promptForPrice: boolean, isManager?: boolean) => void
  priceIsNull: boolean
  theme: ThemeTypes//
  warranty?: Array<ItemType>
  warrantySelections?: SelectedWarrantyType
  appliedDiscounts: Array<ItemDiscount>
  everydayPrice: number
  overridePrice: number
  priceOverridden: boolean
  priceEditQueue?: Array<number>
  handlePriceEditQueue?: (queue: string, transactionId?: number) => void
  promptForPrice?: boolean
  returnItem?: boolean
  isTradeIn?:boolean
  damaged?: boolean
  sellingAssociateId?: string
  attributes: Array<number>
  scrollToNikePopupInView?
  disableDeleteItem: boolean
}

const Item = ({
  index,
  itemName,
  giftReceipt,
  price,
  originalUnitPrice,
  upc,
  quantity,
  discount,
  complete,
  isManager,
  addBorder,
  deleteItem,
  itemTransactionId,
  nextSelectionId,
  priceIsNull,
  editItemPrice,
  theme,
  warranty,
  warrantySelections,
  appliedDiscounts,
  everydayPrice,
  overridePrice,
  priceOverridden,
  priceEditQueue,
  handlePriceEditQueue,
  promptForPrice,
  returnItem,
  isTradeIn,
  damaged,
  sellingAssociateId,
  attributes,
  scrollToNikePopupInView,
  disableDeleteItem
}: ItemProps): JSX.Element => {
  const dispatch = useDispatch()
  const selectItem = useCallback(
    (itemId) =>
      dispatch({
        data: { selectedItem: itemId, lastItem: itemId },
        type: 'UPDATE_UI_DATA'
      }),
    [dispatch]
  )
  const [input, setInput] = useState<string | number>('0.00')
  const [priceEdit, setPriceEdit] = useState<boolean>(false)
  const [manualEdit, setManualEdit] = useState<boolean>(false)
  const [sellingAssociateDetails, setSellingAssociateDetails] = useState<string>('')

  const _textInput = useRef(null)
  // Loop thru provided discount list and create new list w/o $0 promos
  const filteredDiscounts = []
  appliedDiscounts && appliedDiscounts.forEach((d) => {
    if (d.discountAmount < 0) filteredDiscounts.push(d)
  })

  const { autofocusTextbox, loadingStates } = useSelector(state => state.uiData)
  // When priceIsNull or priceEdit changes, focus or blur price input based null price.
  useEffect(() => {
    console.info('EFFECT: components > Item > useEffect[priceIsNull, priceEdit, priceEditQueue]', JSON.stringify({
      priceIsNull: priceIsNull,
      priceEdit: priceEdit
    }))
    if (priceIsNull) {
      if (autofocusTextbox === 'PriceEdit') {
        CefSharp.setBarcodeScannerEnabled(false)
        setTimeout(() => {
          const currentTextInput = _textInput?.current
          currentTextInput && currentTextInput.focus()
        }, 100)
      } else if (priceEditQueue?.includes(itemTransactionId)) {
        setPriceEdit(true)
      }
    } else if (priceEditQueue && priceEditQueue.length === 0) {
      CefSharp.setBarcodeScannerEnabled(true)
    }
  }, [priceIsNull, autofocusTextbox, priceEditQueue])

  useEffect(() => {
    // This is a hack to get the edit text box to focus!
    if (autofocusTextbox === 'PriceEdit') {
      setTimeout(() => {
        const currentTextInput = _textInput?.current
        currentTextInput && currentTextInput.focus()
      })
    }
  }, [autofocusTextbox])

  useEffect(() => {
    if (priceEdit) {
      dispatch(receiveUiData({ autofocusTextbox: 'PriceEdit' }))
    }
  }, [priceEdit])

  useEffect(() => {
    if ((promptForPrice && !priceOverridden) || autofocusTextbox === 'PriceEdit') {
      setTimeout(() => {
        const currentTextInput = _textInput?.current
        currentTextInput && currentTextInput.focus()
      }, 500)
    }
    if (sellingAssociateId) {
      getAssociateById(sellingAssociateId)
        .then(res => {
          if (res.ok) {
            return res.json()
          }
        })
        .then(data => {
          dispatch(receiveAssociateData({ [sellingAssociateId]: data.firstName }, UPDATE_SAP_ASSOCIATE_DICTIONARY))
          setSellingAssociateDetails(`${data.firstName} ${data.lastName}`)
        })
        .catch(error => console.info('Item > getAssociateById Error: ', error))
    }
  }, [])

  const preventAddingSameItemHandler = () => {
    if (!priceEditQueue.includes(itemTransactionId)) handlePriceEditQueue('queue', itemTransactionId)
  }

  /**
   * Reset input value. Set price edit mode to true. Set manual edit based on param.
   * @param {boolean} manualEdit
   */
  const enterPriceEditMode = (manualEdit = false): void => {
    console.info('ENTER: components > Item > enterPriceEditMode', {
      manualEdit: manualEdit,
      itemTransactionId: itemTransactionId
    })
    setTimeout(() => {
      const currentTextInput = _textInput?.current
      currentTextInput && currentTextInput.focus()
    }, 500)
    setInput('0.00')
    setPriceEdit(true)
    setManualEdit(manualEdit)
    preventAddingSameItemHandler()
  }

  const clickedWarrantyMatchesTransactionWarranty =
    warranty.length > 0 && warranty[0] && warranty[0].sku === warrantySelections.warrantySku
  const nsppSellingAssociate = useSelector(state => state.associateData.nsppSellingAssociate)
  const displayWarranty = (
    description: string,
    warrantyPrice: string
  ): JSX.Element => (
    <View>
      <View style={styles.itemLine}>
        <Text
          numberOfLines={1}
          testID={`item-warranty-name${index}`}
          style={styles.warrantyName}
        >
          {description}
        </Text>
        {!priceEdit && price !== undefined && (
          <Text
            testID={`item-warranty-price${index}`}
            style={[
              styles.itemPrice,
              styles.clickedWarrantyPrice,
              { color: theme.fontColor }
            ]}
          >
            {warrantyPrice}
          </Text>
        )}
      </View>
      {
        nsppSellingAssociate && (
          <Text style={styles.nsppSellingAssociate}>
            Sold by {nsppSellingAssociate.associateId} {nsppSellingAssociate.firstName} {nsppSellingAssociate.lastName}
          </Text>
        )
      }
    </View>
  )
  const discounts = (
    <View>
      {filteredDiscounts &&
        filteredDiscounts.map((d, i) => (
          <View key={i} style={styles.itemLine}>
            <Text testID={`discount-description${index}${i}`}>
              {d.discountDescription}
            </Text>
            <Text testID={`discount-amount${index}${i}`}>
              {' (' + d.discountAmount.toFixed(2) + ')'}
            </Text>
          </View>
        ))}
    </View>
  )

  useEffect(() => {
    if (priceIsNull) {
      CefSharp.setBarcodeScannerEnabled(false)
      // this prevents queueing of the same transactionID when price edit is active and user deletes one of the other items
      if (!priceEditQueue.includes(itemTransactionId)) handlePriceEditQueue('queue', itemTransactionId)
    }
  }, [])
  return (
    <View
      testID='item-row'
      style={[
        styles.itemRow,
        { marginLeft: complete ? 20 : 0 },
        !complete && addBorder && styles.border,
        priceIsNull && styles.errorBorder
      ]}
    >
      <View
        style={[styles.item, { marginLeft: !complete && addBorder ? -8 : 0 }]}
      >
        {!complete && !returnItem
          ? (
            loadingStates.deleteItem === itemTransactionId
              ? (
                <View style={{ height: 59, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator/>
                </View>
              )
              : (
                <PopupMenu
                  removeEditPrice={false}
                  disableDeleteItem={disableDeleteItem}
                  index={index}
                  complete={complete}
                  deleteItem={(transactionId) => {
                    handlePriceEditQueue('dequeue')
                    if ((priceEdit || promptForPrice) && priceEditQueue?.length === 1) dispatch(receiveUiData({ priceEditActive: false }))
                    deleteItem(transactionId)
                  }}
                  itemAttributes={attributes}
                  appliedDiscounts={appliedDiscounts}
                  selectItem={selectItem}
                  nextSelectionId={nextSelectionId}
                  itemTransactionId={itemTransactionId}
                  enterPriceEditMode={enterPriceEditMode}
                  upc={upc}
                />
              )
          )
          : <View style={{ height: 56, width: 56 }}/>}
        <TouchableOpacity
          onPress={() => {
            console.info('ACTION: components > Item > onPress')
            selectItem(itemTransactionId)
          }}
          style={styles.itemInnerContainer}
        >
          <View style={styles.itemLine}>
            <Text
              numberOfLines={1}
              testID={`item-description${index}`}
              style={[styles.itemName, { color: theme.fontColor }]}
            >
              {itemName && itemName}
            </Text>
            {!priceEdit && price !== undefined && (
              <Text
                testID={`item-price${index}`}
                style={[styles.itemPrice, { color: theme.fontColor }, price < 0 && { color: '#B80818' }]}
              >
                {loadingStates.editItemPrice === itemTransactionId
                  ? (
                    <ActivityIndicator/>
                  )
                  : (
                    price.toFixed(2)
                  )}
              </Text>
            )}
          </View>
          <View style={[styles.itemLine, isTradeIn ? styles.tradeInItemSummaryDetails : []]}>
            <Text
              testID={`item-upc${index}`}
              style={[styles.upc, { color: theme.fontColor }]}
            >
              {upc && upc}
            </Text>
            {isTradeIn
              ? <Text>Trade-In</Text>
              : quantity && (
                <Text
                  testID={`item-quantity${index}`}
                  style={[styles.itemQty, { color: theme.fontColor }]}
                >{`Quantity: ${quantity}`}</Text>
              )}
          </View>
          {
            sellingAssociateId && (
              <View>
                <Text
                  style={styles.itemLevelSapDetails}>{`Sold by ${sellingAssociateId} ${sellingAssociateDetails || ''}`}</Text>
              </View>
            )
          }
          {(filteredDiscounts && filteredDiscounts.length > 0 && everydayPrice) || (
            priceOverridden && !promptForPrice
          )
            ? (
              <Text style={styles.itemLine} testID={`everydayPrice${index}`}>
                {'Price $' + everydayPrice.toFixed(2)}
              </Text>
            )
            : null}
          {returnItem && damaged && (
            <Text style={styles.itemLine} testID={`damaged-indicator-item-${index}`}>
              Blemished Item
            </Text>
          )}
          {priceOverridden && !promptForPrice && (
            <Text style={styles.itemLine} testID={`overridePrice${index}`}>
              {`Price Override $${overridePrice.toFixed(2)}`}
            </Text>
          )}
          {discounts}
          {warrantySelections && warrantySelections.warrantySku !== null
            ? clickedWarrantyMatchesTransactionWarranty
              ? displayWarranty(
                warranty[0].description,
                warranty[0].returnPrice.toFixed(2)
              )
              : displayWarranty(warrantySelections.warrantyDescription, null)
            : null}
          {discount && (
            <Text style={[styles.itemDiscount, { color: theme.fontColor }]}>
              {discount.toFixed(2)}
            </Text>
          )}
          {attributes?.includes(8) && <NikeConnectedProductTag popupPosition='bottom' scrollToPopupInView={scrollToNikePopupInView}/>}
        </TouchableOpacity>
        {giftReceipt && (
          <Text testID={'gift-receipt-selected-indicator-' + itemTransactionId} style={styles.giftReceiptIndicator}>
            G
          </Text>
        )}
        {(priceIsNull || priceEdit || price === undefined) && (priceEditQueue[0] === itemTransactionId) && (// && !inGiftReceiptPanel
          <TextInput
            maxLength={8}
            paddingMode='none'
            nativeID='item-price-input'
            ref={_textInput}
            labelBackgroundColor={theme.backgroundColor}
            style={styles.textField}
            borderColor='#D76B00'
            value={input}
            onChangeText={(text) => setInput(formatNumber(text))}
            mode='outlined'
            blurOnSubmit={false}
            onSubmitEditing={() => {
              console.info('ACTION: components > Item > onSubmitEditing', { input: input })
              if (input !== '0.00') {
                Queue.dequeue()
                sendRumRunnerEvent('Edit Item', {
                  nullPrice: !originalUnitPrice,
                  originalPrice: price,
                  changedPrice: input,
                  manualEdit: manualEdit
                })
                sendAppInsightsEvent('EditItem', {
                  nullPrice: !originalUnitPrice,
                  originalPrice: price,
                  changedPrice: input,
                  manualEdit: manualEdit
                })
                setPriceEdit(false)
                setManualEdit(false)
                editItemPrice(itemTransactionId, input, everydayPrice, promptForPrice, isManager)
                handlePriceEditQueue('dequeue')
              }
            }}
            onBlur={() => {
              if (!priceIsNull) {
                handlePriceEditQueue('dequeue')
                dispatch(receiveUiData({ priceEditActive: false, autofocusTextbox: 'OmniSearch' }))
              }
              setPriceEdit(false)
              setManualEdit(false)
              if (price) setInput(price)
            }}
            color={theme.fontColor}
            padding='none'
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  itemRow: {
    marginBottom: 10
  },
  tradeInItemSummaryDetails: {
    flexDirection: 'column'
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 59
  },
  border: {
    borderLeftWidth: 8,
    borderColor: '#006554'
  },
  errorBorder: {
    borderWidth: 2,
    borderColor: '#da1600'
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
  textField: {
    width: 75,
    height: 40,
    marginRight: 8,
    justifyContent: 'center'
  },
  upc: {
    fontSize: 14
  },
  itemQty: {
    fontSize: 14,
    marginLeft: 32
  },
  itemDiscount: {
    fontSize: 14
  },
  warrantyName: {
    paddingRight: 8,
    fontSize: 14,
    color: '#006554'
  },
  clickedWarrantyPrice: {
    fontSize: 14
  },
  giftReceiptIndicator: {
    fontWeight: '700',
    color: '#BB5811',
    position: 'absolute',
    right: 0,
    fontSize: 16,
    lineHeight: 16,
    paddingTop: 9,
    paddingRight: 6
  },
  nsppSellingAssociate: {
    fontSize: 8,
    fontWeight: '400',
    color: '#006554',
    marginLeft: 12,
    marginTop: 2
  },
  itemLevelSapDetails: {
    fontSize: 8,
    fontWeight: '400',
    color: '#006554'
  }
})

Item.propTypes = {
  itemName: PropTypes.string,
  price: PropTypes.number,
  originalUnitPrice: PropTypes.number,
  upc: PropTypes.string,
  quantity: PropTypes.number,
  discount: PropTypes.number,
  complete: PropTypes.bool,
  addBorder: PropTypes.bool,
  deleteItem: PropTypes.func,
  nextSelectionId: PropTypes.any,
  itemTransactionId: PropTypes.number,
  index: PropTypes.number,
  editItemPrice: PropTypes.func,
  priceIsNull: PropTypes.bool,
  theme: PropTypes.object,
  warranty: PropTypes.array,
  everydayPrice: PropTypes.number,
  overridePrice: PropTypes.number,
  priceOverridden: PropTypes.bool
}

export default Item
