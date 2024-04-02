import { buildNumber } from './coordinatorAPI'

const loggingHeader = 'utils > autoReload > '
/**
 * Checks for latest build number from server and hard reloads browser if different from local build number. This loads the latest build files.
 */
export const autoReload = (): void => {
  console.info('ENTER: ' + loggingHeader + 'autoReload')

  const headers: HeadersInit = new Headers()
  headers.set('pragma', 'no-cache')
  headers.set('cache-control', 'no-cache')

  fetch('meta.json', { method: 'GET', headers: headers })
    .then(res => res.json())
    .then(data => {
      data['build-number'] !== buildNumber && window.location.reload()
    })
    .catch(err => {
      console.error('ERROR: ' + loggingHeader + 'Failure to fetch ReactPOS build number: ', err)
    })
}
