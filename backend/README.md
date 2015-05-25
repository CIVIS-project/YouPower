# CIVIS backend

This is the backend of the CIVIS project.

## Setup
```
cd backend/     # move into correct directory
npm install     # install dependencies
npm start       # run server
```

## Running unit tests

Make sure that unit tests pass before pushing your code into the repository:
```
npm test
```

## Deploying

Code in the master branch is automatically built and tested by Travis CI.
Successful builds are automatically deployed into a free Heroku Sandbox (at
the moment) and will be available at: https://gentle-coast-9691.herokuapp.com/

## File structure
```
├──  apidoc/        - generated documentation for REST API, do not edit directly
├──  middleware/    - misc express.js middleware
├──  models/        - database models
├──  routes/        - express.js API routes
├──  test/          - unit tests
├──  app.js         - entry point
└──  README.md      - this file
```

## Notes on apidoc
The REST API documentation is generated from inline code comments following
the JSDoc specification. Here's apidoc specific information on the syntax:
http://apidocjs.com/

The documentation webpage is generated/updated by running `gulp apidoc`. (make
sure you have installed `gulp` globally). You will then be able to browse the
API documentation at http://localhost:3000

We will try to keep every single API path documented like this.

Current API documentation of latest master available here:
https://gentle-coast-9691.herokuapp.com/

## TODO:
- OAuth 2.0 instead of HTTP basic auth (eg. OAuth2orize)
