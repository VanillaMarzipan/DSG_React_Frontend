import { useEffect } from 'react'
import * as React from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import ModalBase from './Modal'
import { updateWarrantySelection } from '../../actions/warrantyActions'
import { Item } from '../../reducers/transactionData'
import { useDispatch } from 'react-redux'
import warrantyDescriptions from '../../data/warrantyDescriptions'
import { updateUiData } from '../../actions/uiActions'
import { Warranty } from '../../reducers/warrantyData'

interface WarrantyModalProps {
  warrantySku: string | number
  modalName: string
  data: Item
  warranty: Warranty
  setWarrantySkuNotInFile: (boolean) => void
}

const WarrantyModal: React.FC<WarrantyModalProps> = ({
  warrantySku,
  modalName,
  data,
  warranty,
  setWarrantySkuNotInFile
}: WarrantyModalProps): JSX.Element => {
  const dispatch = useDispatch()
  const skuNotFound = warrantyDescriptions.skuMap[warrantySku] === undefined
  useEffect(() => {
    if (skuNotFound) {
      setTimeout(() => setWarrantySkuNotInFile(true))
    }
  }, [])
  if (skuNotFound) return null

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center'
    },
    textContainer: {
      alignItems: 'flex-start',
      marginTop: 28,
      marginHorizontal: 48,
      marginBottom: 24
    },
    text: {
      marginLeft: 8,
      marginTop: 8
    },
    button: {
      width: 213,
      height: 45,
      backgroundColor: '#BB5811',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowRadius: 4,
      shadowOpacity: 1,
      marginBottom: 32,
      ...Platform.select({
        web: { cursor: 'pointer' }
      })
    },
    buttonText: {
      fontSize: 16,
      letterSpacing: 0.3,
      color: '#f9f9f9',
      textTransform: 'uppercase',
      fontWeight: '600',
      textAlign: 'center'
    },
    subTitleIncludes: {
      fontWeight: 'bold'
    },
    subTitleTerm: {
      fontWeight: 'bold',
      paddingTop: 8
    },
    subBullets: {
      marginLeft: 16
    }
  })

  const descriptionID = warrantyDescriptions.skuMap[warrantySku].descriptionID
  const descriptions = warrantyDescriptions.descriptionMap[descriptionID]

  return (
    <ModalBase
      modalHeading={descriptions.title}
      modalName={modalName}
      headingSize={32}
    >
      <View testID='warranty-modal' style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.subTitleIncludes}>Coverage Includes:</Text>
          {descriptions.coverageIncludes.map((el, i) =>
            typeof el === 'string'
              ? (
                <Text key={'includes-detail-' + i} style={styles.text}>
                  {el}
                </Text>
              )
              : (
                Object.keys(el).map((el, i) => (
                  <Text
                    key={'coverage-sub-bullet-' + i}
                    style={styles.subBullets}
                  >
                    {el}
                  </Text>
                ))
              )
          )}
          <Text style={styles.subTitleTerm}>Coverage Term:</Text>
          {descriptions.coverageTerms.map((el, i) => (
            <Text key={'term-detail-' + i} style={styles.text}>
              {el}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          testID='warranty-modal-add'
          onPress={() => {
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
            dispatch({
              type: 'UPDATE_UI_DATA',
              data: {
                showModal: false
              }
            })
            dispatch(
              updateUiData(
                { selectedItem: data.transactionItemIdentifier },
                'UPDATE_UI_DATA'
              )
            )
          }}
        >
          <View style={styles.button}>
            <Text style={styles.buttonText}>Add to sale</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ModalBase>
  )
}

export default WarrantyModal
