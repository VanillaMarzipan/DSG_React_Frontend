// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import '@cypress/code-coverage/support'
import 'react'
import 'react-native'
import { mount } from 'cypress/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../src/reducers/index'

// Alternatively you can use CommonJS syntax:
// require('./commands')

//  Mount command to be used when testing components that take data from a redux store
Cypress.Commands.add('mount', (component, options = {}) => {
    const { reduxStore = configureStore({ reducer: rootReducer }), ...mountOptions } = options
    const wrapped = <Provider store={reduxStore}>{component}</Provider>
    return mount(wrapped, mountOptions) 
  })

// Example use:
// cy.mount(<MyComponent />)