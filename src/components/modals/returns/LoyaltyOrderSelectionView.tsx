import { View, StyleSheet } from 'react-native'
import Text from '../../StyledText'
import { useEffect, useState } from 'react'
import ReturnsSelectionView from './ReturnsSelectionView'
import SubmitButton from '../../reusable/SubmitButton'
import { useDispatch } from 'react-redux'
import { addReturnItems, ReturnOriginationEnumType } from '../../../actions/returnActions'
import BackButton from '../../BackButton'
import { convertISODateToMonthDayYear } from '../../../utils/formatters'
import OrderList from './OrderList'
import { ReturnOrderType } from '../../../reducers/returnData'
import { UiDataTypes } from '../../../reducers/uiData'

interface LoyaltyOrderSelectionViewProps {
  orders: Array<ReturnOrderType>
  uiData: UiDataTypes
  returnOriginationType: ReturnOriginationEnumType
  orderLookupIdentifier?: string
  handleBackButton: () => void
}

const LoyaltyOrderSelectionView = ({ orders, uiData, returnOriginationType, orderLookupIdentifier, handleBackButton }: LoyaltyOrderSelectionViewProps): JSX.Element => {
  const dispatch = useDispatch()
  const [itemNumsReturnChecked, setItemNumsReturnChecked] = useState({})
  const [itemNumsDamagedChecked, setItemNumsDamagedChecked] = useState({})
  const [orderSelected, setOrderSelected] = useState(null)
  const [returnableItems, setReturnableItems] = useState([])
  const [nonReturnableItems, setNonReturnableItems] = useState([])

  useEffect(() => {
    if (orderSelected) {
      const returnableItemsToSet = []
      const nonReturnableItemsToSet = []
      orderSelected?.orderUnits?.forEach(unit => {
        if (unit.returnEligibility.includes('ELIGIBLE')) {
          returnableItemsToSet.push(unit)
        } else {
          nonReturnableItemsToSet.push(unit)
        }
      })
      setReturnableItems(returnableItemsToSet)
      setNonReturnableItems(nonReturnableItemsToSet)
    }
  }, [orderSelected])
  const handleAddReturnItems = () => {
    const returnReq = {
      returnItems: [],
      orderLookupIdentifier: orderLookupIdentifier
    }
    returnableItems.forEach(item => {
      if (itemNumsReturnChecked[item.transactionItemIdentifier]) {
        const clone = { ...item }
        clone.customerOrderNumber = orderSelected.customerOrderNumber
        clone.returnItem = true
        if (itemNumsDamagedChecked[item.transactionItemIdentifier]) {
          clone.damaged = true
        } else {
          clone.damaged = false
        }
        returnReq.returnItems.push(clone)
      }
    })

    dispatch(addReturnItems(returnReq, returnOriginationType))
  }

  return (
    <View>
      {orderSelected
        ? (
          <>
            <View style={styles.separatorLine} />
            <View style={styles.headerContainer}>
              {uiData.loadingStates.addReturnItems
                ? (<View style={styles.backButtonSpacer}/>)
                : (
                  <BackButton
                    back={() => {
                      setOrderSelected(null)
                      setItemNumsReturnChecked({})
                      setItemNumsDamagedChecked({})
                    }}
                    style={styles.backButtonCustom}
                    size='small'
                    customFontSize={16}
                  />
                )
              }
              <View style={styles.orderDetailsContainer}
                testID='return-order-details'>
                <Text style={[styles.textAlignRight, styles.orderDetailsHeader]}>
                  {convertISODateToMonthDayYear(orderSelected.originalSaleInfo.transactionDate)} - ${orderSelected.calculatedTotal.toFixed(2)}
                </Text>
                <Text style={styles.textAlignRight}>
                  Order #: {orderSelected.customerOrderNumber}
                </Text>
                <Text style={styles.textAlignRight}>
                  {orderSelected.originalSaleInfo.storeName}
                </Text>
              </View>
            </View>
            <ReturnsSelectionView
              uiData={uiData}
              itemNumsReturnChecked={itemNumsReturnChecked}
              setItemNumsReturnChecked={setItemNumsReturnChecked}
              itemNumsDamagedChecked={itemNumsDamagedChecked}
              setItemNumsDamagedChecked={setItemNumsDamagedChecked}
              returnableItems={returnableItems}
              nonReturnableItems={nonReturnableItems}
            />
            <View style={styles.nextButtonContainer}>
              <SubmitButton
                testID='submit-button-loyalty-returns-lookup'
                onSubmit={() => {
                  handleAddReturnItems()
                }}
                buttonLabel='NEXT'
                loading={uiData.loadingStates.addReturnItems}
                customStyles={{ marginVertical: 24 }}
              />
            </View>
          </>
        )
        : <OrderList
          orders={orders}
          selectOrder={setOrderSelected}
          handleBackButton={handleBackButton}
          uiData={uiData} />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  separatorLine: {
    backgroundColor: '#797979',
    height: 1,
    width: 464,
    marginLeft: 34,
    marginVertical: 0
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    marginTop: 16
  },
  backButtonSpacer: {
    position: 'relative',
    marginLeft: 22,
    marginTop: -10,
    height: 42,
    width: 42
  },
  backButtonCustom: {
    position: 'relative',
    marginLeft: 22,
    marginTop: -10
  },
  orderDetailsContainer: {
    marginRight: 26
  },
  textAlignRight: {
    textAlign: 'right'
  },
  orderDetailsHeader: {
    fontWeight: '700',
    fontSize: 20
  },
  nextButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default LoyaltyOrderSelectionView
