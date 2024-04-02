import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../../StyledText'
import BackButton from '../../BackButton'
import HorizontalSortArrowsSvg from '../../svg/HorizontalSortArrowsSvg'
import AthleteOrderDetailsRow from './AthleteOrderDetailsRow'
import { useEffect, useState } from 'react'
import { ReturnOrderType } from '../../../reducers/returnData'
import { UiDataTypes } from '../../../reducers/uiData'
import ReturnItemUpcScanBox from './ReturnItemUpcScanBox'

interface OrderListProps {
  orders: Array<ReturnOrderType>
  selectOrder: (ReturnOrderType) => void
  handleBackButton: () => void
  uiData: UiDataTypes
}

const OrderList = ({ orders, selectOrder, handleBackButton, uiData }: OrderListProps): JSX.Element => {
  const [orderSortedOldestToNewest, setOrderSortedOldestToNewest] = useState(true)
  const [upcFiltersList, setUpcFiltersList] = useState([])
  const [ordersToShow, setOrdersToShow] = useState([])
  const [resultCountToShow, setResultCountToShow] = useState(0)

  const handleSubmitUpc = (upc) => {
    const clone = upcFiltersList.slice()
    clone.push(upc)
    setUpcFiltersList(clone)
  }

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setOrdersToShow([])
      setResultCountToShow(0)
      return
    }
    const filteredOrders = getFilteredOrders(orders, upcFiltersList)
    sortOrders(filteredOrders, orderSortedOldestToNewest)
    setOrdersToShow(filteredOrders)
    setResultCountToShow(filteredOrders.length)
  }, [orders, orderSortedOldestToNewest, upcFiltersList])

  return (
    <View style={styles.orderListContainer}>
      <View style={styles.orderListHeader}>
        <BackButton
          back={() => { handleBackButton() }}
          style={styles.customBackButton}
          size='small'
          customFontSize={16}
        />
        <TouchableOpacity
          testID='order-sort-button'
          style={{ flexDirection: 'row' }}
          onPress={() => {
            setOrderSortedOldestToNewest(!orderSortedOldestToNewest)
          }}
        >
          <HorizontalSortArrowsSvg />
          <Text style={styles.sortingText}>
            {orderSortedOldestToNewest ? 'Oldest to Newest' : 'Newest to Oldest'}
          </Text>
        </TouchableOpacity>
      </View>
      <ReturnItemUpcScanBox
        uiData={uiData}
        submitUpc={handleSubmitUpc}
      />
      <View style={styles.filterChipsContainer}>
        {upcFiltersList.map((upc, index) => (
          <View
            testID={'upc-chip' + index}
            style={styles.filterChip}
            key={'upc-filter-chip' + index}
          >
            <Text style={{ fontWeight: '700', marginHorizontal: 8 }}>
              {upc}
            </Text>
            <TouchableOpacity
              testID={'upc-chip-close-button' + index}
              style={{ marginRight: 12 }}
              onPress={() => {
                const clone = upcFiltersList.slice()
                for (let i = 0; i < clone.length; i++) {
                  if (clone.includes(upc)) {
                    clone.splice(index, 1)
                  }
                }
                setUpcFiltersList(clone)
              }}
            >
              <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M11.8334 1.34163L10.6584 0.166626L6.00002 4.82496L1.34169 0.166626L0.166687 1.34163L4.82502 5.99996L0.166687 10.6583L1.34169 11.8333L6.00002 7.17496L10.6584 11.8333L11.8334 10.6583L7.17502 5.99996L11.8334 1.34163Z' fill='#191F1C' />
              </svg>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Text style={{ marginVertical: 12 }}>
        Showing {resultCountToShow} result{(resultCountToShow > 1 || resultCountToShow === 0) ? 's' : ''}
      </Text>
      <FlatList
        data={ordersToShow}
        scrollEnabled={true}
        style={{ height: 400 }}
        extraData={orders}
        keyExtractor={(order, index) => 'loyalty-account-orders-' + index}
        renderItem={({ item, index }) => {
          return (
            <AthleteOrderDetailsRow
              setOrderSelected={selectOrder}
              index={index}
              order={item}
            />
          )
        }}
      />
    </View>
  )
}

const getFilteredOrders = (orders: ReturnOrderType[], upcs: string[]) => {
  let filteredOrders = []
  if (upcs.length > 0) {
    orders.forEach(order => {
      for (let i = 0; i < order.orderUnits.length; i++) {
        if (upcs.includes(order.orderUnits[i].upc)) {
          filteredOrders.push(order)
          break
        }
      }
    })
  } else {
    filteredOrders = orders.slice()
  }
  return filteredOrders
}

const sortOrders = (orders: ReturnOrderType[], oldestToNewest: boolean) => {
  if (oldestToNewest) {
    orders.sort((a, b) => {
      return (new Date(a.originalSaleInfo.transactionDate)).getTime() - (new Date(b.originalSaleInfo.transactionDate)).getTime()
    })
  } else {
    orders.sort((a, b) => {
      return (new Date(b.originalSaleInfo.transactionDate)).getTime() - (new Date(a.originalSaleInfo.transactionDate)).getTime()
    })
  }
}

const styles = StyleSheet.create({
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
  },
  orderListContainer: {
    marginLeft: 34,
    marginRight: 34
  },
  orderListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  customBackButton: {
    position: 'relative',
    marginTop: 0,
    marginLeft: -14
  },
  sortingText: {
    marginLeft: 8.5,
    fontWeight: '700',
    color: '#006554'
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 475
  },
  filterChip: {
    padding: '0 8px 0 8px',
    margin: '0 4px 4px 4px',
    backgroundColor: '#C8C8C8',
    borderRadius: 44,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: 'max-content',
    marginTop: 12,
    marginRight: 12
  }
})

export default OrderList
