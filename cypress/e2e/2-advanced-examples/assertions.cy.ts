/// <reference types="cypress" />

context('Assertions', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/assertions');
  });

  describe('Implicit Assertions', () => {
    it('.should() - make an assertion about the current subject', () => {
      // https://on.cypress.io/should
      cy.get('.assertion-table')
        .find('tbody tr:last')
        .should('have.class', 'success')
        .find('td')
        .first()
        // checking the text of the <td> element in various ways
        .should('have.text', 'Column content')
        .should('contain', 'Column content')
        .should('have.html', 'Column content')
        // chai-jquery uses "is()" to check if element matches selector
        .should('match', 'td')
        // to match text content against a regular expression
        // first need to invoke jQuery method text()
        // and then match using regular expression
        .invoke('text')
        .should('match', /column content/i);

      // a better way to check element's text content against a regular expression
      // is to use "cy.contains"
      // https://on.cypress.io/contains
      cy.get('.assertion-table')
        .find('tbody tr:last')
        // finds first <td> element with text content matching regular expression
        .contains('td', /column content/i)
        .should('be.visible');

      // for more information about asserting element's text
      // see https://on.cypress.io/using-cypress-faq#How-do-I-get-an-element’s-text-contents
    });

    it('.and() - chain multiple assertions together', () => {
      // https://on.cypress.io/and
      cy.get('.assertions-link')
        .should('have.class', 'active')
        .and('have.attr', 'href')
        .and('include', 'cypress.io');
    });
  });

  describe('Explicit Assertions', () => {
    // https://on.cypress.io/assertions
    it('cy.wrap - make an assertion about a specified subject', () => {
      // We can use Chai's BDD style assertions
      cy.wrap(true).should('be.true');
      const o = { foo: 'bar' };

      cy.wrap(o).should('equal', o);
      cy.wrap(o).should('deep.equal', { foo: 'bar' });
      // matching text using regular expression
      cy.wrap('FooBar').should('match', /bar$/i);
    });

    it('pass your own callback function to should()', () => {
      // Pass a function to should that can have any number
      // of explicit assertions within it.
      // The ".should(cb)" function will be retried
      // automatically until it passes all your explicit assertions or times out.
      cy.get('.assertions-p')
        .find('p')
        .then($p => {
          // https://on.cypress.io/$
          // return an array of texts from all of the p's
          const texts = $p.map((i, el) => Cypress.$(el).text());

          // jquery map returns jquery object
          // and .get() convert this to simple array
          const paragraphs = texts.get();

          // array should have length of 3
          cy.wrap(paragraphs).should('have.length', 3);

          // use second argument to cy.wrap(...) to provide clear
          // message with each assertion
          cy.wrap(paragraphs).should('deep.eq', [
            'Some text from first p',
            'More text from second p',
            'And even more text from third p',
          ]);
        });
    });

    it('finds element by class name regex', () => {
      cy.get('.docs-header')
        .find('div')
        // .should(cb) callback function will be retried
        .then($div => {
          cy.wrap($div).should('have.length', 1);

          const { className } = $div[0];

          cy.wrap(className).should('match', /heading-/);
          cy.wrap($div).should('have.text', 'Introduction');
        });
    });

    it('can throw any error', () => {
      cy.get('.docs-header')
        .find('div')
        .then($div => {
          if ($div.length !== 1) {
            // you can throw your own errors
            throw new Error('Did not find 1 element');
          }

          const { className } = $div[0];

          if (!/heading-/.exec(className)) {
            throw new Error(`Could not find class "heading-" in ${className}`);
          }
        });
    });

    it('matches unknown text between two elements', () => {
      let text: string;

      function normalizeText(s: string) {
        return s.replace(/\s/g, '').toLowerCase();
      }

      cy.get('.two-elements')
        .find('.first')
        .then($first => {
          // save text from the first element
          text = normalizeText($first.text());
        });

      cy.get('.two-elements')
        .find('.second')
        .then($div => {
          // we can massage text before comparing
          const secondText = normalizeText($div.text());

          cy.wrap(secondText).should('equal', text);
        });
    });

    it('assert - assert shape of an object', () => {
      const person = {
        name: 'Joe',
        age: 20,
      };

      assert.isObject(person, 'value is object');
    });

    it('retries the should callback until assertions pass', () => {
      cy.get('#random-number').then($div => {
        const n = parseFloat($div.text());

        cy.wrap(n).should('be.NaN');
      });
    });
  });
});
