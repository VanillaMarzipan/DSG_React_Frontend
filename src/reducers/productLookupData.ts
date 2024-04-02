import { CLEAR_PRODUCT_LOOKUP_DATA, UPDATE_PRODUCT_LOOKUP_DATA, UPDATE_SAVED_VARIANT_PRICE } from '../actions/productLookupActions'

export enum CurrentPage {
  Landing,
  SearchResults,
  Details,
  AdjustDetails
}

export interface ProductLookupDataType {
  searchResults?: SearchResultsType
  currentPage?: CurrentPage
  productDetails?: DetailsType
  savedVariant?: StyleVariantType
  focusedAttribute?: string
  categories?: CategoryType[]
  focusedCategory?: string
  lowestPriceInquiryItem?: LowestPriceInquiryItemType

  detailsError?: boolean
  detailsErrorMessage?: string
  retryUpc?: string

  searchError?: boolean
  searchErrorMessage?: string
  currentSearchTerm?: string

  categoriesError?: boolean
  categoriesErrorMessage?: string

  lowestPriceInquiryError?: boolean
  lowestPriceInquiryErrorMessage?: string
}

export interface SearchResultsType {
  count?: number
  result?: SearchResultType[]
}

export interface SearchResultType {
  imageUrl?: string
  name?: string
  fallbackName?: string
  upc?: string
  webId?: string
}

export interface DetailsType {
  name?: string
  styleVariants?: StyleVariantType[]
  webId?: string
  attributes?: AttributeType[]
}

export type StringBooleanType =
  | 'true'
  | 'false'

export interface ProductAttributesType {
  isLaunched: StringBooleanType
  isNikeExclusive: StringBooleanType
  launchDate: string
}

export interface StyleVariantType {
  color?: string
  displayableDate?: string
  imageUrl?: string
  sku?: number
  specificVariants?: SpecificVariantType[]
  styleNumber?: string
  styleDescription?: string
  upc?: string[]
  onlineInventory?: number
  nearbyStoreInventory?: number
  onHandInventory?: number
  onHandLastReceivedDate?: string
  invalidCombination?: boolean
  price?: number | string
  productAttributes?: ProductAttributesType
}

export interface AttributeType {
  name?: string
  specificVariants?: SpecificVariantType[]
}

export interface SpecificVariantType {
  name?: string
  sort?: number
  swatchColorImageUrl?: string
  value?: string
}

export interface CategoryType {
  name?: string
  products?: CategoryProductType[]
}

export interface CategoryProductType {
  name?: string
  upc?: string
}

export interface LowestPriceInquiryItemType {
  name?: string
  upc?: string
  lowestPrice?: string
}

const updateProductLookupType = (
  state: ProductLookupDataType = {
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
    lowestPriceInquiryItem: null,
    detailsError: false,
    detailsErrorMessage: null,
    retryUpc: null,
    searchError: false,
    searchErrorMessage: null,
    currentSearchTerm: null,
    categoriesError: false,
    categoriesErrorMessage: null,
    lowestPriceInquiryError: false,
    lowestPriceInquiryErrorMessage: null
  },
  action
): ProductLookupDataType => {
  switch (action.type) {
  case UPDATE_PRODUCT_LOOKUP_DATA:
    return {
      ...state,
      ...action.data
    }
  case UPDATE_SAVED_VARIANT_PRICE:
    return {
      ...state,
      savedVariant: {
        ...state.savedVariant,
        price: action.data
      }
    }
  case CLEAR_PRODUCT_LOOKUP_DATA:
    return {
      ...action.data
    }
  default:
    return state
  }
}

export default updateProductLookupType
