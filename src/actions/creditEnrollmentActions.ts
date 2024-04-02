import { CreditEnrollmentDataType } from '../reducers/creditEnrollmentData'

export const UPDATE_CREDIT_ENROLLMENT_DATA = 'UPDATE_CREDIT_ENROLLMENT_DATA'
const loggingHeader = 'actions > creditEnrollmentActions > '

export const receiveCreditEnrollmentData = (data: CreditEnrollmentDataType) => (dispatch): void => {
  console.info('ENTER: ' + loggingHeader + 'updateCreditEnrollmentData\n' + JSON.stringify(data))
  dispatch(updateCreditEnrollmentData(data, UPDATE_CREDIT_ENROLLMENT_DATA))
}

export const clearCreditEnrollmentData = () => (dispatch): void => {
  console.info('ENTER: ' + loggingHeader + 'clearCreditEnrollmentData\n')
  dispatch(updateCreditEnrollmentData({
    enrollmentProcessStep: 1,
    enrollmentLookupStep: 1,
    phoneNumber: '',
    enrollmentStatus: 'none',
    loyaltyLookupStatus: 'default',
    loyaltyData: null,
    enrollingAssociateId: null,
    creditLookupActive: false,
    creditLookupStatus: 'none',
    creditLookupStep: 1,
    creditModalFlow: 'none'
  }, UPDATE_CREDIT_ENROLLMENT_DATA))
}

export const updateCreditEnrollmentData = (
  data: CreditEnrollmentDataType,
  actionType: string
): { type: string; data: CreditEnrollmentDataType } => {
  return {
    type: actionType,
    data
  }
}
