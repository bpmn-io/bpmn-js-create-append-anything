import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import AppendMenuModule from 'lib/create-append-anything/append-menu';


describe('features/create-append-anything - rules', function() {

  const diagramXML = require('./AppendRules.bpmn').default;

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      AppendMenuModule
    ]
  }));


  describe('element append', function() {

    it('should not allow for given element types', inject(function(elementFactory, rules) {

      // given
      const types = [
        'bpmn:EndEvent',
        'bpmn:Group',
        'bpmn:TextAnnotation',
        'bpmn:Lane',
        'bpmn:Participant',
        'bpmn:DataStoreReference',
        'bpmn:DataObjectReference'
      ];

      // when
      const results = types.map(function(type) {
        const element = elementFactory.createShape({ type: type });
        return rules.allowed('shape.append', { element });
      });

      // then
      results.forEach(function(result) {
        expect(result).to.be.false;
      });
    }));


    it('should not allow for labels', inject(function(elementRegistry, rules) {

      // given
      const element = elementRegistry.get('START_EVENT').label;

      // when
      const allowed = rules.allowed('shape.append', { element });

      // then
      expect(allowed).to.be.false;
    }));


    it('should not allow for event subprocess', inject(function(elementFactory, rules) {

      // given
      const element = elementFactory.createShape({ type: 'bpmn:SubProcess', triggeredByEvent: true });

      // when
      const result = rules.allowed('shape.append', { element });

      // then
      expect(result).to.be.false;
    }));


    it('should not allow for link intermediate throw event', inject(function(elementFactory, rules) {

      // given
      const element = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        cancelActivity: false,
        eventDefinitionType: 'bpmn:LinkEventDefinition'
      });

      // when
      const result = rules.allowed('shape.append', { element });

      // then
      expect(result).to.be.false;
    }));


    describe('connections', function() {

      it('should not allow for sequence flows', inject(function(elementRegistry, rules) {

        // given
        const element = elementRegistry.get('SequenceFlow');

        // when
        const allowed = rules.allowed('shape.append', { element });

        // then
        expect(allowed).to.be.false;
      }));


      it('should not allow for associations', inject(function(elementRegistry, rules) {

        // given
        const element = elementRegistry.get('Association');

        // when
        const allowed = rules.allowed('shape.append', { element });

        // then
        expect(allowed).to.be.false;
      }));


      it('should not allow for message flows', inject(function(elementRegistry, rules) {

        // given
        const element = elementRegistry.get('MessageFlow');

        // when
        const allowed = rules.allowed('shape.append', { element });

        // then
        expect(allowed).to.be.false;
      }));

    });
  });

});