/* eslint-disable @typescript-eslint/no-var-requires */

import { StyleSheet, View } from 'react-native'
import Text from './StyledText'
import PropTypes from 'prop-types'
import { DisplayItemType } from '../reducers/transactionData'
import imageUnavailable from '../img/ImageUnavailable.png'
import { SyntheticEvent } from 'react'
import NikeConnectedProductTag from './reusable/NikeConnectedProductTag'

interface ProductDetailProps {
  item: DisplayItemType
}

const ProductDetail = ({ item }: ProductDetailProps): JSX.Element => (
  <View style={styles.container}>
    <View style={styles.innerContainer}>
      <View testID='product-image' style={styles.imageContainer}>
        <img
          style={{ objectFit: 'contain', maxWidth: '70%' }}
          alt={item.description}
          src={item.imageUrl ? item.imageUrl + '&hei=256&fit=constrain,1' : imageUnavailable}
          onError={(e: SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement
            target.onerror = null
            target.src = imageUnavailable
          }}
        />
        <View style={{ marginTop: 12, width: 'max-content' }}>
          {item.attributes?.includes(8) && <NikeConnectedProductTag popupPosition='top' />}
        </View>
      </View>
      <View testID='product-detail-container' style={styles.detailContainer}>
        <View style={styles.row}>
          <Text>Description:</Text>
          <Text testID='product-detail-description' style={styles.detailValue}>
            {item.description}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>UPC:</Text>
          <Text testID='product-detail-upc' style={styles.detailValue}>
            {item.upc}
          </Text>
        </View>
        {item.variants &&
          Object.keys(item.variants).map((key: string) => (
            <View testID='product-detail-row' key={key} style={styles.row}>
              <Text testID='product-detail-key'>{`${key}:`}</Text>
              <Text testID='product-detail-value' style={styles.detailValue}>
                {item.variants[key]}
              </Text>
            </View>
          ))}
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexGrow: 1,
    minHeight: 320,
    maxHeight: 320,
    justifyContent: 'center'
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  imageContainer: {
    paddingRight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%'
  },
  detailContainer: {
    width: '50%',
    marginTop: 16
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16
  },
  detailValue: {
    width: '60%',
    maxWidth: '60%'
  }
})

ProductDetail.propTypes = {
  item: PropTypes.object
}

export default ProductDetail
