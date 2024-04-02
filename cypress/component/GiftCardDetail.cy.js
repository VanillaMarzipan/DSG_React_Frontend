import GiftCardDetail from "../../src/components/GiftCardDetail";

const giftCardImage = 'body > div > div > svg > rect'

describe('GiftCardDetail Component Tests', () => {

    it('Test 1: Component mounts and displays active card details, without errors', () => {
        cy.mount(<GiftCardDetail accountNumber="1234567890123456" cardState="Active"/>)
        cy.get(giftCardImage).should('be.visible')
            .should('have.css', 'fill', 'url("#pattern0")')
        cy.get('body').should('contain', 'Description:')
            .should('contain', 'Gift Card')
            .should('contain', 'Account:')
            .should('contain', '123456******3456')
            .should('contain', 'State:')
            .should('contain', 'Active')
        cy.get('body').should('not.contain', 'Error: Already Active')
    })

    it('Test 2: Component mounts and displays active card details, with errors', () => {
        cy.mount(<GiftCardDetail accountNumber="1234567890123456" cardState="Active" error="Already Active"/>)
        cy.get(giftCardImage).should('be.visible')
            .should('have.css', 'fill', 'url("#pattern0")')
        cy.get('body').should('contain', 'Description:')
            .should('contain', 'Gift Card')
            .should('contain', 'Account:')
            .should('contain', '123456******3456')
            .should('contain', 'State:')
            .should('contain', 'Active')
        cy.get('body').should('contain', 'Error: Already Active')
        cy.contains('Error: Already Active').should('have.css', 'color', 'rgb(255, 0, 0)')
    })
})