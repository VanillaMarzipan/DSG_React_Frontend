import { View, StyleSheet } from 'react-native'
import Text from '../../StyledText'
import CheckMarkCircledSvg from '../../svg/CheckMarkCircledSvg'
import UseNcrComputerMonitorSvg from '../../svg/UseNcrComputerMonitorSvg'

export interface IGettingStartedConfiguration {
  newFeatures: Array<string>
  legacyExclusiveFeatures: Array<string>
  metricsInfo: Array<string>
}

interface GettingStartingModalPageOneProps {
  gettingStartedConfiguration: IGettingStartedConfiguration
}

const GettingStartedModalPageOne = ({
  gettingStartedConfiguration
}: GettingStartingModalPageOneProps): JSX.Element => {
  const newFeatures = gettingStartedConfiguration?.newFeatures
  const legacyExclusiveFeatures = gettingStartedConfiguration?.legacyExclusiveFeatures

  const returnDynamicMargins = (textArray, index) => {
    const style = {
      marginTop: index === 0 ? 8 : 4,
      marginBottom: index === textArray?.length - 1 ? 20 : 0
    }
    return style
  }
  return (
    <View style={styles.mainContainer}>
      <View style={styles.leftInfoPanel}>
        <View style={styles.innerLeftDetailsPanel}>
          <Text style={styles.leftInfoText}>
            The EndZone team wants to provide you with some information around the current capabilities of the register.
          </Text>
          <Text style={[styles.leftInfoText, styles.leftPanelSubsequentText]}>
            We have included helpful hints and noted the transactions for which you should still be using the NCR registers.
          </Text>
          <Text style={[styles.leftInfoText, styles.leftPanelSubsequentText]}>
            We encourage you to use the EndZone register and to actively provide all feedback.
          </Text>
          <Text style={[styles.leftInfoText, styles.leftPanelSubsequentText]}>
            Our team truly values and appreciates your input, as we utilize this to continue improving EndZone.
          </Text>
        </View>
      </View>
      <View style={styles.rightInfoPanel}>
        <View style={styles.newFeatures}>
          <View>
            <View style={styles.newFeaturesHeadingContainer}>
              <CheckMarkCircledSvg/>
              <Text style={styles.rightInfoPanelHeadingText}>JUST ADDED!</Text>
            </View>
            {
              newFeatures?.map((featureName, index) => (
                <View
                  style={[returnDynamicMargins(newFeatures, index), styles.flexRow]}
                  key={`just-added-${index}`}
                >
                  <Text style={{ marginRight: 4 }}>{'\u2022'}</Text>
                  <Text>{featureName}</Text>
                </View>
              ))
            }
          </View>
        </View>
        <View style={styles.legacyExclusiveFeaturesContainer}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <UseNcrComputerMonitorSvg />
              <Text style={styles.rightInfoPanelHeadingText}>USE NCR WHEN...</Text>
            </View>
            {
              legacyExclusiveFeatures?.map((featureName, index) => {
                return (
                  <View
                    key={`use-ncr-when-${index}`}
                    style={[returnDynamicMargins(legacyExclusiveFeatures, index), styles.flexRow]}
                  >
                    <Text style={{ marginRight: 4 }}>{'\u2022'}</Text>
                    <Text>{featureName}</Text>
                  </View>
                )
              })
            }
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    minHeight: 274,
    marginTop: 58
  },
  leftInfoPanel: {
    maxWidth: '60%',
    marginRight: 32
  },
  innerLeftDetailsPanel: {
    height: '70%',
    width: '86%',
    marginLeft: 34,
    alignItems: 'center'
  },
  leftInfoText: {
    lineHeight: 18,
    letterSpacing: 0.5
  },
  leftPanelSubsequentText: {
    marginTop: 16
  },
  rightInfoPanel: {
    width: '35%',
    backgroundColor: '#EDEDED',
    marginTop: -24,
    marginLeft: -19
  },
  newFeatures: {
    minWidth: '40%',
    marginHorizontal: 24
  },
  newFeaturesHeadingContainer: {
    marginTop: 24,
    flexDirection: 'row'
  },
  rightInfoPanelHeadingText: {
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'DSG-Sans-Bold',
    color: '#066554',
    marginLeft: 8
  },
  legacyExclusiveFeaturesContainer: {
    minWidth: '40%',
    marginHorizontal: 24,
    justifyContent: 'space-between'
  },
  flexRow: {
    flexDirection: 'row'
  }
})

export default GettingStartedModalPageOne
