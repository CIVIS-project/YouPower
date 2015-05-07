# CIVIS frontend

We use:

- **yeoman** for app scaffolding - http://yeoman.io/
  - **generator-m** was used to scaffold this project - https://www.npmjs.com/package/generator-m
- **gulp** for running your tasks - http://gulpjs.com/
- **bower** for managing your client packages - http://bower.io/

The following technology stack:

- **angular** - https://angularjs.org/
  - **angular-ui-router** - https://github.com/angular-ui/ui-router
- **ionic** - http://ionicframework.com/
  - **ngCordova** - http://ngcordova.com/
- **Cordova** - http://cordova.apache.org/

Many many tools and tweaks for your convenience:
- powerful collection of [gulp tasks](https://github.com/mwaylabs/generator-m#more-gulp-tasks)
- broad selection of [sub-generators](https://github.com/mwaylabs/generator-m#sub-generators)
- fine tuned [integration with git](https://github.com/mwaylabs/generator-m#git-integration)
- sensible defaults for:
  - code style checks with [JSCS](http://jscs.info/) and [JSHint](http://jshint.com/)
  - configuration files like [.editorconfig](http://editorconfig.org/), [.gitignore](http://git-scm.com/docs/gitignore), [.gitattriubtes](http://git-scm.com/docs/gitattributes) and others
  - continuous integration with [Travis CI](https://travis-ci.org/) and [Jenkins CI](https://jenkins-ci.org/)


## Install

### Prerequisites
- node & npm - http://nodejs.org/download/
  - yo: `npm i -g yo` - http://yeoman.io/
  - gulp: `npm i -g gulp` - http://gulpjs.com/
  - bower: `npm i -g bower` - http://bower.io/
- Sass
  - ruby - https://www.ruby-lang.org/en/installation/
  - sass - http://sass-lang.com/install
- Want to test your app on a device ? - Then you'll need:
  - Platform SDKs for cordova
    - cordova documentation: [http://cordova.apache.org/docs/en/edge/guide_platforms_index.md.html#Platform%20Guides)
    - cordova cli readme: [Requirements](https://github.com/apache/cordova-cli/)

### After git clone
Since all external libraries are excluded from git, you need to install all of them
when you start with a fresh clone of the project. In order to do so, run the
following commands in that order:
```sh
npm install # installs all node modules including cordova, gulp and all that
bower install # install all bower components including angular, ionic, ng-cordova, ...
gulp --cordova 'prepare' # install all cordova platforms and plugins from the config.xml
```

## Get started
#### gulp watch
Prepares everything for development and opens your default browser. Get ready
to start coding!
```sh
gulp watch
```
Livereloads your application when changing/adding/deleting files to immediately
reflect the changes you make. If you don't want this task to open your browser,
just add the `--no-open` option and navigate to `http://localhost:9000`
yourself. For your convenience any occurring **jscs, jshint or jsonlint
errors** will be presented to you on every livereload.

#### File structure
<pre>
└──  app/           - your application folder
│   └──  bower_components/    - local installation of bower packages
│   └──  main/                - ---main module---
│   │   ├──  assets/          - assets: fonts, images, translation, etc... goes here
│   │   ├──  constants/       - angular constants
│   │   ├──  controllers/     - angular controllers
│   │   ├──  directives/      - angular directives
│   │   ├──  filters/         - angular filters
│   │   ├──  services/        - angular services
│   │   ├──  styles/          - scss styles
│   │   ├──  templates/       - angular templates
│   │   └──  main.js          - angular module definition, routing etc...
│   └──  anotherModule/       - ---another  module---
│   │   ├──  ...
│   ├──  app.js               - application module, includes main module, ionic, ui-router etc ...
│   └──  index.html           - angular entry point, injects: app files, bower files, fonts,  ...
├──  gulp_tasks/    - gulp tasks
├──  hooks/         - cordova hooks
├──  nodes_modules/ - local installation of node modules
├──  platforms/     - cordova platforms
├──  plugins/       - cordova plugins
├──  www/           - your gulp build goes here, cordova starts building from here
├──  .bowerrc       - bower configuration
├──  .editorconfig  - editor configuration
├──  .gitattributes - git's attribute configuration
├──  .gitignore     - git's ignore configuration
├──  .jscsrc        - jscs configuration
├──  .jshintignore  - jshint ignore
├──  .jshintrc      - jshint configuration
├──  .travis.yml    - travis continuous integration configuration
├──  .yo-rc.json    - yeoman's .yo-rc.json
├──  bower.json     - bower dependencies
├──  config.xml     - cordova's config.xml
├──  gulpfile.js    - entry point to all gulp tasks
├──  jenkins.sh     - shell script for jenkins continuous integration
├──  package.json   - node dependencies configuration
├──  README.md      - the generator's README.md
</pre>

## More gulp tasks

#### gulp --cordova 'run any command'
A local wrapper for cordova cli (allows to use different cordova CLI versions in different projects). For instance instead of running `cordova plugins ls` you'd write the following to list all the installed plugins:
```sh
gulp --cordova 'plugin ls'
```
Head over to the [cordova cli documentation](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface) or their [github page](https://github.com/apache/cordova-cli/) to learn how to use the cordova cli. Remember that when using generator-m you don't need to install cordova globally!

#### gulp --cordova 'build-related task'

If you run one of the following cordova commands: `build <platform>`, `run <platform>`, `emulate <platform>` or `prepare <platform>`, `gulp build` will build your app into the www folder, before cordova will take it from there. For instance if you want to test your app on your connected ios device, run:
```sh
gulp --cordova 'run ios' # runs gulp build, then cordova run ios
```
Sometimes you don't want `gulp build` to run every time before the cordova command is run. In that case simply add the `--no-build` option and `gulp build` will be skipped.


#### gulp watch-build
Builds into www, watches version in www and opens your browser. Good for debugging and testing your build!
```sh
gulp watch-build
```
Add the `--no-build` option and `gulp build` will be skipped.
The `--no-open` options is available here as well, in case you don't want your browser to open automatically and would rather navigate to `http://localhost:9000` yourself.


#### gulp build
Builds your angular app and moves it to the www folder. Usually you don't run this command directly, but it will be implicitly run by `gulp watch-build` and any build-related cordova tasks (as explained above).
```sh
gulp build
```
Note that the build will not complete if you have any **jscs, jshint or jsonlint errors** in your code! Sometimes it's necessary to let the build run anyway. Use the `--force-build` option to do so. The `--minify` option will minify javascript, css, html and images. These options will also work for all the build-related cordova tasks!

#### gulp environment
Injects environment (dev, prod and any other you'd like) variables into your `Config` constants.

##### How does it work?
Your `main` module per default contains the two files `env-dev.json` and `env-prod.json` located under `app/main/constants/`. Any key value pair you define in those files will be copied into the `Config.ENV` constant located in `app/main/constants/config-const.js`, depending on which environment you chosse. So when you're working on dev, all key value pairs from the `main` module's `env-dev.json` will be copied to your `config-const.js`. Same goes for the prod environment respectively. Then simply inject the `Config` constant in any service or controller where you need to use it.

##### Choosing an environment
When you run `gulp watch` or any other task that runs `gulp build` without specifying an environment it will default to the dev environment:
```shell
gulp watch                # defaults to --env=dev
gulp build                # so does this
gulp --cordova 'run ios'  # and any other command that uses gulp build
```
In order to choose an environment explicitly add the `--env` flag, like this:
```shell
gulp watch --env=prod
gulp build --env=prod
gulp --cordova 'run ios' --env=prod
```
While you're running `gulp watch` you can even **temporarily** switch the environment you're currently working on without having to restart your watch task. Simply type:
```shell
gulp environment --env=<env>
```
Gulp will livereload with your new environment! It's **important** to note that as soon as you are making more changes and a livereload is triggered, your environment switches back to the one that was supplied when `gulp watch` was started. If you want to **permanently** switch your environment you should do so by restarting your `gulp watch` tasks with the desired environment.

##### Creating a new environment
If you find yourself faced needing more than a dev and a prod environment simply create a new file: `app/main/constants/dev-env5.json`, fill it with the desired values and then run one the following:
```shell
gulp watch --env=env5
gulp build --env=env5
gulp environment --env=env5
```

##### Environments when using several modules
In case your project grows large and you have several modules in your project you will probably find yourself wanting to share environments across all modules. No problem. Every module you create has it's own `Config` constant located in `app/module/constants/config-const.js`. But only your `main` module contains the actual environments. The gulp tasks will automatically copy the environments to all of your modules' `Config.ENV` constants.


#### gulp build-vars
Inject variables into your angular app -your `Config` constants which are defined in `app/*/constants/config-const.js` to be exact- during a build.

Adding the `--buildVars` flag to `gulp build` or any gulp task that runs `gulp build` implicitly, for instance:
```sh
gulp watch --buildVars="key:value,keys2:value2"
```
will result in `Config` constants that look like this:
```js
'use strict';
angular.module('main')
.constant('Config', {

  ENV: {
    /*inject-env*/
    // ..
    /*endinject*/
  },

  BUILD: {
    /*inject-build*/
    'key': 'value',
    'keys2': 'value2'
    /*endinject*/
  }

});
```

#### gulp config
Manages project configuration. Modifies cordova's `config.xml`
```sh
gulp config --setVersion=1.1.0
gulp config --setBuild=12
gulp config --setBundle=com.new.bundle # USE WITH CARE! (see below)
gulp config --setName='hello world' # USE WITH CARE! (see below)
gulp config --setDescription='a small app to make the world a happy place'
gulp config --setAuthor='Your Name---your@mail.com---http://yourwebsite.com'
```
**Important**: When **changing the name** or **bundle identifier** of your project, it may lead to problems with the platform projects. If you have your plugins and platforms managed in the `config.xml` you can avoid this by deleting your `plugins/` and `platforms/` folders and installing them again using `gulp --cordova 'prepare'`. For more information see the **Git integration** section in this document.

## Running on Windows
The generator should work just like on unix/mac except there's one difference, when running `gulp --cordova` tasks. They need doublequotes. So write this:
```sh
gulp --cordova "run android" # will work on windows
```
instead of this:
```sh
gulp --cordova 'run android' # won't work on windows
```

## Sub-generators
#### yo m:module - creates a new module
1. `yo m:module <moduleName>` - create a new module
2. add your module to the `app/app.js`:

  ```js
  'use strict';
  angular.module('myProject', [
    // your modules
    'main',
    '<newModuleName>'
  ]);
  ```
3. navigate to `http://localhost:9000/#/<module-name-in-kebap-case>` in your browser.
4. **Done!** - see your new module in action!


#### yo m:others
The `<moduleName>` is optional and defaults to the main module when left blank
```sh
yo m:constant <constantName> <moduleName>
yo m:controller <controllerName> <moduleName>
yo m:directive <directiveName> <moduleName>
yo m:filter <filterName> <moduleName>
yo m:template <templateName> <moduleName>
yo m:service <serviceName> <moduleName>
```
If you have `gulp watch` running, gulp will automatically inject your new files into your application and they will be available right away.

### Platforms and plugins in config.xml
Since `cordova 5.0` all platforms and plugins you install can be added to the `config.xml`.

Release notes:
https://cordova.apache.org/news/2015/04/21/tools-release.html

> Added the ability to manage your plugin and platform dependencies in your project’s `config.xml`. When adding plugins or platforms, use the `--save` flag to add them to `config.xml`. Ex: `cordova platform add android --save`. Existing projects can use `cordova plugin save` and `cordova platform save` commands to save all previously installed plugins and platforms into your project’s `config.xml`. Platforms and plugins will be autorestored when `cordova prepare` is run. This allows developers to easily manage and share their dependenceis among different development enviroments and with their coworkers.
>

Since your projects `.gitignore` will completely ignore the `platforms/` and `plugins/` folders, it's important to make sure your `config.xml` contains all the plugins and platforms required by your project. As explained above this can either be achieved by always using the `--save` options when adding/removing platforms:

```sh
gulp --cordova 'platform add ios --save'
gulp --cordova 'plugin remove cordova-plugin-camera --save'
```

or by typing the following commands every time before you commit:

```sh
gulp --cordova 'platform save'
gulp --cordova 'plugin save'
```

## Options for debugging and development
```sh
yo m --appName='App Name' # set appName via CLI
yo m --skip-welcome-message # skips welcome message
yo m --skip-sdk # skip adding cordova platforms and plugins (sdk-specific) for travis
yo m --skip-install # for debugging purposes, no npm and bower install
yo m --skip-prompts # for debugging purposes, run with predefined answers
yo m --ios-only # in conjunction with --skip-prompts
yo m --android-only # in conjunction with --skip-prompts
yo m --no-cordova # in conjunction with --skip-prompts, no platforms/plugins
```

## License
Code licensed under Apache 2.
