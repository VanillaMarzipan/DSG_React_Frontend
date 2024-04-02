/* eslint-disable no-mixed-operators */
import { createRef, Component, RefObject } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import Item from './Item'
import LoyaltyMiniViewController from './loyalty/LoyaltyMiniViewController'
import { connect } from 'react-redux'
import { deleteItem, editItemPriceWithManagerOverride } from '../actions/transactionActions'
import { addWarrantiesToTransaction, getWarranties } from '../actions/warrantyActions'
import { backToHome, checkForLoading, completeTransaction, receiveUiData, selectItem } from '../actions/uiActions'
import PauseSvg from './svg/PauseSvg'
import TransactionTotals from './TransactionTotals'
import { ThemeTypes } from '../reducers/theme'
import { DisplayItemType, TransactionDataTypes } from '../reducers/transactionData'
import { UiDataTypes } from '../reducers/uiData'
import { WarrantyDataTypes, WarrantySelectionsType } from '../reducers/warrantyData'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { updateAnalyticsData } from '../actions/analyticsActions'
import { AnalyticsData } from '../reducers/analyticsData'
import { clearCustomer } from '../actions/loyaltyActions'
import { LoyaltyDataTypes } from '../reducers/loyaltyData'
import { AssociateDataTypes } from '../reducers/associateData'
import { setNsppSellingAssociateId } from '../utils/coordinatorAPI'
import { endPinPadSurvey } from '../utils/cefSharp'
import ReceiptCard from './ReceiptCard'
import { FeatureFlagDataTypes, featureFlagEnabled } from '../reducers/featureFlagData'
import GiftCardItem from './GiftCardItem'
import { Dispatch } from 'redux'
import { AppDispatch } from '../Main'
import { AppThunk } from '../reducers'
import IconAboveTextButton from './reusable/IconAboveTextButton'
import CloseSvg from './svg/CloseSvg'
import PercentSvg from './svg/PercentSvg'
import { checkIfItemListContainsGiftcard } from '../utils/transactionHelpers'
import { sendAppInsightsMetric, sendAppInsightsPageView } from '../utils/appInsights'
import { getSurveyConfiguration } from '../actions/surveyActions'

interface TransactionsCardProps {
  transactionData: TransactionDataTypes
  scannedItems: DisplayItemType[]
  change: boolean
  uiData: UiDataTypes
  theme: ThemeTypes
  completeTransaction: () => void
  getWarranties: (boolean) => void
  deleteItem: (transactionId: number) => void
  editItemPrice: (itemId: number, itemPrice: string, everydayPrice: string | number, promptForPrice: boolean, isManager: boolean) => Dispatch<AppDispatch>
  backToHome: () => void
  selectItem: (itemId: string | number) => void
  warrantyData: WarrantyDataTypes
  analyticsData: AnalyticsData
  updateAnalyticsData: (data: AnalyticsData, actionType: string) => { type: string; data: AnalyticsData }
  addWarrantiesToTransaction: (warrantySelection: WarrantySelectionsType, completeTransaction, isReturnTransaction) => void
  loyaltyData: LoyaltyDataTypes
  clearCustomer: (altScreenName?: string, lastItem?: string | number) => void
  receiveUiData: (data: UiDataTypes) => AppThunk
  associateData: AssociateDataTypes
  featureFlagData: FeatureFlagDataTypes
}

class TransactionsCard extends Component<TransactionsCardProps> {
  public static propTypes = {}
  public itemsContainer: RefObject<FlatList>

  constructor (props) {
    super(props)
    this.itemsContainer = createRef()
  }

  state = {
    phoneOutput: '',
    focus: false,
    disabled: false,
    priceEditQueue: [],
    receiptOptionSelected: false
  }

  /**
   * Find index of selected item
   * @param {number} selectedItem Transaction ID of selectedItem
   * @returns {number} Index of selected item
   */
  getIndexOfItem = (selectedItem: string | number): number => {
    let val = 0
    for (let i = 0; i < this.props.transactionData.items?.length; i++) {
      if (
        this.props.transactionData.items[i].transactionItemIdentifier ===
        selectedItem
      ) {
        val = i
        break
      }
    }
    return val
  }

