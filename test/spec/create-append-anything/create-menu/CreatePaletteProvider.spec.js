import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';
import { spy } from 'sinon';

import { query as domQuery } from 'min-dom';

import CreateMenuModule from 'lib/create-append-anything/create-menu';

import { createMoveEvent } from 'diagram-js/lib/features/mouse/Mouse';


describe('features/palette', function() {

  const diagramXML = require('./CreateMenuProvider.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [ CreateMenuModule ]
  }));

  describe('create', function() {

    it('should trigger create menu', inject(function(popupMenu, canvas) {

      // given
      const createSpy = spy(popupMenu, 'open');

      // when
      triggerPaletteEntry('create');

      // then
      const args = createSpy.getCall(0).args;

      expect(createSpy).to.have.been.called;
      expect(args[0]).to.eq(canvas.getRootElement());
      expect(args[1]).to.eq('bpmn-create');
    }));


    it('should open create menu with default width', inject(function() {

      // when
      triggerPaletteEntry('create');

      // then
      expect(getComputedStyle(getPopupMenu()).width).to.eql('300px');
    }));


    it('should allow overriding create menu width via css variable', inject(function(canvas) {

      // given
      canvas.getContainer().style.setProperty('--bpmn-create-popup-width', '400px');

      // when
      triggerPaletteEntry('create');

      // then
      expect(getComputedStyle(getPopupMenu()).width).to.eql('400px');
    }));

  });

});


// helpers //////////

function triggerPaletteEntry(id) {
  getBpmnJS().invoke(function(palette) {
    const entry = palette.getEntries()[ id ];

    if (entry && entry.action && entry.action.click) {
      entry.action.click(createMoveEvent(0, 0));
    }
  });
}

function getPopupMenu() {
  const popup = getBpmnJS().get('popupMenu');

  return popup._current && domQuery('.djs-popup', popup._current.container);
}
