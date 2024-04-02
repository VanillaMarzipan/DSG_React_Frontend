import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import Text from './StyledText'
import CloseButton from './reusable/CloseButton'
import { receiveUiData } from '../actions/uiActions'
import ProductLookupLanding from './ProductLookupLanding'
import TextInput from './TextInput'
import { useEffect, useRef, useState } from 'react'
import { clearProductLookupData, fetchProductLookupDetails, fetchProductLookupSearchResults } from '../actions/productLookupActions'
import { CurrentPage } from '../reducers/productLookupData'
import ProductLookupResults from './ProductLookupSearchResults'
import ProductLookupDetails from './ProductLookupDetails'
import ProductLookupAdjustDetails from './ProductLookupAdjustDetails'
import { omniSearch } from '../actions/transactionActions'
import PrintDetailsButton from './reusable/PrintDetailsButton'
import * as CefSharp from '../utils/cefSharp'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import SearchIconSvg from './svg/SearchIconSvg'
import { sendAppInsightsEvent } from '../utils/appInsights'

interface ProductLookupPanelProps {
  authenticated: boolean
}

const ProductLookupPanel = ({
  authenticated = false
}: ProductLookupPanelProps) => {
  const [productLookupInput, setProductLookupInput] = useState('')

  const { uiData, productLookupData, transactionData, associateId } = useSelector(state => ({
    uiData: state.uiData,
    productLookupData: state.productLookupData,
    transactionData: state.transactionData,
    associateId: state.associateData.associateId
  }))

  const handleInput = (value: string): void => {
    setProductLookupInput(value)
  }

  const doSearch = (origin: string) => {
    sendRumRunnerEvent('Product Lookup Search', {
      input: productLookupInput,
      authenticated,
      origin
    })
    sendAppInsightsEvent('ProductLookupSearch', {
      input: productLookupInput,
      origin
    })

    const upcRegex = /[0-9]{12,13}/

    const trimmedInput = productLookupInput.trim()

    if (upcRegex.test(trimmedInput)) {
      dispatch(fetchProductLookupDetails(trimmedInput))
    } else if (trimmedInput) {
      dispatch(fetchProductLookupSearchResults(trimmedInput))
    }
  }

  useEffect(() => {
    if (productLookupData.currentPage === CurrentPage.SearchResults) {
      setProductLookupInput(productLookupData.currentSearchTerm)
    }
  }, [productLookupData.currentPage])

  const dispatch = useDispatch()

  const loadingActive = uiData.loadingStates.fetchProductLookupDetails || uiData.loadingStates.fetchProductLookupSearchResults
  const isActiveTransaction = transactionData?.header?.transactionStatus === 1

  const disableTransactionButton = (uiData.activePanel !== 'initialScanPanel' && uiData.activePanel !== 'scanDetailsPanel' && uiData.activePanel !== 'loginPanel') || productLookupData.savedVariant?.onHandInventory <= 0
  const savedVariantInStock = productLookupData?.savedVariant?.onHandInventory > 0

  const _scrollRef = useRef()

  return (
    <View testID={'product-lookup-panel'} style={styles.container}>
      <View style={{ paddingLeft: 25, minHeight: 576, display: 'flex', flexGrow: 1, maxHeight: '100%' }}>
        <View style={styles.heading}>
          <Text style={styles.headingText}>
            Endzone Lookup
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {
              ((productLookupData.currentPage === CurrentPage.Details) && !productLookupData.detailsError && !loadingActive) &&
                <PrintDetailsButton
                  testID='print-details-button'
                  marginTop={0}
                  marginRight={32}
                  onPress={() => {
                    const price = typeof productLookupData.savedVariant.price === 'number'
                      ? productLookupData.savedVariant.price
                      : 0
                    CefSharp.printProductDetailChit(
                      productLookupData.productDetails.name,
                      JSON.stringify(productLookupData.savedVariant),
                      price
                    )
                    sendRumRunnerEvent('Product Lookup Print Details', {
                      upc: productLookupData.savedVariant.upc
                    })
                  }}
                />
            }
            <CloseButton
              testID='product-lookup-close-button'
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
        </View>
        {(productLookupData.currentPage === CurrentPage.SearchResults || productLookupData.currentPage === CurrentPage.Landing) &&
          <View style={styles.searchContainer}>
            <TextInput
              nativeID='item-lookup-input'
              testID='item-lookup-input'
              labelBackgroundColor={'#FFF'}
              label={'Keyword or Product Identifier'}
              style={styles.textInput}
              autoFocus={uiData.autofocusTextbox === 'ItemLookup'}
              error={uiData.returnsError !== false}
              mode='flat'
              onChangeText={(text) => handleInput(text ?? '')}
              onSubmitEditing={() => {
                doSearch('enter')
              }}
              disabled={loadingActive}
              clearable={true}
              value={productLookupInput}
              onClear={() => {
                dispatch(clearProductLookupData())
              }}
              iconButton={
                <TouchableOpacity style={{
                  height: '100%',
                  justifyContent: 'center',
                  paddingHorizontal: 8,
                  marginRight: -8
                }} onPress={() => {
                  doSearch('icon')
                }}>
                  <SearchIconSvg color={'#006554'}/>
                </TouchableOpacity>
              }
            />
          </View>}
        <ScrollView ref={_scrollRef} style={styles.panelContent} contentContainerStyle={{ minHeight: '100%' }}>
          {productLookupData.currentPage === CurrentPage.Landing &&
            <ProductLookupLanding/>
          }
          {productLookupData.currentPage === CurrentPage.SearchResults &&
            <ProductLookupResults
              loading={uiData.loadingStates.fetchProductLookupSearchResults}
              resultsPerPage={10}
            />
          }
          {productLookupData.currentPage === CurrentPage.Details &&
            <ProductLookupDetails
              loading={uiData.loadingStates.fetchProductLookupDetails}
            />
          }
          {productLookupData.currentPage === CurrentPage.AdjustDetails &&
            <ProductLookupAdjustDetails _scrollRef={_scrollRef}/>
          }
        </ScrollView>
      </View>
      {((productLookupData.currentPage === CurrentPage.Details) && !loadingActive && !productLookupData.detailsError && authenticated) &&
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            testID='product-lookup-transaction-button'
            style={[styles.transactionButton, !disableTransactionButton && { backgroundColor: '#C57135' }]}
            onPress={() => {
              console.info('ACTION: components > ProductLookupDetails > onPress buttonContainer', { isActiveTransaction })
              dispatch(omniSearch(
                productLookupData.savedVariant.upc[0],
                associateId,
                'productLookup'
              ))
              dispatch(clearProductLookupData())
              dispatch(receiveUiData({
                autofocusTextbox: 'OmniSearch',
                footerOverlayActive: 'None'
              }))
              sendRumRunnerEvent('Product Lookup Add to Transaction', {
                upc: productLookupData.savedVariant.upc[0],
                isActiveTransaction
              })
              sendAppInsightsEvent('ProductLookupAddToTransaction', {
                upc: productLookupData?.savedVariant?.upc[0],
                isActiveTransaction
              })
            }}
            disabled={disableTransactionButton}
          >
            <Text style={[styles.transactionButtonText, savedVariantInStock && { color: '#fff' }]}>
              {
                savedVariantInStock
                  ? isActiveTransaction
                    ? 'Add To Transaction'
                    : 'Start Transaction'
                  : 'Out of Stock'
              }
            </Text>
          </TouchableOpacity>
        </View>
      }
    </View>
  )
}
export default ProductLookupPanel

const styles = StyleSheet.create({
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
  heading: {
    borderBottomWidth: 1,
    borderColor: '#979797',
    paddingBottom: 14,
    paddingTop: 25,
    marginRight: 25,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headingText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center'
  },
  searchContainer: {
    marginRight: 25,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomColor: '#C8C8C8',
    borderBottomWidth: 1
  },
  textInput: {
    width: '100%',
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    borderColor: '#A0A0A0',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  panelContent: {
    marginRight: 25,
    paddingHorizontal: 12,
    flex: 1
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  transactionButton: {
    width: '100%',
    height: 62,
    backgroundColor: '#C8C8C8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  transactionButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#4f4f4f',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }
})
