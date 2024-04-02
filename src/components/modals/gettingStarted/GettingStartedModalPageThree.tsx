import { View, StyleSheet, Text } from 'react-native'
import FeedbackInvertedColorsWithLabelSvg from '../../svg/FeedbackInvertedColorsWithLabelSvg'
import ItemDropDownMenuScreenshotSvg from '../../svg/ItemDropDownScreenshotSvg'
import LoyaltyPanelScreenshotSvg from '../../svg/LoyaltyPanelScreenshotSvg'
import StaticStandardScorecardSvg from '../../svg/StaticStandardScorecardSvg'

interface GettingStartedModalPageThreeProps {
  gettingStartedConfiguration
}

const GettingStartedModalPageThree = ({
  gettingStartedConfiguration
}: GettingStartedModalPageThreeProps): JSX.Element => {
  const metricsContent = gettingStartedConfiguration?.metricsInfo
  const mainPanelContent = [
    {
      image: <FeedbackInvertedColorsWithLabelSvg />,
      description: 'Click on the feedback button to send feedback directly to the Point of Sale team!'
    },
    {
      image: <StaticStandardScorecardSvg />,
      description: 'Click the scorecard button to search or enroll a loyalty account.'
    },
    {
      image: <LoyaltyPanelScreenshotSvg/>,
      description: 'Rewards and promotions are clearly displayed to directly apply to a transaction.'
    },
    {
      image: <ItemDropDownMenuScreenshotSvg/>,
      description: 'Click the dropdown next to an item if you need to edit a price or remove the item from a transaction.'
    }
  ]
  return (
    <View style={styles.mainContainer}>
      <View style={styles.mainContent}>
        {mainPanelContent.map((row, index) => {
          const uniqueID = `getting-started-page-three-row-${index}`
          return (
            <View style={styles.mainContentRow} testID={uniqueID} key={uniqueID}>
              <View style={styles.imageContainer}>
                {row.image}
              </View>
              <Text style={styles.textContainer}>{row.description}</Text>
            </View>
          )
        })}
      </View>
      <View style={styles.sideContent}>
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsHeading}>What to expect with Metrics</Text>
          {metricsContent?.map((content, index) => {
            const uniqueID = `getting-started-page-three-right-column-${index}`
            return (
              <Text style={styles.metricsText} testID={uniqueID} key={uniqueID}>
                {content}
              </Text>
            )
          })}
        </View>
        <View>
          <Text style={styles.ejText}>
            You can view/filter all transactions at
          </Text>
          <Text style={styles.ejURL}>https://ejviewer.dcsg.com</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 58,
    minHeight: '60%',
    width: '90%',
    flexDirection: 'row'
  },
  mainContent: {
    width: '60%',
    height: '100%'
  },
  mainContentRow: {
    flexDirection: 'row',
    marginBottom: 24
  },
  imageContainer: {
    width: '39%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    width: '61%',
    fontSize: 12,
    lineHeight: 16,
    paddingRight: 24
  },
  sideContent: {
    width: '40%',
    height: '100%',
    alignItems: 'center'
  },
  metricsContainer: {
    backgroundColor: '#EDEDED',
    padding: 20,
    marginBottom: 32
  },
  metricsHeading: {
    fontFamily: 'DSG-Sans-Bold',
    fontSize: 20,
    color: '#066554'
  },
  metricsText: {
    fontSize: 12,
    paddingVertical: 4
  },
  ejText: {
    textAlign: 'left',
    width: '100%'
  },
  ejURL: {
    fontWeight: '700',
    textAlign: 'left',
    width: '100%'
  }
})

export default GettingStartedModalPageThree
