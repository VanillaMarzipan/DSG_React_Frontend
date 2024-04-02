import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import PopupMenu from './PopupMenu'
import TextInput from './TextInput'
import { formatNumber, obfuscateAccountNumber } from '../utils/formatters'
import { useDispatch } from 'react-redux'
import { ThemeTypes } from '../reducers/theme'
import { DisplayItemType } from '../reducers/transactionData'
import * as CefSharp from '../utils/cefSharp'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { clearMsrSwipe, receiveUiData } from '../actions/uiActions'
import { removeGiftCard, setGiftCardAmount } from '../actions/transactionActions'
import { getGiftCardMinimumAmount } from '../utils/giftCardHelpers'
import { giftcardMaximumAmount } from '../utils/reusableNumbers'

interface GiftCardProps {
  item: DisplayItemType
  msrAccountNumber: string
  msrExpiryDate: string
  nextSelectionId: string | number
  index: number
  theme: ThemeTypes
  priceEditQueue: Array<number>
  handlePriceEditQueue: (queue: string, transactionId?: number) => void
  loading: boolean | string
  complete: boolean
  disableDeleteItem: boolean
}

const GiftCardItem = ({
  item,
  msrAccountNumber,
  msrExpiryDate,
  index,
  nextSelectionId,
  theme,
  priceEditQueue,
  handlePriceEditQueue,
  loading,
  complete,
  disableDeleteItem
}: GiftCardProps): JSX.Element => {
  const dispatch = useDispatch()
  const selectItem = useCallback(
    (itemId) => {
      let encryptedAccountNumber = ''
      try {
        encryptedAccountNumber = obfuscateAccountNumber(item.accountNumber)
      } catch (err) {
        console.error('Unable to get obfuscated account number', err)
        encryptedAccountNumber = '****************'
      }
      dispatch({
        data: { selectedItem: 'GIFTCARD', accountNumber: encryptedAccountNumber, lastItem: itemId },
        type: 'UPDATE_UI_DATA'
      })
    },
    [dispatch]
  )

  const [priceIsNull, setPriceIsNull] = useState((item.sequenceNumber !== undefined && item.sequenceNumber >= 0)
    ? false
    : (
      !Object.prototype.hasOwnProperty.call(
        item,
        'amount'
      ) || item.amount === null
    ))

  const [input, setInput] = useState<string | number>('0.00')
  const [priceEdit, setPriceEdit] = useState<boolean>(false)
  const _textInput = useRef(null)

  const { autofocusTextbox, giftCardError } = useSelector(state => state.uiData)
  const transactionData = useSelector(state => state.transactionData)
  // When priceIsNull or priceEdit changes, focus or blur price input based null price.
  useEffect(() => {
    console.info('EFFECT: components > GiftCardItem > useEffect[priceIsNull, priceEdit, priceEditQueue]', {
      priceIsNull: priceIsNull,
      priceEdit: priceEdit
    })
    if (priceIsNull) {
      if (autofocusTextbox === 'PriceEdit') {
        CefSharp.setBarcodeScannerEnabled(false)
        setTimeout(() => {
          _textInput?.current && _textInput.current.focus()
        }, 100)
      } else if (priceEditQueue?.includes(item.transactionItemIdentifier)) {
        setPriceEdit(true)
      }
    } else if (priceEditQueue && priceEditQueue.length === 0) {
      CefSharp.setBarcodeScannerEnabled(true)
    }
  }, [priceIsNull, autofocusTextbox, priceEditQueue])

  useEffect(() => {
    if (priceEdit) {
      dispatch(receiveUiData({ autofocusTextbox: 'PriceEdit' }))
    }
  }, [priceEdit])

  useEffect(() => {
    if (priceIsNull) {
      CefSharp.setBarcodeScannerEnabled(false)
      // this prevents queueing of the same transactionID when price edit is active and user deletes one of the other items
      if (!priceEditQueue.includes(item.transactionItemIdentifier)) handlePriceEditQueue('queue', item.transactionItemIdentifier)
    }
  }, [])

  useEffect(() => {
    if (giftCardError) {
      enterPriceEditMode()
    }
  }, [giftCardError])

  const deleteItemHandler = (transactionId) => {
    dispatch(removeGiftCard(transactionData, transactionId))
  }

  const preventAddingSameItemHandler = () => {
    if (!priceEditQueue.includes(item.transactionItemIdentifier) && (priceEdit || priceIsNull || item.amount === undefined)) handlePriceEditQueue('queue', item.transactionItemIdentifier)
  }

  const submitAmount = (amount) => {
    const giftcardMinimumAmount = getGiftCardMinimumAmount()

    if (amount < giftcardMinimumAmount || amount > giftcardMaximumAmount) {
      dispatch(receiveUiData({ giftCardError: `Amount must be between $${giftcardMinimumAmount.toFixed(2)} and $${giftcardMaximumAmount.toFixed(2)}` }))
      setInput('0.00')
    } else {
      setPriceEdit(false)
      setPriceIsNull(false)
      dispatch(setGiftCardAmount(msrAccountNumber, amount, msrExpiryDate, transactionData, item.transactionItemIdentifier))
      handlePriceEditQueue('dequeue')
      dispatch(clearMsrSwipe())
    }
  }

  /**
   * Reset input value. Set price edit mode to true. Set manual edit based on param.
   * @param {boolean} manualEdit
   */
  const enterPriceEditMode = (manualEdit = false): void => {
    console.info('ENTER: components > GiftCardItem > enterPriceEditMode', {
      manualEdit: manualEdit,
      itemTransactionId: item.transactionItemIdentifier
    })
    if (item.transactionItemIdentifier === priceEditQueue[0]) {
      setTimeout(() => {
        _textInput?.current && _textInput.current.focus()
      }, 500)
      setInput('0.00')
      setPriceEdit(true)
      preventAddingSameItemHandler()
    }
  }

  const popUpSlot = loading === ('deleteItem-' + item.transactionItemIdentifier)
    ? (
      <View style={{ height: 59, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator/>
      </View>
    )
    : (
      <PopupMenu
        removeEditPrice={true}
        isGiftCardItem={true}
        disableDeleteItem={disableDeleteItem}
        index={index}
        complete={false}
        deleteItem={(transactionId) => {
          handlePriceEditQueue('dequeue')
          if (priceEdit && priceEditQueue?.length === 1) {
            dispatch(receiveUiData({ priceEditActive: false }))
          }
          deleteItemHandler(transactionId)
        }}
        selectItem={selectItem}
        nextSelectionId={nextSelectionId}
        itemTransactionId={item.transactionItemIdentifier}
        enterPriceEditMode={enterPriceEditMode}
        upc={item.upc}
      />
    )

  return (
    <View
      testID='item-row'
      style={[
        styles.itemRow,
        { marginLeft: complete ? 20 : 0 }
      ]}
    >
      <View
        style={[styles.item, { marginLeft: 0 }]}
      >
        {complete
          ? <View style={{ height: 56, width: 56 }}/>
          : popUpSlot}
        <TouchableOpacity
          onPress={() => {
            console.info('ACTION: components > GiftCardItem > onPress')
            selectItem(item.transactionItemIdentifier)
          }}
          style={styles.itemInnerContainer}
        >
          <View style={styles.itemLine}>
            <Text
              numberOfLines={1}
              testID={`item-description${index}`}
              style={[styles.itemName, { color: theme.fontColor }]}
            >
              Gift Card
            </Text>
            {!priceEdit && item.amount && (
              <Text
                testID={`item-price${index}`}
                style={[styles.itemPrice, { color: theme.fontColor }, item.amount < 0 && { color: '#B80818' }]}
              >
                {item.amount.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.itemLine}>
            <Text
              testID={`item-upc${index}`}
              style={[styles.itemNum, { color: theme.fontColor }]}
            >
              {obfuscateAccountNumber(item.accountNumber)}
            </Text>
            {item.quantity && (
              <Text
                testID={`item-quantity${index}`}
                style={[styles.itemQty, { color: theme.fontColor }]}
              >{`Quantity: ${item.quantity}`}</Text>
            )}
          </View>

        </TouchableOpacity>
        {(priceIsNull || priceEdit || item.amount === undefined) && (priceEditQueue[0] === item.transactionItemIdentifier) && (
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
              console.info('ACTION: components > GiftCardItem > onSubmitEditing', { input: input })
              const amount = input ? parseFloat(input.toString()) : 0
              if (amount > 0) {
                submitAmount(amount)
              }
            }}
            onFocus={() => {
              setPriceEdit(true)
            }}
            onBlur={() => {
              if (!priceIsNull) {
                handlePriceEditQueue('dequeue')
                dispatch(receiveUiData({ priceEditActive: false, autofocusTextbox: 'OmniSearch' }))
              }
              setPriceEdit(false)
              if (item.unitPrice) setInput(item.unitPrice)
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
  itemNum: {
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
  }
})

export default GiftCardItem
