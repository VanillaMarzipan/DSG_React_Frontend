import { UPDATE_CREDIT_ENROLLMENT_DATA } from '../actions/creditEnrollmentActions'
import { LoyaltyDataTypes } from './loyaltyData'

type EnrollmentStatusType =
  | 'none'
  | 'approval'
  | 'declined'
  | 'canceled'
  | 'timedOut'
  | 'generalError'

type CreditLookupStatusType =
  | 'none'
  | 'found'
  | 'notFound'
  | 'generalError'

type CreditModalFlowType =
  | 'none'
  | 'enrollment'
  | 'lookup'

type LoyaltyLookupStatusType =
  | 'default'
  | 'successOneAccount'
  | 'successMultipleAccounts'
  | 'noAccountFound'
  | 'generalError'

export interface CreditEnrollmentDataType {
  enrollmentProcessStep?: number
  enrollmentLookupStep?: number
  creditLookupStep?: number
  loyaltyData?: LoyaltyDataTypes
  loyaltyLookupStatus?: LoyaltyLookupStatusType
  phoneNumber?: string
  enrollmentStatus?: EnrollmentStatusType
  enrollingAssociateId?: string
  creditLookupActive?: boolean
  creditLookupStatus?: CreditLookupStatusType
  creditModalFlow?: CreditModalFlowType
}

const creditEnrollmentData = (
  state: CreditEnrollmentDataType = {
    enrollmentLookupStep: 1,
    enrollmentProcessStep: 1,
    creditLookupStep: 1,
    loyaltyData: null,
    loyaltyLookupStatus: 'default',
    phoneNumber: '',
    enrollmentStatus: 'none',
    enrollingAssociateId: null,
    creditLookupActive: false,
    creditLookupStatus: 'none',
    creditModalFlow: 'none'
  },
  action
): CreditEnrollmentDataType => {
  switch (action.type) {
  case UPDATE_CREDIT_ENROLLMENT_DATA:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default creditEnrollmentData
