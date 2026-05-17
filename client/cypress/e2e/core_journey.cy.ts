describe('Core User Journey', () => {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'securepassword123';

  it('should complete the core flow: register -> login -> check tasks -> logout', () => {
    // Register
    cy.visit('/register');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.contains('Registration successful').should('be.visible');

    // Login
    cy.url().should('include', '/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    
    // Check Dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains(`Welcome, ${email}`).should('be.visible');

    // Navigate to Task Board
    cy.contains('Task Board').click();
    cy.url().should('include', '/tasks');
    cy.contains('TODO').should('be.visible');
    cy.contains('IN PROGRESS').should('be.visible');
    cy.contains('DONE').should('be.visible');

    // Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
