import {
  inject,
  getBpmnJS,
  bootstrapModeler,
  createEvent
} from 'test/TestHelper';

import { expect } from 'chai';
import { spy, stub } from 'sinon';

import { fireEvent, waitFor } from '@testing-library/preact';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  isTemplateApplied
} from 'lib/element-templates/replace-menu/ElementTemplatesReplaceProvider';

import diagramXML from './ElementTemplatesAppendProvider.bpmn';
import templates from 'test/fixtures/element-templates.json';

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

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';


describe('<ElementTemplatesAppendProvider>', function() {

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

    it('should display template options', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entries = Object.keys(getEntries());
      const templateEntries = entries.filter((entry) => entry.startsWith('append.template-'));

      expect(templateEntries.length).to.be.greaterThan(0);
    }));


    it('should not display template for Start Event', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entries = Object.keys(getEntries());
      const startEventTemplateEntry = entries.includes('append.template-example.StartEventTemplate');

      expect(startEventTemplateEntry).to.not.be.true;
    }));


    it('should not display template for Participant', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entries = Object.keys(getEntries());
      const participantTemplateEntry = entries.includes('append.template-example.ParticipantTemplate');

      expect(participantTemplateEntry).to.not.be.true;
    }));


    it('should not display template for Sequence Flow', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entries = Object.keys(getEntries());
      const sequenceFlowTemplateEntry = entries.includes('append.template-example.SequenceFlowTemplate');

      expect(sequenceFlowTemplateEntry).to.not.be.true;
    }));

  });


  describe('append', function() {

    it('should append template', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');
      const template = templates[0];

      openPopup(task);

      // when
      triggerAction(`append.template-${template.id}`);

      // then
      const outgoingFlows = getBusinessObject(task).outgoing;
      const newElement = outgoingFlows[0].targetRef;

      expect(outgoingFlows).to.have.length(1);
      expect(isTemplateApplied(newElement, template)).to.be.true;
    }));


    it('should append template via dragstart', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');
      const template = templates[0];

      openPopup(task);

      // when
      placeDragElement(task, `append.template-${template.id}`);

      // then
      const outgoingFlows = getBusinessObject(task).outgoing;
      const newElement = outgoingFlows[0].targetRef;

      expect(outgoingFlows).to.have.length(1);
      expect(isTemplateApplied(newElement, template)).to.be.true;
    }));


    it('should undo', inject(function(elementRegistry, commandStack,) {

      // given
      const task = elementRegistry.get('Task_1');
      const template = templates[0];

      openPopup(task);

      // when
      triggerAction(`append.template-${template.id}`);

      // when
      commandStack.undo();

      // then
      const outgoingFlows = getBusinessObject(task).outgoing;

      expect(outgoingFlows).to.have.length(0);
    }));


    it('should redo', inject(function(elementRegistry, commandStack) {

      // given
      const task = elementRegistry.get('Task_1');
      const template = templates[0];

      openPopup(task);

      // when
      triggerAction(`append.template-${template.id}`);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const outgoingFlows = getBusinessObject(task).outgoing;
      const newElement = outgoingFlows[0].targetRef;

      expect(outgoingFlows).to.have.length(1);
      expect(isTemplateApplied(newElement, template)).to.be.true;
    }));


    describe('should trigger create mode', function() {

      it('boundary event', inject(function(elementRegistry, eventBus) {

        // given
        const task = elementRegistry.get('Task_1');

        const initSpy = spy();

        eventBus.on('create.init', initSpy);

        // when
        openPopup(task);

        triggerAction('append.template-example.MessageBoundaryEventTemplate');

        // then
        expect(initSpy).to.have.been.called;
      }));


      it('link intermediate catch event', inject(function(elementRegistry, eventBus) {

        // given
        const task = elementRegistry.get('Task_1');

        const initSpy = spy();

        eventBus.on('create.init', initSpy);

        // when
        openPopup(task);

        triggerAction('append.template-example.LinkIntermediateCatchEventTemplate');

        // then
        expect(initSpy).to.have.been.called;
      }));

    });

  });


  describe('search', function() {

    it('should be searchable by keywords', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      openPopup(task);

      // when
      const entries = getEntries();
      const entry = entries['append.template-example.KeywordsTemplate'];

      // then
      expect(entry?.search).to.be.eql([ 'first keyword', 'another keyword' ]);
    }));


    it('should find all presets', inject(
      async function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        openPopup(task);

        // when
        search('github');

        // then
        await waitFor(() => {
          expect(getSearchResults()).to.have.length(9);
        });
      }
    ));

  });


  describe('steps and presets', function() {

    it('should expose nested entries for a template with steps', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entry = getEntry('append.template-io.camunda.connectors.GitHub.v1');

      expect(entry.entries).to.exist;
      expect(entry.action).not.to.exist;
    }));


    it('should create element with the selected preset', inject(
      function(elementRegistry, elementTemplates, autoPlace) {

        // given
        const task = elementRegistry.get('Task_1');

        openPopup(task);

        const createElement = stub(elementTemplates, 'createElement');
        stub(autoPlace, 'append');

        // Issues > Create an issue
        const leaf = getEntry('append.template-io.camunda.connectors.GitHub.v1', 'step-0', 'step-0');

        // when
        leaf.action.click();

        // then
        expect(createElement).to.have.been.calledOnce;

        const [ template, options ] = createElement.firstCall.args;

        expect(template.id).to.equal('io.camunda.connectors.GitHub.v1');
        expect(options).to.eql({ presetId: 'createIssue' });
      }
    ));

  });

});


// helpers ////////////

function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {
    popupMenu.open(element, 'bpmn-append', {
      x: element.x, y: element.y
    }, {
      search: true
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

function search(value) {
  const input = domQuery('.djs-popup-search input', getMenuContainer());

  fireEvent.keyUp(input, { target: { value } });
}

function getSearchResults() {
  return domQueryAll('.djs-popup-results .entry', getMenuContainer());
}

function triggerAction(id, action = 'click') {
  const entry = queryEntry(id);

  if (!entry) {
    throw new Error('entry "' + id + '" not found in append menu');
  }

  const popupMenu = getBpmnJS().get('popupMenu');
  return popupMenu.trigger(createEvent(entry, { x: 400, y: 400 }), null, action);
}

function getEntries() {
  const popupMenu = getBpmnJS().get('popupMenu');
  return popupMenu._current.entries;
}

function getEntry(rootId, ...nestedIds) {
  const popupMenu = getBpmnJS().get('popupMenu');

  return nestedIds.reduce(
    (entry, id) => entry.entries[id],
    popupMenu._getEntry(rootId)
  );
}

function placeDragElement(element, action) {
  var dragging = getBpmnJS().get('dragging');
  var elementRegistry = getBpmnJS().get('elementRegistry');

  let processElement = elementRegistry.get('Process_1uc9zgy');

  triggerAction(action, 'dragstart');

  dragging.hover({ element: processElement });
  dragging.end();
}
