/**
 * Initialize RumRunner analytics script
 */
export const initRumRunner = (enabled) => {
  if (window) {
    if (enabled && !window.elkRUM) {
      console.info('Init Rum Runner')
      const rr = document.createElement('SCRIPT')
      let src = "'#{rumrunnerSrc}#'"
      if (src.indexOf('rumrunnerSrc') > 0) { // if Azure DevOps token replacement didn't happen (e.g. running locally)
        src = 'rum-runner-non-prod.min.js'
      }
      rr.type = 'text/javascript'
      rr.src = src
      document.getElementsByTagName('head')[0].appendChild(rr)
    } else if (!enabled && window.elkRUM) {
      console.info('Refresh to remove Rum Runner')
      window.location.reload()
    }
  }
}

/**
 * Send event data to RumRunner
 * @param {string} eventName Name of event to track
 * @param {object} data Key value pairs of data being tracked
 */
export const sendRumRunnerEvent = (eventName, data) => {
  if (window && window.elkRUM && window.elkRUM.setCustom) {
    window.elkRUM.setCustom(eventName, data)
  }
}
