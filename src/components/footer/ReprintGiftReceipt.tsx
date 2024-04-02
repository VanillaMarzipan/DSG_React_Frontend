import { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import { receivePrintReceiptData } from '../../actions/printReceiptActions'
import { transactionByBarcode } from '../../actions/transactionActions'
import { receiveUiData } from '../../actions/uiActions'
import { useTypedSelector } from '../../reducers/reducer'
import { printGiftReceipts } from '../../utils/cefSharp'
import GiftReceiptItem from '../GiftReceiptItem'
import CloseButton from '../reusable/CloseButton'
import DecoratorLine from '../reusable/DecoratorLine'
import SubmitButton from '../reusable/SubmitButton'
import Text from '../StyledText'
import BarcodeSvg from '../svg/BarcodeSvg'
import TextInput from '../TextInput'

interface ReprintGiftReceiptProps {
  setReprintGiftReceiptPanelSelected
  activePanel
  transactionByBarcodeLoading
  scanEvent
}

const ReprintGiftReceipt = ({
  setReprintGiftReceiptPanelSelected,
  activePanel,
  transactionByBarcodeLoading,
  scanEvent
}: ReprintGiftReceiptProps): JSX.Element => {
  const dispatch = useDispatch()
  const receiptBarcodeInputRef = useRef(null)
  const {
    transactionFoundViaBarcode,
    serializedStoreInfo,
    serializedAssociateData,
    transactionByBarcodeError,
    transactionByBarcodeErrorMessage
  } = useTypedSelector(state => state.printReceiptData)
  const [itemsSelected, setItemsSelected] = useState<Array<number>>([])
  const [selectAll, setSelectAll] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState('')

  const handleRerintGiftReceipts = (separateGiftReceipts: boolean) => {
    const clone = { ...transactionFoundViaBarcode }
    dispatch(receivePrintReceiptData({
      transactionFoundViaBarcode: null
    }))
    clone.items.forEach(item => {
      if (itemsSelected.includes(item.transactionItemIdentifier)) {
        item.giftReceipt = true
      } else {
        item.giftReceipt = false
      }
    })
    printGiftReceipts(
      JSON.stringify(clone),
      serializedStoreInfo,
      serializedAssociateData,
      `{"separateGiftReceipts":${separateGiftReceipts}}`
    )
    dispatch(receiveUiData({ footerOverlayActive: 'None' }))
    setReprintGiftReceiptPanelSelected(false)
  }

  useEffect(() => {
    return () => {
      dispatch(receivePrintReceiptData({
        transactionByBarcodeError: null,
        transactionByBarcodeErrorMessage: null,
        transactionFoundViaBarcode: null
      }))
    }
  }, [])

  useEffect(() => {
    if (transactionByBarcodeError !== null) {
      receiptBarcodeInputRef?.current?.focus()
    }
  }, [transactionByBarcodeError])

  useEffect(() => {
    if (scanEvent && scanEvent.scanValue) {
      setReceiptNumber(scanEvent.scanValue)
      dispatch(transactionByBarcode(scanEvent.scanValue, 'reprintGiftReceipt'))
    }
  }, [scanEvent?.scanTime])
  return (
    <View style={[styles.positionAbsolute, styles.mainContainer]}>
      <Text style={[styles.boldFont, styles.heading]}>
        Print/Reprint Gift Receipt
      </Text>
      {transactionByBarcodeLoading
        ? (
          <View style={[styles.positionAbsolute, styles.closeButtonSpacer]} />
        )
        : (
          <CloseButton
            testID='close-reprint-gift-receipt-panel'
            dismisser={() => {
              setReprintGiftReceiptPanelSelected(false)
              dispatch(receiveUiData({
                scanEvent: null,
                footerOverlayActive: 'None'
              }))
            }}
            customStyles={{
              position: 'absolute',
              right: 6
            }}
          />
        )}
      {
        transactionFoundViaBarcode
          ? (
            <>
              <View style={[styles.fullWidth, styles.alignCenter]}>
                <DecoratorLine customStyles={styles.topDecoratorLine} />
                <Text style={[styles.boldFont, styles.transactionFoundHeader]}>
                  Order #: {receiptNumber} - ${transactionFoundViaBarcode.total.grandTotal.toFixed(2)}
                </Text>
                <DecoratorLine customStyles={styles.width88} />
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={
                    () => {
                      console.info('ACTION: components > GiftReceiptSelection > onPress selectAllButton')
                      const arr = []
                      if (!selectAll) {
                        transactionFoundViaBarcode.items && transactionFoundViaBarcode.items.forEach(item => {
                          arr.push(item.transactionItemIdentifier)
                        })
                      }
                      setItemsSelected(arr)
                      setSelectAll(!selectAll)
                    }
                  }>
                  <Text testID={'select-all-gift-receipts'} style={styles.selectAllText}>
                    Select All
                  </Text>
                </TouchableOpacity>
                <View style={[styles.fullWidth, { height: 388 }]}>
                  <FlatList
                    data={transactionFoundViaBarcode.items}
                    extraData={{ transactionFoundViaBarcode, activePanel, itemsSelected }}
                    keyExtractor={(item, index) => index.toString() + item.upc}
                    renderItem={({ item, index }) => {
                      if (item.description && item.returnPrice && item.upc) {
                        return (
                          <>
                            {itemsSelected.includes(item.transactionItemIdentifier) &&
                              <View
                                style={{
                                  position: 'absolute',
                                  backgroundColor: '#D9D9D9',
                                  minWidth: 1000,
                                  height: 60,
                                  paddingHorizontal: 1000
                                }}
                              />
                            }
                            <GiftReceiptItem
                              selected={itemsSelected.includes(item.transactionItemIdentifier)}
                              setItemsSelected={setItemsSelected}
                              itemsSelected={itemsSelected}
                              index={index}
                              itemName={item.description}
                              giftReceipt={item.giftReceipt}
                              price={item.returnPrice}
                              originalUnitPrice={item.originalUnitPrice}
                              everydayPrice={item.everydayPrice}
                              overridePrice={item.overridePrice}
                              priceOverridden={item.priceOverridden}
                              itemNum={item.upc}
                              complete={activePanel !== 'scanDetailsPanel'}
                              itemTransactionId={item.transactionItemIdentifier}
                              appliedDiscounts={item.appliedDiscounts}
                              customStyles={{ marginLeft: 54, width: '86%' }}
                            />
                          </>
                        )
                      }
                    }}
                  />
                </View>
              </View>
              <View style={[styles.fullWidth, styles.positionAbsolute, styles.transactionFoundSubmitButtons]}>
                {itemsSelected.length > 0
                  ? (
                    <>
                      <SubmitButton
                        testID='reprint-one-item-per-gift-receipt-button'
                        onSubmit={() => handleRerintGiftReceipts(true)}
                        buttonLabel='ONE ITEM PER RECEIPT'
                        disabled={itemsSelected.length === 1}
                        customStyles={[
                          styles.printReceiptButtons,
                          {
                            backgroundColor: '#006554'
                          }
                        ]}
                      />
                      <SubmitButton
                        testID='reprint-single-gift-receipt-button'
                        onSubmit={() => handleRerintGiftReceipts(false)}
                        buttonLabel='SINGLE RECEIPT'
                        customStyles={styles.printReceiptButtons}
                      />
                    </>
                  )
                  : (
                    <SubmitButton
                      testID='reprint-gift-receipt-next-button'
                      onSubmit={() => null}
                      buttonLabel='SELECT ITEMS FOR GIFT RECEIPT'
                      customStyles={[
                        styles.fullWidth,
                        styles.nonClickableButton
                      ]}
                      customTextStyles={{ color: '#4F4F4F' }}
                    />
                  )}
              </View>
            </>
          )
          : (
            <>
              <View>
                <Text
                  style={[styles.fullWidth, styles.transactionLookupHeader, transactionByBarcodeError !== null && { color: '#B10216' }]}
                >
                  {transactionByBarcodeError !== null
                    ? (
                      transactionByBarcodeErrorMessage
                    )
                    : (
                      "Input the receipt number, located on the customer's receipt"
                    )
                  }
                </Text>
                <View style={[styles.fullWidth, styles.alignCenter]}>
                  <TextInput
                    nativeID={'identification-number-text-input'}
                    testID={'identification-number-text-input'}
                    ref={receiptBarcodeInputRef}
                    labelBackgroundColor='white'
                    error={transactionByBarcodeError !== null}
                    label={'Receipt Number'}
                    style={styles.textInput}
                    value={receiptNumber}
                    autoFocus={true}
                    onChangeText={text => setReceiptNumber(text)}
                    onSubmitEditing={() => {
                      if (!transactionByBarcodeLoading) {
                        dispatch(transactionByBarcode(receiptNumber, 'reprintGiftReceipt'))
                      }
                    }}
                    mode='outlined'
                  />
                </View>
                <View style={[styles.orArea, styles.alignCenter]}>
                  <View style={styles.orLine}></View>
                  <Text style={{ color: '#666' }}>{'or'}</Text>
                  <View style={styles.orLine}></View>
                </View>
                <View style={[styles.alignCenter, { marginHorizontal: 'auto' }]}>
                  <BarcodeSvg />
                  <Text style={{ marginTop: 16 }}>Scan the receipt barcode</Text>
                </View>
              </View>
              <SubmitButton
                testID='reprint-gift-receipt-lookup-barcode-button'
                onSubmit={() => dispatch(transactionByBarcode(receiptNumber, 'reprintGiftReceipt'))}
                buttonLabel='NEXT'
                disabled={receiptNumber.length < 22}
                loading={transactionByBarcodeLoading}
                customStyles={[
                  styles.fullWidth,
                  styles.positionAbsolute,
                  {
                    bottom: 0,
                    marginBottom: 0,
                    height: 62
                  }
                ]}
              />
            </>
          )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#EDEDED',
    height: 638,
    width: 525,
    right: 20,
    zIndex: 2,
    bottom: 100
  },
  heading: {
    fontSize: 20,
    marginTop: 25,
    marginLeft: 32
  },
  boldFont: {
    fontWeight: '700'
  },
  textInput: {
    marginBottom: 20,
    width: 343,
    height: 60
  },
  closeButtonSpacer: {
    width: 35.8,
    height: 39,
    right: 6
  },
  width88: {
    width: '88%'
  },
  topDecoratorLine: {
    marginTop: 28,
    width: '88%',
    marginBottom: 14
  },
  transactionFoundHeader: {
    width: 461,
    textAlign: 'left',
    marginLeft: 0,
    marginBottom: 14,
    fontSize: 20
  },
  orArea: {
    marginVertical: 32,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  transactionLookupHeader: {
    textAlign: 'center',
    marginTop: 72,
    marginBottom: 63
  },
  orLine: {
    width: 126,
    height: 1,
    backgroundColor: '#C5C5C5',
    marginLeft: 10,
    marginRight: 10
  },
  transactionFoundSubmitButtons: {
    display: 'flex',
    flexDirection: 'row',
    bottom: 0,
    marginBottom: 0
  },
  nonClickableButton: {
    height: 62,
    marginBottom: 'inherit',
    backgroundColor: '#C8C8C8'
  },
  selectAllButton: {
    height: 26,
    marginBottom: 34,
    width: '80%'
  },
  selectAllText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textDecorationLine: 'underline',
    paddingTop: 8
  },
  printReceiptButtons: {
    width: '50%',
    height: 62,
    marginBottom: 'inherit'
  },
  fullWidth: {
    width: '100%'
  },
  alignCenter: {
    alignItems: 'center'
  },
  positionAbsolute: {
    position: 'absolute'
  }
})

export default ReprintGiftReceipt
