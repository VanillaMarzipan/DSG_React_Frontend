import FooterOverlayModal from "../../src/components/reusable/FooterOverlayModal";

describe('Footer Overlay Modal component tests', () => {

    const closeButton = '[data-testid="modal-close-button-undefined"]'
    const styledTextColor = Cypress.env().styledTextColor

    it('Test 1: Clicking Close button calls onClickClose function', () => {
        const onClickClose = cy.spy()

        cy.mount(<FooterOverlayModal onClickClose={onClickClose} dismissable={true}/>)
        cy.get(closeButton)
            .click()
            .then(() => {
                expect(onClickClose).to.have.been.calledOnce
            })

    })

    it('Test 2: Modal has correct styles, default font size when headingSize is not set is 24px', () => {
        cy.mount(<FooterOverlayModal modalHeading="Test Footer Overlay" modalName="footer-overlay" dismissable={true} centerChildren={true} anchorToFooter={true} />)
        cy.get('[data-testid="modal-title-footer-overlay"]')
            .should("have.text", "Test Footer Overlay")
            .should("have.css", "fontFamily", "DSG-Sans-Bold")
            .should("have.css", "color", styledTextColor)
            .should("have.css", "text-transform", "uppercase")
            .should("have.css", "font-size", "24px")
    })    

    it('Test 3: Heading font size matches headingSize when set', () => {
        cy.mount(<FooterOverlayModal modalHeading="Test Footer Overlay" modalName="footer-overlay" dismissable={true} centerChildren={true} anchorToFooter={true} headingSize={50}/>)
        cy.get('[data-testid="modal-title-footer-overlay"]').should("have.css", "font-size", "50px")
    })

})           