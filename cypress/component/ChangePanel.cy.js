import ChangePanel from "../../src/components/ChangePanel";

const changeDueText = '#change-due'
const changeDue = '[data-testid="change-due"]'
const closeRegisterInstructions = '[data-testid="close-register-instructions"]'

describe('ChangePanel Component Tests', () => {

    it.only('Test 1: ChangePanel mounts and displays as expected for cash tender', () => {
        cy.mount(<ChangePanel cashTendered={2} changeDue={1} tenderType={'Cash'}/>)
        cy.get('body').should('contain', 'Cash Tendered: $2.00')
        cy.contains('Cash Tendered:').should('have.css', 'font-size', '20px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.contains('Cash Tendered:').children(1).should('have.css', 'font-size', '36px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.get(changeDueText).should('have.text', 'Change Due: $1.00')
            .should('have.css', 'font-size', '20px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.get(changeDueText).children(1).should('have.css', 'font-size', '36px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.get(changeDue).should('have.css', 'font-size', '62px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.get(closeRegisterInstructions).should('have.text', 'Close Register Drawer After Giving Customer Change')
            .should('have.css', 'text-align', 'center')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
    })

    it('Test 2: ChangePanel mounts and displays as expected for return refund due', () => {
        cy.mount(<ChangePanel cashTendered={-2} isCashRefund={true} />)
        cy.get('body').should('contain', 'Refund Due: $2.00')
        cy.contains('Refund Due:').should('have.css', 'font-size', '20px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.contains('Refund Due:').children(1).should('have.css', 'font-size', '36px')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
        cy.get(closeRegisterInstructions).should('have.text', 'Close Register Drawer After Giving Customer Refund')
            .should('have.css', 'text-align', 'center')
            .should('have.css', 'color', 'rgb(0, 0, 0)')
    })
})