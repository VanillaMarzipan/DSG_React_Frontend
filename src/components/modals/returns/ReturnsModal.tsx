import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import ReturnsLookupView from './ReturnsLookupView'
import ReturnsSelectionView from './ReturnsSelectionView'
import Text from '../../StyledText'
import ModalBase from '../Modal'
import { useTypedSelector as useSelector, useTypedSelector } from '../../../reducers/reducer'
import { addNonReceiptedReturnItems, clearReturnData, addReturnItems, getReturns, receiveReturnData } from '../../../actions/returnActions'
import { receiveUiData, checkForLoading } from '../../../actions/uiActions'
import NonReceiptedReturn from './NonReceiptedReturn'
import { sendAppInsightsEvent } from '../../../utils/appInsights'
import LoyaltyOrderSelectionView from './LoyaltyOrderSelectionView'
import LoyaltyAccountsScrollableList from './LoyaltyAccountsScrollableList'
import TradeIns from './TradeIns'
import OrderLookupByCreditCard from './OrderLookupByCreditCard'

interface ReturnsModalProps {
  uiData
  transactionData
  returnData
}

export type AlternateReturnsViewType =
  | 'itemSelection'
  | 'lookupOrderByLoyalty'
  | 'nonReceiptedReturns'
  | 'tradeIns'
  | 'lookupOrderByCreditCard'

