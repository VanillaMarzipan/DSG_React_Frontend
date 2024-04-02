import PrintButton from "../../src/components/reusable/PrintDetailsButton";

describe('Print Details Button component tests', () => {

    it('Test 1: Clicking the Print Details button calls onPress', () => {
        const onPress = cy.spy()

        cy.mount(<PrintButton testID="print-button" onPress={onPress}/>)
        cy.get('[data-testid="print-button"]')
            .click()
            .then(() => {
                expect(onPress).to.have.been.called
            })
    })

    it('Test 2: Print Details Button has correct color and text', () => {
        cy.mount(<PrintButton testID="print-button"/>)
        cy.get('[data-testid="print-button"] > div')
            .should('have.text', 'Print Details')
            .should('have.css', 'color', 'rgba(0, 0, 0, 0.87)')
            .should('have.css', 'font-family', 'Archivo')
    })
})