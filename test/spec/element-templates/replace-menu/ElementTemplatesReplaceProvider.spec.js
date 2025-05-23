import {
  inject,
  getBpmnJS,
  bootstrapModeler
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  isTemplateApplied
} from 'lib/element-templates/replace-menu/ElementTemplatesReplaceProvider';

import diagramXML from './ElementTemplatesReplaceProvider.bpmn';
import templates from './ElementTemplatesReplaceProvider.element-templates.json';

import { isString } from 'min-dash';

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


describe('<ElementTemplatesReplaceProvider>', function() {

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

    it('should display matching element templates', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('ServiceTask_1');

      // when
      openPopup(task);

      // then
      const entries = getTemplateEntries();
      expect(entries).to.have.length(7);
    }));


    it('should not display element templates that do not apply', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entries = getTemplateEntries();
      expect(entries).to.have.length(6);
    }));


    it('should not display applied element template', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = applyTemplate(
        'ServiceTask_1',
        'io.camunda.connectors.HttpJson.v1.noAuth'
      );

      // when
      openPopup(task);

      // then
      const entries = getTemplateEntries();
      expect(entries).to.have.length(6);
    }));


    describe('should handle non-existing template', function() {

      it('bpmn:Group', inject(function(elementRegistry, selection) {

        // given
        const group = elementRegistry.get('GROUP');

        // when
        selection.select(group);

        // then
        // no error
      }));

    });

  });


  describe('options', function() {

    beforeEach(inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('ServiceTask_1');

      // when
      openPopup(task);
    }));


    it('should have title', inject(function() {

      // given
      const template = templates[0];
      const entry = getEntry(`replace.template-${template.id}`);

      // then
      expect(entry.label).to.eql(template.name);
    }));


    it('should have icon', inject(function() {

      // given
      const template = templates[0];
      const entry = getEntry(`replace.template-${template.id}`);

      // then
      expect(entry.imageUrl).to.eql(template.icon.contents);
    }));


    it('should have description', inject(function() {

      // given
      const template = templates[0];
      const entry = getEntry(`replace.template-${template.id}`);

      // then
      expect(entry.description).to.eql(template.description);
    }));


    it('should have documentation link', inject(function() {

      // given
      const template = templates[0];
      const entry = getEntry(`replace.template-${template.id}`);

      // then
      expect(entry.documentationRef).to.eql(template.documentationRef);
    }));


    it('should have group - default', inject(function() {

      // given
      const templateEntryId = getTemplateEntries()[0];
      const entry = getEntry(templateEntryId);

      // then
      expect(entry.group.id).to.eql('templates');
      expect(entry.group.name).to.eql('Templates');
    }));


    it('should have group - category', inject(function(popupMenu) {

      // given
      const templateEntryId = getTemplateEntries()[1];
      const entry = getEntry(templateEntryId);

      // then
      expect(entry.group.id).to.eql('connectors');
      expect(entry.group.name).to.eql('Connectors');
    }));

  });


  describe('replace', function() {

    it('should apply template', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('ServiceTask_1');
      const template = templates[0];

      // when
      openPopup(task);

      triggerAction(`replace.template-${template.id}`);

      // then
      expect(isTemplateApplied(task, template)).to.be.true;

    }));


    it('should remove template', inject(function(elementRegistry) {

      // given
      let task = elementRegistry.get('ServiceTask_1_template');

      // then
      expect(hasExtensionElements(task)).to.be.true;

      // when
      openPopup(task);
      triggerAction('replace-remove-element-template');

      // then
      task = elementRegistry.get('ServiceTask_1_template');
      expect(isTemplateApplied(task, templates[0])).to.be.false;
      expect(hasExtensionElements(task)).to.be.false;
    }));


    it('should undo', inject(function(elementRegistry, commandStack) {

      // given
      const task = elementRegistry.get('ServiceTask_1');
      const template = templates[0];

      openPopup(task);
      triggerAction(`replace.template-${template.id}`);

      // when
      commandStack.undo();

      // then
      expect(isTemplateApplied(task, template)).to.be.false;
    }));


    it('should redo', inject(function(elementRegistry, commandStack) {

      // given
      const task = elementRegistry.get('ServiceTask_1');
      const template = templates[0];

      openPopup(task);
      triggerAction(`replace.template-${template.id}`);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(isTemplateApplied(task, template)).to.be.true;
    }));

  });


  describe('search', function() {

    it('should be searchable by keywords', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      const entries = getEntries();
      const entry = entries['replace.template-example.KeywordsTemplate'];

      // then
      expect(entry?.search).to.be.eql([ 'first keyword', 'another keyword' ]);
    }));

  });

});


// helpers ////////////

function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {
    popupMenu.open(element, 'bpmn-replace', {
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
    throw new Error('entry "' + id + '" not found in replace menu');
  }

  const popupMenu = getBpmnJS().get('popupMenu');
  const eventBus = getBpmnJS().get('eventBus');

  return popupMenu.trigger(
    eventBus.createEvent({
      target: entry,
      x: 0,
      y: 0,
    })
  );
}

function getEntries() {
  const popupMenu = getBpmnJS().get('popupMenu');
  return popupMenu._current.entries;
}

function getEntry(id) {
  const popupMenu = getBpmnJS().get('popupMenu');

  return popupMenu._getEntry(id);
}

function getTemplateEntries() {
  const entries = getEntries();
  const entryIds = Object.keys(entries);

  return entryIds.filter(entry => entry.startsWith('replace.template'));
}


function applyTemplate(element, template) {

  return getBpmnJS().invoke(function(elementTemplates, elementRegistry) {

    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    if (isString(template)) {
      template = templates.find(t => t.id === template);
    }

    expect(element).to.exist;
    expect(template).to.exist;

    return elementTemplates.applyTemplate(element, template);
  });
}

function hasExtensionElements(element) {
  const businessObject = getBusinessObject(element);
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return false;
  } else {
    return true;
  }
}