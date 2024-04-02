import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { useDispatch } from 'react-redux'
import { omniSearch } from '../actions/transactionActions'
import { receiveUiData } from '../actions/uiActions'
import { CategoryProductType } from '../reducers/productLookupData'
import { clearProductLookupData } from '../actions/productLookupActions'
import { sendAppInsightsEvent } from '../utils/appInsights'

interface StoreServicesCategoryProductProps {
  product: CategoryProductType
  index: number
}

const StoreServicesCategoryProduct = ({ product, index }: StoreServicesCategoryProductProps) => {
  const { transactionData, associateId, uiData } = useSelector(state => ({
    transactionData: state.transactionData,
    associateId: state.associateData.associateId,
    uiData: state.uiData
  }))

  const dispatch = useDispatch()

  const isActiveTransaction = transactionData?.header?.transactionStatus === 1

  const disableAddButton = (uiData.activePanel !== 'initialScanPanel' && uiData.activePanel !== 'scanDetailsPanel' && uiData.activePanel !== 'loginPanel')

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productUpc}>{product.upc}</Text>
      </View>
      <TouchableOpacity
        testID={`service-add-button-${index}`}
        style={[styles.addButton, !disableAddButton && { backgroundColor: '#C57135' }]}
        onPress={() => {
          console.info('ACTION: components > StoreServiceCategoryProduct > onPress addButton', { isActiveTransaction })
          dispatch(omniSearch(
            product.upc,
            associateId,
            'productLookup'
          ))
          dispatch(receiveUiData({
            autofocusTextbox: 'OmniSearch',
            footerOverlayActive: 'None'
          }))
          sendAppInsightsEvent('StoreServiceAddToTransaction', {
            upc: product?.upc
          })
          dispatch(clearProductLookupData())
        }}
        disabled={disableAddButton}>
        <Text style={styles.buttonText}>add</Text>
      </TouchableOpacity>
    </View>
  )
}
export default StoreServicesCategoryProduct

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    marginHorizontal: 12,
    width: '100%',
    fontFamily: 'Archivo',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productName: {
    textTransform: 'uppercase',
    fontSize: 18
  },
  productUpc: {
    fontSize: 18,
    color: '#666'
  },
  addButton: {
    backgroundColor: '#C8C8C8',
    paddingHorizontal: 26,
    paddingVertical: 10,
    justifyContent: 'center',
    borderRadius: 2
  },
  buttonText: {
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'white'
  }
})