const ReturnsModal = ({ uiData, returnData }: ReturnsModalProps): JSX.Element => {
  const dispatch = useDispatch()
  const [returnsCode, setReturnsCode] = useState('')

  const [itemNumsReturnChecked, setItemNumsReturnChecked] = useState({})
  const [itemNumsDamagedChecked, setItemNumsDamagedChecked] = useState({})
  const [alternateReturnsView, setAlternateReturnsView] = useState<AlternateReturnsViewType>(null)

  const {
    returnableItems,
    nonReturnableItems,
    lookedUpOrders: returnsLoyaltyOrders,
    nonReceiptedReturnItems,
    nonReceiptedReturnActive
  } = useSelector(state => state.returnData)

  const { returnsLoyaltyAccountsFound, returnsLoyaltyAccountsFoundError } = useTypedSelector(state => state.returnData)
  const selectedReturnsLoyaltyAccount = useSelector(state => state.returnData.selectedReturnsLoyaltyAccount)
  const handleAddReturnItems = () => {
    const returnReq = {
      returnItems: []
    }
    returnableItems.forEach(item => {
      if (itemNumsReturnChecked[item.transactionItemIdentifier]) {
        const clone = { ...item }
        if (itemNumsDamagedChecked[item.transactionItemIdentifier]) {
          clone.damaged = true
        } else {
          clone.damaged = false
        }
        returnReq.returnItems.push(clone)
      }
    })
    dispatch(addReturnItems(returnReq, returnData.returnOriginationType))
  }

  const handleListBackButton = () => {
    dispatch(receiveReturnData({
      lookedUpOrders: null,
      selectedReturnsLoyaltyAccount: null
    }))
    dispatch(receiveUiData({ scanEvent: null }))
  }

  useEffect(() => {
    if (
      (returnableItems && returnableItems.length > 0) ||
      (nonReturnableItems && nonReturnableItems.length > 0)
    ) {
      setAlternateReturnsView('itemSelection')
    } else if (!returnableItems || returnableItems.length === 0) {
      setReturnsCode('')
      setAlternateReturnsView(null)
    }
  }, [returnableItems, nonReturnableItems])

  let disableSubmitButton = false
  if (alternateReturnsView === null && !nonReceiptedReturnActive && returnsCode.length < 11) {
    disableSubmitButton = true
  }

  const alternateReturnsViewIsItemSelection = alternateReturnsView === 'itemSelection'

  let mainView = (
    <ReturnsLookupView
      returnsCode={returnsCode}
      setReturnsCode={setReturnsCode}
      uiData={uiData}
      returnsLoyaltyAccountsFoundError={returnsLoyaltyAccountsFoundError}
      setAlternateReturnsView={setAlternateReturnsView}
    />
  )
  if (alternateReturnsView === 'lookupOrderByLoyalty') {
    if (returnsLoyaltyOrders?.length > 0) {
      mainView = (
        <LoyaltyOrderSelectionView
          orders={returnData.lookedUpOrders}
          uiData={uiData}
          returnOriginationType={3}
          handleBackButton={handleListBackButton}
        />
      )
    } else if (returnsLoyaltyAccountsFound?.length > 1) {
      mainView = (
        <LoyaltyAccountsScrollableList
          loyaltyAccountsFound={returnsLoyaltyAccountsFound}
          phoneInput={returnsCode}
          loadingStates={uiData.loadingStates}
        />
      )
    }
  } else if (alternateReturnsViewIsItemSelection) {
    disableSubmitButton = !Object.values(itemNumsReturnChecked).includes(true)
    mainView = (
      <ReturnsSelectionView
        uiData={uiData}
        // transactionData={transactionData}
        itemNumsReturnChecked={itemNumsReturnChecked}
        setItemNumsReturnChecked={setItemNumsReturnChecked}
        itemNumsDamagedChecked={itemNumsDamagedChecked}
        setItemNumsDamagedChecked={setItemNumsDamagedChecked}
        returnableItems={returnableItems}
        nonReturnableItems={nonReturnableItems}
      />
    )
  } else if (nonReceiptedReturnActive) {
    if (nonReceiptedReturnItems.length > 0 && Object.values(itemNumsReturnChecked).includes(true)) disableSubmitButton = false
    else disableSubmitButton = true
    mainView = (
      <NonReceiptedReturn
        nonReceiptedReturnItems={nonReceiptedReturnItems}
        itemNumsReturnChecked={itemNumsReturnChecked}
        setItemNumsReturnChecked={setItemNumsReturnChecked}
        itemNumsDamagedChecked={itemNumsDamagedChecked}
        setItemNumsDamagedChecked={setItemNumsDamagedChecked}
      />
    )
  } else if (alternateReturnsView === 'tradeIns') {
    mainView = (
      <TradeIns
        handleBackButton={() => setAlternateReturnsView(null)}
        uiData={uiData}
      />
    )
  } else if (alternateReturnsView === 'lookupOrderByCreditCard') {
    mainView = (
      <OrderLookupByCreditCard uiData={uiData} handleBackButton={() => { setAlternateReturnsView(null) } }/>
    )
  }

  const loadingActive = checkForLoading(uiData.loadingStates)

  let modalHeading = alternateReturnsView === 'tradeIns' ? 'Trade-Ins' : 'Return Items'
  if (nonReceiptedReturnActive) modalHeading = 'Return Items - No Receipt'
  else if (returnsLoyaltyOrders?.length > 0) {
    modalHeading = `Return Items${selectedReturnsLoyaltyAccount ? (' - ' + selectedReturnsLoyaltyAccount.firstName + ' ' + selectedReturnsLoyaltyAccount.lastName) : ''}`
  }

  return (
    <ModalBase
      modalName='returns'
      modalHeading={modalHeading}
      headingSize={20}
      modalWidth={525}
      dismissable={
        !loadingActive
      }
      backgroundColor='#EDEDED'
      onDismiss={() => {
        setItemNumsReturnChecked({})
        setItemNumsDamagedChecked({})
        dispatch(clearReturnData())
        dispatch(receiveUiData({ returnsError: false, scanEvent: null, autofocusTextbox: 'OmniSearch' }))
        setAlternateReturnsView(null)
      }}
      backdropDismissable={false}
    >
      {mainView}
      {
        ((nonReceiptedReturnActive && nonReceiptedReturnItems.length > 0) || (!nonReceiptedReturnActive && alternateReturnsViewIsItemSelection)) &&
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              testID={'confirm-returns'}
              disabled={disableSubmitButton || loadingActive}
              style={[styles.submitButton, (disableSubmitButton || loadingActive) && { backgroundColor: '#C8C8C8' }]}
              onPress={() => {
                if (nonReceiptedReturnActive) {
                  dispatch(addNonReceiptedReturnItems(nonReceiptedReturnItems, itemNumsReturnChecked, itemNumsDamagedChecked))
                  sendAppInsightsEvent('StartReturn', {
                    isNonReceipted: true,
                    nonReceiptedReturnItems,
                    itemNumsReturnChecked,
                    itemNumsDamagedChecked
                  })
                } else {
                  sendAppInsightsEvent('StartReturn', {
                    isNonReceipted: false,
                    returnsCode
                  })
                  if (alternateReturnsViewIsItemSelection) handleAddReturnItems()
                  else dispatch(getReturns(returnsCode))
                }
              }}
            >
              <Text style={[styles.submitButtonText, (disableSubmitButton || loadingActive) && { color: '#797979' }]}>
                {(
                  uiData.loadingStates.getReturns ||
                  uiData.loadingStates.addReturnItems ||
                  uiData.loadingStates.addNonReceiptedReturnItems ||
                  uiData.loadingStates.fetchLowestReturnPrice)
                  ? <ActivityIndicator color={'#FFFFFF'} />
                  : (
                    alternateReturnsViewIsItemSelection && Object.keys(itemNumsReturnChecked).length === 0 ? 'SELECT ITEMS FOR RETURN' : 'NEXT'
                  )}
              </Text>
            </TouchableOpacity>
          </View>
      }
    </ModalBase>
  )
}

export default ReturnsModal

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
    width: '100%'
  },
  submitButton: {
    width: '100%',
    height: 62,
    backgroundColor: '#C57135',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },
  submitButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }
})
