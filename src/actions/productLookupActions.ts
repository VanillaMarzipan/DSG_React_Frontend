import * as UiActions from './uiActions'
import * as CoordinatorAPI from '../utils/coordinatorAPI'
import { AttributeType, CurrentPage, ProductLookupDataType, StyleVariantType } from '../reducers/productLookupData'
import { AppThunk } from '../reducers'
import { AppDispatch } from '../Main'
import { sendRumRunnerEvent } from '../utils/rumrunner'

export const UPDATE_PRODUCT_LOOKUP_DATA = 'UPDATE_PRODUCT_LOOKUP_DATA'
export const UPDATE_SAVED_VARIANT_PRICE = 'UPDATE_SAVED_VARIANT_PRICE'
export const CLEAR_PRODUCT_LOOKUP_DATA = 'CLEAR_PRODUCT_LOOKUP_DATA'
const loggingHeader = 'actions > productLookupActions > '

export const fetchProductLookupSearchResults = (searchTerm: string): AppThunk => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ fetchProductLookupSearchResults: true }))
  dispatch(updateProductLookupData({ currentPage: CurrentPage.SearchResults, currentSearchTerm: searchTerm, searchError: false, searchErrorMessage: null }, UPDATE_PRODUCT_LOOKUP_DATA))
  await CoordinatorAPI.fetchProductLookupSearchResults(encodeURIComponent(searchTerm))
    .then(res => {
      sendRumRunnerEvent('Product Lookup Search Response', {
        statusCode: res.status
      })
      if (!res.ok) {
        throw new Error(`Could not fetch search results:\n${JSON.stringify(res)}`)
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info('SUCCESS: ' + loggingHeader + 'fetchProductLookupSearchResults:\n' + JSON.stringify(data))
      dispatch(updateProductLookupData({ searchResults: data }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchProductLookupSearchResults: false }))
    })
    .catch(error => {
      dispatch(updateProductLookupData({ searchError: true, searchErrorMessage: 'Failed to fetch search results.' }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchProductLookupSearchResults: false }))
      console.error('ERROR: ' + loggingHeader + 'fetchProductLookupSearchResults:\n', error)
    })
}

export const fetchProductLookupDetails = (upc: string): AppThunk => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ fetchProductLookupDetails: true }))
  dispatch(updateProductLookupData({ currentPage: CurrentPage.Details, retryUpc: upc, detailsError: false, detailsErrorMessage: null }, UPDATE_PRODUCT_LOOKUP_DATA))
  await CoordinatorAPI.fetchProductLookupDetails(upc)
    .then(res => {
      sendRumRunnerEvent('Product Lookup Details Response', {
        statusCode: res.status
      })
      if (!res.ok) {
        const responseError = new Error(`Could not fetch product lookup details: ${JSON.stringify(res)}`)
        if (res.status === 404) {
          responseError.name = 'UpcNotFoundError'
        }
        throw responseError
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info('SUCCESS: ' + loggingHeader + 'fetchProductLookupDetails:\n' + JSON.stringify(data))
      // Get list of values for each attribute
      const attributes: AttributeType[] = []
      for (let i = 0; i < data.styleVariants.length; i++) {
        const styleVariant = data.styleVariants[i]
        for (let j = 0; j < styleVariant.specificVariants.length; j++) {
          const specificVariant = styleVariant.specificVariants[j]
          const attribute = attributes.find((att) => att.name === specificVariant.name)
          if (!attribute) {
            attributes.push({
              name: specificVariant.name,
              specificVariants: [specificVariant]
            })
          } else {
            if (!attribute.specificVariants.find((variant) => variant.value === specificVariant.value)) {
              attribute.specificVariants.push(specificVariant)
            }
          }
        }
      }
      // If a variant is missing an attribute, set it to N/A
      for (let i = 0; i < data.styleVariants.length; i++) {
        const styleVariant = data.styleVariants[i]
        for (let j = 0; j < attributes.length; j++) {
          const attribute = attributes[j]
          if (!styleVariant.specificVariants.some((variant) => variant.name === attribute.name)) {
            styleVariant.specificVariants.push({
              name: attribute.name,
              value: 'N/A',
              sort: -1
            })
            if (!attribute.specificVariants.some((variant) => variant.value === 'N/A')) {
              attribute.specificVariants.push({
                name: attribute.name,
                value: 'N/A',
                sort: -1
              })
            }
          }
        }
      }
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i]
        attribute.specificVariants.sort((a, b) => a.sort - b.sort)
      }
      data.attributes = attributes
      console.info('ATTRIBUTES: ' + loggingHeader + 'fetchProductLookupDetails:\n' + JSON.stringify(attributes))
      dispatch(updateProductLookupData({ productDetails: data }, UPDATE_PRODUCT_LOOKUP_DATA))
      // Find variant matching queried UPC, or use the first if none match
      const matchingVariant = data.styleVariants.find(variant => variant.upc.includes(upc)) ?? data.styleVariants[0]
      if (!matchingVariant) {
        throw new Error('Invalid variant was returned.')
      }
      dispatch(selectVariant(matchingVariant))
      dispatch(UiActions.updateLoadingStates({ fetchProductLookupDetails: false }))
    })
    .catch(error => {
      console.error('ERROR: ' + loggingHeader + 'fetchProductLookupDetails:\n', error)
      const errorMessage = error.name === 'UpcNotFoundError' ? 'UPC not found.' : 'Failed to fetch product details from the system.'
      dispatch(updateProductLookupData({ detailsError: true, detailsErrorMessage: errorMessage }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchProductLookupDetails: false }))
    })
}

