import {
  inject,
  getBpmnJS,
  bootstrapModeler,
  createCanvasEvent,
  createEvent as globalEvent
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  isTemplateApplied
} from 'lib/element-templates/replace-menu/ElementTemplatesReplaceProvider';

import diagramXML from './ElementTemplatesCreateProvider.bpmn';
import templates from 'test/fixtures/element-templates.json';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from 'bpmn-js-properties-panel';

import {
  CloudElementTemplatesPropertiesProviderModule as ElementTemplatesProviderModule
} from 'bpmn-js-element-templates';

import { CreateAppendElementTemplatesModule } from 'lib/';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';


describe('<ElementTemplatesCreateProviderSpec>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ZeebePropertiesProviderModule,
      ElementTemplatesProviderModule,
      CreateAppendElementTemplatesModule
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    }
  }));

  beforeEach(inject(function(elementTemplates) {
    elementTemplates.set(templates);
  }));


  describe('display', function() {

    it('should display template options', inject(function(canvas) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      openPopup(rootElement);

      // then
      const entries = Object.keys(getEntries());
      const templateEntries = entries.filter((entry) => entry.startsWith('create.template-'));

      expect(templateEntries.length).to.eql(templates.length);
    }));

  });


  describe('create', function() {

    it('should create template', inject(function(elementRegistry, selection) {

      // given
      const template = templates[0];

      // when
      triggerEntry(`create.template-${template.id}`);

      // then
      expectElementWithTemplate(elementRegistry, 'bpmn:Task', template, true);
      expectSelected(selection, 'bpmn:Task');
    }));


    it('should undo', inject(function(elementRegistry, commandStack, selection) {

      // given
      const template = templates[0];

      // when
      triggerEntry(`create.template-${template.id}`);

      // then
      expectElementWithTemplate(elementRegistry, 'bpmn:Task', template);
      expectSelected(selection, 'bpmn:Task');

      // when
      commandStack.undo();

      // then
      expectElementWithTemplate(elementRegistry, 'bpmn:Task', template, false);
      expectSelected(selection, 'bpmn:Task', false);
    }));


    it('should redo', inject(function(elementRegistry, commandStack, selection) {

      // given
      const template = templates[0];

      // when
      triggerEntry(`create.template-${template.id}`);
      commandStack.undo();

      // then
      expectElementWithTemplate(elementRegistry, 'bpmn:Task', template, false);
      expectSelected(selection, 'bpmn:Task', false);

      // when
      commandStack.redo();

      // then
      expectElementWithTemplate(elementRegistry, 'bpmn:Task', template);
    }));

  });

  describe('search', function() {

    it('should be searchable by keywords', inject(function(canvas) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      openPopup(rootElement);

      const entries = getEntries();
      const entry = entries['create.template-example.KeywordsTemplate'];

      // then
      expect(entry?.search).to.be.eql([ 'first keyword', 'another keyword' ]);
    }));

  });

});


// helpers ////////////

function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {
    popupMenu.open(element, 'bpmn-create', {
      x: element.x, y: element.y
    });

  });
}

function queryEntry(id) {
  var container = getMenuContainer();

  return domQuery('.djs-popup [data-id="' + id + '"]', container);
}

function getMenuContainer() {
  const popup = getBpmnJS().get('popupMenu');
  return popup._current.container;
}

function triggerAction(id) {
  const entry = queryEntry(id);

  if (!entry) {
    throw new Error('entry "' + id + '" not found in append menu');
  }

  const popupMenu = getBpmnJS().get('popupMenu');

  return popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));
}

function getEntries() {
  const popupMenu = getBpmnJS().get('popupMenu');
  return popupMenu._current.entries;
}

function expectElementWithTemplate(elementRegistry, type, template, result = true) {
  const element = elementRegistry.find((element) => is(element, type));

  if (!result) {
    expect(element).to.not.exist;
  } else {
    expect(element).to.exist;
    expect(isTemplateApplied(element, template)).to.be.true;
  }
}

function expectSelected(selection, type, result = true) {
  const selected = selection.get();

  if (!result) {
    expect(selected).to.have.length(0);
  } else {
    expect(selected).to.have.length(1);
    expect(is(selected[0], type)).to.be.true;
  }
}

function triggerEntry(id) {

  return getBpmnJS().invoke(function(canvas, dragging) {

    var rootElement = canvas.getRootElement(),
        rootGfx = canvas.getGraphics(rootElement);

    openPopup(rootElement);
    triggerAction(id);

    dragging.hover({ element: rootElement, gfx: rootGfx });
    dragging.move(createCanvasEvent({ x: 200, y: 300 }));

    // when
    dragging.end();

  });
}