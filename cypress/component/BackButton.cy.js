import BackButton from '../../src/components/BackButton'

const chevron = '[aria-label="Edit"] > svg'
const text= '[data-testid="back-button"]'

describe('BackButton Component Test', () => {
  
  it('Test 1: The back chevron appears as expected.', () => {
    cy.mount(<BackButton />)
    cy.get(chevron).should('be.visible')
  })

  it('Test 2: The back button has the correct text formatted as expected.', () => {
    cy.mount(<BackButton />)
    cy.get(text).should('be.visible')
      .should('contain.text', 'Back')
    cy.contains('Back').should('have.css', 'text-transform', 'uppercase')
      .should('have.css', 'font-weight', '700')
      .should('have.css', 'font-family', 'Archivo')
  })

  it('Test 3: The Back button calls the back function when pressed', () => {
    const back = cy.spy()

    cy.mount(<BackButton back={back}/>)
    cy.get(text)
      .click()
      .then(() => {
        expect(back).to.have.been.calledOnce
      })
  })
})