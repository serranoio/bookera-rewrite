/// <reference types="cypress" />

const enterElement = () => {
	return cy.enterCreateElement().find("create-right-panel-element").shadow()
}

const enterProductivityPanel = () => {
		return cy.enterCreateElement().find('productivity-panel-element').shadow()
}

const TIME_ACTION = "time-action"

const changeTimeTo6Seconds = () => {
	cy.getIconButton('settings-button').click();
	cy.get('sl-input[data-test="focus-input"]').invoke('attr', 'step', '.1').invoke('attr', 'value', '.1').trigger('sl-change', {force: true})
	cy.get('sl-input[data-test="break-input"]').invoke('attr', 'step', '.1').invoke('attr', 'value', '.1').trigger('sl-change', {force: true})
}

describe('Pomodoro Timer', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:3000/studio')
    cy.viewport(1440, 900)

		enterElement().within(() => {
			cy.get('[data-test="productivity-button"]').click()
		})

		enterProductivityPanel().within(() => {
			changeTimeTo6Seconds()
		})
  })

	// I can only start testing this when I expose the ability to set a time

  it('should start the timer. Cannot change time while timer has started. Can pause the timer.', () => {
		enterProductivityPanel().within(() => {
			
			cy.log("Starting timer")
			cy.getIconButton(TIME_ACTION).click();
			cy.contains('sl-button', 'Focus').should('have.attr', 'variant', 'primary')
			cy.wait(6000);
			
			cy.contains('[data-test="time"]', '00:00').should('exist')
			cy.log("Timer should alternate between focus and break times according to the set time periods")
			cy.contains('sl-button', 'Focus').should('have.not.attr', 'variant', 'primary')
			cy.contains('sl-button', 'Break').should('have.attr', 'variant', 'primary')
			cy.wait(6000);
			cy.contains('[data-test="time"]', '00:00').should('exist')
			cy.contains('sl-button', 'Focus').should('have.attr', 'variant', 'primary')
			cy.contains('sl-button', 'Break').should('have.not.attr', 'variant', 'primary')
		})
	})

	
	it('should play and pause the timer', () => {
		enterProductivityPanel().within(() => {
			cy.log("Start")
			cy.getIconButton(TIME_ACTION).click();
			cy.get('[data-test="time"]').should('contain.text', "00:06");
			
			cy.log('Wait 2 seconds, time will be 4 seconds. pause')
			cy.wait(2000)
			cy.getIconButton(TIME_ACTION).click();
			cy.get('[data-test="time"]').should('contain.text', "00:04");
			
			cy.log('Wait 2 seconds, time will STILL be 4 seconds')
			cy.wait(2000)
			cy.get('[data-test="time"]').should('contain.text', "00:04");
			
			cy.log('Play, should say 00:00 after 4 seconds')
			cy.getIconButton(TIME_ACTION).click();
			cy.wait(4000)
			cy.get('[data-test="time"]').should('contain.text', "00:00");
		})
	})
	
  it('should switch from focus timer to break timer when focus timer ends. Then when focus timer ends, it should go back to focus timer', () => {
		cy.enterCreateElement().find('productivity-panel-element').shadow().within(() => {
			cy.get('sl-input[data-test="break-input"]').should('not.have.attr', 'disabled')
			cy.get('sl-input[data-test="focus-input"]').should('not.have.attr', 'disabled')

			cy.log("Starting timer")
		cy.getIconButton(TIME_ACTION).click();
				cy.get('sl-input[data-test="break-input"]').should('have.attr', 'disabled', 'disabled')
				cy.get('sl-input[data-test="focus-input"]').should('have.attr', 'disabled', 'disabled')
		})
	})

	it('should let user switch to other mode by pressing it.', () => {

		enterProductivityPanel().within(() => {
			cy.log("Starting timer")
			cy.getIconButton(TIME_ACTION).click();
			cy.log('If focus => break, it will restart timer and setting statistics')
			cy.contains('sl-button', 'Break').click()

			cy.log('timer should be reset to break period')
			cy.get('[data-test="time"]').should('contain.text', "00:06");
			cy.wait(1000)
			
			cy.log('If break => focus, it will restart timer and setting statistics')
			cy.contains('sl-button', 'Focus').click()
			cy.get('[data-test="time"]').should('contain.text', "00:06");
			cy.wait(3000)
			
			cy.log('should be able to reset time period when paused as well')
			cy.getIconButton(TIME_ACTION).click();
			cy.contains('sl-button', 'Break').click()
			cy.get('[data-test="time"]').should('contain.text', "00:06");
		})
	})
	
  it('should continue to count despite page reload', () => {
		enterProductivityPanel().within(() => {
		})
	})
	
	// TODO: THIS test is not finished.
  it('should count statistics correctly.', () => {
		enterProductivityPanel().within(() => {
			cy.getIconButton(TIME_ACTION).click();
		})
		cy.typeInDocument(" 3 words here")
		
		enterProductivityPanel().within(() => {
			// cy.getIconButton(TIME_ACTION).click();
			// cy.getIconButton(TIME_ACTION).click();
			cy.wait(7000);
			cy.contains('sl-button', 'End Session').click()
			// now we need to see that the word count is 3
			cy.get("#pomodoro-chart").should('have.attr', 'word_counts','3-0')
		})
		
	})

  it('Productivity / Words => also include DELTA for statistics', () => {
		enterProductivityPanel().within(() => {
			cy.getIconButton(TIME_ACTION).click();
		})
		cy.typeInDocument(" 3 words here")
		
		enterProductivityPanel().within(() => {
			// cy.getIconButton(TIME_ACTION).click();
			// cy.getIconButton(TIME_ACTION).click();
			cy.wait(7000);
			cy.contains('sl-button', 'End Session').click()
			// now we need to see that the word count is 3
			cy.get("#pomodoro-chart").should('have.attr', 'word_counts','3-0')
		})
		
	})
})