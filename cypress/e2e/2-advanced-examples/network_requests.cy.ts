/// <reference types="cypress" />

context('Network Requests', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/network-requests');
  });

  // Manage HTTP requests in your app
  interface TestContext {
    user: { id: number };
    post: unknown;
  }

  it('cy.request() - make an XHR request', () => {
    // https://on.cypress.io/request
    cy.request('https://jsonplaceholder.cypress.io/comments').then(response => {
      cy.wrap(response.status).should('eq', 200);
      // the server sometimes gets an extra comment posted from another machine
      // which gets returned as 1 extra object
      cy.wrap(response.body)
        .should('have.property', 'length')
        .and('be.oneOf', [500, 501]);
      cy.wrap(response).should('have.property', 'headers');
      cy.wrap(response).should('have.property', 'duration');
    });
  });

  it('cy.request() - verify response using BDD syntax', () => {
    cy.request('https://jsonplaceholder.cypress.io/comments').then(response => {
      // https://on.cypress.io/assertions
      cy.wrap(response.status).should('eq', 200);
      cy.wrap(response.body)
        .should('have.property', 'length')
        .and('be.oneOf', [500, 501]);
      cy.wrap(response).should('include.keys', 'headers', 'duration');
    });
  });

  it('cy.request() with query parameters', () => {
    // will execute request
    // https://jsonplaceholder.cypress.io/comments?postId=1&id=3
    cy.request({
      url: 'https://jsonplaceholder.cypress.io/comments',
      qs: {
        postId: 1,
        id: 3,
      },
    })
      .its('body')
      .should('be.an', 'array')
      .and('have.length', 1)
      .its('0') // yields first element of the array
      .should('contain', {
        postId: 1,
        id: 3,
      });
  });

  it('cy.request() - pass result to the second request', () => {
    // first, let's find out the userId of the first user we have
    cy.request('https://jsonplaceholder.cypress.io/users?_limit=1')
      .its('body') // yields the response object
      .its('0') // yields the first element of the returned list
      // the above two commands its('body').its('0')
      // can be written as its('body.0')
      // if you do not care about TypeScript checks
      .then((user: { id: number }) => {
        cy.wrap(user).should('have.property', 'id').should('be.a', 'number');
        // make a new post on behalf of the user
        cy.request('POST', 'https://jsonplaceholder.cypress.io/posts', {
          userId: user.id,
          title: 'Cypress Test Runner',
          body: 'Fast, easy and reliable testing for anything that runs in a browser.',
        });
      })
      // note that the value here is the returned value of the 2nd request
      // which is the new post object
      .then((response: { body: object }) => {
        cy.wrap(response).should('have.property', 'status', 201); // new entity created
        cy.wrap(response)
          .should('have.property', 'body')
          .and('have.property', 'title', 'Cypress Test Runner');

        // we don't know the exact post id - only that it will be > 100
        // since JSONPlaceholder has built-in 100 posts
        cy.wrap(response.body)
          .should('have.property', 'id')
          .and('be.a', 'number')
          .and('be.gt', 100);

        // we don't know the user id here - since it was in above closure
        // so in this test just confirm that the property is there
        cy.wrap(response.body)
          .should('have.property', 'userId')
          .and('be.a', 'number');
      });
  });

  it('cy.request() - save response in the shared test context', function testContext(this: TestContext) {
    // https://on.cypress.io/variables-and-aliases
    cy.request('https://jsonplaceholder.cypress.io/users?_limit=1')
      .its('body')
      .its('0') // yields the first element of the returned list
      .as('user') // saves the object in the test context
      .then(() => {
        // NOTE 👀
        //  By the time this callback runs the "as('user')" command
        //  has saved the user object in the test context.
        //  To access the test context we need to use
        //  the "function () { ... }" callback form,
        //  otherwise "this" points at a wrong or undefined object!
        cy.request('POST', 'https://jsonplaceholder.cypress.io/posts', {
          userId: this.user.id,
          title: 'Cypress Test Runner',
          body: 'Fast, easy and reliable testing for anything that runs in a browser.',
        })
          .its('body')
          .as('post'); // save the new post from the response
      })
      .then(() => {
        // When this callback runs, both "cy.request" API commands have finished
        // and the test context has "user" and "post" objects set.
        // Let's verify them.
        cy.wrap(this.post)
          .should('have.property', 'userId')
          .and('equal', this.user.id);
      });
  });

  it('cy.intercept() - route responses to matching requests', () => {
    // https://on.cypress.io/intercept

    const message = 'whoa, this comment does not exist';

    // Listen to GET to comments/1
    cy.intercept('GET', '**/comments/*').as('getComment');

    // we have code that gets a comment when
    // the button is clicked in scripts.js
    cy.get('.network-btn').click();

    // https://on.cypress.io/wait
    cy.wait('@getComment')
      .its('response.statusCode')
      .should('be.oneOf', [200, 304]);

    // Listen to POST to comments
    cy.intercept('POST', '**/comments').as('postComment');

    // we have code that posts a comment when
    // the button is clicked in scripts.js
    cy.get('.network-post').click();
    cy.wait('@postComment').then(({ request, response }) => {
      cy.wrap(request.body).should('include', 'email');
      cy.wrap(request.headers).should('have.property', 'content-type');
      cy.wrap(response && response.body).should(
        'have.property',
        'name',
        'Using POST in cy.intercept()',
      );
    });

    // Stub a response to PUT comments/ ****
    cy.intercept(
      {
        method: 'PUT',
        url: '**/comments/*',
      },
      {
        statusCode: 404,
        body: { error: message },
        headers: { 'access-control-allow-origin': '*' },
        delayMs: 500,
      },
    ).as('putComment');

    // we have code that puts a comment when
    // the button is clicked in scripts.js
    cy.get('.network-put').click();

    cy.wait('@putComment');

    // our 404 statusCode logic in scripts.js executed
    cy.get('.network-put-comment').should('contain', message);
  });
});
