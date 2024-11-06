import TestContainer from 'mocha-test-container-support';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles,
  enableLogging
} from 'test/TestHelper';

import Modeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from 'bpmn-js-properties-panel';

import {
  CloudElementTemplatesPropertiesProviderModule as ElementTemplatesProviderModule
} from 'bpmn-js-element-templates';

import { CreateAppendElementTemplatesModule, CreateAppendAnythingModule } from 'lib/';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';

import templates from 'test/fixtures/element-templates.json';


const singleStart = window.__env__ && window.__env__.SINGLE_START === 'templates';

insertCoreStyles();
insertBpmnStyles();


describe('<CreateAppendAnything>', function() {

  let modelerContainer;

  let propertiesContainer;

  let container;

  beforeEach(function() {
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}, BpmnJS = Modeler) {
    const {
      shouldImport = true,
      additionalModules = [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule,
        ElementTemplatesProviderModule,
        ElementTemplateChooserModule,
        CreateAppendAnythingModule,
        CreateAppendElementTemplatesModule
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      },
      description = {},
      layout = {}
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      additionalModules,
      propertiesPanel: {
        parent: propertiesContainer,
        feelTooltipContainer: container,
        description,
        layout
      },
      moddleExtensions,
      ...options
    });

    enableLogging && enableLogging(modeler, !!singleStart);

    setBpmnJS(modeler);

    if (!shouldImport) {
      return { modeler };
    }

    try {
      const result = await modeler.importXML(xml);

      return { error: null, warnings: result.warnings, modeler: modeler };
    } catch (err) {
      return { error: err, warnings: err.warnings, modeler: modeler };
    }
  }


  (singleStart ? it.only : it)('should import simple process', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const { error, modeler } = await createModeler(diagramXml);


    modeler.get('elementTemplates').set(templates);

    // then
    expect(error).not.to.exist;
  });

});
