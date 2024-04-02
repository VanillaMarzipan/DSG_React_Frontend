import AssociateDiscountDetail from '../../src/components/AssociateDiscountDetail'

const associateDiscountImage = '[data-testid="associateDiscount-icon"] > svg'
const associateDiscountText = '[data-testid="associateDiscount-icon"] > div'

describe('Associate Discount Applied Component Tests', () => {
  it('Test 1: Associate discount applied image has the right height, weight and color', () => {
    cy.mount(<AssociateDiscountDetail />)
    cy.get(associateDiscountImage).children(0).should('have.css', 'fill', 'rgb(0, 141, 117)')
    cy.get(associateDiscountImage).children(1).should('have.css', 'fill', 'rgb(0, 141, 117)')
  })

  it('Test 2: Associate discount applied text is correct, the right color, and font-size', () => {
    cy.mount(<AssociateDiscountDetail />)
    cy.get(associateDiscountText).should('have.text', 'Associate discount is successfully applied.')
      .should('have.css', 'font-weight', '400')
      .should('have.css', 'color', 'rgb(0, 0, 0)')
      .should('have.css', 'font-family', 'Archivo')
  })

  it('Test 3: Family Night text is correct and has correct color', () => {
    cy.mount(<AssociateDiscountDetail isFamilyNight={true}/>)
    cy.get(associateDiscountText)
      .should('have.text', 'Teammate and Family Sale coupon is successfully applied.')
      .should('have.css', 'color', 'rgb(0, 0, 0)')
    cy.get(associateDiscountImage).children(0).should('have.css', 'fill', 'rgb(0, 141, 117)')
    cy.get(associateDiscountImage).children(1).should('have.css', 'fill', 'rgb(0, 141, 117)')
  })

})