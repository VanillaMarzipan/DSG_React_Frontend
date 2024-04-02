import { useEffect, useRef } from 'react'
import { SectionList, StyleSheet, TouchableOpacity, View } from 'react-native'
import ReturnItem from '../../ReturnItem'
import Text from '../../StyledText'

interface ReturnsModalProps {
  uiData
  itemNumsReturnChecked
  setItemNumsReturnChecked
  itemNumsDamagedChecked
  setItemNumsDamagedChecked
  returnableItems
  nonReturnableItems
}

const ReturnsSelectionView = ({
  uiData,
  itemNumsReturnChecked,
  setItemNumsReturnChecked,
  itemNumsDamagedChecked,
  setItemNumsDamagedChecked,
  returnableItems,
  nonReturnableItems
}: ReturnsModalProps): JSX.Element => {
  const returnableItemsRef = useRef(null)
  useEffect(() => {
    if (uiData?.scanEvent?.scanTime && uiData.showModal === 'returns') {
      const clone = { ...itemNumsReturnChecked }
      for (let i = 0; i < returnableItems.length; i++) {
        if (uiData.scanEvent.scanValue === returnableItems[i].upc && !clone[returnableItems[i].transactionItemIdentifier]) {
          clone[returnableItems[i].transactionItemIdentifier] = true
          setItemNumsReturnChecked(clone)
          if (returnableItemsRef) {
            returnableItemsRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: i })
          }
          break
        }
      }
    }
  }, [uiData.scanEvent?.scanTime])
  return (
    <View>
      <View testID='returns-modal' style={styles.container}>
        {((returnableItems && returnableItems.length > 0) || (nonReturnableItems && nonReturnableItems.length > 0)) && (
          <>
            {returnableItems.length > 0 && (
              <>
                <View style={styles.separatorLine}></View>
                <View >
                  <Text style={styles.instructionText}>
                      Product imagery is available on transaction screen {'\n'}
                            by tapping the item in the receipt panel.
                  </Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={
                      () => {
                        console.info('ACTION: components > ReturnsSelection > onPress selectAllButton')
                        if (Object.keys(itemNumsReturnChecked).length < returnableItems.length) {
                          const clone = { ...itemNumsReturnChecked }
                          returnableItems && returnableItems.forEach(item => {
                            clone[item.transactionItemIdentifier] = true
                          })
                          setItemNumsReturnChecked(clone)
                        } else {
                          setItemNumsReturnChecked({})
                        }
                      }
                    }>
                    <Text style={styles.selectAllText}
                      testID='select-all-link'>Select All</Text>
                  </TouchableOpacity>
                  {uiData.returnsError && (
                    <Text style={{ marginLeft: 264, color: '#B80818' }}>Sorry, something went wrong, please try
                      again.</Text>
                  )}
                </View>
              </>
            )}
            <View style={styles.itemsContainer}>
              <SectionList
                ref={returnableItemsRef}
                sections={[
                  returnableItems && {
                    title: 'Returnable Items',
                    data: returnableItems
                  },
                  nonReturnableItems && {
                    title: 'Nonreturnable Items',
                    data: nonReturnableItems
                  }
                ]}
                renderSectionHeader={
                  ({ section: { title } }) => {
                    if (title === 'Nonreturnable Items' && nonReturnableItems && nonReturnableItems.length > 0) {
                      return (
                        <View style={styles.nonEligibleHeader}>
                          <View style={styles.separatorLine}></View>
                          <Text style={styles.nonEligibleText}>Not Eligible for Return</Text>
                        </View>
                      )
                    } else {
                      return null
                    }
                  }
                }
                extraData={{ returnableItems, nonReturnableItems }}
                keyExtractor={(item, index) => {
                  if (item && item.upc) {
                    return index.toString() + item.upc
                  }
                }}
                renderItem={({ item, index }) => {
                  if (item) {
                    return (
                      <View>
                        <ReturnItem
                          inReturnsPanel={true}
                          itemAction={item.returnEligibility[0] === 'ELIGIBLE' ? 'checkBox' : null}
                          index={index}
                          itemName={item.description}
                          price={item.returnPrice}
                          originalUnitPrice={item.returnPrice}
                          everydayPrice={item.returnPrice}
                          itemUpc={item.upc}
                          itemTransactionId={item.transactionItemIdentifier}
                          itemNumsDamagedChecked={itemNumsDamagedChecked}
                          setItemNumsDamagedChecked={setItemNumsDamagedChecked}
                          itemNumsReturnChecked={itemNumsReturnChecked}
                          setItemNumsReturnChecked={setItemNumsReturnChecked}
                        />
                      </View>

                    )
                  } else return null
                }}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise(resolve => setTimeout(resolve, 100))
                  wait.then(() => {
                    returnableItemsRef.current?.scrollToLocation({ itemIndex: info.index })
                  })
                }}
              />
            </View>
          </>
        )}
      </View>
    </View>
  )
}

export default ReturnsSelectionView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginLeft: 34,
    marginBottom: 42
  },
  selectAllButton: {
    height: 26
  },
  selectAllText: {
    textAlign: 'left',
    textDecorationLine: 'underline',
    fontWeight: '700'
  },
  separatorLine: {
    backgroundColor: '#797979',
    height: 1,
    width: 464,
    marginVertical: 16
  },
  instructionText: {
    color: 'black',
    textAlign: 'center',
    marginLeft: 75,
    marginBottom: 15,
    display: 'flex'
  },
  itemsContainer: {
    minWidth: 525,
    maxWidth: 525,
    marginLeft: -34,
    maxHeight: 270
  },
  nonEligibleHeader: {
    marginLeft: 34,
    marginBottom: 24
  },
  nonEligibleText: {
    fontWeight: '700'
  }
})
