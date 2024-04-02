import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import DecoratorLine from '../../reusable/DecoratorLine'
import TextInput from '../../TextInput'
import BarcodeSvg from '../../svg/BarcodeSvg'
import { useEffect, useState } from 'react'
import BackButton from '../../BackButton'
import SubmitButton from '../../reusable/SubmitButton'
import { UiDataTypes } from '../../../reducers/uiData'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '../../../reducers/reducer'
import { fetchProductByUpcAction, addTradeInItemsAction } from '../../../actions/returnActions'
import { TradeInItem } from '../../../reducers/returnData'
import TradeInListItem from '../../TradeInListItem'

interface TradeInsProps {
  handleBackButton: () => void
  uiData: UiDataTypes
}

const TradeIns = ({
  handleBackButton,
  uiData
}: TradeInsProps) => {
  const dispatch = useDispatch()
  const [tradeInUpc, setTradeInUpc] = useState('')
  const [disableSelection, setDisableSelection] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [itemNumsChecked, setItemNumsChecked] = useState({})
  const [tradeInItems, setTradeInItems] = useState([])
  const theme = useTypedSelector(state => state.theme)

  useEffect(() => {
    const updatedItemNums = JSON.parse(JSON.stringify(itemNumsChecked))
    if (tradeInItems.length > 0) {
      updatedItemNums[tradeInItems.length - 1] = true
      setItemNumsChecked(updatedItemNums)
    }
  }, [tradeInItems])

  useEffect(() => {
    if (uiData.scanEvent?.scanValue && !tradeInItems?.some(i => i.returnPrice === 0)) {
      const upc = uiData.scanEvent.scanValue
      setTradeInUpc(upc)
      handleScanTradeInItems(upc)
    }
  }, [uiData.scanEvent?.scanTime])

  const updateTradeInItemPrice = (index: number, price: number) => {
    const clone: Array<TradeInItem> = JSON.parse(JSON.stringify(tradeInItems))
    clone[index].returnPrice = price
    setTradeInItems(clone)
  }

  const handleScanTradeInItems = (upc) => {
    dispatch(fetchProductByUpcAction(upc, tradeInItems, setTradeInItems, () => setTradeInUpc(''), (message: string) => setErrorMessage(message)))
  }
  const submitTradeInRequest = () => {
    const filteredTradeInItems = tradeInItems?.filter((item, index) => itemNumsChecked[index])
    dispatch(addTradeInItemsAction(filteredTradeInItems, setErrorMessage))
  }
  return (
    <View style={styles.mainContainer}>
      <DecoratorLine
        customStyles={styles.customDecoratorLine}
      />
      <View style={[styles.textInputContainer]}>
        <TextInput
          autoFocus={true}
          error={errorMessage !== null}
          nativeID='no-receipt-manual-input'
          testID='no-receipt-manual-input'
          labelBackgroundColor='white'
          label={'Type or scan UPC of items to be Traded In'}
          style={[
            styles.textInput
          ]}
          value={tradeInUpc}
          onChangeText={text => {
            const reg = /^[0-9\b]+$/
            if (text.length >= 1 && !reg.test(text)) return
            setTradeInUpc(text)
          }}
          mode='outlined'
          maxLength={13}
          onSubmitEditing={() => {
            handleScanTradeInItems(tradeInUpc)
          }}
        />
        {errorMessage && (
          <Text style={styles.textInputErrorMessage}>
            {errorMessage}
          </Text>
        )}
      </View>
      {tradeInItems.length > 0
        ? (
          <View style={styles.tradeInsFlatListContainer}>
            <FlatList
              style={{ marginTop: 24 }}
              data={tradeInItems}
              extraData={{ tradeInItems }}
              keyExtractor={(item, index) => index.toString() + item.upc}
              renderItem={({ item, index }) => (
                <View>
                  <TradeInListItem
                    index={index}
                    itemName={item.description}
                    price={item.returnPrice}
                    theme={theme}
                    itemUpc={item.upc}
                    itemTransactionId={index}
                    disableSelection={disableSelection}
                    setDisableSelection={setDisableSelection}
                    updateTradeInItemPrice={updateTradeInItemPrice}
                    itemNumsReturnChecked={itemNumsChecked}
                    setItemNumsReturnChecked={setItemNumsChecked}
                  />
                </View>
              )}
            />
          </View>
        )
        : (
          <>
            <View style={styles.backButtonContainer}>
              <BackButton
                back={handleBackButton}
                size='small'
                customFontSize={16}
              />
            </View>
            <BarcodeSvg height={87} width={87} />
            <Text style={styles.instructionsLineOne}>
              Type or scan UPC of items for trade-in,
            </Text>
            <Text style={styles.instructionsLineTwo}>
              then enter item price listed on the form when prompted
            </Text>
          </>
        )}
      <View style={styles.barcodeSvgContainer}>
        {uiData.loadingStates.fetchProductByUpc
          ? (
            <View style={{ height: 42, justifyContent: 'center', width: 63, alignItems: 'center' }}>
              <ActivityIndicator />
            </View>
          )
          : <BarcodeSvg height={43} width={63} />}
      </View>
      <SubmitButton
        testID={'trade-in-item-lookup'}
        onSubmit={submitTradeInRequest}
        disabled={uiData.loadingStates.fetchProductByUpc || uiData.loadingStates.addTradeInItems || disableSelection || !Object.values(itemNumsChecked).some(checked => checked)}
        customStyles={styles.addToTransactionButton}
        buttonLabel={'ADD TO TRANSACTION'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    alignItems: 'center'
  },
  textInputContainer: {
    alignItems: 'center'
  },
  textInput: {
    width: 461,
    height: 60
  },
  barcodeSvgContainer: {
    position: 'absolute',
    top: 36,
    right: 42
  },
  instructionsLineOne: {
    marginTop: 24,
    marginBottom: 12
  },
  instructionsLineTwo: {
    marginBottom: 32
  },
  backButtonContainer: {
    height: 56,
    width: '92%',
    marginLeft: 0
  },
  addToTransactionButton: {
    width: '100%',
    height: 62,
    marginBottom: 0
  },
  customDecoratorLine: {
    width: 461,
    marginTop: 13,
    marginBottom: 10
  },
  tradeInsFlatListContainer: {
    minHeight: 120,
    maxHeight: 345,
    marginBottom: 24
  },
  textInputErrorMessage: {
    width: '100%',
    marginTop: 11,
    color: '#B80818'
  }
})

export default TradeIns