export const setCurrentPage = (currentPage: CurrentPage): AppThunk => (dispatch: AppDispatch): void => {
  dispatch(updateProductLookupData({ currentPage }, UPDATE_PRODUCT_LOOKUP_DATA))
}

export const selectVariant = (savedVariant: StyleVariantType): AppThunk => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(updateProductLookupData({ savedVariant }, UPDATE_PRODUCT_LOOKUP_DATA))
  await CoordinatorAPI.fetchProductPricing(savedVariant.sku.toString())
    .then(res => {
      sendRumRunnerEvent('Product Lookup Pricing Response', {
        statusCode: res.status
      })
      if (!res.ok) {
        throw new Error('Failed to fetch pricing from the system')
      } else {
        return res.json()
      }
    }).then(pricingData => {
      console.info('SUCCESS: ' + loggingHeader + 'selectVariant:\n' + JSON.stringify(pricingData))
      const price = pricingData.permanent <= 0.02 ? pricingData.permanent : pricingData.original
      dispatch(updateSavedVariantPrice(price, UPDATE_SAVED_VARIANT_PRICE))
    })
    .catch((error: Error) => {
      dispatch(updateSavedVariantPrice(error.message, UPDATE_SAVED_VARIANT_PRICE))
      console.error('ERROR: ' + loggingHeader + 'selectVariant:\n', error)
    })
}

export const updateProductLookupData = (data: ProductLookupDataType, actionType: string): { type: string; data: ProductLookupDataType } => {
  console.info('ENTER: ' + loggingHeader + 'updateProductLookupData\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

export const updateSavedVariantPrice = (data: number | string, actionType: string): { type: string; data: number | string } => {
  console.info('ENTER: ' + loggingHeader + 'updateSavedVariantPrice\n' + JSON.stringify({
    data: data,
    actionType: actionType
  }))
  return {
    type: actionType,
    data
  }
}

export const fetchProductLookupCategories = (): AppThunk => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ fetchProductLookupCategories: true }))
  dispatch(updateProductLookupData({ categoriesError: false, categoriesErrorMessage: null }, UPDATE_PRODUCT_LOOKUP_DATA))
  await CoordinatorAPI.fetchProductLookupCategories()
    .then(res => {
      sendRumRunnerEvent('Product Lookup Categories Response', {
        statusCode: res.status
      })
      if (!res.ok) {
        throw new Error(`Could not fetch categories:\n${JSON.stringify(res)}`)
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info('SUCCESS: ' + loggingHeader + 'fetchProductLookupCategories:\n' + JSON.stringify(data))
      dispatch(updateProductLookupData({
        categories: data?.categories
      }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchProductLookupCategories: false }))
    })
    .catch(error => {
      dispatch(updateProductLookupData({ categoriesError: true, categoriesErrorMessage: 'Failed to fetch categories.' }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchProductLookupCategories: false }))
      console.error('ERROR: ' + loggingHeader + 'fetchProductLookupCategories:\n', error)
    })
}

export const fetchLowestPriceAndName = (upc: string): AppThunk => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(UiActions.updateLoadingStates({ fetchLowestPriceAndName: true }))
  dispatch(updateProductLookupData({ lowestPriceInquiryError: false, lowestPriceInquiryErrorMessage: null }, UPDATE_PRODUCT_LOOKUP_DATA))
  await CoordinatorAPI.fetchLowestReturnPrice(upc)
    .then(res => {
      const error = Error(`Could not fetch lowest return price for lowest price inquiry:\n${JSON.stringify(res)}`)

      if (res.status === 404) {
        error.name = 'LowestPriceNotFoundError'
      }
      if (!res.ok) {
        throw error
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.info('SUCCESS: ' + loggingHeader + 'fetchLowestPriceAndName:\n' + JSON.stringify(data))
      let lowestPrice: string = data?.returnPrice?.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
      lowestPrice = lowestPrice?.substring(1)
      dispatch(updateProductLookupData({
        lowestPriceInquiryItem: {
          name: data?.product?.description,
          upc: data?.product?.upc,
          lowestPrice: lowestPrice
        }
      }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchLowestPriceAndName: false }))
    })
    .catch(error => {
      dispatch(updateProductLookupData({
        lowestPriceInquiryError: true,
        lowestPriceInquiryErrorMessage: (error.name === 'LowestPriceNotFoundError')
          ? 'Sorry, we could not find the lowest price for this product because it has not been sold recently.'
          : 'Failed to fetch lowest price from the system.'
      }, UPDATE_PRODUCT_LOOKUP_DATA))
      dispatch(UiActions.updateLoadingStates({ fetchLowestPriceAndName: false }))
      console.error('ERROR: ' + loggingHeader + 'fetchLowestPriceAndName:\n', error)
    })
}

export const clearProductLookupData = () => {
  console.info('ENTER: ' + loggingHeader + 'clearProductLookupData\n')
  return {
    type: CLEAR_PRODUCT_LOOKUP_DATA,
    data: {
      searchResults: {
        count: 0,
        result: null
      },
      currentPage: CurrentPage.Landing,
      productDetails: {
        name: null,
        styleVariants: null,
        webId: null,
        attributes: null
      },
      savedVariant: null,
      focusedAttribute: null,
      categories: null,
      focusedCategory: null,
      detailsError: false,
      detailsErrorMessage: null,
      retryUpc: null,
      searchError: false,
      searchErrorMessage: null,
      retrySearchTerm: null,
      categoriesError: false,
      categoriesErrorMessage: null
    }
  }
}
