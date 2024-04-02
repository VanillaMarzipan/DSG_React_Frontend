import { PendingManagerOverrideData } from '../reducers/managerOverrideData'

export const RECEIVE_MANAGER_OVERRIDE_INFO = 'RECEIVE_MANAGER_OVERRIDE_INFO'
export const CLEAR_MANAGER_OVERRIDE_INFO = 'CLEAR_MANAGER_OVERRIDE_INFO'

export const receiveManagerOverrideInfo = (data: PendingManagerOverrideData[]): { type: string; data: PendingManagerOverrideData[] } => {
  return {
    type: RECEIVE_MANAGER_OVERRIDE_INFO,
    data
  }
}

export const clearManagerOverrideInfo = () => {
  return {
    type: CLEAR_MANAGER_OVERRIDE_INFO
  }
}