  isTradeInItem = (transactionItemIdentifier: string | number) : boolean => {
    for (let i = 0; i < this.props.transactionData?.originalSaleInformation?.length; i++) {
      if (this.props.transactionData.originalSaleInformation[i].returnOriginationType === 5) {
        for (let j = 0; j < this.props.transactionData.originalSaleInformation[i].returnItems.length; j++) {
          if (this.props.transactionData.originalSaleInformation[i].returnItems[j].transactionItemIdentifier === transactionItemIdentifier) {
            return true
          }
        }
      }
    }
    return false
  }

  // On mount, if there are not items or any items do not have a unit price, disable complete button
  componentDidMount () {
    // Retrieve a survey to use at the end of this transaction
    getSurveyConfiguration()
    if (this.props.transactionData?.items?.length > 0 || this.props.transactionData?.originalSaleInformation) {
      this.props.transactionData.items.some(i =>
        (!Object.prototype.hasOwnProperty.call(i, 'unitPrice') && !Object.prototype.hasOwnProperty.call(i, 'amount')) ||
        (Object.prototype.hasOwnProperty.call(i, 'unitPrice') && i.unitPrice === null) ||
        (Object.prototype.hasOwnProperty.call(i, 'amount') && i.amount === null)) &&
      this.setState({ disabled: true })
    } else {
      this.setState({ disabled: true })
    }
  }

  componentDidUpdate (prevProps) {
    // Auto scroll to bottom of list when a new item is added
    if (prevProps.scannedItems?.length < this.props.scannedItems?.length) {
      setTimeout(
        () => !this.props.change && this.itemsContainer?.current?.scrollToEnd(),
        100
      )
    }
    // On component update, enable complete button if there is at least one item on the transaction and all items have a unitPrice.
    if (!this.state.disabled) {
      if (this.props.transactionData?.items?.length > 0 || this.props.transactionData?.originalSaleInformation) {
        this.props.transactionData.items.some(i =>
          (!Object.prototype.hasOwnProperty.call(i, 'unitPrice') && !Object.prototype.hasOwnProperty.call(i, 'amount')) ||
          (Object.prototype.hasOwnProperty.call(i, 'unitPrice') && i.unitPrice === null) ||
          (Object.prototype.hasOwnProperty.call(i, 'amount') && i.amount === null)) &&
        this.setState({ disabled: true })
      } else {
        this.setState({ disabled: true })
      }
    } else {
      (this.props.transactionData?.originalSaleInformation || this.props.transactionData?.items?.length > 0) &&
      (
        this.props.transactionData?.items?.length < 1 ||
        this.props.transactionData.items.every(i => {
          return (
            (Object.prototype.hasOwnProperty.call(i, 'unitPrice') && i.unitPrice !== null) ||
            (Object.prototype.hasOwnProperty.call(i, 'amount') && i.amount !== null)
          )
        })) &&
      this.setState({ disabled: false })
    }
    // Scroll to selected item when component updates if there are warrantySelections and if the previous selected item does not equal the current selected item
    if (
      this.props.warrantyData.warrantySelections &&
      prevProps.uiData.selectedItem !== this.props.uiData.selectedItem
    ) {
      this?.itemsContainer?.current &&
      this.itemsContainer.current.scrollToIndex({
        index: this.getIndexOfItem(this.props.uiData.selectedItem)
      })
    }
  }

