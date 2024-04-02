import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import Text from './StyledText'
import { setGiftReceipts } from '../actions/transactionActions'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../actions/uiActions'
import GiftReceiptItem from './GiftReceiptItem'
import SubmitButton from './reusable/SubmitButton'
import { receivePrintReceiptData } from '../actions/printReceiptActions'

interface GiftReceiptSelectionProps {
  setGiftReceiptPanelSelected: (boolean) => void
}

const GiftReceiptSelection = ({
  setGiftReceiptPanelSelected
}: GiftReceiptSelectionProps) => {
  const transactionData = useSelector(state => state.transactionData)
  const startingArray = []
  const items = transactionData.items
  items && items.forEach(item => {
    if (item.giftReceipt === true) {
      startingArray.push(item.transactionItemIdentifier)
    }
  })
  const uiData = useSelector(state => state.uiData)
  const [itemsSelected, setItemsSelected] = useState<Array<number>>(startingArray)
  const [submitButtonEnabled, setSubmitButtonEnabled] = useState(false)

  useEffect(() => {
    console.info('EFFECT: components > GiftReceiptSelection > useEffect[itemsSelected]')
    const selectionDiffs = itemsSelected
      .filter(el => !startingArray.includes(el))
      .concat(startingArray.filter(el => !itemsSelected.includes(el)))
    setSubmitButtonEnabled(selectionDiffs.length > 0)
  }, [itemsSelected])
  const [selectAll, setSelectAll] = useState(false)
  const dispatch = useDispatch()

  const handleSubmitGiftReceiptSelection = (separateGiftReceipts: boolean) => {
    console.info('ACTION: components > GiftReceiptSelection > onPress buttonContainer', JSON.stringify({ separateGiftReceipts: separateGiftReceipts }))
    dispatch(setGiftReceipts(itemsSelected))
    dispatch(receiveUiData({ footerOverlayActive: 'None' }))
    setGiftReceiptPanelSelected(false)
    dispatch(receivePrintReceiptData({
      midSaleSeparateGiftReceipts: separateGiftReceipts
    }))
  }
  return (
    <View testID={'gift-receipt-panel'} style={styles.container}>
      <View style={{ paddingLeft: 25, minHeight: 576 }}>
        <View style={styles.heading}>
          <Text style={styles.headingText}>
            Gift Receipt
          </Text>
        </View>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={
            () => {
              console.info('ACTION: components > GiftReceiptSelection > onPress selectAllButton')
              const arr = []
              transactionData.items && transactionData.items.forEach(item => {
                arr.push(item.transactionItemIdentifier)
              })
              setItemsSelected(arr)
              setSelectAll(true)
            }
          }>
          <Text testID={'select-all-gift-receipts'} style={styles.selectAllText}>
            Select All
          </Text>
        </TouchableOpacity>
        <View style={styles.selectionContainer}>
          <>
            {transactionData.items && transactionData.items.length > 0 && (
              <FlatList
                data={transactionData.items}
                extraData={{ transactionData, uiData }}
                keyExtractor={(item, index) => index.toString() + item.upc}
                renderItem={({ item, index }) => (
                  <GiftReceiptItem
                    selected={selectAll}
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
                    complete={uiData.activePanel !== 'scanDetailsPanel'}
                    itemTransactionId={item.transactionItemIdentifier}
                    appliedDiscounts={item.appliedDiscounts}
                  />
                )}
              />
            )}
          </>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {submitButtonEnabled
          ? (
            <View style={{ width: '100%', flexDirection: 'row', alignContent: 'flex-end' }}>
              <SubmitButton
                testID='confirm-separate-gift-receipts'
                buttonLabel='ONE ITEM PER RECEIPT'
                disabled={itemsSelected.length < 2}
                customStyles={[styles.confirmReceiptTypeButton, { backgroundColor: '#006554' }]}
                onSubmit={() => {
                  handleSubmitGiftReceiptSelection(true)
                }}
              />
              <SubmitButton
                testID='confirm-single-gift-receipt'
                customStyles={styles.confirmReceiptTypeButton}
                buttonLabel='SINGLE RECEIPT'
                onSubmit={() => {
                  handleSubmitGiftReceiptSelection(false)
                }}
              />
            </View>
          )
          : (
            <View
              testID={'select-items-for-gift-receipt'}
              style={[styles.submitButton, submitButtonEnabled && { backgroundColor: '#C57135' }]}
            >
              <Text style={styles.submitButtonText}>
                SELECT ITEMS FOR GIFT RECEIPT
              </Text>
            </View>
          )}
      </View>
    </View>
  )
}
export default GiftReceiptSelection

const styles = StyleSheet.create({
  container: {
    minHeight: 638,
    minWidth: 525,
    maxWidth: 525,
    backgroundColor: 'white',
    position: 'absolute',
    right: 32,
    bottom: 99,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  heading: {
    borderBottomWidth: 1,
    borderColor: '#979797',
    paddingBottom: 14,
    paddingTop: 25,
    marginRight: 25
  },
  headingText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700'
  },
  selectAllText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textDecorationLine: 'underline',
    paddingTop: 8
  },
  selectAllButton: {
    height: 26,
    marginBottom: 34
  },
  selectionContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxHeight: 450
  },
  itemListContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  itemContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButton: {
    width: '100%',
    height: 62,
    backgroundColor: '#C8C8C8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  confirmReceiptTypeButton: {
    marginBottom: 0,
    height: 62,
    width: '50%'
  }
})
