import { UPDATE_ANALYTICS_DATA } from '../actions/analyticsActions'

export type ModalStates = 'main' | 'voidReason' | 'textInput' | 'success' | 'error'

export interface AnalyticsData {
  modalState?: ModalStates
  feedback?: boolean
  warrantyModalClicks?: number
  warrantyPanelViewStartTime?: number
  warrantyPanelViewed?: boolean
}

function analyticsData (
  state: AnalyticsData = {
    modalState: 'main',
    feedback: false,
    warrantyModalClicks: 0,
    warrantyPanelViewStartTime: 0,
    warrantyPanelViewed: false
  },
  action
): AnalyticsData {
  switch (action.type) {
  case UPDATE_ANALYTICS_DATA:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default analyticsData
