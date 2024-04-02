import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import monitorReducersEnhancer from './enhancers/monitorReducers'
import { rootReducer } from './reducers'

export default function configureAppStore (preloadedState) {
  // Configure redux store. Also, make reduxStore variable accessible from the global state
  window.reduxStore = configureStore({
    reducer: rootReducer,
    middleware: [...getDefaultMiddleware()],
    preloadedState,
    enhancers: [monitorReducersEnhancer]
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => window.reduxStore.replaceReducer(rootReducer))
  }

  return window.reduxStore
}
