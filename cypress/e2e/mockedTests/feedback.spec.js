/// <reference types="cypress" />
import elements from '../../support/pageElements'
import generalFeedbackResponse from '../../fixtures/feedback/generalFeedbackResponse.json'
import featureRequestResponse from '../../fixtures/feedback/featureRequestResponse.json'
import technicalIssueResponse from '../../fixtures/feedback/technicalIssueResponse.json'

context('Feedback tests', () => {
  beforeEach(() => {
    cy.launchPageLoggedIn()
    tags.feedback().click()
  })

  const tags = new elements()

  it('Test 1: Clicking the feedback button brings up the feedback modal.', () => {
    tags.feedbackModal().should('be.visible')
  })

  it('Test 2: Feedback modal contains options, text entry, send, and close buttons.', () => {
    tags.feedbackOptions().should('be.visible')
    tags.feedbackTextEntry().should('be.visible')
    tags.feedbackSendButton().should('be.visible')
        .and('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.feedbackLearnMoreButton().should('be.visible')
    tags.modalCloseButton('feedback').should('be.visible')
    cy.get('body').should('contain.text', 'FEEDBACK')
  })

  it('Test 3: There should be 3 feedback options', () => {
    tags.feedbackOptions().select('Technical Issue').should('be.visible')
      .should('have.value', 3)
    tags.feedbackOptions().select('Feature Request').should('be.visible')
      .should('have.value', 2)
    tags.feedbackOptions().select('General Feedback').should('be.visible')
      .should('have.value', 1)
  })

  it('Test 4: Feedback can not be submitted without one of the options being selected.', () => {
    tags.feedbackTextEntry().click()
      .type('This is feedback without selecting a feedback option.', { force: true })
    tags.feedbackSendButton().should('not.be.enabled')
  })

  it('Test 5: The Send button is not active if no text is entered.', () => {
    tags.feedbackOptions().select('General Feedback')
    tags.feedbackSendButton().should('not.be.enabled')
  })

  it('Test 6: General feedback is accurately sent after entering text and pressing Send', () => {
    tags.feedbackOptions().select('General Feedback')
    tags.feedbackTextEntry().type('General feedback from automation', { force: true})
    cy.intercept('**/Feedback/SendFeedback', { body: generalFeedbackResponse } ).as('feedbackSubmission')
    tags.feedbackSendButton().click()
    cy.wait('@feedbackSubmission').its('request.body.feedbackType').should('contain', 1)
    cy.get('@feedbackSubmission').its('request.body.message').should('contain', 'General feedback from automation')
    tags.transactionFeedbackSuccessClose().click()
  })

  it('Test 7: Feature Request feedback is accurately sent after entering text and pressing Send', () => {
    tags.feedbackOptions().select('Feature Request')
    tags.feedbackTextEntry().type('Feature Request feedback from automation', { force: true})
    cy.intercept('**/Feedback/SendFeedback', { body: featureRequestResponse } ).as('feedbackSubmission')
    tags.feedbackSendButton().click()
    cy.wait('@feedbackSubmission').its('request.body.feedbackType').should('contain', 2)
    cy.get('@feedbackSubmission').its('request.body.message').should('contain', 'Feature Request feedback from automation')
    tags.transactionFeedbackSuccessClose().click()
  })

  it('Test 8: Technical Issue feedback is accurately sent after entering text and pressing Send', () => {
    tags.feedbackOptions().select('Technical Issue')
    tags.feedbackTextEntry().type('Technical Issue feedback from automation', { force: true})
    cy.intercept('**/Feedback/SendFeedback', { body: technicalIssueResponse } ).as('feedbackSubmission')
    tags.feedbackSendButton().click()
    cy.wait('@feedbackSubmission').its('request.body.feedbackType').should('contain', 3)
    cy.get('@feedbackSubmission').its('request.body.message').should('contain', 'Technical Issue feedback from automation')
    tags.transactionFeedbackSuccessClose().click()
  })

  it('Test 9: Learn more button is selected', () => {
    tags.feedbackLearnMoreButton().click()
    tags.gettingStartedModal().should('have.text', 'GETTING STARTED WITH ENDZONE')
    tags.gettingStartedModalJustAddedSection().should('be.visible')
    tags.gettingStartedModalUseNCRSection().should('be.visible')
    tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
    tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(196, 196, 196)')
    tags.breadcrumb(3).should('have.css', 'background-color', 'rgb(196, 196, 196)')
    tags.gettingStartedNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
        .and('have.text', 'NEXT')
    tags.gettingStartedCloseButton().should('be.visible')
        .click()
    tags.omniScan().should('be.visible')
  })

  it('Test 10: Feedback errors are handled correctly', () => {
    tags.feedbackOptions().select('Technical Issue')
    tags.feedbackTextEntry().type('Technical Issue feedback from automation', { force: true})
    cy.intercept('**/Feedback/SendFeedback', { statusCode: 500 } ).as('feedbackSubmissionError')
    tags.feedbackSendButton().click()
    cy.wait('@feedbackSubmissionError')
    cy.intercept('**/Feedback/SendFeedback', { body: technicalIssueResponse }).as('feedbackSubmissionSuccess')
    tags.transactionFeedbackErrorRetry().click()
    cy.wait('@feedbackSubmissionSuccess')
    tags.transactionFeedbackSuccessClose().click()
  })
})
