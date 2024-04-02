export const GetModalTitle = (failedOperation: string): string => {
  if (failedOperation === 'finalizeTransaction') return 'FINALIZE ERROR'
  if (failedOperation === 'createNewCreditTender') return 'PAYMENT ERROR'
  if (failedOperation === 'closeRegister') return 'REGISTER ERROR'
}

export const GetModalUserMessage = (failedOperation: string, timeToCallServiceDesk: boolean): string => {
  if (failedOperation === 'finalizeTransaction') return 'Endzone is working on sending data from the previous transaction.'
  if (failedOperation === 'createNewCreditTender') {
    if (timeToCallServiceDesk) {
      return 'Endzone was unable to authorize payment.'
    }
    return 'Endzone is working on authorizing payment.'
  }
  if (failedOperation === 'closeRegister') {
    if (timeToCallServiceDesk) {
      return 'Endzone was unable to process closing of the register.'
    }
    return 'Endzone is working on processing closing register data.'
  }
}

export const GetModalTimeout = (failedOperation: string): number => {
  if (failedOperation === 'finalizeTransaction') return 180000
  if (failedOperation === 'createNewCreditTender' || failedOperation === 'closeRegister') return 60000
}
