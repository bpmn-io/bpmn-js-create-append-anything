import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import AppendMenuModule from 'lib/create-append-anything/append-menu';
import CustomRulesModule from 'bpmn-js/test/util/custom-rules';


describe('features/create-append-anything - append menu provider', function() {

  describe('append', function() {

    const diagramXML = require('../../../fixtures/simple.bpmn').default;

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        AppendMenuModule,
        CustomRulesModule
      ]
    }));


    it('should show append menu in the correct position', inject(function(elementRegistry, contextPad) {

      // given
      const element = elementRegistry.get('StartEvent_1'),
            padding = { y: 1, x: 5 };

      contextPad.open(element);

      // when
      contextPad.trigger('click', padEvent('append'));

      const padMenuRect = getPad().getBoundingClientRect();
      const replaceMenuRect = getPopupMenu().getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.right + padding.x);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.top + padding.y);
    }));


    it('should hide icon if append is disallowed', inject(
      function(elementRegistry, contextPad, customRules) {

        // given
        const element = elementRegistry.get('StartEvent_1');

        // disallow append
        customRules.addRule('shape.append', function(context) {
          return !is(context.element, 'bpmn:StartEvent');
        });

        // when
        contextPad.open(element);

        const padNode = getPad();

        // then
        expect(padEntry(padNode, 'append')).not.to.exist;
      }
    ));


    it('should show icon if append is allowed', inject(
      function(elementRegistry, contextPad, customRules) {

        // given
        const element = elementRegistry.get('Task_1');

        // disallow append
        customRules.addRule('shape.append', function(context) {
          return !is(context.element, 'bpmn:StartEvent');
        });

        // when
        contextPad.open(element);

        const padNode = getPad();

        // then
        expect(padEntry(padNode, 'append')).to.exist;
      }
    ));

  });
});


// helper //////////////////////////////////////////////////////////////////////
function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}

function padEvent(entry) {
  const target = padEntry(getPad(), entry);

  return {
    target: target,
    preventDefault: function() {},
    clientX: 100,
    clientY: 100
  };
}

function getPad() {
  return getBpmnJS().invoke(function(canvas) {
    return canvas.getContainer().querySelector('.djs-context-pad');
  });
}

function getPopupMenu() {
  const popup = getBpmnJS().get('popupMenu');

  return popup._current && domQuery('.djs-popup', popup._current.container);
}