import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import { CreateAppendAnythingModule } from 'lib/';


describe('features/create-append-anything - editor actions', function() {

  const diagramXML = require('test/fixtures/simple.bpmn').default;

  beforeEach(
    bootstrapModeler(diagramXML, {
      additionalModules: [
        CreateAppendAnythingModule
      ]
    })
  );

  describe('#appendElement', function() {

    it('should open append element', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('StartEvent_1');

      selection.select(element);
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-append')).to.be.true;
    }));


    it('should open create element if multiple elements selected', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const elementIds = [ 'StartEvent_1', 'Task_1' ];
      const elements = elementIds.map(function(id) {
        return elementRegistry.get(id);
      });

      selection.select(elements);
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));


    it('should open create element if no selection', inject(function(editorActions, eventBus) {

      // given
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));


    it('should open create element if append not allowed', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('EndEvent_1');

      selection.select(element);
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));

  });


  describe('#createElement', function() {

    it('should open create element', inject(function(editorActions, eventBus) {

      // given
      const changedSpy = sinon.spy();
      eventBus.once('popupMenu.open', changedSpy);

      // when
      editorActions.trigger('createElement', {});

      // then
      expect(changedSpy).to.have.been.called;
    }));

  });

});


// helpers //////////////////////
function isMenu(menuId) {
  const popup = getBpmnJS().get('popupMenu');
  const popupElement = popup._current && domQuery('.djs-popup', popup._current.container);

  return popupElement.classList.contains(menuId);
}