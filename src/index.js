import ReactDOM from 'react-dom'
import './index.css'
import App from './Main'
import * as serviceWorker from './serviceWorker'
import UnhandledException from './UnhandledException'

window.onerror = (e) => {
  console.error(`unhandled exception: ${e}`)
  try {
    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        applicationError: {
          state: 'unhandled exception',
          detail: JSON.stringify(e)
        }
      }
    })
  } catch { }
  ReactDOM.render(<UnhandledException title='An unhandled exception occurred'
    message={e}></UnhandledException>, document.getElementById('root'))
}

window.onunhandledrejection = event => {
  console.error(`unhandled promise rejection: ${event.reason}`)
  try {
    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        applicationError: {
          state: 'unhandled promise rejection',
          detail: JSON.stringify(event)
        }
      }
    })
  } catch { }
  ReactDOM.render(<UnhandledException title='An unhandled promise rejection occurred'
    message={event.reason}></UnhandledException>, document.getElementById('root'))
}

try {
  ReactDOM.render(<App/>, document.getElementById('root'))
} catch (error) {
  console.error(`unhandled component error: ${error.message}`)
  try {
    window.reduxStore.dispatch({
      type: 'UPDATE_UI_DATA',
      data: {
        applicationError: {
          state: 'component error',
          detail: JSON.stringify(error)
        }
      }
    })
  } catch { }
  ReactDOM.render(<UnhandledException title='An unhandled component error occurred'
    message={error.message}></UnhandledException>, document.getElementById('root'))
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