  /**
   * If on warranty panel, add selected warranties and send analytics data, else get warranty options for items on transaction
   */
  handleComplete = (): void => {
    endPinPadSurvey()
    if (this.props.loyaltyData.isNoAccountFound) {
      this.props.clearCustomer(this.props.loyaltyData.altScreenName, this.props.uiData.lastItem)
    }
    if (this.props.uiData.activePanel === 'warrantyPanel') {
      const isReturnTransaction = 'originalSaleInformation' in this.props.transactionData
      this.props.addWarrantiesToTransaction(
        this.props.warrantyData.warrantySelections,
        true,
        isReturnTransaction
      )

      let associateId = this.props.associateData.associateId
      if (this.props.associateData.nsppSellingAssociate) {
        associateId = this.props.associateData.nsppSellingAssociate.associateId
      }
      try {
        setNsppSellingAssociateId(associateId)
      } catch (error) {
        console.error('error setting nspp selling associate ID: ' + JSON.stringify(error))
      }

      if (
        !this.props.analyticsData.warrantyPanelViewed &&
        this.props.warrantyData.warrantySelections
      ) {
        const warrantyPanelViewStartTime = this.props.analyticsData
          .warrantyPanelViewStartTime
        const warrantyPanelViewLeaveTime = new Date().getTime() / 1000
        const secondsSpentOnWarrantyPanel = Number(warrantyPanelViewLeaveTime) - Number(warrantyPanelViewStartTime)

        const warrantyDataForRumRunner = {}
        const warrantySelections = this.props.warrantyData.warrantySelections

        for (const itemId in warrantySelections) {
          warrantyDataForRumRunner[warrantySelections[itemId].warrantySku] = warrantySelections[itemId].warrantyDescription
        }
        sendRumRunnerEvent(
          'Time Spent on WarrantyPanel and Warranties Purchased',
          {
            f_screenTime: Number(secondsSpentOnWarrantyPanel).toFixed(2),
            warrantiesPurchased: warrantySelections
          }
        )
        sendAppInsightsPageView(
          'Transaction',
          'WarrantyPanel',
          {
            duration: secondsSpentOnWarrantyPanel * 1000,
            warrantiesPurchased: warrantySelections
          }
        )
      }

      updateAnalyticsData(
        {
          warrantyModalClicks: 0,
          warrantyPanelViewed: true
        },
        'UPDATE_ANALYTICS_DATA'
      )

      sendRumRunnerEvent('Total Warranty Modal Clicks', {
        warrantyModalClicks: this.props.analyticsData.warrantyModalClicks
      })
      sendAppInsightsMetric('WarrantyModalClicks', this.props.analyticsData.warrantyModalClicks)
    } else {
      const isReturnTransaction = 'originalSaleInformation' in this.props.transactionData
      this.props.getWarranties(isReturnTransaction)
    }
  }

  /**
   * Total all applied discounts
   * @returns {number} total applied discounts as a negative number
   */
  calculateDiscount = (): number => {
    let discountTotal = 0
    this.props.transactionData.items?.forEach(item => {
      const appliedDiscounts = item.appliedDiscounts
      appliedDiscounts && appliedDiscounts.forEach(discount => {
        if (discount.couponCode || discount.rewardCertificateNumber) {
          discountTotal = discountTotal - discount.discountAmount
        }
      })

      const associatedItems = item.associatedItems
      associatedItems && associatedItems.forEach(associatedItem => {
        const appliedDiscount = associatedItem.appliedDiscounts
        appliedDiscount && appliedDiscount.forEach(associatedItemDiscount => {
          if (associatedItemDiscount.couponCode || associatedItemDiscount.rewardCertificateNumber) {
            discountTotal = discountTotal - associatedItemDiscount.discountAmount
          }
        })
      })
    })

    return discountTotal
  }

  handlePriceEditQueue = (action, itemID?) => {
    const clone = this.state.priceEditQueue.slice(0)
    if (action === 'dequeue') {
      clone.shift()
    } else if (action === 'queue') {
      clone.unshift(itemID)
    }
    this.setState({ priceEditQueue: clone })
    if (clone?.length === 1 && action === 'queue') {
      setTimeout(() => {
        this.props.receiveUiData({
          priceEditActive: true
        })
      })
    } else if (clone?.length === 0 && action === 'dequeue') {
      this.props.receiveUiData({
        priceEditActive: false
      })
    }
  }

  renderCell = ({ index, style, ...props }) => {
    return <View style={[style, { zIndex: -index }]} {...props}/>
  }

  render () {
    const {
      change,
      scannedItems,
      theme,
      transactionData,
      uiData,
      deleteItem,
      editItemPrice,
      warrantyData,
      loyaltyData
    } = this.props
    const transactionContainsGiftcard = checkIfItemListContainsGiftcard(this.props.transactionData?.items)
    const disableVoidButton = uiData.loadingStates.omniSearch !== null || uiData.loadingStates.deleteItem !== null || uiData.loadingStates.giftCardActivation
    return (
      <View
        testID='transaction-card'
        nativeID='transaction-card'
        style={[
          styles.root,
          { backgroundColor: theme.transactionCardBackground }
        ]}
      >
        <View style={styles.titleContainer}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              paddingBottom: 16,
              color: theme.fontColor
            }}
          >
            {uiData.activePanel !== 'changePanel' || this.state.receiptOptionSelected === true ? 'Sale Transaction' : 'Receipt Options'}
          </Text>

