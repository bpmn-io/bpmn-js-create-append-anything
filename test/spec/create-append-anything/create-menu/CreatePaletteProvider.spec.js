import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import CreateMenuModule from 'lib/create-append-anything/create-menu';

import { createMoveEvent } from 'diagram-js/lib/features/mouse/Mouse';


describe('features/palette', function() {

  const diagramXML = require('./CreateMenuProvider.bpmn').default;

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [ CreateMenuModule ]
  }));

  describe('create', function() {

    it('should trigger create menu', inject(function(popupMenu, canvas) {

      // given
      const createSpy = sinon.spy(popupMenu, 'open');

      // when
      triggerPaletteEntry('create');

      // then
      const args = createSpy.getCall(0).args;

      expect(createSpy).to.have.been.called;
      expect(args[0]).to.eq(canvas.getRootElement());
      expect(args[1]).to.eq('bpmn-create');
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