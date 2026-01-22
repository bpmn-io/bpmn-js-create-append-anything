import {
  bootstrapModeler,
  getBpmnJS,
  inject,
  createEvent as globalEvent
} from 'test/TestHelper';

import { expect } from 'chai';
import { spy } from 'sinon';


import AppendMenuModule from 'lib/create-append-anything/append-menu';
import CustomRulesModule from 'bpmn-js/test/util/custom-rules';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';


describe('features/create-append-anything - append menu provider', function() {

  const diagramXML = require('./AppendMenuProvider.bpmn').default;

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      AppendMenuModule,
      CustomRulesModule
    ]
  }));


  describe('rules', function() {

    it('should get entries by default', inject(function(elementRegistry) {

      // given
      const startEvent = elementRegistry.get('StartEvent');

      // when
      openPopup(startEvent);

      // then
      expect(queryEntries()).to.have.length.above(0);
    }));


    it('should get entries when custom rule returns true',
      inject(function(elementRegistry, customRules) {

        // given
        const startEvent = elementRegistry.get('StartEvent');

        customRules.addRule('shape.append', function() {
          return true;
        });

        // when
        openPopup(startEvent);

        // then
        expect(queryEntries()).to.have.length.above(0);
      })
    );


    it('should get no entries when custom rule returns false',
      inject(function(elementRegistry, customRules) {

        // given
        const startEvent = elementRegistry.get('StartEvent');

        customRules.addRule('shape.append', function() {
          return false;
        });

        // when
        openPopup(startEvent);

        // then
        expect(queryEntries()).to.have.length(0);
      })
    );

  });


  describe('menu', function() {

    describe('should not appear as append option', function() {

      it('Start Event', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // when
        openPopup(task);

        // then
        expect(queryEntry('append-none-start')).to.not.exist;
      }));


      it('Participant', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // when
        openPopup(task);

        // then
        expect(queryEntry('append-expanded-pool')).to.not.exist;
      }));


      it('None Boundary Event', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // when
        openPopup(task);

        // then
        expect(queryEntry('append-boundary-event')).to.not.exist;
      }));

    });

  });


  describe('append', function() {

    describe('task', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(startEvent);
        triggerAction('append-task');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should append via dragstart', inject(function(elementRegistry, eventBus, dragging) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;
        const createSpy = spy();
        const endSpy = spy();

        eventBus.on('create.start', createSpy);
        eventBus.on('create.end', endSpy);

        // when
        openPopup(startEvent);
        placeDragElement(startEvent, 'append-task');

        // then
        expect(createSpy).to.have.been.called;
        expect(endSpy).to.have.been.called;
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-task');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-task');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));

    });


    describe('sub process', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(startEvent);
        triggerAction('append-expanded-subprocess');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should append via dragstart', inject(function(elementRegistry, eventBus, dragging) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;
        const createSpy = spy();
        const endSpy = spy();

        eventBus.on('create.start', createSpy);
        eventBus.on('create.end', endSpy);

        // when
        openPopup(startEvent);
        placeDragElement(startEvent, 'append-expanded-subprocess');

        // then
        expect(createSpy).to.have.been.called;
        expect(endSpy).to.have.been.called;
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-expanded-subprocess');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        openPopup(startEvent);
        triggerAction('append-expanded-subprocess');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      describe('should trigger create mode', function() {

        it('event subprocess', inject(function(elementRegistry, eventBus) {

          // given
          const task = elementRegistry.get('Task');

          const initSpy = spy();

          eventBus.on('create.init', initSpy);

          // when
          openPopup(task);

          triggerAction('append-event-subprocess');

          // then
          expect(initSpy).to.have.been.called;

        }));

      });


    });


    describe('event', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');
        const outgoingFlows = getBusinessObject(task).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(task);
        triggerAction('append-none-end-event');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should append via dragstart', inject(function(elementRegistry, eventBus, dragging) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;
        const createSpy = spy();
        const endSpy = spy();

        eventBus.on('create.start', createSpy);
        eventBus.on('create.end', endSpy);

        // when
        openPopup(startEvent);
        placeDragElement(startEvent, 'append-none-end-event');

        // then
        expect(createSpy).to.have.been.called;
        expect(endSpy).to.have.been.called;
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const outgoingFlows = getBusinessObject(task).outgoing;

        // when
        openPopup(task);
        triggerAction('append-none-end-event');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const outgoingFlows = getBusinessObject(task).outgoing;

        openPopup(task);
        triggerAction('append-none-end-event');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));
    });

    describe('should trigger create mode', function() {
      it('link intermediate catch event', inject(function(elementRegistry, eventBus) {

        // given
        const task = elementRegistry.get('Task');

        const initSpy = spy();

        eventBus.on('create.init', initSpy);

        // when
        openPopup(task);

        triggerAction('append-link-intermediate-catch');

        // then
        expect(initSpy).to.have.been.called;
      }));
    });


    describe('boundary event', function() {

      it('should NOT auto-attach when element already has attachers', inject(function(elementRegistry, eventBus) {

        // given
        const taskWithBoundary = elementRegistry.get('TaskWithBoundary');
        const createInitSpy = spy();

        expect(taskWithBoundary.attachers).to.have.length(1);

        eventBus.on('create.init', createInitSpy);

        // when
        openPopup(taskWithBoundary);
        triggerAction('append-timer-boundary');

        // then
        // Should trigger create mode (manual placement) instead of auto-attach
        expect(createInitSpy).to.have.been.called;
        expect(taskWithBoundary.attachers).to.have.length(1);
      }));

      it('should NOT auto-attach when rules disallow attachment', inject(function(elementRegistry, eventBus) {

        // given
        const receiveTask = elementRegistry.get('ReceiveTaskAfterGateway');
        const createInitSpy = spy();

        eventBus.on('create.init', createInitSpy);

        // when
        openPopup(receiveTask);
        triggerAction('append-timer-boundary');

        // then
        // Should trigger create mode (manual placement) because rules.allowed returns false
        expect(createInitSpy).to.have.been.called;
        expect(receiveTask.attachers || []).to.be.empty;
      }));

      it('should auto-attach when element has no attachers and rules allow', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // Verify task has no boundary events
        expect(task.attachers || []).to.be.empty;

        // when
        openPopup(task);
        triggerAction('append-timer-boundary');

        // then
        // Boundary event should be attached
        expect(task.attachers).to.have.length(1);
        expect(task.attachers[0].type).to.equal('bpmn:BoundaryEvent');
      }));

      it('should append via dragstart', inject(function(elementRegistry, eventBus) {

        // given
        const task = elementRegistry.get('Task');
        const createSpy = spy();
        const endSpy = spy();

        eventBus.on('create.start', createSpy);
        eventBus.on('create.end', endSpy);

        expect(task.attachers || []).to.be.empty;

        // when
        openPopup(task);
        placeBoundaryEventOnTask(task, 'append-timer-boundary');

        // then
        expect(createSpy).to.have.been.called;
        expect(endSpy).to.have.been.called;
        expect(task.attachers).to.have.length(1);
      }));

      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');

        expect(task.attachers || []).to.be.empty;

        // when
        openPopup(task);
        triggerAction('append-timer-boundary');

        // then
        expect(task.attachers).to.have.length(1);

        // when
        commandStack.undo();

        // then
        expect(task.attachers).to.be.empty;
      }));

      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');

        expect(task.attachers || []).to.be.empty;

        // when
        openPopup(task);
        triggerAction('append-timer-boundary');
        commandStack.undo();

        // then
        expect(task.attachers).to.be.empty;

        // when
        commandStack.redo();

        // then
        expect(task.attachers).to.have.length(1);
      }));
    });


    describe('gateway', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(startEvent);
        triggerAction('append-exclusive-gateway');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should append via dragstart', inject(function(elementRegistry, eventBus, dragging) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;
        const createSpy = spy();
        const endSpy = spy();

        eventBus.on('create.start', createSpy);
        eventBus.on('create.end', endSpy);

        // when
        openPopup(startEvent);
        placeDragElement(startEvent, 'append-exclusive-gateway');

        // then
        expect(createSpy).to.have.been.called;
        expect(endSpy).to.have.been.called;
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-exclusive-gateway');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        openPopup(startEvent);
        triggerAction('append-exclusive-gateway');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));

    });


    describe('data reference', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');
        const dataOutputAssociations = getBusinessObject(task).get('dataOutputAssociations');

        expect(dataOutputAssociations).to.have.length(0);

        // when
        openPopup(task);
        triggerAction('append-data-store-reference');

        // then
        expect(dataOutputAssociations).to.have.length(1);
      }));


      it('should append via dragstart', inject(function(elementRegistry, eventBus, dragging) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;
        const createSpy = spy();
        const endSpy = spy();

        eventBus.on('create.start', createSpy);
        eventBus.on('create.end', endSpy);

        // when
        openPopup(startEvent);
        placeDragElement(startEvent, 'append-data-store-reference');

        // then
        expect(createSpy).to.have.been.called;
        expect(endSpy).to.have.been.called;
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const dataOutputAssociations = getBusinessObject(task).get('dataOutputAssociations');

        // when
        openPopup(task);
        triggerAction('append-data-store-reference');

        // then
        expect(dataOutputAssociations).to.have.length(1);

        // when
        commandStack.undo();

        // then
        expect(dataOutputAssociations).to.have.length(0);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const dataOutputAssociations = getBusinessObject(task).get('dataOutputAssociations');

        openPopup(task);
        triggerAction('append-data-store-reference');
        commandStack.undo();

        // then
        expect(dataOutputAssociations).to.have.length(0);

        // when
        commandStack.redo();

        // then
        expect(dataOutputAssociations).to.have.length(1);
      }));

    });

  });

});


