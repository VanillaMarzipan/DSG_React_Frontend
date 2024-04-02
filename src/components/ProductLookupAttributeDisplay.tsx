import { useDispatch } from 'react-redux'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { AttributeType, CurrentPage } from '../reducers/productLookupData'
import { setCurrentPage, updateProductLookupData, UPDATE_PRODUCT_LOOKUP_DATA } from '../actions/productLookupActions'

interface ProductLookupAttributeDisplayProps {
  attribute: AttributeType
  index: number
}

const ProductLookupAttributeDisplay = ({
  attribute = null,
  index = 0
}: ProductLookupAttributeDisplayProps) => {
  const { productLookupData } = useSelector(state => ({
    productLookupData: state.productLookupData
  }))

  const { savedVariant } = productLookupData

  const dispatch = useDispatch()

  // Options text
  let optionsText = `${attribute.specificVariants.length} Option${attribute.specificVariants.length !== 1 ? 's' : ''}`
  const firstValue = attribute.specificVariants[0]
  const lastValue = attribute.specificVariants[attribute.specificVariants.length - 1]
  if (firstValue.sort !== lastValue.sort) {
    optionsText = `${firstValue.value} - ${lastValue.value}`
  }

  const variantAttributeValue = savedVariant.specificVariants.find((variant) => attribute.name === variant.name)

  return (
    <View style={[styles.attribute, index > 0 && { borderLeftWidth: 1, borderLeftColor: '#D8D8D8' }]}>
      <Text style={{ fontSize: 16 }}>
        { attribute.name }
      </Text>
      <Text style={{ fontFamily: 'Archivo-Bold', fontSize: 16, color: '#027256', marginTop: 4 }}>
        { optionsText }
      </Text>
      <TouchableOpacity
        testID={`product-lookup-attribute-${attribute.name.toLowerCase()}`}
        style={[styles.valueButton, variantAttributeValue.swatchColorImageUrl && styles.swatchButton]}
        onPress={() => {
          dispatch(setCurrentPage(CurrentPage.AdjustDetails))
          dispatch(updateProductLookupData({ focusedAttribute: attribute.name }, UPDATE_PRODUCT_LOOKUP_DATA))
        }}
      >
        {
          variantAttributeValue.swatchColorImageUrl
            ? <Image
              source={{ uri: variantAttributeValue.swatchColorImageUrl }}
              style={ styles.swatch }
              resizeMode='cover'
            />
            : <Text style={{ fontSize: 16, fontFamily: 'Archivo-Bold' }}>{ variantAttributeValue.value }</Text>
        }
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  attribute: {
    paddingHorizontal: 32,
    alignItems: 'center',
    flexGrow: 1
  },
  valueButton: {
    height: 48,
    minWidth: 48,
    borderRadius: 24,
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderColor: '#666',
    borderWidth: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F1F1'
  },
  swatchButton: {
    borderColor: 'black',
    borderWidth: 4,
    paddingHorizontal: 4
  },
  swatch: {
    height: 32,
    width: 32,
    borderRadius: 16
  }
})

export default ProductLookupAttributeDisplay
