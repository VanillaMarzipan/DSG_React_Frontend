import CouponOverrideButton from "../../src/components/CouponOverrideButton";

describe('CouponOverrideButton Component Tests', () => {

    it('Test 1: Coupon not selected', () => {
        cy.mount(<CouponOverrideButton buttonText={'OVERRIDE'} testId={'coupon-override-button'} isSelected={false} />)
        cy.get('[data-testid="coupon-override-button"]').should('have.text', 'OVERRIDE')
            .should('not.have.css', 'background-color', 'rgb(0, 101, 84)')
    })

    it('Test 2: Coupon is selected', () => {
        cy.mount(<CouponOverrideButton buttonText={'COUPON ACCEPTED'} testId={'coupon-icon'} isSelected={true} />)
        cy.get('[data-testid="coupon-icon"]').should('have.text', 'COUPON ACCEPTED')
            .should('have.css', 'background-color', 'rgb(0, 101, 84)')
    })

    it('Test 3: Coupon Override Button calls onPress function when clicked', () => {
        const onPress = cy.spy()

        cy.mount(<CouponOverrideButton onPress={onPress} testId={'coupon-override-button'} isSelected={false}/>)
        cy.get('[data-testid="coupon-override-button"]')
            .click()
            .then(() => {
                expect(onPress).to.have.been.calledOnce
            })
    })

    it('Test 4: Coupon Override Button has correct CSS when disabled', () => {
        cy.mount(<CouponOverrideButton testId={'coupon-override-button'} disabled={true} />)
        cy.get('[data-testid="coupon-override-button"]')
            .should('have.css', 'background-color', 'rgb(200, 200, 200)')
            .should('have.css', 'border-width', '0px')

    })
})