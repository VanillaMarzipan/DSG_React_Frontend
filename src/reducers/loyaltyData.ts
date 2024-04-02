import { UPDATE_LOYALTY_DATA } from '../actions/loyaltyActions'
import { RewardCertificates } from './transactionData'

export enum EmailConfirmationChoice {
  Failure = 0,
  Yes = 1,
  No = 2,
  NotSet = 3
}

export interface LoyaltyDataTypes {
  phoneInput?: string
  phoneOutput?: string
  lastPhoneLookup?: string
  lastCustomerLookup?: string
  firstNameInput?: string
  lastNameInput?: string
  zipInput?: string
  isNoAccountFound?: boolean
  didCreatedAccountExist?: boolean
  loyaltyError?: number
  retryParameters?: RetryLoyaltyEnrollOrLookupParams
  retryType?: 'enroll' | 'phone' | 'advanced' | 'accountNumber' | ''
  loyaltyCustomers?: Customer[]
  selectedLoyaltyCustomer?: Customer
  accountLookupFailure?: boolean
  altScreenName?:
    | 'advanced'
    | 'details'
    | 'enrollment'
    | 'confirmation'
    | 'edit'
    | 'rewards'
    | 'pickYourPoints'
    | null
  errorFields?: string[]
  accountLevelDetails?: AccountLevelDetails
  rewardCountToDisplay?: number
  lastAppliedReward?: string
  removeRewardError?: boolean
  pickYourPointsAvailable?: boolean
  pinpadReceiptChoice?: 'print' | 'eReceiptOnly' | 'eReceiptAndPrint' | ''
  emailConfirmationChoice?: EmailConfirmationChoice
  invalidReward?: InvalidReward
}

export interface InvalidReward {
  reasonCode?: number
  message?: string
  upc?: string
  rewardCertificate?: RewardCertificates
}

export interface RetryLoyaltyEnrollOrLookupParams {
  firstName?: string
  lastName?: string
  street?: string
  apartment?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email?: string
  storeNumber?: number
  lastItem?: string
  loyaltyAccount?: string
}

export interface AvailableRewards {
  activeDate: string
  expirationDate: string
  graceExpirationDate: string
  onlineCertificateNumber: string
  rewardAmount: number
  rewardCertificateNumber: string
  status: number
  statusDescription: string
  rewardTypeDescription: string
}

export type Customer = {
  id: number
  firstName: string
  lastName: string
  emailAddress: string
  street: string
  apartment: string
  city: string
  state: string
  zip: string
  homePhone: string
  loyalty: string
  subAccount: string
  currentPointBalance: number
  rewardAmount: number
}

export type PartyAttributesType = {
  attributes: {
    /* eslint-disable camelcase */
    nike_connected?: boolean
  }
}

export interface AccountLevelDetails {
  rewards: AvailableRewards[]
  tier: Tier
  points: Points
  partyAttributes: PartyAttributesType
}

interface Tier {
  tier: number
  tierDescription: string
}

interface Points {
  currentPointBalance: number
  rewardAmount: number
  pointsToNextReward: number
  currentRewardTier: number
  nextRewardTier: number
}

function loyaltyData (
  state: LoyaltyDataTypes = {
    phoneInput: '',
    phoneOutput: '',
    lastPhoneLookup: null,
    lastCustomerLookup: null,
    firstNameInput: '',
    lastNameInput: '',
    zipInput: '',
    isNoAccountFound: false, // set to true if no accounts or multiple accounts linked to phone number
    didCreatedAccountExist: false,
    loyaltyError: null,
    retryParameters: {
      firstName: '',
      lastName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      storeNumber: 0,
      lastItem: '',
      loyaltyAccount: ''
    },
    retryType: '',
    loyaltyCustomers: null,
    selectedLoyaltyCustomer: null,
    altScreenName: null,
    accountLevelDetails: null,
    rewardCountToDisplay: 0,
    lastAppliedReward: null,
    removeRewardError: false,
    pickYourPointsAvailable: false,
    pinpadReceiptChoice: '',
    emailConfirmationChoice: EmailConfirmationChoice.NotSet,
    invalidReward: {}
  },
  action
): LoyaltyDataTypes {
  switch (action.type) {
  case UPDATE_LOYALTY_DATA:
    return {
      ...state,
      loyaltyError: null,
      ...action.data
    }
  default:
    return state
  }
}

export default loyaltyData
