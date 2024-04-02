import FeedbackSuccess from "../../src/components/reusable/FeedbackSuccess";

describe('Feedback Success component tests', () => {

    it('Test 1: onClose is called after 5 second timeout', () => {
        const onClose = cy.spy().as('closeButton')

        cy.mount(<FeedbackSuccess onClose={onClose}/>)
            cy.wait(5000)
            .then(() => {
                expect(onClose).to.have.been.calledOnce
            }) 
    })

    it('Test 2: onClose is called when CLOSE button is clicked', () => {
        const onClose = cy.spy()

        cy.mount(<FeedbackSuccess onClose={onClose}/>)
        cy.get('[data-testid="transaction-feedback-success-close"]')
            .click()
            .then(() => {
                expect(onClose).to.have.been.calledOnce
            })
    })

    it('Test 3: FeedbackSuccess component has correct text and styles', () => {
        cy.mount(<FeedbackSuccess />)
        cy.contains('Thank you! Your feedback has been submitted successfully.')
            .should('be.visible')
            .should('have.css', 'color', 'rgba(0, 0, 0, 0.87)')
        cy.contains('This popup will close in 5 seconds...')
            .should('be.visible')
            .should('have.css', 'color', 'rgba(0, 0, 0, 0.87)')
        cy.get('[data-testid="transaction-feedback-success-close"]')
            .should('have.text', 'CLOSE')
            .should('have.css', 'background-color', 'rgb(187, 88, 17)')
    })

})