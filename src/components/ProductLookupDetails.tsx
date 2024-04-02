import { useTypedSelector as useSelector } from '../reducers/reducer'
import Text from './StyledText'
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native'
import ChevronSvg from './svg/ChevronSvg'
import { useDispatch } from 'react-redux'
import { fetchProductLookupDetails, setCurrentPage, updateProductLookupData, UPDATE_PRODUCT_LOOKUP_DATA } from '../actions/productLookupActions'
import { CurrentPage } from '../reducers/productLookupData'
import { Clipboard } from 'react-native-web'
import ProductLookupAttributeDisplay from './ProductLookupAttributeDisplay'
import { useState } from 'react'
import ProductLookupErrorBox from './ProductLookupErrorBox'
import ExMarkSvg from './svg/ExMarkSvg'
import CheckMarkSvg from './svg/CheckMarkSvg'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import NikeConnectedProductTag from './reusable/NikeConnectedProductTag'

interface ProductLookupDetailsProps {
  loading: boolean
}

const ProductLookupDetails = ({
  loading = false
}: ProductLookupDetailsProps) => {
  const { productLookupData } = useSelector(state => ({
    productLookupData: state.productLookupData
  }))

  const { savedVariant, productDetails } = productLookupData

  const [showUpcCopiedBanner, setShowUpcCopiedBanner] = useState(false)

  const dispatch = useDispatch()
  return (
    loading
      ? <ActivityIndicator color={'#000'} style={styles.activityIndicator} />
      : <>
        <TouchableOpacity testID='product-lookup-back-to-search' style={styles.backButtonContainer} onPress={() => {
          if (productLookupData.currentSearchTerm) {
            dispatch(setCurrentPage(CurrentPage.SearchResults))
          } else {
            dispatch(setCurrentPage(CurrentPage.Landing))
          }
        }}>
          <View style={styles.rotate}><ChevronSvg/></View>
          <Text style={{ fontSize: 16, fontFamily: 'Archivo-Bold', letterSpacing: 0.5 }}>{productLookupData.currentSearchTerm ? 'BACK TO SEARCH' : 'BACK'}</Text>
        </TouchableOpacity>
        {
          productLookupData.detailsError
            ? <ProductLookupErrorBox errorMessage={productLookupData.detailsErrorMessage} onRetry={() => {
              dispatch(fetchProductLookupDetails(productLookupData.retryUpc))
            }} />
            : <>
              <View style={styles.detailsBox}>
                <View style={styles.detailsHeading}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'Archivo-Bold' }}>{productDetails.name || savedVariant.styleDescription}</Text>
                    <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 4 }}>
                      <Text style={{ color: '#797979', marginRight: 12, letterSpacing: 0.5 }}>UPC: {savedVariant.upc}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          sendRumRunnerEvent('Product Lookup UPC Copy', {
                            upc: savedVariant.upc
                          })
                          Clipboard.setString(savedVariant.upc)
                          setShowUpcCopiedBanner(true)
                          setTimeout(() => {
                            setShowUpcCopiedBanner(false)
                          }, 3000)
                        }}
                      >
                        <Text style={styles.link}>
                          Copy
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {savedVariant.productAttributes?.isNikeExclusive === 'true' && <NikeConnectedProductTag popupPosition='bottom' />}
                  </View>
                  <Image
                    source={{ uri: savedVariant.imageUrl }}
                    style={{ width: 100, height: 100, marginLeft: 100 }}
                    resizeMode='contain'
                  />
                </View>
                <View style={[styles.upcCopiedBannerContainer, showUpcCopiedBanner && { display: 'flex' }]}>
                  <View style={styles.upcCopiedBanner}>
                    <Text style={{ color: 'white' }}>UPC Copied</Text>
                  </View>
                </View>
                <View style={styles.detailsInventory}>
                  <View style={styles.detailsInventoryItem}>
                    <Text style={styles.inventoryHeading}>Current Price</Text>
                    {
                      typeof savedVariant.price === 'undefined'
                        ? <ActivityIndicator color={'#000'}/>
                        : <>
                          {
                            typeof savedVariant.price === 'string'
                              ? <Text style={styles.errorText}>{ savedVariant.price }</Text>
                              : savedVariant.price <= 0.02
                                ? <Text style={[styles.inventoryText, { color: '#B80818' }]}>
                                  Prompt for Price
                                </Text>
                                : <Text style={[styles.inventoryText, { color: '#027256' }]}>
                                  ${savedVariant.price.toFixed(2)}
                                </Text>
                          }
                        </>
                    }
                  </View>
                  <View style={[styles.detailsInventoryItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#D8D8D8' }]}>
                    <Text style={styles.inventoryHeading}>In Store</Text>
                    {
                      savedVariant.onHandInventory === 0
                        ? <View style={styles.inventoryValue}>
                          <ExMarkSvg width={20} height={20} color='#DA1600'/>
                          <Text style={[styles.inventoryText, { color: '#666', marginLeft: 8 }]}>{ savedVariant.onHandInventory }</Text>
                        </View>
                        : <View style={styles.inventoryValue}>
                          <CheckMarkSvg width={24} height={24} size='small'/>
                          <Text style={ [styles.inventoryText, { color: '#027256', marginLeft: 8 }] }>
                            { savedVariant.onHandInventory }
                          </Text>
                        </View>
                    }
                  </View>
                  <View style={styles.detailsInventoryItem}>
                    <Text style={styles.inventoryHeading}>Online</Text>
                    {
                      savedVariant.onlineInventory === 0
                        ? <View style={styles.inventoryValue}>
                          <ExMarkSvg width={20} height={20} color='#DA1600'/>
                          <Text style={[styles.inventoryText, { color: '#666', marginLeft: 8 }]}>No Stock</Text>
                        </View>
                        : <View style={styles.inventoryValue}>
                          <CheckMarkSvg width={24} height={24} size='small'/>
                          <Text style={[styles.inventoryText, { color: '#027256', marginLeft: 8 }] }>
                            In Stock
                          </Text>
                        </View>
                    }
                  </View>
                </View>
              </View>
              { productDetails.attributes.length > 0 &&
                <View style={[styles.detailsBox, { paddingBottom: 0 }]}>
                  <View style={[styles.detailsHeading, { alignItems: 'center', justifyContent: 'flex-start' }]}>
                    <Text style={{ fontSize: 18, fontFamily: 'Archivo-Bold', marginRight: 16 }}>Item Details</Text>
                    <TouchableOpacity onPress={() => {
                      dispatch(setCurrentPage(CurrentPage.AdjustDetails))
                      dispatch(updateProductLookupData({ focusedAttribute: null }, UPDATE_PRODUCT_LOOKUP_DATA))
                    }}>
                      <Text style={styles.link}>
                        Adjust
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal={true} style={{ marginTop: 20, marginHorizontal: -16, paddingBottom: 16 }} contentContainerStyle={{ width: '100%' }}>
                    {
                      productDetails.attributes.map((item, index) => {
                        return (
                          <ProductLookupAttributeDisplay attribute={item} key={item.name} index={index} />
                        )
                      })
                    }
                  </ScrollView>
                </View>
              }
            </>
        }
      </>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 56
  },
  backButtonContainer: {
    marginVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  rotate: {
    transform: [{ rotate: '180deg ' }]
  },
  link: {
    color: '#006554',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid'
  },
  detailsBox: {
    backgroundColor: 'white',
    minWidth: 464,
    marginBottom: 16,
    padding: 16
  },
  detailsHeading: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1
  },
  detailsInventory: {
    display: 'flex',
    alignItems: 'stretch',
    paddingVertical: 16,
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -16
  },
  detailsInventoryItem: {
    alignItems: 'center',
    flexGrow: 1,
    maxWidth: '33%',
    textAlign: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8
  },
  inventoryHeading: {
    fontSize: 18,
    fontFamily: 'Archivo-Bold',
    marginBottom: 10
  },
  inventoryText: {
    fontSize: 24,
    fontFamily: 'Archivo-Bold'
  },
  inventoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1
  },
  upcCopiedBannerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'none',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none'
  },
  upcCopiedBanner: {
    padding: 16,
    backgroundColor: '#666',
    borderRadius: 24
  },
  errorText: {
    fontSize: 18,
    color: '#B10216',
    letterSpacing: 0.5
  }
})

export default ProductLookupDetails
