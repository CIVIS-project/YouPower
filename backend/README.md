# CIVIS backend

This is the backend of the CIVIS project.

## Setup
- npm install
- npm start

## Running unit tests
- npm test

## File structure
<pre>
├──  apidoc/        - generated documentation for REST API, do not edit directly
├──  middlewares/   - misc express.js middleware
├──  models/        - database models
├──  routes/        - express.js API routes
├──  test/          - unit tests
├──  app.js         - entry point
└──  README.md      - this file
</pre>

## Notes on apidoc
The REST API documentation is generated from inline code comments following
the JSDoc specification. Here's apidoc specific information on the syntax:
http://apidocjs.com/

The documentation webpage is generated/updated by running `gulp apidoc`. (make
sure you have installed `gulp` globally). You will then be able to browse the
API documentation at http://localhost:3000

We will try to keep every single API path documented like this.

## TODO:
- OAuth 2.0 instead of HTTP basic auth (eg. OAuth2orize)
