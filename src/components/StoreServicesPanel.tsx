import { ActivityIndicator, StyleSheet, View } from 'react-native'
import Text from './StyledText'
import { useDispatch } from 'react-redux'
import { checkForLoading, receiveUiData } from '../actions/uiActions'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import CloseButton from './reusable/CloseButton'
import StoreServicesCategory from './StoreServicesCategory'
import ProductLookupErrorBox from './ProductLookupErrorBox'
import { clearProductLookupData, fetchProductLookupCategories } from '../actions/productLookupActions'

const StoreServicesPanel = () => {
  const { uiData, productLookupData } = useSelector(state => ({
    uiData: state.uiData,
    productLookupData: state.productLookupData
  }))

  const dispatch = useDispatch()

  const loadingActive = checkForLoading(uiData.loadingStates)

  return (
    <View testID={'store-services-panel'} style={styles.container}>
      <View style={{ paddingLeft: 25, minHeight: 576, display: 'flex', flexGrow: 1, maxHeight: '100%' }}>
        <View style={styles.heading}>
          <Text style={styles.headingText}>
            Store Service UPC
          </Text>
          <CloseButton
            testID='store-services-close-button'
            dismisser={() => {
              dispatch(receiveUiData({
                autofocusTextbox: 'OmniSearch',
                footerOverlayActive: 'None'
              }))
              dispatch(clearProductLookupData())
            }}
            dismissable={!loadingActive}
            marginTop={0}
            marginRight={0}
          />
        </View>
        <View style={styles.panelContent}>
          {
            uiData.loadingStates.fetchProductLookupCategories
              ? <ActivityIndicator color={'#000'} style={styles.activityIndicator} />
              : productLookupData.categoriesError
                ? <ProductLookupErrorBox
                  errorMessage={productLookupData.categoriesErrorMessage}
                  onRetry={() => {
                    dispatch(fetchProductLookupCategories())
                  }}
                />
                : productLookupData.categories.map((item, index) => {
                  return (
                    <StoreServicesCategory
                      key={index}
                      category={item}
                      catIndex={index}
                    />
                  )
                })
          }
        </View>
      </View>
    </View>
  )
}
export default StoreServicesPanel

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 56
  },
  container: {
    minWidth: 525,
    width: '38%',
    backgroundColor: '#EDEDED',
    position: 'absolute',
    left: 32,
    top: 32,
    bottom: 99,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  },
  categories: {
    marginRight: 25,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomColor: '#C8C8C8',
    borderBottomWidth: 1
  },
  heading: {
    borderBottomWidth: 1,
    borderColor: '#979797',
    paddingBottom: 14,
    paddingTop: 25,
    marginRight: 25,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headingText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center'
  },
  panelContent: {
    marginRight: 25,
    paddingHorizontal: 12,
    flex: 1
  }
})
