# YouPower backend

This is the backend of the YouPower app.

## Setup

First set up nodejs, npm and mongodb on your local machine. Also install
`graphicsmagick` on your machine. (needed for resizing profile pictures).

If you're on Debian or Ubuntu, here's a hack to put nodejs into the same
path that almost everyone else uses:
```
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

Then:
```
cd YouPower/    # move into project root
npm install     # install dependencies

# run server:
MONGO_URL=mongodb://user:pass@my.db/name npm start
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

## Inserting default data into the database
When first launching the application it is pretty useless, since the database
is initially empty. In order to get started, populate it with some default
actions and communities using the `putDummyData.js` script.

Run it as

    node putDummyData.js

Just like the `metricsViewer.js` script, you can supply a custom MONGO_URL to
fill another database than the local one.

## TODO:
- OAuth 2.0 instead of HTTP basic auth (eg. OAuth2orize)