// // helpers
function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {

    popupMenu.open(element, 'bpmn-append', {
      x: element.x + offset, y: element.y + offset
    });

  });
}

function queryEntry(id) {
  const container = getMenuContainer();

  return domQuery('.djs-popup [data-id="' + id + '"]', container);
}

function queryEntries() {
  const container = getMenuContainer();

  return domQueryAll('.djs-popup .entry', container);
}

function getMenuContainer() {
  const popup = getBpmnJS().get('popupMenu');
  return popup._current.container;
}

function triggerAction(id, action = 'click') {
  const entry = queryEntry(id);

  if (!entry) {
    throw new Error('entry "' + id + '" not found in append menu');
  }

  const popupMenu = getBpmnJS().get('popupMenu');
  return popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }), null, action);
}

function placeDragElement(element, action) {
  const dragging = getBpmnJS().get('dragging');
  const elementRegistry = getBpmnJS().get('elementRegistry');

  let processElement = elementRegistry.get('Process_07k5b99');

  triggerAction(action, 'dragstart');

  dragging.hover({ element: processElement });
  dragging.end();
}

function placeBoundaryEventOnTask(task, action) {
  const dragging = getBpmnJS().get('dragging');
  const elementRegistry = getBpmnJS().get('elementRegistry');

  triggerAction(action, 'dragstart');

  const taskGfx = elementRegistry.getGraphics(task);
  dragging.hover({ element: task, gfx: taskGfx });

  // Move to the bottom edge of the task (boundary position)
  dragging.move(globalEvent(taskGfx, { x: task.x + task.width / 2, y: task.y + task.height }));

  dragging.end();
}
