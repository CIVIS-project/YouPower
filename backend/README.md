# YouPower backend

This is the backend of the YouPower app.

## Setup

First set up mongodb on your local machine.
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
Note that this requires a local instance of mongodb running.

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

## Metrics
Most REST API calls are logged into the DB. The logs can be read using the
`metricsViewer.js` tool. It takes the following options:

    -c   Colorize output
    -e   Ellipsize long lines (only show first row)
    -h   Show help

Run it as

    node metricsViewer.js

It defaults to a local mongodb instance (named youpower), you can change this
by setting the `MONGO_URL` environment variable as such:

    MONGO_URL=mongodb://somewhere.else.com/youpower node metricsViewer.js

## TODO:
- OAuth 2.0 instead of HTTP basic auth (eg. OAuth2orize)
