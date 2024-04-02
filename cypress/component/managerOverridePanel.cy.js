/// <reference types="cypress" />

import ManagerOverridePanel from "../../src/components/reusable/ManagerOverridePanel";
//import { DARK_MODE } from "../../src/actions/themeActions";

describe('ManagerOverridePanel component tests', () => {

    const headers = {
        mainHeader:'MainHeader',
        subHeader: 'SubHeader',
        mainText: 'MainText'
    }

    const theme = {
        backgroundColor: '#ffffff',
        fontColor: 'rgba(0,0,0,0.87)',
        buttonBackground: '#006554',
        transactionCardBackground: '#f1f1f1'
    }
    const managerOverridePanel = '[data-testid="manager-override-modal"]'
    const declineButton = '[data-testid="decline-manager-override"]'
    

    it('Test 1: should render the MO panel with headers', () => {
        cy.mount(<ManagerOverridePanel 
            theme={theme}
            headers={headers}
        />)
        cy.get(managerOverridePanel).should('be.visible')
    })
    it('Test 2: should call the handleDecline function when the decline button is clicked', () => {
        const handleDecline= cy.spy()
        const setErrorMessage = cy.spy()
        cy.mount(<ManagerOverridePanel 
            headers={headers}
            handleDecline={handleDecline}
            theme={theme}
            setErrorMessage={setErrorMessage}
        />)
        cy.get(declineButton).click()
            .then(()=> {
                expect(handleDecline).to.be.calledOnce
            }
        )
    })
    it('Test 3: should call the onSubmitManagerCredentials function when the decline button is clicked', () => {
        const applyButton = '[data-testid="apply-manager-override"]'
        const associateID = '[data-testid="associate-id"]'
        const associatePin = '[data-testid="associate-pin"]'
        const setErrorMessage = cy.spy()
        const onSubmitManagerCredentials = cy.spy()
        cy.mount(<ManagerOverridePanel 
            headers={headers}
            theme={theme}
            onSubmitManagerCredentials={onSubmitManagerCredentials}
            setErrorMessage={setErrorMessage}
        />)
        cy.get(associateID).type('9876543')
        cy.get(associatePin).type('222222')
        cy.get(applyButton).click()
            .then(()=> {
                expect(onSubmitManagerCredentials).to.be.calledOnce
            }
        )
    })
})