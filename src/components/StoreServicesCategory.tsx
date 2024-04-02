import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Text from './StyledText'
import { useDispatch } from 'react-redux'
import { updateProductLookupData, UPDATE_PRODUCT_LOOKUP_DATA } from '../actions/productLookupActions'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import ChevronSvg from './svg/ChevronSvg'
import StoreServiceCategoryProduct from './StoreServiceCategoryProduct'
import { CategoryType } from '../reducers/productLookupData'

interface StoreServicesCategoryProps {
  category: CategoryType
  catIndex: number
}

const StoreServicesCategory = ({ category, catIndex }: StoreServicesCategoryProps) => {
  const dispatch = useDispatch()

  const focusedCategory = useSelector(state => state.productLookupData.focusedCategory)

  const isFocused = focusedCategory === category.name

  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        testID={`store-services-category-${catIndex}`}
        style={styles.category}
        onPress={() => {
          dispatch(updateProductLookupData({
            focusedCategory: ((focusedCategory === category.name) ? null : category.name)
          }, UPDATE_PRODUCT_LOOKUP_DATA))
        }}>
        <View>
          <Text style={styles.categoryHeading}>{category.name}</Text>
        </View>
        <View style={isFocused ? styles.up : styles.down}>
          <ChevronSvg width={36} height={36}></ChevronSvg>
        </View>
      </TouchableOpacity>
      {
        isFocused && (
          <View style={styles.valueList}>
            {
              category.products.map((item, index) => {
                return (
                  <View style={styles.singleValue} key={item.name}>
                    <StoreServiceCategoryProduct
                      key={item.name}
                      product={item}
                      index={index}
                    />
                  </View>
                )
              })
            }
          </View>
        )
      }
    </View>
  )
}
export default StoreServicesCategory

const styles = StyleSheet.create({
  categoryHeading: {
    fontSize: 20,
    fontFamily: 'Archivo-Bold'
  },
  categoryContainer: {
    backgroundColor: 'white',
    width: '100%',
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  category: {
    flexDirection: 'row',
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  up: {
    transform: [{ rotate: '-90deg ' }]
  },
  down: {
    transform: [{ rotate: '90deg ' }]
  },
  valueList: {
    borderTopColor: '#D8D8D8',
    borderTopWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },
  singleValue: {
    marginTop: 16,
    paddingRight: 16,
    width: '100%'
  }
})