          <View
            style={styles.headerButtonsContainer}
          >
            {featureFlagEnabled('ManualTransactionDiscount') &&
            uiData.activePanel === 'scanDetailsPanel' &&
            transactionData?.items?.length > 0 &&
            transactionData?.tenders?.length === 0 &&
            <IconAboveTextButton
              testId='manual-transaction-discount'
              buttonTextStyle={{
                marginTop: 6,
                marginBottom: 2
              }}
              disabled={uiData.loadingStates.omniSearch !== null}
              buttonText='DISCOUNT'
              style={[styles.suspendButton, { width: 90 }]}
              onPress={() => { this.props.receiveUiData({ showModal: 'manualTransactionDiscount' }) }}
              icon={<PercentSvg style={{ marginTop: 0 }} disabled={uiData.loadingStates.omniSearch !== null} />}
            />
            }
            {uiData.activePanel === 'scanDetailsPanel' &&
            transactionData?.header?.transactionType === 1 &&
            transactionData?.items?.length > 0 &&
            transactionData?.tenders?.length === 0 &&
            <IconAboveTextButton
              testId='suspend-button'
              disabled={uiData.loadingStates.omniSearch !== null || transactionContainsGiftcard}
              style={styles.suspendButton}
              buttonTextStyle={{
                marginTop: 8,
                marginBottom: 2
              }}
              onPress={() => {
                this.props.receiveUiData({
                  showModal: 'suspend',
                  footerOverlayActive: 'None'
                })
              }}
              icon={<PauseSvg style={{ marginBottom: -2 }} disabled={uiData.loadingStates.omniSearch !== null || transactionContainsGiftcard} />}
              buttonText='SUSPEND'
            />}
            {uiData.activePanel !== 'changePanel' &&
            (uiData.activePanel !== 'creditPanel' || uiData.creditPanelError) &&
            transactionData?.tenders?.length === 0 &&
            !(transactionData?.header?.transactionStatus === 0 && loyaltyData.isNoAccountFound) &&
            <IconAboveTextButton
              testId='void-button'
              disabled={disableVoidButton}
              style={{
                width: 30,
                marginLeft: 20
              }}
              buttonTextStyle={{
                marginTop: 0,
                marginBottom: 2,
                color: '#AB2635'
              }}
              icon={<CloseSvg color={disableVoidButton ? '#C8C8C8' : '#AB2635'}/>}
              buttonText='VOID'
              onPress={() => {
                this.props.receiveUiData({
                  showModal: 'void',
                  footerOverlayActive: 'None'
                })
              }}
            />}
          </View>
        </View>
        <View
          style={{
            borderColor: '#979797',
            borderTopWidth: 1,
            marginHorizontal: 32
          }}
        >
        </View>

        {uiData.activePanel !== 'changePanel' &&
          (uiData.activePanel !== 'creditPanel' || uiData.creditPanelError) &&
            <LoyaltyMiniViewController tenders={transactionData.tenders ? transactionData.tenders : []}/>}

        <View style={styles.itemContainer}>
          {uiData.activePanel === 'changePanel'
            ? (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1
                }}
              >
                <ReceiptCard
                  loyaltyData={loyaltyData}
                  theme={theme}
                />

