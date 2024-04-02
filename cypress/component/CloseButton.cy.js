import CloseButton from '../../src/components/reusable/CloseButton'

describe('Close Button component tests', () => {

    it('Test 1: The Close Button renders correctly', () => {

        cy.mount(<CloseButton testID='closeButton'/>)
        cy.get('[data-testid="closeButton"]')
            .should('be.visible')
            .should('have.text', 'Close')
    })

    it('Test 2: Clicking the Close Button calls dismisser', () => {
        const dismisser = cy.spy()

        cy.mount(<CloseButton testID='closeButton' dismisser={dismisser}/>)
        cy.get('[data-testid="closeButton"]')
            .click()
            .then(() => {
                expect(dismisser).to.have.been.calledOnce
            })
    })

})