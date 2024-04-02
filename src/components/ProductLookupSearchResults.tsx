import { StyleSheet, View, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import Text from './StyledText'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { useEffect, useState } from 'react'
import PaginationIndex from './PaginationIndex'
import { fetchProductLookupDetails, fetchProductLookupSearchResults } from '../actions/productLookupActions'
import { useDispatch } from 'react-redux'
import ProductLookupErrorBox from './ProductLookupErrorBox'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import NoSearchResultsSvg from './svg/NoSearchResultsSvg'

interface ProductLookupSearchResultsProps {
  loading: boolean
  resultsPerPage: number
}

const ProductLookupResults = ({
  loading = false,
  resultsPerPage
}: ProductLookupSearchResultsProps) => {
  const { productLookupData } = useSelector(state => ({
    productLookupData: state.productLookupData
  }))

  const dispatch = useDispatch()

  useEffect(() => {
    setCurrentPage(0)
  }, [productLookupData])

  const [currentPage, setCurrentPage] = useState(0)

  const totalResults = productLookupData.searchResults.result ? productLookupData.searchResults.result.length : 0
  const startIndex = currentPage * resultsPerPage
  const endIndex = Math.min((currentPage + 1) * resultsPerPage, totalResults)

  const results = productLookupData.searchResults.result?.slice(startIndex, endIndex)

  const setPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setNextPage = () => {
    if ((currentPage + 1) < (totalResults / resultsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const totalPages = Math.max(Math.ceil(totalResults / resultsPerPage), 1)

  return (
    loading
      ? <ActivityIndicator color={'#000'} style={styles.activityIndicator} />
      : productLookupData.searchError
        ? <ProductLookupErrorBox errorMessage={productLookupData.searchErrorMessage} onRetry={() => {
          dispatch(fetchProductLookupSearchResults(productLookupData.currentSearchTerm))
        }} marginTop={16} />
        : results.length === 0
          ? <View style={{ height: '100%', width: '100%', paddingVertical: 20 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 93 }}>
              <NoSearchResultsSvg color={'#C8C8C8'}/>
              <Text style={{ textAlign: 'center', letterSpacing: 0.5, fontSize: 16, lineHeight: 22, marginTop: 12 }}>
                {'No search results found.\nTry adjusting your search to find what you are looking for.'}
              </Text>
            </View>
            <View>
              <Text style={{ textAlign: 'center', letterSpacing: 0.5, fontSize: 16, lineHeight: 22, color: '#666666' }}>
                {'If the problem persists, please call the Service Desk at (724)\u00A0273-3456, toll-free: (866)\u00A0418-3456'}
              </Text>
            </View>
          </View>
          : <View style={styles.resultsContainer}>
            <View style={styles.paginationBar}>
              <View>
                {totalPages > 1 &&
                  <PaginationIndex
                    currentPageIndex={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                  />
                }
              </View>
              <Text style={styles.resultsCount}>Showing {totalResults > resultsPerPage && `${startIndex + 1}–${endIndex} of `}{totalResults} {totalResults !== 1 ? 'results' : 'result'}</Text>
            </View>
            <View style={styles.resultsList}>
              {
                results.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.resultItem}
                      onPress={() => {
                        sendRumRunnerEvent('Product Lookup Details', {
                          upc: item.upc
                        })
                        dispatch(fetchProductLookupDetails(item.upc))
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', fontFamily: 'Archivo' }}>{item.name || item.fallbackName}</Text>
                      </View>
                      <View style={{ flex: 1, flexBasis: 60 }}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: 60, height: 60, marginLeft: 'auto' }}
                          resizeMode='contain'
                        />
                      </View>
                    </TouchableOpacity>
                  )
                })
              }
              <View style={styles.paginationFooter}>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 24 }}>
                  <View style={{ flex: 1 }}>
                    {(currentPage > 0) && <TouchableOpacity onPress={setPreviousPage}>
                      <Text style={[styles.paginationLink, { textAlign: 'left' }]}>Previous Page</Text>
                    </TouchableOpacity>}
                  </View>
                  {totalPages > 1 &&
                    <View style={{ flex: 1 }}>
                      <PaginationIndex
                        centered={true}
                        currentPageIndex={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                      />
                    </View>
                  }
                  <View style={{ flex: 1 }}>
                    {((currentPage + 1) < (totalResults / resultsPerPage)) && <TouchableOpacity onPress={setNextPage}>
                      <Text style={[styles.paginationLink, { textAlign: 'right' }]}>Next Page</Text>
                    </TouchableOpacity>}
                  </View>
                </View>
                <Text style={styles.resultsCount}>Showing {totalResults > resultsPerPage && `${startIndex + 1}–${endIndex} of `}{totalResults} {totalResults !== 1 ? 'results' : 'result'}</Text>
              </View>
            </View>
          </View>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 56
  },
  paginationLink: {
    color: '#006554',
    fontFamily: 'Archivo-Bold'
  },
  resultsContainer: {
    width: '100%',
    marginHorizontal: 'auto',
    flexShrink: 1,
    display: 'flex',
    overflowX: 'visible'
  },
  paginationBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16
  },
  resultsCount: {
    color: '#666',
    fontStyle: 'italic'
  },
  resultsList: {
    flexShrink: 1
  },
  resultItem: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  paginationFooter: {
    marginTop: 48,
    paddingBottom: 24,
    display: 'flex',
    alignItems: 'center'
  }
})

export default ProductLookupResults
