import { View, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import IconAboveTextButton from '../../reusable/IconAboveTextButton'
import LoyaltyLookUpSvg from '../../svg/LoyaltyLookUpSvg'
import { receiveUiData } from '../../../actions/uiActions'
import { UPDATE_LOYALTY_DATA, updateLoyaltyData } from '../../../actions/loyaltyActions'
import { featureFlagEnabled } from '../../../reducers/featureFlagData'
import LowestPriceSVG from '../../LowestPriceSVG'
import { sendRumRunnerEvent } from '../../../utils/rumrunner'
import MagnifyingGlassSvg from '../../svg/MagnifyingGlassSvg'
import BarcodeCircleSvg from '../../svg/BarcodeCircleSvg'
import { fetchProductLookupCategories } from '../../../actions/productLookupActions'
import { FooterOverlayActiveType, PanelsType } from '../../../reducers/uiData'

interface PostVoidPopupProps {
  footerOverlayActive: FooterOverlayActiveType
  productLookupPanelSelected: boolean
  storeServicesPanelSelected: boolean
  lowestPriceInquiryPanelSelected: boolean
  activePanel: PanelsType
  authenticated: boolean
  shim: JSX.Element
}

const FooterLookupOptionsColumn = ({
  footerOverlayActive,
  productLookupPanelSelected,
  storeServicesPanelSelected,
  lowestPriceInquiryPanelSelected,
  activePanel,
  authenticated,
  shim
}: PostVoidPopupProps): JSX.Element => {
  const dispatch = useDispatch()
  const disableLoyaltyLookup = activePanel !== 'scanDetailsPanel' && activePanel !== 'initialScanPanel'

  return (
    footerOverlayActive === 'ItemLookup' && !productLookupPanelSelected && !storeServicesPanelSelected && !lowestPriceInquiryPanelSelected
      ? (
        <View>
          {
            <IconAboveTextButton
              testId={'loyalty-lookup-name'}
              icon={<LoyaltyLookUpSvg disabled={disableLoyaltyLookup} width={56} height={56} />}
              buttonText={'LOYALTY LOOKUP BY NAME'}
              disabled={disableLoyaltyLookup}
              onPress={() => {
                console.info('ACTION: components > FooterMenuOverlay > onPress LOYALTY LOOKUP BY NAME')
                dispatch(receiveUiData({ footerOverlayActive: 'None', selectedItem: 'LOYALTY_PANEL', autofocusTextbox: 'LoyaltyAdvancedSearch', activePanel: 'scanDetailsPanel' }))
                dispatch(
                  updateLoyaltyData(
                    {
                      altScreenName: 'advanced',
                      lastPhoneLookup: '',
                      phoneInput: '',
                      phoneOutput: '',
                      isNoAccountFound: true,
                      selectedLoyaltyCustomer: null,
                      loyaltyCustomers: [null]
                    },
                    UPDATE_LOYALTY_DATA
                  )
                )
              }}
              buttonTextStyle={[
                styles.buttonTextStyle,
                { marginTop: 8, width: 200 }
              ]}
            />
          }
          {
            featureFlagEnabled('LowestPriceInquiry') && <IconAboveTextButton
              testId={'lowest-price-inquiry'}
              icon={<LowestPriceSVG disabled={false} width={56} height={56} />}
              buttonText={'LOWEST PRICE INQUIRY'}
              disabled={false}
              onPress={() => {
                console.info('ACTION: components > FooterMenuOverlay > onPress LOWEST PRICE INQUIRY')
                if (lowestPriceInquiryPanelSelected) {
                  dispatch(receiveUiData({
                    footerOverlayActive: 'None'
                  }))
                } else {
                  sendRumRunnerEvent('Product Lookup Panel', {
                    authenticated
                  })
                }
                dispatch(receiveUiData({
                  lowestPriceInquiryPanelSelected: !lowestPriceInquiryPanelSelected
                }))
              }}
              buttonTextStyle={[
                styles.buttonTextStyle,
                { marginTop: 8 }
              ]}
            />
          }
          {
            featureFlagEnabled('ItemLookup') && <IconAboveTextButton
              testId={'item-lookup'}
              icon={<MagnifyingGlassSvg disabled={false} width={56} height={56} />}
              buttonText={'PRODUCT LOOKUP'}
              disabled={false}
              onPress={() => {
                console.info('ACTION: components > FooterMenuOverlay > onPress PRODUCT LOOKUP')
                if (productLookupPanelSelected) {
                  dispatch(receiveUiData({
                    footerOverlayActive: 'None'
                  }))
                } else {
                  sendRumRunnerEvent('Product Lookup Panel', {
                    authenticated
                  })
                }
                dispatch(receiveUiData({
                  productLookupPanelSelected: !productLookupPanelSelected
                }))
              }}
              buttonTextStyle={[
                styles.buttonTextStyle,
                { marginTop: 8 }
              ]}
            />
          }
          {
            featureFlagEnabled('StoreServices') && <IconAboveTextButton
              testId={'store-services'}
              icon={<BarcodeCircleSvg disabled={false} width={56} height={56} />}
              buttonText={'LICENSE/PERMITS'}
              disabled={false}
              onPress={() => {
                console.info('ACTION: components > FooterMenuOverlay > onPress LICENSE/PERMITS')
                if (storeServicesPanelSelected) {
                  dispatch(receiveUiData({
                    footerOverlayActive: 'None'
                  }))
                } else {
                  sendRumRunnerEvent('Product Lookup Panel', {
                    authenticated
                  })
                  dispatch(fetchProductLookupCategories())
                }
                dispatch(receiveUiData({
                  storeServicesPanelSelected: !storeServicesPanelSelected
                }))
              }}
              buttonTextStyle={[
                styles.buttonTextStyle,
                { marginTop: 8 }
              ]}
            />
          }
        </View>
      )
      : shim
  )
}

export default FooterLookupOptionsColumn

const styles = StyleSheet.create({
  buttonTextStyle: {
    color: '#FFFFFF',
    fontWeight: '700',
    alignItems: 'center',
    marginTop: 0,
    paddingBottom: 0,
    width: 170,
    marginBottom: 20
  }
})
