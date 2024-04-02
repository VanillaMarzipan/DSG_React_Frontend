/// <reference types="cypress" />

import FeedbackError from "../../src/components/reusable/FeedbackError"

describe('Feedback error component tests', () => {

    it('Test 1: Clicking the Close button calls onClose function', () => {
        const onClose = cy.spy()

        cy.mount(<FeedbackError onClose={onClose}/>)
        cy.contains('CLOSE')
            .should('have.css', 'backgroundColor', 'rgba(0, 0, 0, 0)')
            .click()
            .then(() => {
                expect(onClose).to.have.been.calledOnce
            })
    })

    it('Test 2: Clicking the Submit button calls onRetry function', () => {
        const onRetry = cy.spy()

        cy.mount(<FeedbackError onRetry={onRetry}/>)
        cy.get('[data-testid="transaction-feedback-error-retry"]')
            .should('have.text', 'SUBMIT AGAIN')
            .should('have.css', 'backgroundColor', 'rgb(187, 88, 17)')
            .click()
            .then(() => {
                expect(onRetry).to.have.been.calledOnce
            })
    })

    it('Test 3: Error messages display properly', () => {
        cy.mount(<FeedbackError errorMessage="TEST ERROR MESSAGE"/>)
        cy.contains('TEST ERROR MESSAGE').should('have.css', 'color', 'rgb(177, 2, 22)')
        cy.contains('Please wait a moment and try again later.').should('have.css', 'color', 'rgb(177, 2, 22)')
    })
})