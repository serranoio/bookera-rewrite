/// <reference types="cypress" />

import { enterElement } from "../settings.cy"

const enterOutlinePanel = () => {
	return cy.enterCreateElement().find('outline-notes-panel-element').shadow()
}

const mockOutline = `1
1.0.0.1	
1.0.1	
1.1
1.2	
1.3	
1.4
1.5
1.6
1.6.1
1.6.2
1.6.3
1.6.4`

const mockOutlineArray = ['<h1>1</h1>',
'<h4>1.0.0.1	</h4>',
'<h3>1.0.1	</h3>',
'<h2>1.1	</h2>',
'<h2>1.2	</h2>',
'<h2>1.3	</h2>',
'<h2>1.4	</h2>',
'<h2>1.5	</h2>',
'<h2>1.6	</h2>',
'<h3>1.6.1	</h3>',
'<h3>1.6.2	</h3>',
'<h3>1.6.3	</h3>',
'<h3>1.6.4	</h3>']


describe('Create Right Panel / Outline Notes', () => {

	before(() => {
    cy.visit('localhost:3000/studio')
    cy.viewport(1440, 900)

		enterElement().within(() => {
			cy.get('[data-test="outline-notes-button"]').click()
		})

		cy.typeInDocument("start", true)

		for (let i = 0; i < mockOutlineArray.length; i++) {
			cy.appendElement(mockOutlineArray[i])
		}
	})

	it('should filter by extractContentsConfig.mode', () => {

	})
	
	it('should filter by name, status', () => {
		enterOutlinePanel().within(() =>	{
			cy.log("filtering by 1.0")
			cy.get(".filter-string").shadow().within(() => {
				cy.get("input").type("1.0")
			})
			
			cy.get("dialog-element").should("have.length", 2)
			
			cy.log("Removing filter")
			cy.get(".filter-string").shadow().within(() => {
				cy.get("input").clear()
			})

			cy.get("dialog-element").should("have.length", 13)

			for (let i = 0; i < 6; i+= 2) {
				const select = cy.get("dialog-element").eq(i).find("sl-select")
				select.click()
	
				select.within(() => {
					cy.findByText("Complete").click()
				})
			}

			cy.log("Opening filters")
			cy.get(".filter").click()

			
			cy.get(".popup-filters").within(() => {
				cy.get("sl-select").first().click()
				cy.get("sl-select").first().within(() => {
					cy.findByText("Complete").click()
				})
			})

			cy.get("dialog-element").should("have.length", 3)

			cy.get(".popup-filters").within(() => {
				cy.get("sl-select").first().shadow().find("sl-popup").within(() => {
					cy.get("sl-tag").shadow().find("sl-icon-button").click()
				})

				cy.get("sl-select").first().click()
				cy.get("sl-select").first().within(() => {
					cy.findByText("New").click()
				})
			})
			
			cy.get("dialog-element").should("have.length", 10)


			cy.log("Closing filters")
			cy.get(".filter").click()
			cy.get(".filter-string").shadow().within(() => {
				cy.get("input").type("1.0")
			})

			cy.get("dialog-element").should("have.length", 1)
		

			})
		})

		it('should filter by labels', () => {
			cy.log("Making Labels")
			cy.addLabel("dystopian", "#f00", true)
			cy.addLabel("nature", "#0f0")
			cy.addLabel("cool", "#00f")
			
			enterElement().within(() => {
				cy.get('[data-test="outline-notes-button"]').click()
			})
			
			cy.log("Adding Labels")
			enterOutlinePanel().within(() => {
				cy.get('dialog-element').eq(1).find("labels-popup-element").shadow().within(() => {
					cy.get('sl-icon-button').click()
					cy.get("sl-select").click()
					cy.get("sl-select").within(() => {
						cy.findByText("dystopian").click()
						cy.findByText("nature").click()
						cy.findByText("cool").click()
					})
				})

				cy.get('dialog-element').eq(3).find("labels-popup-element").shadow().within(() => {
					cy.get('sl-icon-button').click()
					cy.get("sl-select").click()
					cy.get("sl-select").within(() => {
						cy.findByText("dystopian").click()
						cy.findByText("cool").click()
					})
				})

				cy.get('dialog-element').eq(5).find("labels-popup-element").shadow().within(() => {
					cy.get('sl-icon-button').click()
					cy.get("sl-select").click()
					cy.get("sl-select").within(() => {
						cy.findByText("nature").click()
					})
				})
				
				
				cy.log("Opening filters")
				cy.get(".filter").click()
				
				cy.get(".popup-filters").within(() => {
					cy.get("sl-select").last().click()
					cy.get("sl-select").last().within(() => {
						cy.findByText("dystopian").click()
					})
				})
				
				cy.get('dialog-element').should('have.length', 2)
			})


		})
})