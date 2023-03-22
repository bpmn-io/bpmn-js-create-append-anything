> This extension is a work in progress.

# bpmn-js-create-append-anything

This module extends [bpmn-js](https://github.com/bpmn-io/bpmn-js) with a create and append anything modeling experience.

![screenshot](./resources/screenshot.png)

## Features

### Create and append any BPMN element

* Create and append any BPMN element during modeling using the palette or the context pad.

* Use the `CTRL+N` and `CTRL+A`  to open the create and append menus respectively.

### Create and append element templates

* Built on top of [element templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/).

* As well as BPMN elements, you can create and append element templates. You can also apply element templates to existing elements via the replace menu.

## Installation

Install via npm:

```sh
npm install bpmn-js-create-append-anything
```

## Usage

Use as an extension for [bpmn-js](https://github.com/bpmn-io/bpmn-js):

```javascript
import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

const modeler = new BpmnModeler({
  additionalModules: [
    ...,
    CreateAppendAnythingModule,
    CreateAppendElementTemplatesModule
  ]
});
```

If desired, integrate with [element templates](https://github.com/bpmn-io/element-templates):

```javascript
import {
  CreateAppendAnythingModule
  CreateAppendElementTemplatesModule
} from 'bpmn-js-create-append-anything';

const modeler = new BpmnModeler({
  additionalModules: [
    ...,
    CreateAppendAnythingModule,
    CreateAppendElementTemplatesModule
  ]
});
```

This relies on `elementTemplates` to be provided via an external module, i.e. [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel).


## Run locally

To get the development setup make sure to have [NodeJS](https://nodejs.org/en/download/) installed.
As soon as you are set up, clone the project and execute

```sh
# install dependencies
npm install

# start a bpmn-js instance with the extension
npm start

# for regular BPMN elements only
npm run start:bpmn
```


## License

MIT