              </View>
            )
            : (
              <>
                {((scannedItems?.length > 0) || (transactionData?.originalSaleInformation)) && (
                  <FlatList
                    ref={this.itemsContainer}
                    data={
                      transactionData?.originalSaleInformation
                        ? (
                          [...transactionData.originalSaleInformation[0].returnItems, ...scannedItems]
                        )
                        : (
                          scannedItems
                        )
                    }
                    extraData={{ transactionData, uiData }}
                    keyExtractor={(item, index) => index.toString() + item.upc}
                    CellRendererComponent={this.renderCell}
                    renderItem={({ item, index }) => (
                    // TODO: have a better flag to key off of than description matching
                      (!item.description)
                        ? <GiftCardItem
                          item={item}
                          msrAccountNumber={uiData.giftCardAccountNumber}
                          msrExpiryDate={uiData.giftCardExpirationDate}
                          nextSelectionId={
                            (item && (item.transactionItemIdentifier !== uiData.selectedItem))
                              ? uiData.selectedItem
                              : scannedItems?.length > 1
                                ? scannedItems[index === 0 ? 1 : index - 1]?.transactionItemIdentifier
                                : null
                          }
                          index={index}
                          theme={theme}
                          priceEditQueue={this.state.priceEditQueue}
                          handlePriceEditQueue={this.handlePriceEditQueue}
                          loading={uiData.loadingStates.deleteItem === item.transactionItemIdentifier}
                          disableDeleteItem={checkForLoading(uiData.loadingStates) || (this.state.priceEditQueue.length > 0 && this.state.priceEditQueue[0] !== item.transactionItemIdentifier)}
                          complete={uiData.activePanel !== 'scanDetailsPanel'}
                        />
                        : <Item
                          returnItem={item.returnItem || item.lineNumber !== undefined}
                          damaged={item.returnItem ? item.damaged : false}
                          index={index}
                          theme={theme}
                          itemName={item.description}
                          price={item.returnPrice}
                          originalUnitPrice={item.originalUnitPrice}
                          everydayPrice={item.everydayPrice}
                          overridePrice={item.overridePrice}
                          priceOverridden={item.priceOverridden}
                          giftReceipt={item.giftReceipt}
                          upc={item.upc}
                          quantity={item.quantity}
                          complete={uiData.activePanel !== 'scanDetailsPanel'}
                          addBorder={
                            uiData.selectedItem === item.transactionItemIdentifier
                          }
                          scrollToNikePopupInView={() => this.itemsContainer?.current?.scrollToOffset({ offset: index * 84 })}
                          disableDeleteItem={checkForLoading(uiData.loadingStates) || (this.state.priceEditQueue.length > 0 && this.state.priceEditQueue[0] !== item.transactionItemIdentifier)}
                          deleteItem={deleteItem}
                          editItemPrice={editItemPrice}
                          isManager={this.props.associateData?.isManager}
                          itemTransactionId={item.transactionItemIdentifier}
                          isTradeIn={this.isTradeInItem(item.transactionItemIdentifier)}
                          priceIsNull={
                            (item.sequenceNumber !== undefined && item.sequenceNumber >= 0)
                              ? false
                              : (
                                !Object.prototype.hasOwnProperty.call(item, 'unitPrice') || item.unitPrice === null
                              )
                          }
                          // nextSelectionId is needed for when items are deleted in the receipt pane
                          // it is used as the item to switch to after the delete
                          // -----------
                          // if the current scanned item is NOT the selected item, then make the next selection the selected item
                          // otherwise, if we have multiple scanned items, then if its the first item, make the next selection the next item
                          // if the scanned item is selected and is the first item in the pane, make the next item selected
                          // else make the previous item selected
                          nextSelectionId={
                            (item && (item.transactionItemIdentifier !== uiData.selectedItem))
                              ? uiData.selectedItem
                              : scannedItems?.length > 1
                                ? scannedItems[index === 0 ? 1 : index - 1]?.transactionItemIdentifier
                                : null
                          }
                          warranty={item.associatedItems || []}
                          warrantySelections={
                            Object.prototype.hasOwnProperty.call(
                              warrantyData,
                              'warrantySelections'
                            ) &&
                          warrantyData.warrantySelections[item.transactionItemIdentifier]
                          }
                          appliedDiscounts={item.appliedDiscounts}
                          priceEditQueue={this.state.priceEditQueue}
                          handlePriceEditQueue={this.handlePriceEditQueue}
                          promptForPrice={item.promptForPrice}
                          sellingAssociateId={item.sellingAssociateId}
                          attributes={item.attributes}
                        />
                    )}
                  />
                )}
              </>
            )}
        </View>
        {uiData.activePanel !== 'changePanel' && <TransactionTotals
          taxSummaries={transactionData?.total?.taxSummaries}
          subTotal={transactionData.total && transactionData.total.subTotal}
          discounts={this.calculateDiscount()}
          tax={transactionData.total && transactionData.total.tax}
          grandTotal={transactionData.total && transactionData.total.grandTotal}
          theme={theme}
          change={change}
          triplePointsApplied={
            transactionData.rewardCertificates?.some(
              reward => reward?.rewardTypeDescription === 'PickYourPointsOffer'
            )
          }
          taxExempt={transactionData.isTaxExempt}
        />}

        <View style={styles.buttonContainer}>
          {(uiData.activePanel === 'warrantyPanel' ||
            uiData.activePanel === 'scanDetailsPanel') && (
            <TouchableOpacity
              testID='complete-transaction'
              style={[
                styles.button,
                (this.state.disabled || checkForLoading(uiData.loadingStates) || uiData.pinpadPhoneEntryEnabled) && styles.buttonDisabled
              ]}
              onPress={() => {
                console.info('ACTION: components > TransactionsCard > onPress')
                this.handleComplete()
              }}
              disabled={this.state.disabled || checkForLoading(uiData.loadingStates) || uiData.pinpadPhoneEntryEnabled}
            >
              {uiData.loadingStates.complete
                ? (
                  <ActivityIndicator color='#ffffff'/>
                )
                : (
                  <Text
                    style={[
                      styles.buttonText,
                      (this.state.disabled || checkForLoading(uiData.loadingStates)) && styles.buttonDisabledText
                    ]}
                  >
                  Complete
                  </Text>
                )}
            </TouchableOpacity>
          )}
          {change && uiData.showNewTransactionButton
            ? (
              <TouchableOpacity
                testID='new-transaction-button'
                style={styles.button}
                onPress={() => {
                  console.info('ACTION: components > TransactionsCard > onPress (new transaction button)')
                  this.props.backToHome()
                }}
              >
                <Text style={styles.buttonText}>New Transaction</Text>
              </TouchableOpacity>
            )
            : null}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
    marginTop: 31,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginLeft: 16,
    borderRadius: 3,
    maxHeight: 638,
    minHeight: 638
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    minHeight: 57,
    flexDirection: 'row',
    paddingHorizontal: 32
  },
  imgPlaceholder: {
    height: 63,
    width: 99,
    margin: 10
  },
  textField: {
    marginLeft: 16,
    flex: 1
  },
  itemContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60
  },
  button: {
    width: '100%',
    height: 62,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  buttonDisabled: {
    backgroundColor: '#d8d8d8d8'
  },
  buttonDisabledText: {
    color: '#6e6e6e'
  },
  receiptPrintedText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  emailReceiptButton: {
    width: '65%',
    height: 44,
    backgroundColor: '#BB5811',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 47
  },
  printReceiptButtonContainer: {
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  printReceiptButton: {
    width: '55%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#BB5811',
    borderBottomWidth: 4,
    marginTop: 87
  },
  printReceiptButtonText: {
    fontSize: 14,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    color: '#191F1C',
    lineHeight: 20,
    paddingTop: 18
  },
  columnContainer: {
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  promptText: {
    fontSize: 16,
    color: '#000000'
  },
  textBox: {
    minWidth: 325,
    height: 52,
    marginTop: 47,
    borderRadius: 1,
    fontSize: 14
  },
  suspendButton: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-end',
    display: 'flex'
  },
  headerButtonsContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
})

TransactionsCard.propTypes = {
  change: PropTypes.bool,
  scannedItems: PropTypes.array,
  uiData: PropTypes.object,
  transactionData: PropTypes.object,
  theme: PropTypes.object,
  completeTransaction: PropTypes.func,
  deleteItem: PropTypes.func,
  editItemPrice: PropTypes.func,
  backToHome: PropTypes.func,
  selectItem: PropTypes.func,
  getWarranties: PropTypes.func,
  warrantyData: PropTypes.object,
  analyticsData: PropTypes.object,
  addWarrantiesToTransaction: PropTypes.func,
  loyaltyData: PropTypes.object,
  associateData: PropTypes.object
}

const mapStateToProps = state => ({
  uiData: state.uiData,
  transactionData: state.transactionData,
  theme: state.theme,
  warrantyData: state.warrantyData,
  analyticsData: state.analyticsData,
  loyaltyData: state.loyaltyData,
  associateData: state.associateData
})

const mapDispatchToProps = {
  completeTransaction,
  deleteItem,
  editItemPrice: editItemPriceWithManagerOverride,
  backToHome,
  selectItem,
  getWarranties,
  addWarrantiesToTransaction,
  updateAnalyticsData,
  clearCustomer,
  receiveUiData
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsCard)
