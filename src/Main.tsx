import { Provider } from 'react-redux'
import configureStore from './configureStore'
import Routes from './routes/Routes'

const store = configureStore()

const Main = () => (
  <Provider store={store}>
    <Routes/>
  </Provider>
)

export default Main

export type AppDispatch = typeof store.dispatch
