import * as CoordinatorAPI from '../utils/coordinatorAPI'
import * as Storage from '../utils/asyncStorage'

const loggingHeader = 'actions > surveyActions > '

export const sendSurveyResponse = async (data: string, surveyConfigurationString: string): Promise<void> => {
  console.debug('BEGIN: ' + loggingHeader + 'sendSurveyResponse with response ' + data)

  let responseObject = null
  try {
    const surveyConfiguration = JSON.parse(surveyConfigurationString)
    responseObject = {
      formId: surveyConfiguration.formId,
      pageName: surveyConfiguration.pageName,
      surveyQuestionName: surveyConfiguration.name,
      surveyQuestionId: surveyConfiguration.id,
      type: surveyConfiguration.type,
      customParameters: surveyConfiguration.customParameters,
      value: data
    }
  } catch (error) {
    console.error(loggingHeader + 'Error parsing survey configuration into feedback response' + JSON.stringify(error))
  }

  if (responseObject) {
    return CoordinatorAPI.sendSurveyResponse(responseObject)
      .then(res => {
        if (!res.ok) {
          console.error(loggingHeader + 'sendSurveyResponse: Failure sending survey response\n' + JSON.stringify(res))
        }
        console.debug('END: ' + loggingHeader + 'sendSurveyResponse')
      })
      .catch(error => {
        console.error(loggingHeader + 'sendSurveyResponse: Failure sending survey response\n' + JSON.stringify(error))
      })
  }
}

export const getSurveyConfiguration = (): Promise<void> => {
  console.debug('BEGIN: ' + loggingHeader + 'getSurveyConfiguration')
  return CoordinatorAPI.getSurveyConfiguration()
    .then(res => {
      if (!res.ok) {
        console.error(loggingHeader + 'getSurveyConfiguration: Could not get survey configuration\n' + JSON.stringify(res))
        throw new Error('Could not get survey configuration')
      } else if (res.status === 200) {
        return res.json()
      }
    })
    .then(async data => {
      if (data) {
        const stringData: string = JSON.stringify(data)
        await Storage.storeData('surveyConfiguration', stringData)
      } else {
        await Storage.removeItems(['surveyConfiguration'])
      }
      console.debug('END: ' + loggingHeader + 'getSurveyConfiguration')
    })
    .catch(error => {
      console.error(loggingHeader + 'getSurveyConfiguration: Error\n' + JSON.stringify(error))
    })
}
