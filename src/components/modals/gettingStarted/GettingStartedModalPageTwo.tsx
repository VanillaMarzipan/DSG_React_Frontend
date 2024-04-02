import { View, StyleSheet, Text } from 'react-native'

const GettingStartedModalPageTwo = (): JSX.Element => {
  const rowsToRender = [
    [
      {
        heading: 'NEW SEARCH FUNCTION',
        description: 'Use the home screen search bar to start a transaction by looking up loyalty accounts, scanning or entering a bar code, and more.'
      },
      {
        heading: 'ASSOCIATE DISCOUNT',
        description: 'To add employee discount, scan bar code on card or manually enter into UPC search input box.'
      }
    ],
    [
      {
        heading: 'PRODUCT LOOKUP',
        description: 'This feature allows you to find product information and add the item to the transaction.'
      },
      {
        heading: 'NO SWEAT PROTECTION PLAN',
        description: 'Click on the plan name for all the plan details.'
      }
    ],
    [
      {
        heading: 'OPEN THE DRAWER',
        description: 'Tap the Functions Button and then No Sale.'
      },
      {
        heading: 'NO SALE',
        description: 'Now a searchable transaction type in Electronic Journal.'
      }
    ]
  ]

  const renderFeatureAndDescription = (featureRow, row) => {
    return (
      <View style={styles.rowContainer}>
        {
          featureRow.map((feature, index) => {
            const uniqueID = `getting-started-page-two-feature-${row}-${index}`
            return (
              <View testID={uniqueID} key={uniqueID} style={styles.featureContainer}>
                <Text testID={uniqueID + '-heading'} style={styles.featureHeading}>
                  {feature.heading}
                </Text>
                <Text style={styles.featureDescription} testID={uniqueID + '-description'}>
                  {feature.description}
                </Text>
              </View>
            )
          })
        }
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      {
        rowsToRender.map((row, index) => (
          renderFeatureAndDescription(row, index)
        ))
      }
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 58,
    height: '60%',
    width: '90%'
  },
  featureContainer: {
    width: '50%',
    paddingRight: 16
  },
  featureHeading: {
    fontFamily: 'DSG-Sans-Bold',
    fontSize: 20
  },
  featureDescription: {
    marginTop: 8,
    fontSize: 12
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 24
  }
})

export default GettingStartedModalPageTwo
