import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { selectVariant, setCurrentPage } from '../actions/productLookupActions'
import ChevronSvg from './svg/ChevronSvg'
import { CurrentPage } from '../reducers/productLookupData'
import ProductLookupAttributeAdjust from './ProductLookupAttributeAdjust'
import React, { useEffect, useState } from 'react'
import { sendRumRunnerEvent } from '../utils/rumrunner'

interface ProductLookupAdjustDetailsProps {
  _scrollRef: React.MutableRefObject<ScrollView>
}

const ProductLookupAdjustDetails = ({ _scrollRef }: ProductLookupAdjustDetailsProps) => {
  const { productLookupData } = useSelector(state => ({
    productLookupData: state.productLookupData
  }))

  const { savedVariant, productDetails } = productLookupData

  const [selectedVariant, setSelectedVariant] = useState(savedVariant)

  const dispatch = useDispatch()

  useEffect(() => {
    if (selectedVariant.invalidCombination) {
      _scrollRef.current?.scrollTo({
        y: 0,
        animated: true
      })
    }
  }, [selectedVariant])

  return (
    <>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => {
        dispatch(setCurrentPage(CurrentPage.Details))
      }}>
        <View style={styles.rotate}><ChevronSvg/></View>
        <Text style={{ fontSize: 16, fontFamily: 'Archivo-Bold', letterSpacing: 0.5 }}>BACK TO PRODUCT PAGE</Text>
      </TouchableOpacity>
      <View style={[styles.detailsBox, { marginBottom: (selectedVariant.invalidCombination) ? 0 : 16 }]}>
        <Text style={{ fontSize: 20, fontFamily: 'Archivo-Bold' }}>Adjust Item Details</Text>
        <TouchableOpacity
          onPress={() => {
            dispatch(selectVariant(selectedVariant))
            !selectedVariant.invalidCombination && dispatch(setCurrentPage(CurrentPage.Details))
          }}
          style={[styles.saveButtonTop, !selectedVariant.invalidCombination && { backgroundColor: '#C57135' }]}
          disabled={selectedVariant.invalidCombination}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      {selectedVariant.invalidCombination &&
        <View style={{ marginTop: 14, marginBottom: 14 }}>
          <Text style={styles.errorMessage}>
            Sorry, the system does not have a UPC for this combination of details. Please choose different options, or go back.
          </Text>
        </View>
      }
      <View>
        {
          productDetails.attributes.map((item) => {
            return (
              <ProductLookupAttributeAdjust attribute={item} key={item.name} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant}/>
            )
          })
        }
      </View>
      <TouchableOpacity
        testID='product-lookup-save-attributes'
        onPress={() => {
          sendRumRunnerEvent('Product Lookup Save Attributes', {
            upc: selectedVariant.upc
          })
          dispatch(selectVariant(selectedVariant))
          !selectedVariant.invalidCombination && dispatch(setCurrentPage(CurrentPage.Details))
        }}
        style={[styles.saveButtonBottom, !selectedVariant.invalidCombination && { backgroundColor: '#C57135' }]}
        disabled={selectedVariant.invalidCombination}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  backButtonContainer: {
    marginVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  rotate: {
    transform: [{ rotate: '180deg ' }]
  },
  detailsBox: {
    backgroundColor: 'white',
    width: '100%',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  saveButtonTop: {
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#C8C8C8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButtonBottom: {
    width: '100%',
    height: 62,
    backgroundColor: '#C8C8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 2
  },
  saveButtonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  errorMessage: {
    letterSpacing: 0.5,
    color: '#B10216',
    textAlign: 'center',
    fontSize: 15.5
  }
})

export default ProductLookupAdjustDetails
