import { useDispatch } from 'react-redux'
import React from 'react'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { AttributeType, StyleVariantType } from '../reducers/productLookupData'
import ChevronSvg from './svg/ChevronSvg'
import RadioButton from './RadioButton'
import RadioButtonInput from './RadioButtonInput'
import RadioButtonLabel from './RadioButtonLabel'
import { updateProductLookupData, UPDATE_PRODUCT_LOOKUP_DATA } from '../actions/productLookupActions'

interface ProductLookupAttributeAdjustProps {
  attribute: AttributeType
  selectedVariant: StyleVariantType
  setSelectedVariant: (value: React.SetStateAction<StyleVariantType>) => void
}

const ProductLookupAttributeAdjust = ({
  attribute,
  selectedVariant,
  setSelectedVariant
}: ProductLookupAttributeAdjustProps) => {
  const { productLookupData } = useSelector(state => ({
    productLookupData: state.productLookupData
  }))

  const { focusedAttribute, productDetails } = productLookupData

  const isFocused = focusedAttribute === attribute.name

  const variantAttributeValue = selectedVariant.specificVariants.find((variant) => attribute.name === variant.name)

  const dispatch = useDispatch()

  // Long attribute names won't line-break on slashes, which can wrapping to look bad.
  // Increasing a ZWSP before each slash lets the browser break the line whenever there's a slash, which makes more sense.
  const insertZWSP = (text) => {
    return text.replaceAll(/(\S)\/(\S)/g, '$1\u200B/$2')
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity testID={`product-lookup-adjust-${attribute.name.toLowerCase()}`} style={styles.heading} onPress={() => {
        dispatch(updateProductLookupData({
          focusedAttribute: (focusedAttribute === attribute.name) ? null : attribute.name
        }, UPDATE_PRODUCT_LOOKUP_DATA))
      }}>
        <View>
          <Text style={{ fontSize: 20, fontFamily: 'Archivo-Bold' }}>{ attribute.name }</Text>
          <Text style={{ fontSize: 16, color: '#797979', marginTop: 4 }}>{ variantAttributeValue?.value }</Text>
        </View>
        <View style={isFocused ? styles.up : styles.down}><ChevronSvg width={36} height={36}></ChevronSvg></View>
      </TouchableOpacity>
      {
        isFocused &&
          <View style={ styles.valueList }>
            {
              attribute.specificVariants.map((variant) => {
                const availableVariant = productDetails.styleVariants.find((styleVariant) => {
                  for (let i = 0; i < styleVariant.specificVariants.length; i++) {
                    const specificVariant = styleVariant.specificVariants[i]
                    if (specificVariant.name === attribute.name) {
                      if (specificVariant.value !== variant.value) {
                        return false
                      }
                    } else {
                      const selectedSpecificVariant = selectedVariant.specificVariants.find((selSpecVar) => selSpecVar.name === specificVariant.name)
                      if (selectedSpecificVariant && (selectedSpecificVariant.value !== specificVariant.value)) {
                        return false
                      }
                    }
                  }
                  return true
                })
                const attributeVariant: StyleVariantType = availableVariant ?? {
                  invalidCombination: true,
                  specificVariants: [...selectedVariant.specificVariants.filter(s => s.name !== attribute.name), variant]
                }
                return (
                  <View testID={`product-lookup-variant-${variant.value.toLowerCase().replaceAll(' ', '-')}`} style={[styles.singleValue, !availableVariant && { opacity: 0.5 }]} key={variant.value}>
                    <RadioButton key={variant.value} animation={true} marginBottom={0}>
                      <>
                        <RadioButtonInput
                          index={0}
                          testID={'radio-button-input'}
                          isSelected={
                            variantAttributeValue?.value === variant.value
                          }
                          onPress={() => {
                            console.info('ACTION: components > ProductLookupAttributeAdjust > onPress (1)')
                            setSelectedVariant(attributeVariant)
                          }}
                          borderWidth={2}
                          buttonSize={16}
                          accessibilityLabel={'radioButton' + 0}
                          accessible={true}
                          value={variant.value}
                          buttonColor={'#005343'}
                        />
                        <View style={{ flexShrink: 1 }}>
                          <RadioButtonLabel style={{ maxWidth: '100%' }}>
                            <View style={{ flexDirection: 'row', maxWidth: '100%', alignItems: 'center' }}>
                              <Text style={{ fontSize: 16 }} numberOfLines={2}>{insertZWSP(variant.value)}</Text>
                              {
                                variant.swatchColorImageUrl &&
                                  <Image
                                    source={{ uri: variant.swatchColorImageUrl }}
                                    style={ styles.swatch }
                                    resizeMode='cover'
                                  />
                              }
                            </View>
                          </RadioButtonLabel>
                        </View>
                      </>
                    </RadioButton>
                  </View>
                )
              })
            }
          </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    marginBottom: 16,
    padding: 16
  },
  heading: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  valueList: {
    marginTop: 20,
    borderTopColor: '#D8D8D8',
    borderTopWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  singleValue: {
    width: '50%',
    marginTop: 16,
    paddingRight: 16
  },
  swatch: {
    height: 20,
    width: 20,
    borderRadius: 4,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#D8D8D8'
  },
  down: {
    transform: [{ rotate: '90deg ' }]
  },
  up: {
    transform: [{ rotate: '-90deg ' }]
  }
})

export default ProductLookupAttributeAdjust
