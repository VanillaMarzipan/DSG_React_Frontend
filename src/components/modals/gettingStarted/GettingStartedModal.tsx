import Modal from '../Modal'
import { View, StyleSheet } from 'react-native'
import Text from '../../StyledText'
import Breadcrumbs from '../../Breadcrumbs'
import SubmitButton from '../../reusable/SubmitButton'
import { getConfigurationValue } from '../../../actions/configurationActions'
import { useState } from 'react'
import GettingStartedModalPageOne from './GettingStartedModalPageOne'
import GettingStartedModalPageTwo from './GettingStartedModalPageTwo'
import GettingStartedModalPageThree from './GettingStartedModalPageThree'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../../actions/uiActions'

const GettingStartedModal = (): JSX.Element => {
  const dispatch = useDispatch()
  const [gettingStartedPageNum, setGettingStartedPageNum] = useState(1)

  const gettingStartedConfiguration = getConfigurationValue('gettingstartedmodal')

  const stepPanelDictionary = {
    1: <GettingStartedModalPageOne gettingStartedConfiguration={gettingStartedConfiguration}/>,
    2: <GettingStartedModalPageTwo />,
    3: <GettingStartedModalPageThree gettingStartedConfiguration={gettingStartedConfiguration}/>
  }

  const onFinalPage = gettingStartedPageNum === 3
  return (
    <Modal
      modalHeading={'GETTING STARTED WITH ENDZONE'}
      modalName={'gettingStarted'}
      minModalHeight={518}
      modalWidth={700}
      headingSize={32}
      onDismiss={() => {
        setGettingStartedPageNum(1)
      }}
    >
      <View style={styles.mainContainer}>
        <Breadcrumbs
          breadcrumbCount={3}
          currentProcessStep={gettingStartedPageNum}
          customContainerStyles={{
            position: 'absolute',
            marginLeft: 68,
            marginTop: 8
          }}
          customLineWidth={36}
        />
        {stepPanelDictionary[gettingStartedPageNum]}
        <SubmitButton
          testID='next-button-getting-started'
          onSubmit={() => {
            if (onFinalPage) {
              dispatch(receiveUiData({ showModal: false }))
            } else {
              setGettingStartedPageNum(gettingStartedPageNum + 1)
            }
          }}
          buttonLabel={onFinalPage ? 'COMPLETE' : 'NEXT'}
          customStyles={styles.customNextButton}
        />
        <Text style={{ marginBottom: 20 }}>
          If you are having a technical problem on the register, please contact the Service Desk at 866-418-3456.
        </Text>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '88%',
    alignItems: 'center'
  },
  customNextButton: {
    marginBottom: 16,
    marginTop: 24
  }
})

export default GettingStartedModal
