import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import Text from '../../StyledText'
import BarcodeSvg from '../../svg/BarcodeSvg'
import TextInput from '../../TextInput'
import ReturnItem from '../../ReturnItem'
import { useTypedSelector as useSelector } from '../../../reducers/reducer'
import { useDispatch } from 'react-redux'
import { fetchLowestReturnPrice } from '../../../actions/returnActions'

interface NoReceiptReturnProps {
    nonReceiptedReturnItems
    itemNumsReturnChecked
    setItemNumsReturnChecked
    itemNumsDamagedChecked
    setItemNumsDamagedChecked
}

const NoReceiptReturn = ({
  nonReceiptedReturnItems,
  itemNumsReturnChecked,
  setItemNumsReturnChecked,
  itemNumsDamagedChecked,
  setItemNumsDamagedChecked
}: NoReceiptReturnProps): JSX.Element => {
  const dispatch = useDispatch()
  const { fetchLowestReturnPriceError, addNonReceiptedReturnItemsError } = useSelector(state => state.returnData)
  const [manualEntry, setManualEntry] = useState(false)
  const [nonReceiptUpc, setNonReceiptUpc] = useState('')
  const mainInputRef = useRef(null)
  useEffect(() => {
    if (nonReceiptedReturnItems.length > 0 || fetchLowestReturnPriceError) mainInputRef?.current?.focus()
  }, [nonReceiptedReturnItems, fetchLowestReturnPriceError])
  let textInputErrorMessage = ''
  if (fetchLowestReturnPriceError === 'upcNotFound') textInputErrorMessage = 'Barcode not found'
  else if (fetchLowestReturnPriceError === 'generalError' || addNonReceiptedReturnItemsError) textInputErrorMessage = 'Sorry, something went wrong. Please try again.'

  const textInput = (
    <View style={[styles.textInputContainer, nonReceiptedReturnItems.length > 0 && styles.textInputContainerWithItems]}>
      <TextInput
        autoFocus={true}
        ref={mainInputRef}
        error={fetchLowestReturnPriceError !== null}
        nativeID='no-receipt-manual-input'
        testID='no-receipt-manual-input'
        labelBackgroundColor='white'
        label={'Type or scan UPC of items to be returned'}
        style={[
          styles.textInput,
          nonReceiptedReturnItems.length > 0 && styles.textInputWithItems
        ]}
        value={nonReceiptUpc}
        onChangeText={text => {
          const reg = /^[0-9\b]+$/
          if (text.length >= 1 && !reg.test(text)) return
          setNonReceiptUpc(text)
        }}
        mode='outlined'
        maxLength={13}
        onSubmitEditing={() => {
          dispatch(fetchLowestReturnPrice(nonReceiptUpc, nonReceiptedReturnItems))
          setNonReceiptUpc('')
        }}
      />
      {(fetchLowestReturnPriceError || addNonReceiptedReturnItemsError) && (
        <Text style={[styles.textInputErrorMessage, styles.errorText]}>
          {textInputErrorMessage}
        </Text>
      )}
    </View>
  )
  let scanItemScreenMessage = 'Scan Items to Return'
  if (fetchLowestReturnPriceError === 'upcNotFound') scanItemScreenMessage = 'Barcode not found'
  else if (fetchLowestReturnPriceError === 'generalError') scanItemScreenMessage = 'Sorry, something went wrong. Please try again.'
  return (
    <View style={styles.noItemsContainer}>
      {nonReceiptedReturnItems.length > 0 && <View style={styles.decoratorLine} />}
      {!(nonReceiptedReturnItems.length > 0) &&
                (<View style={styles.initialScanViewContainer}>
                  <Text style={[styles.initialScanViewMessage, fetchLowestReturnPriceError && { color: '#000000' }]}>
                        Returns with no receipt will default to the lowest selling price
                  </Text>
                  {manualEntry
                    ? <View style={{}}>
                      {textInput}
                    </View>
                    : (
                      <View style={styles.initialScanViewInnerContainer}>
                        <View style={{ marginTop: 83 }}>
                          <BarcodeSvg />
                        </View>
                        <Text style={[{ marginTop: 23 }, fetchLowestReturnPriceError && styles.errorText]}>
                          {scanItemScreenMessage}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setManualEntry(true)}
                        >
                          <Text style={styles.noBarcodeAvailableText}>
                                        No Barcode Available
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </View>)
      }
      {nonReceiptedReturnItems.length > 0 &&
                <View style={styles.withItemsContainer}>
                  {textInput}
                  < View style={styles.barcodeSvgContainer}>
                    <BarcodeSvg height={43} width={63} />
                  </View>
                  <View >
                    <Text style={styles.instructionText}>
                        Product imagery is available on transaction screen {'\n'}
                              by tapping the item in the receipt panel.
                    </Text>
                  </View>
                  <View style={styles.flatListContainer}>
                    <FlatList
                      data={nonReceiptedReturnItems}
                      extraData={{ nonReceiptedReturnItems }}
                      keyExtractor={(item, index) => index.toString() + item.product.upc}
                      renderItem={({ item, index }) => (
                        <View>
                          <ReturnItem
                            inReturnsPanel={true}
                            itemAction={'checkBox'}
                            index={index}
                            itemName={item.product.description}
                            price={item.returnPrice}
                            originalUnitPrice={item.returnPrice}
                            everydayPrice={item.returnPrice}
                            itemUpc={item.product.upc}
                            itemTransactionId={index}
                            itemNumsDamagedChecked={itemNumsDamagedChecked}
                            setItemNumsDamagedChecked={setItemNumsDamagedChecked}
                            itemNumsReturnChecked={itemNumsReturnChecked}
                            setItemNumsReturnChecked={setItemNumsReturnChecked}
                          />
                        </View>
                      )}
                    />
                  </View>
                </View>
      }
    </View >
  )
}

const styles = StyleSheet.create({
  noItemsContainer: {
    width: '100%',
    minHeight: '50%',
    alignItems: 'center'
  },
  decoratorLine: {
    height: 1,
    width: '90%',
    marginTop: 14,
    backgroundColor: '#797979'
  },
  initialScanViewContainer: {
    width: '100%',
    alignItems: 'center'
  },
  initialScanViewMessage: {
    marginTop: 95,
    color: '#B10216'
  },
  initialScanViewInnerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: '#B80818'
  },
  noBarcodeAvailableText: {
    marginTop: 39,
    marginBottom: 120,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  textInput: {
    marginTop: 120,
    width: 331,
    height: 60
  },
  textInputWithItems: {
    width: 461,
    marginTop: 11
  },
  textInputContainer: {
    marginBottom: 200,
    alignItems: 'center'
  },
  textInputContainerWithItems: {
    marginBottom: 29
  },
  textInputErrorMessage: {
    width: '100%',
    marginTop: 11
  },
  withItemsContainer: {
    maxWidth: 461
  },
  barcodeSvgContainer: {
    position: 'absolute',
    top: 23,
    right: 10
  },
  flatListContainer: {
    width: '112%',
    marginLeft: -27,
    minHeight: 120,
    maxHeight: 345
  },
  instructionText: {
    color: 'black',
    textAlign: 'center',
    marginLeft: 75,
    marginBottom: 15,
    display: 'flex'
  }
})

export default NoReceiptReturn
