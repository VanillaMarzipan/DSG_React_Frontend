import Breadcrumbs from '../../src/components/Breadcrumbs'

const breadcrumb1 = '[data-testid=breadcrumb-1]'
const breadcrumb2 = '[data-testid=breadcrumb-2]'
const breadcrumb3 = '[data-testid=breadcrumb-3]'

describe('Breadcumbs Component Tests', () => {

    it('Test 1: The breadcrumbs component mounts with a default value of 1.', () => {
        cy.mount(<Breadcrumbs />)
        cy.get(breadcrumb1).should('have.text', '1')
        cy.get(breadcrumb2).should('not.exist')
        cy.get(breadcrumb3).should('not.exist')
    })

    it('Test 2: The breadcrumbs load displaying the accurate number, and all gray by default.', () => {
        cy.mount(<Breadcrumbs breadcrumbCount={3} />)
        cy.get(breadcrumb1).should('have.text', '1')
            .should('have.css', 'background-color', 'rgb(196, 196, 196)')
        cy.get(breadcrumb2).should('have.text', '2')
            .should('have.css', 'background-color', 'rgb(196, 196, 196)')
        cy.get(breadcrumb3).should('have.text', '3')
            .should('have.css', 'background-color', 'rgb(196, 196, 196)')
    })

    it.only('Test 3: The breaccrumb for the current page is highlighed in green.', () => {
        cy.mount(<Breadcrumbs breadcrumbCount={3} currentProcessStep={2} />)
        cy.get(breadcrumb1).should('not.have.text', '1')
            .should('have.css', 'background-color', 'rgb(0, 141, 117)')
        cy.get(breadcrumb2).should('have.text', '2')
            .should('have.css', 'background-color', 'rgb(0, 141, 117)')
        cy.get(breadcrumb3).should('have.text', '3')
            .should('have.css', 'background-color', 'rgb(196, 196, 196)')
    })
})