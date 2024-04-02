import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../TodoActions'
import fetchMock from 'fetch-mock'
import expect from 'expect' // You can use any testing library

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('async actions', () => {
  // afterEach(() => {
  //   fetchMock.restore()
  // })

  it('creates UPDATE_TRANSACTION_DATA when called', () => {
    // Should this be calling a coordinatorAPI function? Could I just mock those functions or use fetchMock there?
    fetchMock.getOnce('/todos', {
      body: { todos: ['do something'] },
      headers: { 'content-type': 'application/json' }
    })

    const expectedActions = [
      { type: 'RECEIVE_ASSOCIATE_DATA' },
      { type: 'FETCH_TODOS_SUCCESS', body: { todos: ['do something'] } }
    ]
    const store = mockStore({
      authenticated: true,
      associateId: '1234567',
      firstName: 'Johnny',
      lastName: 'Cashier'
    })

    return store
      .dispatch(actions.authenticateUser(1234567, 111111, 42))
      .then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions)
      })
  })
})
