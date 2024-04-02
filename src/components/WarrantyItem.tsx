import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import PropTypes from 'prop-types'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import RadioButton from './RadioButton'
import RadioButtonInput from './RadioButtonInput'
import RadioButtonLabel from './RadioButtonLabel'
import ChevronSvg from './svg/ChevronSvg'
import WarrantyModal from './modals/WarrantyModal'
import { Item } from '../reducers/transactionData'
import { Warranty, WarrantySelectionsType } from '../reducers/warrantyData'
import { updateWarrantySelection } from '../actions/warrantyActions'
import { updateUiData } from '../actions/uiActions'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { AppDispatch } from '../Main'

interface WarrantyItemProps {
  data: Item
  warrantyData: Array<Warranty>
  warrantySelections: WarrantySelectionsType
}

const WarrantyItem = ({
  data,
  warrantyData,
  warrantySelections
}: WarrantyItemProps): JSX.Element => {
  const [more, toggleMore] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>()
  const styles = StyleSheet.create({
    root: {
      borderColor: '#EAEBEB',
      borderWidth: 1,
      minHeight: more ? warrantyData.length * 40 : 114,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      flex: 0,
      marginBottom: 38,
      maxWidth: '100%',
      width: '100%'
    },
    container: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: 300,
      marginTop: 12
    },
    img: {
      height: 78,
      width: 93,
      marginRight: 30
    },
    productName: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 8,
      marginBottom: 8,
      maxWidth: 200
    },
    radioContainer: { marginTop: 10 },
    radioLabelText: {
      fontSize: 12
    },
    moreContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 44,
      alignSelf: 'flex-start',
      minWidth: 102
    },
    moreText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: 'rgba(0,0,0,0.54)',
      marginBottom: -10,
      letterSpacing: 1.5
    },
    moreIcon: {
      height: 40,
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: more ? '270deg' : '90deg' }]
    }
  })

  // On mount, update warranty selections if the transactionItemIdentifier is not found on warranty selections
  useEffect(() => {
    if (!warrantySelections || !Object.prototype.hasOwnProperty.call(warrantySelections, data.transactionItemIdentifier)) {
      dispatch(
        updateWarrantySelection({
          warrantySelections: {
            [data.transactionItemIdentifier]: {
              warrantySku: null,
              itemTransactionIdentifier: data.transactionItemIdentifier
            }
          }
        })
      )
    }
  }, [])

  const warrantyClicks = useSelector(
    state => state.analyticsData.warrantyModalClicks
  )
  const [warrantySkuNotInFile, setWarrantySkuNotInFile] = useState(false)
  return (
    <View testID='warranty-item' style={styles.root}>
      <View style={styles.container}>
        <Image
          style={styles.img}
          resizeMode='contain'
          source={(data.imageUrl) ? { uri: data.imageUrl + '&hei=256&fit=constrain,1' } : require('../img/ImageUnavailable.png')}
        />
        <View>
          <Text style={styles.productName} numberOfLines={1}>
            {data.description}
          </Text>
          <Text>{`$${data.unitPrice.toFixed(2)}`}</Text>
        </View>
      </View>

      <View style={styles.radioContainer}>
        <RadioButton key={0} animation={true}>
          <>
            <RadioButtonInput
              index={0}
              testID={data.transactionItemIdentifier.toString() + ':0'}
              isSelected={
                warrantySelections &&
                warrantySelections[data?.transactionItemIdentifier]
                  ?.warrantySku === null
              }
              onPress={() => {
                console.info('ACTION: components > WarrantyItem > onPress (1)')
                dispatch(
                  updateWarrantySelection({
                    warrantySelections: {
                      [data.transactionItemIdentifier]: {
                        warrantySku: null,
                        itemTransactionIdentifier:
                        data.transactionItemIdentifier
                      }
                    }
                  })
                )
                dispatch(
                  updateUiData(
                    { selectedItem: data.transactionItemIdentifier },
                    'UPDATE_UI_DATA'
                  )
                )
              }}
              borderWidth={1}
              buttonSize={8}
              accessibilityLabel={'radioButton' + 0}
              accessible={true}
              value={0}
            />
            <RadioButtonLabel>
              <Text
                style={[
                  styles.radioLabelText,
                  {
                    fontWeight:
                      warrantySelections &&
                      warrantySelections[data?.transactionItemIdentifier] &&
                      warrantySelections[data.transactionItemIdentifier]
                        .warrantySku === null
                        ? 'bold'
                        : 'normal'
                  }
                ]}
              >
                No Protection Plan
              </Text>
            </RadioButtonLabel>
          </>
        </RadioButton>
        {warrantyData
          .filter((obj, i) => (more ? true : i < 2))
          .map((warranty, i) => (
            <RadioButton key={i} animation={true}>
              <>
                <RadioButtonInput
                  testID={
                    data.transactionItemIdentifier.toString() +
                    ':' +
                    (i + 1).toString()
                  }
                  index={i + 1}
                  isSelected={
                    warrantySelections &&
                    warrantySelections[data?.transactionItemIdentifier]
                      ?.warrantySku === warranty.sku
                  }
                  onPress={() => {
                    console.info('ACTION: components > WarrantyItem > onPress (2)')
                    dispatch(
                      updateWarrantySelection({
                        warrantySelections: {
                          [data.transactionItemIdentifier]: {
                            warrantySku: warranty.sku,
                            itemTransactionIdentifier: data.transactionItemIdentifier,
                            warrantyDescription: warranty.product.description
                          }
                        }
                      })
                    )
                    dispatch(
                      updateUiData(
                        { selectedItem: data.transactionItemIdentifier },
                        'UPDATE_UI_DATA'
                      )
                    )
                  }}
                  borderWidth={1}
                  buttonSize={8}
                  accessibilityLabel={'radioButton' + warranty.sku}
                  accessible={true}
                  value={warranty.sku}
                />
                <RadioButtonLabel>
                  <>
                    <Text
                      style={[
                        styles.radioLabelText,
                        {
                          fontWeight:
                            warrantySelections &&
                            warrantySelections[data?.transactionItemIdentifier]
                              ?.warrantySku === warranty.sku
                              ? 'bold'
                              : 'normal'
                        }
                      ]}
                    >
                      {warranty.product.description.slice(0, 7)}
                    </Text>
                    <TouchableOpacity
                      testID={'warranty-label'}
                      disabled={warrantySkuNotInFile}
                      onPress={() => {
                        console.info('ACTION: components > WarrantyItem > onPress (3)')
                        dispatch({
                          type: 'UPDATE_UI_DATA',
                          data: {
                            showModal: `warrantyModal${warranty.planDescription +
                            warranty.sku +
                            data.transactionItemIdentifier}`
                          }
                        })
                        dispatch({
                          type: 'UPDATE_ANALYTICS_DATA',
                          data: {
                            warrantyModalClicks: warrantyClicks + 1
                          }
                        })
                        sendRumRunnerEvent('Warranty modal', { event: 'opened' })
                      }}
                    >
                      <Text
                        style={[
                          styles.radioLabelText,
                          {
                            textDecorationLine: warrantySkuNotInFile ? 'none' : 'underline',
                            fontWeight:
                              warrantySelections &&
                              warrantySelections[
                                data?.transactionItemIdentifier
                              ]?.warrantySku === warranty.sku
                                ? 'bold'
                                : 'normal'
                          }
                        ]}
                      >
                        {warranty.product.description.slice(7)}
                      </Text>
                      <WarrantyModal
                        data={data}
                        warranty={warranty}
                        modalName={`warrantyModal${warranty.planDescription +
                        warranty.sku +
                        data.transactionItemIdentifier}`}
                        warrantySku={warranty.sku.slice(1)}
                        setWarrantySkuNotInFile={setWarrantySkuNotInFile}
                      />
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.radioLabelText,
                        {
                          fontWeight:
                            warrantySelections &&
                            warrantySelections[data?.transactionItemIdentifier]
                              ?.warrantySku === warranty.sku
                              ? 'bold'
                              : 'normal'
                        }
                      ]}
                    >
                      {' - ' + warranty.pricing.unitSellingPrice}
                    </Text>
                  </>
                </RadioButtonLabel>
              </>
            </RadioButton>
          ))}
      </View>

      <TouchableOpacity
        onPress={() => {
          console.info('ACTION: components > WarrantyItem > onPress (4)')
          toggleMore(!more)
        }}
        style={styles.moreContainer}
      >
        {warrantyData.length > 2 && (
          <>
            <Text style={styles.moreText}>{`${more ? 'less' : 'More'} Plans ${
              !more ? `(${warrantyData.length})` : ''
            }`}</Text>
            <View style={styles.moreIcon}>
              <ChevronSvg fill='rgba(0,0,0,0.54)'/>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  )
}

WarrantyItem.propTypes = {
  data: PropTypes.object,
  theme: PropTypes.object,
  warrantyData: PropTypes.array,
  warrantySelections: PropTypes.object
}

export default WarrantyItem
