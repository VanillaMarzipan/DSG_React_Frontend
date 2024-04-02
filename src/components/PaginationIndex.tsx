import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Text from './StyledText'

interface PaginationIndexProps {
  centered?: boolean
  currentPageIndex: number
  totalPages: number
  setCurrentPage: (value: React.SetStateAction<number>) => void
}

const PaginationIndex = ({
  centered,
  currentPageIndex,
  totalPages,
  setCurrentPage
}: PaginationIndexProps) => {
  const middlePageNums = []

  // At page 1 this shows pages 1-3; at last page it shows last 3 pages; otherwise it shows prev, current, last
  const firstMiddlePageNum = Math.max(0, Math.min(currentPageIndex - 1, totalPages - 3))

  for (let i = firstMiddlePageNum; i < Math.min(firstMiddlePageNum + 3, totalPages); i++) {
    middlePageNums.push(i)
  }

  return (
    <Text style={[styles.paginationLink, centered && { textAlign: 'center' }]}>
      {!middlePageNums.includes(0) &&
        <>
          <TouchableOpacity testID={`product-lookup-page-${1}`} style={styles.indexItem} onPress={() => setCurrentPage(0)}>
            <Text style={styles.paginationLink}>{currentPageIndex === 0 ? '(1)' : 1}</Text>
          </TouchableOpacity>
          {middlePageNums[0] !== 1 && <Text style={[styles.paginationLink, styles.indexItem]}>...</Text>}
        </>
      }
      {middlePageNums.map((item) => {
        return (
          <TouchableOpacity testID={`product-lookup-page-${item + 1}`} style={(item !== totalPages - 1) && styles.indexItem} onPress={() => setCurrentPage(item)} key={item}>
            <Text style={styles.paginationLink}>{currentPageIndex === item ? `(${item + 1})` : item + 1}</Text>
          </TouchableOpacity>
        )
      })}
      {!middlePageNums.includes(totalPages - 1) &&
        <>
          {middlePageNums[middlePageNums.length - 1] !== totalPages - 2 && <Text style={[styles.paginationLink, styles.indexItem]}>...</Text>}
          <TouchableOpacity testID={`product-lookup-page-${totalPages}`} onPress={() => setCurrentPage(totalPages - 1)}>
            <Text style={styles.paginationLink}>{currentPageIndex === totalPages - 1 ? `(${totalPages})` : totalPages}</Text>
          </TouchableOpacity>
        </>
      }
    </Text>
  )
}

const styles = StyleSheet.create({
  indexItem: {
    marginRight: 10
  },
  paginationLink: {
    color: '#006554',
    fontFamily: 'Archivo-Bold'
  }
})

export default PaginationIndex
