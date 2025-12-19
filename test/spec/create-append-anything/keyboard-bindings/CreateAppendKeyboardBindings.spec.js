import {
  inject,
  getBpmnJS,
  bootstrapModeler
} from 'test/TestHelper';

import { expect } from 'chai';
import { spy } from 'sinon';

import { forEach } from 'min-dash';

import {
  createKeyEvent
} from 'bpmn-js/test/util/KeyEvents';

import {
  query as domQuery
} from 'min-dom';

import { CreateAppendAnythingModule } from 'lib';


describe('features/create-append-anything - keyboard bindings', function() {

  const diagramXML = require('test/fixtures/simple.bpmn').default;

  beforeEach(
    bootstrapModeler(diagramXML, {
      additionalModules: [
        CreateAppendAnythingModule
      ]
    })
  );


  describe('create append keyboard bindings', function() {

    it('should include triggers inside editorActions', inject(function(editorActions) {

      // given
      const expectedActions = [
        'appendElement',
        'createElement'
      ];
      const actualActions = editorActions.getActions();

      // then
      expect(
        expectedActions.every(action => actualActions.includes(action))
      ).to.be.true;
    }));


    forEach([ 'a', 'A' ], function(key) {

      it(`should trigger append menu for ${key}`,
        inject(function(keyboard, popupMenu, elementRegistry, selection) {

          spy(popupMenu, 'open');

          // given
          const task = elementRegistry.get('Task_1');

          selection.select(task);

          const e = createKeyEvent(key);

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.have.been.calledOnce;
          expect(isMenu('bpmn-append')).to.be.true;
        }));


      it('should trigger create menu',
        inject(function(keyboard, popupMenu) {

          spy(popupMenu, 'open');

          // given
          const e = createKeyEvent(key);

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.have.been.calledOnce;
          expect(isMenu('bpmn-create')).to.be.true;
        }));


      it('should not trigger create or append menus',
        inject(function(keyboard, popupMenu) {

          spy(popupMenu, 'open');

          // given
          const e = createKeyEvent(key, { ctrlKey: true });

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.not.have.been.called;
        }));

    });


    forEach([ 'n', 'N' ], function(key) {

      it(`should trigger create menu for <${key}>`,
        inject(function(keyboard, popupMenu) {

          spy(popupMenu, 'open');

          // given
          const e = createKeyEvent(key);

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.have.been.calledOnce;
          expect(isMenu('bpmn-create')).to.be.true;
        }));


      it('should not trigger create menu',
        inject(function(keyboard, popupMenu) {

          spy(popupMenu, 'open');

          // given
          const e = createKeyEvent(key, { ctrlKey: true });

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.not.have.been.called;
        }));

    });

  });

});


// helpers //////////////////////
function isMenu(menuId) {
  const popup = getBpmnJS().get('popupMenu');
  const popupElement = popup._current && domQuery('.djs-popup', popup._current.container);

  return popupElement.classList.contains(menuId);
}
