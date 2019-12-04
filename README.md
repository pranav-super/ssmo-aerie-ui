[![Build Status](https://cae-jenkins2.jpl.nasa.gov/buildStatus/icon?job=MPSA/SEQ/normal_builds/aerie-ui/develop)](https://cae-jenkins2.jpl.nasa.gov/job/MPSA/job/SEQ/job/normal_builds/job/aerie-ui/job/develop)

# aerie-ui

This is the UI application and reusable UI components for [Aerie](https://github.jpl.nasa.gov/MPS/aerie).

## Contributing

Please see our [contributing documentation](./CONTRIBUTING.md) for information on how to contribute to this project.

## Install

First make sure you have [Node.js LTS](https://nodejs.org/) installed, then do:

```
npm i yarn -g
cd aerie-ui
yarn
```

## Development Server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running Unit Tests

Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests

Run `yarn e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
