/// <reference types="cypress" />

/// JSON fixture file can be loaded directly using
// the built-in JavaScript bundler
import requiredExample from '../../fixtures/example.json';

context('Files', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/files');

    // load example.json fixture file and store
    // in the test context object
    cy.fixture('example.json').as('example');
  });

  it('cy.fixture() - load a fixture', () => {
    // https://on.cypress.io/fixture

    // Instead of writing a response inline you can
    // use a fixture file's content.

    // when application makes an Ajax request matching "GET **/comments/*"
    // Cypress will intercept it and reply with the object in `example.json` fixture
    cy.intercept('GET', '**/comments/*', { fixture: 'example.json' }).as(
      'getComment',
    );

    // we have code that gets a comment when
    // the button is clicked in scripts.js
    cy.get('.fixture-btn').click();

    cy.wait('@getComment')
      .its('response.body')
      .should('have.property', 'name')
      .and('include', 'Using fixtures to represent data');
  });

  it('cy.fixture() or require - load a fixture', function testFunc(this: {
    example: unknown;
  }) {
    // we are inside the "function () { ... }"
    // callback and can use test context object "this"
    // "this.example" was loaded in "beforeEach" function callback
    cy.wrap(this.example).should('deep.equal', requiredExample);

    // or use "cy.wrap" and "should('deep.equal', ...)" assertion
    cy.wrap(this.example).should('deep.equal', requiredExample);
  });

  it('cy.readFile() - read file contents', () => {
    // https://on.cypress.io/readfile

    // You can read a file and yield its contents
    // The filePath is relative to your project's root.
    cy.readFile(Cypress.config('configFile')).then(config => {
      cy.wrap(config).should('be.an', 'string');
    });
  });

  it('cy.writeFile() - write to a file', () => {
    // https://on.cypress.io/writefile

    // You can write to a file

    // Use a response from a request to automatically
    // generate a fixture file for use later
    cy.request('https://jsonplaceholder.cypress.io/users').then(
      (response: {
        body: {
          id: number;
          name: string;
          username: string;
          email: string;
          address: {
            street: string;
            suite: string;
            city: string;
            zipcode: string;
            geo: {
              lat: string;
              lng: string;
            };
          };
          phone: string;
          website: string;
          company: {
            name: string;
            catchPhrase: string;
            bs: string;
          };
        }[];
      }) => {
        cy.writeFile('cypress/fixtures/users.json', response.body);
      },
    );

    cy.fixture('users').then(
      (
        users: {
          id: number;
          name: string;
          username: string;
          email: string;
          address: {
            street: string;
            suite: string;
            city: string;
            zipcode: string;
            geo: {
              lat: string;
              lng: string;
            };
          };
          phone: string;
          website: string;
          company: {
            name: string;
            catchPhrase: string;
            bs: string;
          };
        }[],
      ) => {
        cy.wrap(users[0].name).should('exist');
      },
    );

    // JavaScript arrays and objects are stringified
    // and formatted into text.
    cy.writeFile('cypress/fixtures/profile.json', {
      id: 8739,
      name: 'Jane',
      email: 'jane@example.com',
    });

    cy.fixture('profile').then(
      (profile: { id: number; name: string; email: string }) => {
        cy.wrap(profile.name).should('eq', 'Jane');
      },
    );
  });
});
