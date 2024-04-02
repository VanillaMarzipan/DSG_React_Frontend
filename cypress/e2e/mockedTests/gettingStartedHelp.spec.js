/// <reference types="cypress" />
import elements from '../../support/pageElements'

const tags = new elements()

context('Getting Started Under Help Button', ()=>{

    beforeEach(()=>{
        cy.launchPageLoggedIn()
    })

    it('Test 1: Validating Help Button is Visible and Clickable ', ()=>{
        tags.helpButton().should('be.visible')
            .click()
        tags.gettingStarted().should('be.visible')
    })
    it('Test 2: Validating Getting Started Modal Page 1 Has Correct Verbiage and Close Button is Closing the Modal', ()=>{
        tags.helpButton().click()
        tags.gettingStarted().should('be.visible')
            .click()
        tags.gettingStartedModal().should('have.text', 'GETTING STARTED WITH ENDZONE')
        tags.gettingStartedModalJustAddedSection().should('be.visible')
        tags.gettingStartedModalUseNCRSection().should('be.visible')
        tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.breadcrumb(3).should('have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.gettingStartedNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
        .should('have.text', 'NEXT')
        tags.gettingStartedCloseButton().should('be.visible')
            .click()
        tags.omniScan().should('be.visible')
    })
    it('Test 3: Validating Getting Started Modal Page 2 Has Correct Verbiage and Close Button is Closing the Modal', ()=>{
        tags.helpButton().click()
        tags.gettingStarted().click()
        tags.gettingStartedNextButton().click()
        tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(3).should('have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.gettingStartedNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
            .should('have.text', 'NEXT')
        tags.gettingStartedCloseButton().should('be.visible')
            .click()
        tags.omniScan().should('be.visible')
    })
    it('Test 4: Validating Getting Started Modal Page 3 Has Correct Verbiage and Complete Button is Closing the Modal', ()=>{
        tags.helpButton().click()
        tags.gettingStarted().click()
        tags.gettingStartedNextButton().click()
        tags.gettingStartedNextButton().click()
        tags.gettingStartedModalWhatToExpectWithMetricsSection().should('be.visible')
        tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(3).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.gettingStartedModalContactServiceDesk().should('be.visible')
        tags.gettingStartedNextButton().should('have.text', 'COMPLETE')
            .should('have.css', 'background-color', 'rgb(197, 113, 53)')
            .click()
        tags.omniScan().should('be.visible')
    })
    it('Test 5: Validating Getting Started Modal Page 3 Has Close Button is Closing the Modal', ()=>{
        tags.helpButton().click()
        tags.gettingStarted().click()
        tags.gettingStartedNextButton().click()
        tags.gettingStartedNextButton().click()
        tags.gettingStartedCloseButton().should('be.visible')
            .click()
        tags.omniScan().should('be.visible')
    })
})

