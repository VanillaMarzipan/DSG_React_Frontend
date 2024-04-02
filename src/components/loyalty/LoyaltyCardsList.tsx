import { useState } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import LoyaltyInfoCard from './LoyaltyInfoCard'
import PropTypes from 'prop-types'
import ChevronSvg from '../svg/ChevronSvg'
import { Customer } from '../../reducers/loyaltyData'

interface LoyaltyCardsListProps {
  setAdvancedSearch: () => void
  selectLoyaltyAccount: (index: number, loyaltyCustomers: Customer[]) => void
  selectItemPanel: (number) => void
  loyaltyCustomers: Array<Customer>
  lastItem: string | number
}

const loggingHeader = 'components > loyalty > LoyaltyCardsList > '

const LoyaltyCardsList = ({
  loyaltyCustomers,
  setAdvancedSearch,
  selectLoyaltyAccount,
  selectItemPanel,
  lastItem
}: LoyaltyCardsListProps) => {
  const [page, setPage] = useState(1)

  return (
    <View>
      <Text style={styles.heading}>Select Correct Account</Text>

      <View style={styles.list}>
        {
          // previous arrow
        }
        {page > 1 && (
          <TouchableOpacity
            testID='previous-arrow'
            onPress={() => {
              console.info('ACTION: ' + loggingHeader + 'onPress (previous-arrow)\n' + JSON.stringify({ page: page }))
              setPage(page - 1)
            }}
          >
            <View style={styles.chevronBox}>
              <View style={styles.rotate}>
                <ChevronSvg width={64} height={64}/>
              </View>
              <Text style={styles.chevronText}>PREVIOUS</Text>
            </View>
          </TouchableOpacity>
        )}

        {page === 1 && (
          <TouchableOpacity
            testID='loyalty-search-again-card'
            style={styles.orangeCard}
            onPress={() => {
              console.info('ACTION: ' + loggingHeader + 'onPress (loyalty-search-again-card)')
              setAdvancedSearch()
            }}
          >
            <View>
              <Text style={styles.bigText}>{'Not This\nAthlete?'}</Text>
              <Text style={styles.littleText}>search again</Text>
            </View>
          </TouchableOpacity>
        )}

        {loyaltyCustomers.map((data, index) => {
          if (page === 1 && index < 2) {
            return (
              <LoyaltyInfoCard
                key={index}
                testID={`loyalty-info-card-${index}`}
                selectLoyaltyAccount={selectLoyaltyAccount}
                selectItemPanel={selectItemPanel}
                index={index}
                loyaltyCustomers={loyaltyCustomers}
                firstName={data.firstName}
                lastName={data.lastName}
                street={data.street}
                city={data.city}
                state={data.state}
                zip={data.zip}
                lastItem={lastItem}
              />
            )
          } else if (index >= (page - 1) * 3 - 1 && index <= page * 3 - 2) {
            return (
              <LoyaltyInfoCard
                testID={`loyalty-info-card-${index}`}
                key={index}
                selectLoyaltyAccount={selectLoyaltyAccount}
                selectItemPanel={selectItemPanel}
                index={index}
                loyaltyCustomers={loyaltyCustomers}
                firstName={data.firstName}
                lastName={data.lastName}
                street={data.street}
                city={data.city}
                state={data.state}
                zip={data.zip}
                lastItem={lastItem}
              />
            )
          }
          return null
        })}

        {
          // next arrow
        }
        {page < Math.ceil((loyaltyCustomers.length + 1) / 3) && (
          <TouchableOpacity
            testID='next-arrow'
            onPress={() => {
              console.info('ACTION: ' + loggingHeader + 'onPress (next-arrow)\n' + JSON.stringify({ page: page }))
              setPage(page + 1)
            }}
          >
            <View style={styles.chevronBox}>
              <ChevronSvg width={64} height={64}/>
              <Text style={styles.chevronText}>NEXT</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.listNavigation}>
          {
            // first page button
          }
          {page > 1 && (
            <TouchableOpacity testID='first-arrow' onPress={() => {
              console.info('ACTION: ' + loggingHeader + 'onPress (first-arrow)')
              setPage(1)
            }}>
              <View style={styles.doubleArrowBox}>
                <View style={[styles.doubleArrow, styles.rotate]}>
                  <ChevronSvg
                    width={64}
                    height={64}
                    style={{ marginRight: -46 }}
                  />
                  <ChevronSvg width={64} height={64}/>
                </View>
                <Text style={styles.chevronText}>FIRST</Text>
              </View>
            </TouchableOpacity>
          )}
          <Text
            testID='loyalty-cards-list-pages-count'
            style={styles.pageNumber}
          >{`${page}/${Math.ceil((loyaltyCustomers.length + 1) / 3)}`}</Text>

          {
            // last page button
          }
          {page < Math.ceil((loyaltyCustomers.length + 1) / 3) && (
            <TouchableOpacity
              testID='last-arrow'
              onPress={() => {
                console.info('ACTION: ' + loggingHeader + 'onPress (last-arrow)\n' + JSON.stringify({
                  loyaltyCustomersLength: loyaltyCustomers?.length
                }))
                setPage(Math.ceil((loyaltyCustomers.length + 1) / 3))
              }}
            >
              <View style={styles.doubleArrowBox}>
                <View style={styles.doubleArrow}>
                  <ChevronSvg
                    width={64}
                    height={64}
                    style={{ marginRight: -46 }}
                  />
                  <ChevronSvg width={64} height={64}/>
                </View>
                <Text style={styles.chevronText}>LAST</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16
  },
  rotate: {
    transform: [{ rotate: '180deg ' }]
  },
  doubleArrow: {
    paddingHorizontal: 40,
    marginBottom: -8,
    flexDirection: 'row'
  },
  list: {
    width: '100%',
    paddingTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  listNavigation: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  pageNumber: {
    fontSize: 24
  },
  chevronText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  chevronBox: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  doubleArrowBox: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  bigText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  littleText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    color: 'white',
    textAlign: 'center',
    marginTop: 16
  },
  orangeCard: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
      }
    }),
    height: 164,
    width: 166,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D76B00'
  }
})

LoyaltyCardsList.propTypes = {
  setAdvancedSearch: PropTypes.func,
  selectLoyaltyAccount: PropTypes.func,
  selectItemPanel: PropTypes.func,
  loyaltyCustomers: PropTypes.array,
  lastItem: PropTypes.number
}

export default LoyaltyCardsList
