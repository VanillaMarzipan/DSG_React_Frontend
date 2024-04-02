import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import CloseButton from '../reusable/CloseButton'
import { receiveUiData } from '../../actions/uiActions'
import TextInput from '../TextInput'
import SubmitButton from '../reusable/SubmitButton'
import {
  addItemLevelSapUpc,
  getAssociateByIdForItemLevelSap,
  RECEIVE_ASSOCIATE_DATA,
  receiveAssociateData
} from '../../actions/associateActions'
import { omniSearch } from '../../actions/transactionActions'

const ItemLevelSap = () => {
  const dispatch = useDispatch()
  const [sellingAssociateNumber, setSellingAssociateNumber] = useState('')
  const [sellingAssociateUpc, setSellingAssociateUpc] = useState('')
  const {
    itemLevelSapUpcs,
    itemLevelSapAssociate,
    itemLevelSapStep,
    sapError,
    associateId
  } = useSelector(state => state.associateData)
  const { loadingStates, scanEvent } = useSelector(state => state.uiData)

  const handleEnterButton = (step) => {
    if (step === 1) {
      dispatch(getAssociateByIdForItemLevelSap(sellingAssociateNumber))
    }
    if (step !== 1) {
      dispatch(receiveAssociateData({ itemLevelSapStep: 2 }, RECEIVE_ASSOCIATE_DATA))
    }
    if (step > 1) {
      dispatch(addItemLevelSapUpc(itemLevelSapUpcs, sellingAssociateUpc))
      setSellingAssociateUpc('')
    }
    setTimeout(() => mainInputRef?.current?.focus(), 10)
  }

  const shouldDisableEnterButton = (step) => {
    if (loadingStates.getAssociateById) return true
    if (step === 1) {
      return sellingAssociateNumber?.length < 7
    } else {
      return sellingAssociateUpc?.length === 0
    }
  }

  const mainInputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => mainInputRef?.current?.focus(), 10)
  }, [])
  useEffect(() => {
    if (scanEvent) {
      if (itemLevelSapStep === 1) setSellingAssociateNumber(scanEvent.scanValue)
      else setSellingAssociateUpc(scanEvent.scanValue)
    }
  }, [scanEvent?.scanTime])

  const getSubheadingText = (step, error) => {
    if (error) return 'Sorry, something went wrong. Please try again.'
    if (step === 1) return 'Scan SAP barcode or insert associate number'
    return `Scan or input UPC for items that ${itemLevelSapAssociate?.associateId} ${itemLevelSapAssociate?.firstName} ${itemLevelSapAssociate?.lastName} sold`
  }

  const onSubmit = () => {
    itemLevelSapUpcs.forEach(upc => {
      dispatch(omniSearch(upc, associateId, 'manual', null, sellingAssociateNumber))
    })
  }

  const onClose = () => {
    dispatch(receiveUiData({ showItemLevelSap: false, footerOverlayActive: 'None', scanEvent: null }))
    dispatch(receiveAssociateData({
      itemLevelSapUpcs: [],
      itemLevelSapStep: 1,
      nsppSellingAssociate: null,
      sapError: null
    }, RECEIVE_ASSOCIATE_DATA))
  }

  return (
    <View style={styles.container}>
      <View style={styles.userWindow}>
        <View style={styles.headerWrapper}>
          <Text style={styles.heading}>
            {itemLevelSapStep === 1 ? 'ADD TEAMMATE TO SALE' : 'ADD ITEMS'}
          </Text>
          {loadingStates.getAssociateById
            ? <View style={{ width: 35.8, height: 39 }}/>
            : <CloseButton
              testID='close-item-level-sap'
              dismisser={() => onClose()}
            />}
        </View>
        <View style={styles.centeredContent}>
          <Text style={[styles.subHeading, sapError && { color: '#AB2635' }]}>
            {getSubheadingText(itemLevelSapStep, sapError)}
          </Text>
          <TextInput
            ref={mainInputRef}
            nativeID='item-level-sap-input'
            testID='item-level-sap-input'
            labelBackgroundColor='white'
            label={itemLevelSapStep === 1 ? 'Selling Associate Number' : 'Scan or input UPC'}
            style={styles.textInput}
            value={itemLevelSapStep === 1 ? sellingAssociateNumber : sellingAssociateUpc}
            onChangeText={text => {
              const reg = /^[0-9\b]+$/
              if (text.length >= 1 && !reg.test(text)) return
              itemLevelSapStep === 1 ? setSellingAssociateNumber(text) : setSellingAssociateUpc(text)
            }}
            mode='outlined'
            maxLength={itemLevelSapStep === 1 ? 7 : null}
            onSubmitEditing={() => {
              handleEnterButton(itemLevelSapStep)
            }}
          />
          <SubmitButton
            testID='item-sap-enter-button'
            disabled={shouldDisableEnterButton(itemLevelSapStep)}
            onSubmit={() => {
              handleEnterButton(itemLevelSapStep)
            }}
            loading={loadingStates.getAssociateById}
            buttonLabel={'ENTER'}
            customStyles={{ width: 331 }}
          />
        </View>
        {itemLevelSapUpcs?.length > 0
          ? (
            <View style={styles.footer}>
              <View style={styles.decoratorLine}/>
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{ width: '76%', alignItems: 'center' }}>
                  <Text testID='item-sap-item-count'>
                    <View style={styles.itemCount}>
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{itemLevelSapUpcs.length}</Text>
                    </View>
                    {` Item${itemLevelSapUpcs.length === 1 ? '' : 's'} Sold by ${itemLevelSapAssociate.firstName} ${itemLevelSapAssociate.lastName}`}
                  </Text>
                </View>
                <TouchableOpacity
                  testID={'item-sap-add-to-sale'}
                  style={styles.addToSale}
                  onPress={() => {
                    onSubmit()
                    onClose()
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>ADD TO SALE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
          : (
            <View style={{ height: 89 }}/>
          )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100vh',
    width: '100%',
    zIndex: 3,
    position: 'absolute',
    bottom: 98,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  centeredContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userWindow: {
    width: 636,
    zIndex: 4,
    backgroundColor: '#FFFFFF',
    position: 'absolute'
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'DSG-Sans-Bold',
    marginTop: 26,
    marginLeft: 26
  },
  subHeading: {
    marginTop: 24,
    marginBottom: 26
  },
  textInput: {
    marginBottom: 11,
    width: 331,
    height: 60
  },
  footer: {
    width: '100%',
    alignItems: 'center'
  },
  addToSale: {
    borderColor: '#191FC',
    borderWidth: 2,
    height: 44,
    width: 143,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12
  },
  itemCount: {
    height: 23,
    width: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#006554'
  },
  decoratorLine: {
    backgroundColor: '#C8C8C8',
    height: 1,
    width: '95%',
    marginBottom: 24
  },
  headerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default ItemLevelSap
