class elements {
  //  login page elements
  login() {
    return cy.get('[data-testid=associate-num]')
  }

  loginBorder() {
    return cy.get('[data-testid=associate-num-border]')
  }

  pin() {
    return cy.get('[data-testid=associate-pin]')
  }

  loginSubmit() {
    return cy.get('[data-testid=login-submit]')
  }

  cashDrawerOpenTitleModal() {
    return cy.get('[data-testid="modal-title-cashDrawerOpen"]')
  }

  cashDrawerOpenModal() {
    return cy.get('[data-testid=cash-drawer-open-modal]')
  }

  //  Omni scan page elemenets
  dsgLogo() {
    return cy.get('[data-testid="dsg-logo"]')
  }

  storeNumber() {
    return cy.get('[data-testid="store-number"]')
  }

  registerNumber() {
    return cy.get('[data-testid="register-number"]')
  }

  posMode() {
    return cy.get('[data-testid="pos-mode"]')
  }

  reactBuild() {
    return cy.get('[data-testid="react-build-number"]')
  }

  launcherBuild() {
    return cy.get('[data-testid="launcher-build-number"]')
  }

  helpButton() {
    return cy.get('[data-testid="help-button"]')
  }

  gettingStarted() {
    return cy.get('[data-testid="getting-started"]')
  }

  gettingStartedModal() {
    return cy.get('[data-testid="modal-title-gettingStarted"]')
  }

  breadcrumb(breadcrumbNumber) {
    return cy.get(`[data-testid="breadcrumb-${breadcrumbNumber}"]`)
  }

  gettingStartedNextButton() {
    return cy.get('[data-testid="next-button-getting-started"]')
  }

  gettingStartedCloseButton() {
    return cy.get('[data-testid="modal-close-button-gettingStarted"]')
  }

  gettingStartedModalJustAddedSection() {
    return cy.contains('JUST ADDED!').should('be.visible')
  }

  gettingStartedModalUseNCRSection() {
    return cy.contains('USE NCR WHEN...').should('be.visible')
  }

  gettingStartedModalWhatToExpectWithMetricsSection() {
    return cy.contains('What to expect with Metrics').should('be.visible')
  }

  gettingStartedModalContactServiceDesk() {
    return cy.contains('If you are having a technical problem on the register, please contact the Service Desk at 866-418-3456.').should('be.visible')
  }

  omniScan() {
    return cy.get('#scan')
  }

  omniScanBorder() {
    return cy.get('[data-testid=undefined-border]')
  }

  scanSubmit() {
    return cy.get('[data-testid=submit]')
  }

  scanPanel() {
    return cy.get('#scan-panel')
  }

  registerFunctions() {
    return cy.get('[data-testid=register-functions]')
  }

  closeRegister() {
    return cy.get('[data-testid=close-register]')
  }

  confirmCloseRegister() {
    return cy.get('[data-testid=confirm-close-register]')
  }

  noSaleButton() {
    return cy.get('[data-testid="no-sale"]')
  }

  connectPinpadButton() {
    return cy.get('[data-testid="connect-pinpad-button"]')
  }

  receiptOptions() {
    return cy.get('[data-testid=receipt-options]')
  }

  reprintLastReceiptButton() {
    return cy.get('[data-testid=reprint-receipt]')
  }

  giftReceiptButton() {
    return cy.get('[data-testid=add-a-gift-receipt]')
  }

  giftReceiptButtonText() {
    return cy.get('[data-testid="gift-receipt"]')
  }

  teammateButton() {
    return cy.get('[data-testid="teammate-footer"]')
  }

  addTeammateToSaleButton() {
    return cy.get('[data-testid="add-teammate-to-sale"]')
  }
  addAssociateDiscountButton() {
    return cy.get('[data-testid="add-associate-discount"]')
  }

  addAssociateDiscountModal() {
    return cy.get('[data-testid="modal-title-addAssociateDiscount"]')
  }

  addAssociateDiscountModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-addAssociateDiscount"]')
  }
  addAssociateDiscountInputBox() {
    return cy.get('[data-testid="add-associate-discount-input"]')
  }
  addAssociateDiscountSubmitButton() {
    return cy.get('[data-testid="submit-add-associate-discount"]')
  }
  associateDiscountAddedIcon() {
    return cy.get('[data-testid="associateDiscount-icon"]')
  }
  addAssociateDiscountPanel() {
    return cy.get('[data-testid="associateDiscount-panel"]')
  }
  addAssociateDiscountDesription() {
    return cy.get('[data-testid="discount-description00"]')
  }
  addAssociateDiscountIcon() {
    return cy.get('[data-testid="associateDiscount-icon"]')
  }

  discountAmount() {
    return cy.get('[data-testid="discount-amount00"]')
  }

  sapModalHeader() {
    return cy.contains('ADD TEAMMATE TO SALE')
  }

  sapModalCloseButton() {
    return cy.get('[data-testid="close-item-level-sap"]')
  }

  sapModalDescription() {
    return cy.contains('Scan SAP barcode or insert associate number')
  }

  sapModalItemEntryField() {
    return cy.get('[data-testid=item-level-sap-input]')
  }

  sapModalItemEntryFieldBorder() {
    return cy.get('[data-testid=item-level-sap-input-border]')
  }

  sapModalItemEntrySubmitButton() {
    return cy.get('[data-testid="item-sap-enter-button"]')
  }

  sapModalAddItemsHeader() {
    return cy.contains('ADD ITEMS')
  }

  sapModalAddItemsDescription() {
    return cy.contains('Scan or input UPC for items that 9876543 Jane Manager sold')
  }

  sapItemAddedVerbiage() {
    return cy.contains('Sold by Jane Manager')
  }

  sapAddItemToSaleButton() {
    return cy.get('[data-testid="item-sap-add-to-sale"]')
  }

  footerMenuOverlay() {
    return cy.get('[data-testid=footer-menu-overlay]')
  }

  giftReceiptsSelectAllOption() {
    return cy.get('[data-testid=select-all-gift-receipts]')
  }

  giftReceiptSelectItem1() {
    return cy.get('[data-testid=check-box-1]')
  }

  giftReceiptSelectItem2() {
    return cy.get('[data-testid=check-box-2]')
  }

  giftReceiptSelectItem3() {
    return cy.get('[data-testid=check-box-3]')
  }

  giftReceiptConfirmSingleButton() {
    return cy.get('[data-testid=confirm-single-gift-receipt]')
  }

  giftReceiptConfirmSeparateButton() {
    return cy.get('[data-testid="confirm-separate-gift-receipts"]')
  }

  giftReceiptSelectedIndicator1() {
    return cy.get('[data-testid=gift-receipt-selected-indicator-1]')
  }

  giftReceiptSelectedIndicator2() {
    return cy.get('[data-testid=gift-receipt-selected-indicator-2]')
  }

  giftReceiptSelectedIndicator3() {
    return cy.get('[data-testid=gift-receipt-selected-indicator-3]')
  }

  reprintGiftReceiptButton() {
    return cy.get('[data-testid="reprint-gift-receipt"]')
  }

  reprintGiftReceiptCloseButton() {
    return cy.get('[data-testid="close-reprint-gift-receipt-panel"]')
  }

  reprintGiftReceiptNextButton() {
    return cy.get('[data-testid="reprint-gift-receipt-lookup-barcode-button"]')
  }

  reprintGiftReceiptInputBox() {
    return cy.get('[data-testid="identification-number-text-input"]')
  }

  reprintReceiptWrongDateError() {
    return cy.contains('Barcode date is not for today')
  }

  reprintReceiptWrongStoreError() {
    return cy.contains('Claim store number / register number does not match bar code store number / register number')
  }

  reprintReceiptTransactionError() {
    return cy.contains('Transaction is not eligible for gift receipts')
  }

  oneItemPerGiftReceiptButton() {
    return cy.get('[data-testid="reprint-one-item-per-gift-receipt-button"]')
  }

  singleGiftReceiptButton() {
    return cy.get('[data-testid="reprint-single-gift-receipt-button"]')
  }

  selectItemsForGiftReceiptButton() {
    return cy.get('[data-testid="select-items-for-gift-receipt"]')
  }

  giftCardFooterButton() {
    return cy.get('[data-testid="gift-card-balance-inquiry-footer"]')
  }

  activateGiftCardButton() {
    return cy.get('[data-testid="create-gift-card"]')
  }

  giftCardSaleButton() {
    return cy.get('[data-testid="sell-gift-card"]')
  }

  giftCardCustomerServiceButton() {
    return cy.get('[data-testid="customer-service"]')
  }

  giftCardHighFiveButton() {
    return cy.get('[data-testid="high-five"]')
  }

  activateGiftCardModalTitle() {
    return cy.get('[data-testid="modal-title-createGiftCard"]')
  }

  activateGiftCardModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-createGiftCard"]')
  }

  activateGiftCardAmountInput() {
    return cy.get('[data-testid="giftCard-amount-inputBox"]')
  }

  activateGiftCardConfirmButton() {
    return cy.get('[data-testid="confirm-complimentary-giftcard"]')
  }

  activateGiftCardCompleteButton() {
    return cy.get('[data-testid="complete-complimentary-giftcard"]')
  }

  activateGiftCardAmountPageCustomerServiceText() {
    return cy.contains('Customer Service')
  }

  activateGiftCardAmountPageHighFiveText() {
    return cy.contains('High Five')
  }

  complementartGiftCardErrorMessage() {
    return cy.contains('Sorry, something went wrong. Please try again. If problem persists, please try another gift card.')
  }

  complementartGiftCardSuccessMessage() {
    return cy.contains('Gift card was successfully created.')
  }

  complementaryGiftCardCompletePageSubHeader() {
    return cy.get('[data-testid="complimentary-giftcard-sub-header"]')
  }

  complementaryGiftCardSuccessPageAmount() {
    return cy.get('[data-testid="complimentary-giftcard-amount"]')
  }

  giftCardBalanceInquiryFooterButton() {
    return cy.get('[data-testid="gift-card-balance-inquiry"]')
  }
  giftCardBalanceInquiryModal() {
    return cy.get('[data-testid="modal-title-giftCardBalanceInquiry"]')
  }

  giftCardBalanceInquiryModalText() {
    return cy.contains('Have athlete swipe giftcard on the pinpad to check balance')
  }

  giftCardBalanceInquiryModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-giftCardBalanceInquiry"]')
  }
  
  sellGiftCardModalText() {
    return cy.get('[data-testid="sell-gift-card-modal"]')
  }
  
  returnsFooterButton() {
    return cy.get('[data-testid=returns-footer]')
  }

  confirmReturnsButton() {
    return cy.get('[data-testid=confirm-returns]')
  }

  returnGenericNumberEntryField() {
    return cy.get('[data-testid=returns-re-ph-num]')
  }

  returnGenericNumberEntryFieldBorder() {
    return cy.get('[data-testid=returns-re-ph-num-border]')
  }

  noReceiptReturnLink() {
    return cy.contains('No Receipt Available')
  }

  noReceiptReturnModalHeader() {
    return cy.contains('Return Items - No Receipt')
  }

  noReceiptReturnsDisclaimer() {
    return cy.contains('Returns with no receipt will default to the lowest selling price')
  }

  barcodeNotAvailableLink() {
    return cy.contains('No Barcode Available')
  }

  noReceiptReturnNextButton() {
    return cy.contains('Next')
  }

  noReceiptManualInputField() {
    return cy.get('#no-receipt-manual-input')
  }

  returnSelectedItems() {
    return cy.get('[data-testid=confirm-returns]')
  }

  noReceiptReturnItem1() {
    return cy.get('[data-testid="check-box-return0"]')
  }

  noReceiptReturnItem2() {
    return cy.get('[data-testid="check-box-return1"]')
  }
  noReceiptReturnModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-returnsAuthorization"]')
  }
  returnModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-returns"]')
  }
  returnItemRow1() {
    return cy.get('[data-testid="item-row"]')
  }

  returnItem1() {
    return cy.get('[data-testid=check-box-return-10]')
  }

  returnItem2() {
    return cy.get('[data-testid=check-box-return-20]')
  }

  returnItem3() {
    return cy.get('[data-testid=check-box-return-30]')
  }

  returnDamagedCheckbox1() {
    return cy.get('[data-testid=check-box-damaged--10]')
  }

  returnDamagedCheckbox2() {
    return cy.get('[data-testid=check-box-damaged--20]')
  }

  returnDamagedCheckbox3() {
    return cy.get('[data-testid=check-box-damaged--30]')
  }

  returnDamagedIndicator1() {
    return cy.get('[data-testid=damaged-indicator-item-0]')
  }

  returnDamagedIndicator2() {
    return cy.get('[data-testid=damaged-indicator-item-1]')
  }

  returnDamagedIndicator3() {
    return cy.get('[data-testid=damaged-indicator-item-3]')
  }

  feedback() {
    return cy.get('[data-testid=feedback-modal-button]')
  }

  feedbackLearnMoreButton(){
    return cy.get('[data-testid="feedback-getting-started-modal"]')
  }

  postVoid() {
    return cy.get('[data-testid=post-void]')
  }

  postVoidLastTransaction() {
    return cy.contains('POST-VOID LAST TRANSACTION')
  }

  postVoidEnhancedCancel() {
    return cy.get('[data-testid="cancel-enhanced-post-void"]')
  }

  postVoidModalTitle() {
    return cy.get('[data-testid="modal-title-PostVoid"]')
  }

  postVoidModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-PostVoid"]')
  }

  postVoidModalReceiptLookup() {
    return cy.get('[data-testid="credit-enrollment-lookup-input"]')
  }

  postVoidEnhancedConfirmButton() {
    return cy.get('[data-testid="confirm-enhanced-post-void"]')
  }

  yesPostVoidButton() {
    return cy.get('[data-testid=submit-button]')
  }

  noCancelPostVoidButton() {
    return cy.get('[data-testid=cancel-button]')
  }

  signout() {
    return cy.get('[data-testid=logout]')
  }

  //  Transaction card
  transactionCard() {
    return cy.get('#transaction-card')
  }

  voidButton() {
    return cy.get('[data-testid=void-button]')
  }

  suspendButton() {
    return cy.get('[data-testid=suspend-button]')
  }

  loyaltyLookupField() {
    return cy.get('[data-testid=loyalty-phone-lookup]')
  }

  loyaltyLookupFieldBorder() {
    return cy.get('[data-testid=loyalty-phone-lookup-border]')
  }

  loyaltyMiniController() {
    return cy.get('[data-testid=loyalty-mini-controller]')
  }

  loyaltySelectedAthlete() {
    return cy.get('[data-testid=loyalty-select-athlete]')
  }

  loyaltyGoldTier() {
    return cy.get('[data-testid=gold-card]')
  }

  loyaltyPointsBalance() {
    return cy.get('[data-testid=points-balance]')
  }
  loyaltyLookupByName() {
    return cy.get('[data-testid="loyalty-lookup-name"]')
  }

  loyaltyClearButton() {
    return cy.get('[data-testid=loyalty-clear-button]')
  }

  basicRewardCard() {
    return cy.get('[data-testid=basic-card]')
  }

  rewardCountBadge() {
    return cy.get('[data-testid=reward-count-badge]')
  }

  itemRow() {
    return cy.get('[data-testid=item-row]')
  }

  returnRow1() {
    return cy.get(':nth-child(1) > [data-testid="item-row"]')
  }

  returnRow2() {
    return cy.get(':nth-child(2) > [data-testid="item-row"]')
  }

  editItem1() {
    return cy.get('[data-testid=item-edit0]')
  }

  editItem2() {
    return cy.get('[data-testid=item-edit1]')
  }

  editItem3() {
    return cy.get('[data-testid=item-edit2]')
  }

  editItemPrice1() {
    return cy.get('[data-testid=edit-item]')
  }

  itemPrice0EntryField() {
    return cy.get('input#item-price-input')
  }

  descriptionItem1() {
    return cy.get('[data-testid=item-description0]')
  }

  descriptionItem2() {
    return cy.get('[data-testid=item-description1]')
  }

  descriptionItem3() {
    return cy.get('[data-testid=item-description2]')
  }

  priceItem1() {
    return cy.get('[data-testid=item-price0]')
  }

  priceItem2() {
    return cy.get('[data-testid=item-price1]')
  }

  priceItem3() {
    return cy.get('[data-testid=item-price2]')
  }

  upcItem1() {
    return cy.get('[data-testid=item-upc0]')
  }

  upcItem2() {
    return cy.get('[data-testid=item-upc1]')
  }

  upcItem3() {
    return cy.get('[data-testid=item-upc2]')
  }

  quantityItem1() {
    return cy.get('[data-testid=item-quantity0]')
  }

  quantityItem2() {
    return cy.get('[data-testid=item-quantity1]')
  }

  quantityItem3() {
    return cy.get('[data-testid=item-quantity2]')
  }

  everydayPriceItem3() {
    return cy.get('[data-testid="everydayPrice2"]')
  }

  overridePriceItem3() {
    return cy.get('[data-testid="overridePrice2"]')
  }

  sapItem1() {
    return cy.get('[data-testid="item-row"]').eq(0).contains('Sold by 9876543 Jane Manager')
  }

  sapItem2() {
    return cy.get('[data-testid="item-row"]').eq(1).contains('Sold by 9876543 Jane Manager')
  }

  sapItem3() {
    return cy.get('[data-testid="item-row"]').eq(2).contains('Sold by 9876543 Jane Manager')
  }

  itemDiscountApplied() {
    return cy.get('[data-testid=discount-description00]')
  }

  itemDiscountAmount() {
    return cy.get('[data-testid=discount-amount00]')
  }

  itemDiscountModalTitle() {
    return cy.get('[data-testid="modal-title-manualItemDiscount"]')
  }

  itemDiscountModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-manualItemDiscount"]')
  }

  itemDiscountModalNextButton() {
    return cy.get('[data-testid="manual-transaction-discount-next"]')
  }

  itemDiscountModalReasonPicker() {
    return cy.get('[data-testid="discount-reason-picker"]')
  }

  itemDiscountMethodPicker() {
    return cy.get('[data-testid="discount-method-picker"]')
  }

  itemDiscountModalPage2NextButton() {
    return cy.get('[data-testid="manual-trx-discount-next"]')
  }

  itemDiscountInputBox() {
    return cy.get('[data-testid="manual-item-discount-amount"]')
  }

  itemDiscountApplyButton() {
    return cy.get('[data-testid="apply-manual-item-discount-button"]')
  }

  itemDiscountDollarButton() {
    return cy.get('[data-testid="select-item-discount-dollar-button"]')
  }

  itemDiscountPercentButton() {
    return cy.get('[data-testid="select-item-discount-percent-button"]')
  }

  itemDiscountCouponBox() {
    return cy.get('[data-testid="manual-item-discount-coupon"]')
  }

  itemDiscountDescription() {
    return cy.get('[data-testid="discount-description00"]')
  }

  transactionDiscountButton() {
    return cy.get('[data-testid="manual-transaction-discount"]')
  }

  transactionDiscountModalReasonPicker() {
    return cy.get('[data-testid="identification-picker"]')
  }

  transactioDiscountModalNextButton() {
    return cy.get('[data-testid="submit-manual-discount-reason-button"]')
  }

  transactionDiscountCloseButton() {
    return cy.get('[data-testid="modal-close-button-manualTransactionDiscount"]')
  }

  transactionDiscountCouponInputBox() {
    return cy.get('[data-testid="coupon-code-input"]')
  }

  transactionDiscountModalTitle() {
    return cy.get('[data-testid="modal-title-manualTransactionDiscount"]')
  }

  transactionDiscountAmountInputBox() {
    return cy.get('[data-testid="manual-discount-amount"]')
  }

  transactionDiscountDollarButton() {
    return cy.get('[data-testid="select-manual-dollar-button"]')
  }

  transactionDiscountApplyButton() {
    return cy.get('[data-testid="apply-discount-button"]')
  }

  editItem0() {
    return cy.get('[data-testid=item-edit0]')
  }

  editItem() {
    return cy.get('[data-testid=edit-item]')
  }

  itemPriceInput() {
    return cy.get('#item-price-input')
  }

  deleteItem() {
    return cy.get('[data-testid=delete-item]')
  }

  itemDiscount() {
    return cy.get('[data-testid="discount-item"]')
  }

  couponsAndDiscounts() {
    return cy.get('[data-testid=discounts]')
  }

  couponIcon() {
    return cy.get('[data-testid=coupon-icon]')
  }

  couponOverrideButton() {
    return cy.get('[data-testid=coupon-override-button]')
  }

  couponOverrideModalTitle() {
    return cy.get('[data-testid="modal-title-couponOverride"]')
  }

  couponOverrideAmount() {
    return cy.get('[data-testid=coupon-override-amount]')
  }

  couponOverridePercentButton() {
    return cy.get('[data-testid=select-percent-button]')
  }

  couponOverrideDollarButton() {
    return cy.get('[data-testid=select-dollar-button]')
  }

  couponOverrideApplyButton() {
    return cy.get('[data-testid=apply-coupon-button]')
  }

  couponOverrideModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-couponOverride"]')
  }

  couponRewardDiscount() {
    return cy.get('[data-testid="discounts"]')
  }

  subtotal() {
    return cy.get('[data-testid=subtotal]')
  }

  taxes() {
    return cy.get('[data-testid=tax]')
  }

  taxSummaryTypeLabel(index) {
    return cy.get(`[data-testid=taxSummaryTypeLabel_${index}]`)
  }

  taxSummaryValue(index) {
    return cy.get(`[data-testid=taxSummaryValue_${index}]`)
  }

  total() {
    return cy.get('[data-testid=total]')
  }

  complete() {
    return cy.get('[data-testid=complete-transaction]')
  }

  //  Product Detail
  productDetailContainer() {
    return cy.get('[data-testid=product-detail-container]')
  }

  productImage() {
    return cy.get('[data-testid=product-image]')
  }

  productDetailDescription() {
    return cy.get('[data-testid=product-detail-description]')
  }

  productDetailUPC() {
    return cy.get('[data-testid="product-detail-upc"]')
  }

  //  Loyalty advanced search
  loyaltyAdvancedSearchFirstName() {
    return cy.get('[data-testid=first-name-input]')
  }

  loyaltyAdvancedSearchLastName() {
    return cy.get('[data-testid=last-name-input]')
  }

  loyaltyAdvancedSearchZipCode() {
    return cy.get('[data-testid=zip-input]')
  }

  loyaltyAdvancedSearchSearchAgain() {
    return cy.get('[data-testid=name-zip-search]')
  }

  loyaltyAdvancedSearchEnrollNowButton() {
    return cy.get('[data-testid=enroll-now]')
  }

  loyaltyAdvancedSearchCity() {
    return cy.get('[data-testid=city-input]')
  }

  loyaltyAdvancedSearchState() {
    return cy.get('[data-testid=state-input]')
  }

  loyaltyAdvancedSearchStreet() {
    return cy.get('[data-testid=street-input]')
  }

  loyaltyAdvancedSearchPhone() {
    return cy.get('[data-testid=phone-input]')
  }

  loyaltyAdvancedSearchPhoneBorder() {
    return cy.get('[data-testid=phone-input-border]')
  }

  loyaltyAdvancedSearchEmail() {
    return cy.get('[data-testid=email-input]')
  }

  loyaltyAdvancedSearchEmailBorder() {
    return cy.get('[data-testid=email-input-border]')
  }

  loyaltyAdvancedSearchConfirmChanges() {
    return cy.get('[data-testid=confirm-changes]')
  }

  loyaltyAdvancedSearch() {
    return cy.get('[data-testid=loyalty-advanced-search]')
  }

  searchAgainCard() {
    return cy.get('[data-testid=loyalty-search-again-card]')
  }

  loyaltyInfoCard0() {
    return cy.get('[data-testid=loyalty-info-card-0]')
  }

  loyaltyInfoCard1() {
    return cy.get('[data-testid=loyalty-info-card-1]')
  }

  loyaltyAdvancedSearchNextArrow() {
    return cy.get('[data-testid=next-arrow]')
  }

  loyaltyAdvancedSearchLastArrow() {
    return cy.get('[data-testid=last-arrow]')
  }

  loyaltyAdvancedSearchPreviousArrow() {
    return cy.get('[data-testid=previous-arrow]')
  }

  loyaltyAdvancedSearchFirstArrow() {
    return cy.get('[data-testid=first-arrow]')
  }

  numberOfPagesOfResults() {
    return cy.get('[data-testid=loyalty-cards-list-pages-count]')
  }

  loyaltyUserProfileCard() {
    return cy.get('[data-testid=user-profile-card]')
  }

  rewardsAvailableCard() {
    return cy.get('[data-testid=rewards-available-card]')
  }

  rewardCertificate1() {
    return cy.get('[data-testid=reward-card-0]')
  }

  rewardCertificate2() {
    return cy.get('[data-testid=reward-card-1]')
  }

  rewardCertificate3() {
    return cy.get('[data-testid=reward-card-2]')
  }

  //  Modal window
  confirmVoidButton() {
    return cy.get('[data-testid=confirm-void-button]')
  }

  confirmSuspendButton() {
    return cy.get('[data-testid=confirm-suspend-button]')
  }

  voidModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-void"]')
  }

  modalCloseButton(modalName) {
    return cy.get(`[data-testid=modal-close-button-${modalName}]`)
  }

  rewardExceededTotalModal() {
    return cy.get('[data-testid="modal-title-rewardAmountExceedsDiscountedAmount"]')
  }

  rewardExceededTotalCancelButton() {
    return cy.get('[data-testid="cancel-reward"]')
  }

  rewardExceededTotalContinueButton() {
    return cy.get('[data-testid="keep-reward"]')
  }

  //  Feedback window
  feedbackModal() {
    return cy.get('[data-testid=feedback-modal]')
  }

  feedbackOptions() {
    return cy.get('[data-testid=feedback-picker]')
  }

  feedbackTextEntry() {
    return cy.get('[data-testid=feedback-input]')
  }

  feedbackSendButton() {
    return cy.get('[data-testid=feedback-send-button]')
  }

  feedbackSelectType() {
    return cy.get('[data-testid=feedback-default')
  }

  feedbackTechnicalIssue() {
    return cy.get('[data-testid=feedback-technical-issue]')
  }

  feedbackFeatureRequest() {
    return cy.get('[data-testid=feedback-feature-request]')
  }

  feedbackGeneralRequest() {
    return cy.get('[data-testid=feedback-general-request]')
  }

  //  Restricted Age Prompt
  ageRestrictedModal() {
    return cy.get('[data-testid=age-restriction-modal]')
  }

  athleteIsAgeRestrictedModal() {
    return cy.get('[data-testid=athlete-is-age-restricted-modal]')
  }

  ageRestrictedBirthDateEntryField() {
    return cy.get('#age-input')
  }

  ageRestrictedBirthDateEntryFieldBorder() {
    return cy.get('[data-testid=age-input-border]')
  }

  ageRestrictedCannotAddItem() {
    return cy.contains('This athlete is not eligible to purchase this item, based on age.')
  }

  ageRestrictedBirthDateEnterButton() {
    return cy.get('[data-testid=age-button]')
  }

  //  Warranty screen
  warrantySellingAssociate() {
    return cy.get('[data-testid=selling-associate-id]')
  }

  warrantySellingAssociateEnterButton() {
    return cy.get('[data-testid=nspp-enter]')
  }

  warrantyItemDisplay() {
    return cy.get('[data-testid=warranty-item]')
  }

  noProtectionPlanRadioButton0() {
    return cy.get('[data-testid="radio:1:0"]')
  }

  noProtectionPlanRadioButton0Selected() {
    return cy.get('[data-testid="radio-select:1:0"]')
  }

  firstProtectionPlanOptionRadioButton1() {
    return cy.get('[data-testid="radio:1:1"]')
  }

  firstProtectionPlanOptionRadioButton1Selected() {
    return cy.get('[data-testid="radio-select:1:1"]')
  }

  warrantySoldBy() {
    return cy.get('[data-testid=nspp-sold-by]')
  }

  tenderMenuAmountDue() {
    return cy.get('[data-testid=amount-due]')
  }

  tenderMenuCashButton() {
    return cy.get('[data-testid=cash-button]')
  }

  tenderMenuCreditButton() {
    return cy.get('[data-testid=credit-button]')
  }

  tenderMenuGiftCardButton() {
    return cy.get('[data-testid=gift-card-button]')
  }

  tenderMenuSplitTenderButton() {
    return cy.get('[data-testid="split-tender-button"]')
  }

  tenderMenuStoreCreditButton() {
    return cy.get('[data-testid="store-credit-button"]')
  }

  tenderMenuScoreRewardsLookupButton() {
    return cy.get('[data-testid="lookup-button"]')
  }

  backButtonOnTenderScreen() {
    return cy.get('[data-testid="back-button"]')
  }

  cashInput() {
    return cy.get('#cash-input')
  }

  cashInputEnter() {
    return cy.get('[data-testid=cash-enter-button]')
  }

  changeDue() {
    return cy.get('[data-testid=change-due]')
  }

  newTransactionButton() {
    return cy.get('[data-testid=new-transaction-button]')
  }

  amountTendered() {
    return cy.get('[data-testid=total-tendered]')
  }

  remainingAmountDue() {
    return cy.get('[data-testid=remaining-balance]')
  }

  //  Coupon and Rewards details
  couponDetailPanel() {
    return cy.get('[data-testid=coupon-panel]')
  }

  couponAppliedIcon() {
    return cy.get('[data-testid=coupon-icon]')
  }

  couponDetailDescription() {
    return cy.get('[data-testid=coupon-detail-description]')
  }

  couponDetailCode() {
    return cy.get('[data-testid=coupon-detail-code]')
  }

  couponDetailExpirationDate() {
    return cy.get('[data-testid=coupon-detail-expiration]')
  }

  couponIcon() {
    return cy.get('[data-testid="coupon-icon"] ')
  }

  // Returns Auth
  noReceiptReturnAuthModalLabel() {
    return cy.contains('No Receipt Return')
  }

  returnAuthModalVoidBtn() {
    return cy.get('[data-testid=return-auth-modal-void-btn]')
  }

  noReceiptReturnAuthModalFirstLineOfText() {
    return cy.contains('A return with no receipt requires additional customer information.')
  }

  noReceiptReturnAuthModalSecondLineOfText() {
    return cy.contains('Please ask the Athlete for a government issued identification.')
  }

  noReceiptReturnAuthModalThirdLineOfText() {
    return cy.contains("Please scan the barcode on the Athlete's ID")
  }

  noReceiptReturnAuthModalNoBarcodeAvailableLink() {
    return cy.contains('no barcode available')
  }

  returnAuthModalCompleteBtn() {
    return cy.get('[data-testid=return-auth-modal-complete-btn]')
  }

  returnAuthIdPicker() {
    return cy.get('[data-testid="identification-picker"]')
  }

  nonReceiptedReturnAuthNextButton() {
    return cy.get('[data-testid="non-receipted-return-submit"]')
  }

  nonReceiptedReturnAuthModalDescription() {
    return cy.contains("Verify the athlete's identification")
  }

  nonReceiptedReturnAuthModalIdEntryDescription() {
    return cy.contains("Input Athlete's Information")
  }

  nonReceiptedReturnAuthModalIdNumberEntryField() {
    return cy.get('[data-testid="nonReceiptedAuth-idNumTextInput"]')
  }

  nonReceiptedReturnAuthModalStateEntryField() {
    return cy.get('[data-testid="nonReceiptedAuth-stateTextInput"]')
  }

  nonReceiptedReturnAuthModalExpirationDateField() {
    return cy.get('[data-testid="nonReceiptedAuth-expDateInput"]')
  }

  nonReceiptedReturnAuthModalFirstNameField() {
    return cy.get('[data-testid="nonReceiptedAuth-firstNameInput"]')
  }

  nonReceiptedReturnAuthModalLastNameField() {
    return cy.get('[data-testid="nonReceiptedAuth-lastNameInput"]')
  }

  nonReceiptedReturnAuthModalBirthDateField() {
    return cy.get('[data-testid="nonReceiptedAuth-birthDateInput"]')
  }

  nonReceiptedReturnAuthModalAddress1EntryField() {
    return cy.get('[data-testid="nonReceiptedAuth-address1Input"]')
  }

  nonReceiptedReturnAuthModalAddress2EntryField() {
    return cy.get('[data-testid="nonReceiptedAuth-address2Input"]')
  }

  nonReceiptedReturnAuthModalCityAndStateEntryField() {
    return cy.get('[data-testid="nonReceiptedAuth-cityStateInput"]')
  }

  nonReceiptedReturnAuthModalZipCodeEntryField() {
    return cy.get('[data-testid="nonReceiptedAuth-zipCodeInput"]')
  }

  nonReceiptedReturnAuthModalSubmitButton() {
    return cy.get('[data-testid="non-receipted-return-submit"]')
  }

  returnAuthWarnedReason() {
    return cy.contains("This return has been warned because I'm suspicious of you")
  }

  returnAuthWarnedContinueButton() {
    return cy.get('[data-testid="return-auth-modal-complete-btn"]')
  }

  returnAuthDeniedReason() {
    return cy.contains("This return was denied because I don't like you")
  }

  returnAuthModalVoidButton() {
    return cy.get('[data-testid="return-auth-modal-void-btn"]')
  }

  returnsLookupGenericButton() {
    return cy.get('[data-testid="lookup-return-generic-button"]')
  }

  loyaltyReturnLookupNextButton() {
    return cy.get('[data-testid="loyalty-return-lookup-next-button"]')
  }

  loyaltyReturnLookupPhoneNumberField() {
    return cy.get('[data-testid="loyalty-return-lookup-phone-num"]')
  }

  loyaltyReturnLookupRetryButton() {
    return cy.get('[data-testid="retry-athlete-lookup-returns"]')
  }

  loyaltyReturnToOrderLookupButton() {
    return cy.get('[data-testid="return-to-order-lookup"]')
  }

  loyaltyReturnLookupFirstResult() {
    return cy.get('[data-testid="loyalty-order0"]')
  }

  loyaltyReturnLookupSecondResult() {
    return cy.get('[data-testid="loyalty-order1"]')
  }

  loyaltyReturnLookupThirdResult() {
    return cy.get('[data-testid="loyalty-order2"]')
  }

  loyaltyReturnLookupCustomerFirstResult() {
    return cy.get('[data-testid="loyalty-customer0"]')
  }

  loyaltyReturnLookupCustomerSecondResult() {
    return cy.get('[data-testid="loyalty-customer1"]')
  }

  loyaltyReturnLookupModalTitle() {
    return cy.get('[data-testid="modal-title-returns"]')
  }

  loyaltyReturnModal() {
    return cy.get('[data-testid="returns-modal"]')
  }

  loyaltyReturnOrderDetails() {
    return cy.get('[data-testid="return-order-details"]')
  }

  loyaltyReturnLookupCloseButton() {
    return cy.get('[data-testid="modal-close-button-returns"]')
  }

  loyaltyReturnLookupSubmitButton() {
    return cy.get('[data-testid="submit-button-loyalty-returns-lookup"]')
  }

  loyaltyReturnLookupSelectAllLink() {
    return cy.get('[data-testid="select-all-link"]')
  }

  loyaltyReturnLookupItem1Description() {
    return cy.get('[data-testid="item-description0"]')
  }

  loyaltyReturnLookupItem2Description() {
    return cy.get('[data-testid="item-description1"]')
  }

  loyaltyReturnLookupItem3Description() {
    return cy.get('[data-testid="item-description2"]')
  }

  loyaltyReturnLookupItem1UPC() {
    return cy.get('[data-testid="item-upc0"]')
  }

  loyaltyReturnLookupItem2UPC() {
    return cy.get('[data-testid="item-upc1"]')
  }

  loyaltyReturnLookupItem3UPC() {
    return cy.get('[data-testid="item-upc2"]')
  }

  loyaltyReturnLookupItem1Price() {
    return cy.get('[data-testid="item-price0"]')
  }

  loyaltyReturnLookupItem2Price() {
    return cy.get('[data-testid="item-price1"]')
  }

  loyaltyReturnLookupItem3Price() {
    return cy.get('[data-testid="item-price2"]')
  }

  athleteOrderUpcFirstChip() {
    return cy.get('[data-testid="upc-chip0"]')
  }

  athleteOrderUpcFirstChipCloseButton() {
    return cy.get('[data-testid="upc-chip-close-button0"]')
  }

  athleteOrderUpcSecondChip() {
    return cy.get('[data-testid="upc-chip1"]')
  }

  athleteOrderUpcSecondChipCloseButton() {
    return cy.get('[data-testid="upc-chip-close-button1"]')
  }

  returnLookupByLoyaltySortButton() {
    return cy.get('[data-testid="order-sort-button"]')
  }

  closeRegisterInstructions() {
    return cy.get('[data-testid=close-register-instructions]')
  }

  //  Donation Round Up modal elements
  sportsMatterModal() {
    return cy.contains('sports-matter-modal')
  }

  sportsMatterLogo() {
    return cy.contains('sports-matter-logo')
  }

  sportsMatterModalVerbage1() {
    return cy.contains('Would you like to make a donation to help youth sports?')
  }

  sportsMatterModalVerbage2() {
    return cy.contains('*Rounds up ')
  }

  sportsMatterModalVerbage3() {
    return cy.contains('to the next full dollar.')
  }

  sportsMatterModalAddOneDollarButton() {
    return cy.get('[data-testid="sports-matter-add-one-dollar-button"]')
  }

  sportsMatterCampaignAddOneDollarButton() {
    return cy.get('[data-testid="sports-matter-campaign-one-button"]')
  }

  sportsMatterModalNoThanksButton() {
    return cy.get('[data-testid="sports-matter-no-thanks-button"]')
  }

  sportsMatterCampaignNoThanksButton() {
    return cy.get('[data-testid="sports-matter-campaign-none-button"]')
  }

  sportsMatterRoundUpAcceptButton() {
    return cy.get('[data-testid="sports-matter-round-up-button"]')
  }

  sportsMatterCampaignRoundUpAcceptButton() {
    return cy.get('[data-testid="sports-matter-campaign-roundup-button"]')
  }

  sportsMatterCampaignAddFiveDollarsButton() {
    return cy.get('[data-testid="sports-matter-campaign-five-button"]')
  }

  sportsMatterCampaignOtherButton() {
    return cy.get('[data-testid="sports-matter-campaign-other-button"]')
  }

  sportsMatterCampaignOtherVerbiage() {
    return cy.contains('How much would the athlete like to donate?')
  }

  sportsMatterCampaignOtherDonationInputBox() {
    return cy.get('[id="donation-input"]')
  }

  sportsMatterCampaignOtherNoThanksButton() {
    return cy.get('[data-testid="sports-matter-campaign-other-nothanks-button"]')
  }

  sportsMatterCampaignOtherAcceptButton() {
    return cy.get('[data-testid="sports-matter-campaign-other-accept-button"]')
  }

  printReceiptButton() {
    return cy.get('[data-testid="print-receipt-button"]')
  }

  productLookupFooterButton() {
    return cy.get('[data-testid="item-lookup-footer"]')
  }

  productLookupOverlayButton() {
    return cy.get('[data-testid="item-lookup"]')
  }

  productLookupPanel() {
    return cy.get('[data-testid="product-lookup-panel"]')
  }

  productLookupSearchInput() {
    return cy.get('[data-testid="item-lookup-input"]')
  }

  productLookupClearButton() {
    return cy.get(`[data-testid="item-lookup-input-clear"]`)
  }

  productLookupCloseButton() {
    return cy.get('[data-testid="product-lookup-close-button"]')
  }

  productLookupPrintDetailsButton() {
    return cy.get('[data-testid="print-details-button"]')
  }

  productLookupPaginationItem(pageNo) {
    return cy.get(`[data-testid="product-lookup-page-${pageNo}"]`).first()
  }

  productLookupBackToSearch() {
    return cy.get('[data-testid="product-lookup-back-to-search"]')
  }

  productLookupTransactionButton() {
    return cy.get('[data-testid="product-lookup-transaction-button"]')
  }

  productLookupAttribute(name) {
    return cy.get(`[data-testid="product-lookup-attribute-${name}"]`)
  }

  productLookupVariant(name) {
    return cy.get(`[data-testid="product-lookup-variant-${name}"]`)
  }

  productLookupAttributeAdjust(name) {
    return cy.get(`[data-testid="product-lookup-adjust-${name}"]`)
  }

  productLookupSaveAttributesButton() {
    return cy.get('[data-testid="product-lookup-save-attributes"]')
  }

  productLookupRetryButton() {
    return cy.get('[data-testid="product-lookup-retry-button"]')
  }

  giftCardBalanceInquiryButton() {
    return cy.get('[data-testid="gift-card-balance-inquiry-footer')
  }

  //  Unhandled Exceptions Modal
  unhandledExceptionModalTitle() {
    return cy.get('[data-testid="modal-title-error"]')
  }

  unhandledExceptionModalBody() {
    return cy.get('[data-testid="error-modal"]')
  }

  unhandledExceptionModalRefreshButton() {
    return cy.contains('Refresh')
  }

  //  Store Services
  storeServicesOverlayButton() {
    return cy.get('[data-testid="store-services"]')
  }

  storeServicesPanel() {
    return cy.get('[data-testid="store-services-panel"]')
  }

  storeServicesCategory(index) {
    return cy.get(`[data-testid="store-services-category-${index}"]`).first()
  }

  storeServicesAddButton(index) {
    return cy.get(`[data-testid="service-add-button-${index}"]`).first()
  }

  closeFooterOverlay() {
    return cy.get(`[data-testid="close-footer-overlay"]`)
  }

  reasonButton(index) {
    return cy.get(`[data-testid="void-reason-button-${index}"]`)
  }

  transactionFeedbackInput() {
    return cy.get('[data-testid="transaction-feedback-input"]')
  }

  transactionFeedbackInputSend() {
    return cy.get('[data-testid="transaction-feedback-input-send"]')
  }

  transactionFeedbackSuccessClose() {
    return cy.get('[data-testid="transaction-feedback-success-close"]')
  }

  transactionFeedbackErrorRetry() {
    return cy.get('[data-testid="transaction-feedback-error-retry"]')
  }

  lowestPriceInquiryOverlayButton() {
    return cy.get('[data-testid="lowest-price-inquiry"]')
  }

  lowestPriceInquiryPanel() {
    return cy.get('[data-testid="lowest-price-inquiry-panel"]')
  }

  lowestPriceInquiryInput() {
    return cy.get('[data-testid="lowest-price-inquiry-input"]')
  }

  lowestPriceInquiryNextButton() {
    return cy.get('[data-testid="lowest-price-inquiry-next-button"]')
  }

  taxExemptButton() {
    return cy.get('[data-testid="tax-exempt"]')
  }

  taxExemptModalTitle() {
    return cy.get('[data-testid="modal-title-taxExemptSale"]')
  }

  taxExemptModalEnterButton() {
    return cy.get('[data-testid="tax-exempt-sale-enter-button"]')
  }

  taxExemptModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-taxExemptSale"]')
  }

  taxExemptModalDisclaimer() {
    return cy.contains('The athlete can use the self-service kiosk to createa new customer number, or to search for an exisiting number.')
  }

  taxExemptCustomerInputBox() {
    return cy.get('[data-testid="tax-exempt-customer-number-input"]')
  }

  taxExemptQRCodeDisclaimer() {
    return cy.contains('Scan the QR Code')
  }

  taxExemptErrorMessage() {
    return cy.contains('Sorry, this customer number was not found in our system.Please check the number and try again.')
  }

  taxExemptAppliedIcon() {
    return cy.contains('Tax-Exempt Sale is successfully activated.')
  }

  familyNightSaleInput() {
    return cy.get('[data-testid="family-night-discount-input"]')
  }

  familyNightSubmitButton() {
    return cy.get('[data-testid="submit-family-night-discount"]')
  }

  familyNightModalCloseButton() {
    return cy.get('[data-testid="modal-close-button-addAssociateDiscount"]')
  }

  backButton() {
    return cy.get('[data-testid="back-button"]')
  }

  familyNightNoCouponButton() {
    return cy.get('[data-testid="family-night-no-coupon"]')
  }

  familyNightModalTitle() {
    return cy.get('[data-testid="modal-title-addAssociateDiscount"]')
  }

  familyNightModalSubTitle() {
    return cy.get('[style="color: rgb(102, 102, 102); margin-bottom: 48px;"]')
  }

  managerOverrideModal() {
    return cy.get('[data-testid="manager-override-modal"]')
  }

  managerOverrideModalTitle() {
    return cy.get('[data-testid="modal-title-managerOverride"]')
  }

  managerOverrideAssociateId() {
    return cy.get('#managerOverrideAssociateId')
  }

  managerOverrideAssociatePin() {
    return cy.get('[data-testid="associate-pin"]')
  }

  managerOverrideDeclineButton() {
    return cy.get('[data-testid="decline-manager-override"]')
  }

  managerOverrideApplyButton() {
    return cy.get('[data-testid="apply-manager-override"]')
  }
  nikeConnectTag() {
    return cy.get('[data-testid="nike-connect-tag"]')
  }

  nikeConnectProductPopupLine1() {
    return cy.contains('This item is only to be sold to Nike Connect Members.')
  }

  nikeConnectProductPopupLine2() {
    return cy.contains('Please validate connected status of Athlete before purchase.')
  }

  nikeConnectMemberPopupLine1() {
    return cy.contains('This athlete has Nike Connect and can purchase Nike Connect Members Access items')
  }

  nikeConnectCloseButton() {
    return cy.get('[data-testid="popup-close-button"]')
  }

  nikeConnectLoyaltyMiniViewIcon() {
    return cy.get('[data-testid="nike-connected-miniview-icon"]')
  }

  couponOverrideButton() {
    return cy.get('[data-testid="coupon-override-button"]')
  }
}

export default elements
