import DateTime from '../../src/components/DateTime'

describe('DateTime Component Tests', () => {

    let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    let dayAndDate = new Date().toString()
    let dayDateArray = dayAndDate.split(' ')
    let dateInt = parseInt(dayDateArray[2], 10)

    it('Test 1: DateTime Component Mounts as expected, with out "its" when transactionCardShowing is false', () => {
        cy.mount(<DateTime transactionCardShowing={false} />)
        cy.get('body').should('not.contain', 'It\'s')
        cy.get('body').should('contain', dayDateArray[0])
        cy.get('body').should('contain', dayDateArray[1])
        cy.get('body').should('contain', dateInt)
        cy.contains(dayDateArray[0]).should('have.css', 'font-family', 'Archivo')
            .should('have.css', 'color', 'rgb(121, 121, 121)')
        cy.contains(dayDateArray[1]).should('have.css', 'font-family', 'Archivo')
            .should('have.css', 'color', 'rgb(121, 121, 121)')
        cy.get('body').should('contain', currentTime)
        cy.contains(currentTime).should('have.css', 'font-family', 'Archivo')
            .should('have.css', 'color', 'rgb(121, 121, 121)')
    })

    it('Test 2: DateTime Component Mounts as expected, with "its" when transactionCardShowing is true', () => {
        cy.mount(<DateTime transactionCardShowing={true} />)
        cy.get('body').should('contain', 'It\'s')
        cy.get('body').should('contain', dayDateArray[0])
        cy.get('body').should('contain', dayDateArray[1])
        cy.get('body').should('contain', dateInt)
        cy.get('body').should('contain', currentTime)
        cy.contains(dayDateArray[0]).should('have.css', 'font-family', 'Archivo')
            .should('have.css', 'color', 'rgb(121, 121, 121)')
        cy.contains(dayDateArray[1]).should('have.css', 'font-family', 'Archivo')
            .should('have.css', 'color', 'rgb(121, 121, 121)')
        cy.get('body').should('contain', currentTime)
        cy.contains(currentTime).should('have.css', 'font-family', 'Archivo')
            .should('have.css', 'color', 'rgb(121, 121, 121)')
    })
})