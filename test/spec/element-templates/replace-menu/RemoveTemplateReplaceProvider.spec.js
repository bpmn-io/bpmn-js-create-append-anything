import {
  inject,
  getBpmnJS,
  bootstrapModeler
} from 'test/TestHelper';

import diagramXML from './RemoveTemplateReplaceProvider.bpmn';
import templates from './RemoveTemplateReplaceProvider.element-templates.json';

import { isString } from 'min-dash';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  CloudElementTemplatesPropertiesProviderModule as ElementTemplatesProviderModule
} from 'bpmn-js-properties-panel';

import { CreateAppendElementTemplatesModule } from 'lib/';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';


describe('<RemoveTemplateReplaceProvider>', function() {

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

    it('should not display remove on plain task', inject(function(elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      openPopup(task);

      // then
      const entries = Object.keys(getEntries());
      expect(entries).not.to.include('replace-remove-element-template');
    }));


    describe('display options to reset to plain element in correct order', function() {

      it('template service task -> service task', inject(function() {

        // given
        const element = applyTemplate(
          'ServiceTask_1',
          'com.camunda.example.MailTask'
        );

        // when
        openPopup(element);

        // then
        const entries = Object.keys(getEntries());
        const entryIndex = entries.indexOf('replace-remove-element-template');

        // should be displayed on top
        expect(entryIndex).to.be.lessThanOrEqual(2);
      }));


      it('template task -> task', inject(function() {

        // given
        const element = applyTemplate(
          'Task_1',
          'example.TaskTemplate'
        );

        // when
        openPopup(element);

        // then
        const entries = Object.keys(getEntries());
        const entryIndex = entries.indexOf('replace-remove-element-template');

        expect(entryIndex).to.eql(0);
      }));


      it('template transaction -> transaction', inject(function() {

        // given
        const element = applyTemplate(
          'SUB_PROCESS',
          'example.TransactionTemplate'
        );

        // when
        openPopup(element);

        // then
        const entries = Object.keys(getEntries());
        const entryIndex = entries.indexOf('replace-remove-element-template');

        expect(entryIndex).to.eql(0);
      }));

    });

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

function getEntries() {
  const popupMenu = getBpmnJS().get('popupMenu');
  return popupMenu._current.entries;
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