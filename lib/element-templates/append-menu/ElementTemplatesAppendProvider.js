import { assign } from 'min-dash';

import { templateToEntry } from '../util/entryBuilder';

/**
 * A popup menu provider that allows to append elements with
 * element templates.
 */
export default function ElementTemplatesAppendProvider(
    popupMenu, translate, elementTemplates,
    autoPlace, create, mouse, rules) {

  this._popupMenu = popupMenu;
  this._translate = translate;
  this._elementTemplates = elementTemplates;
  this._autoPlace = autoPlace;
  this._create = create;
  this._mouse = mouse;
  this._rules = rules;

  this.register();
}

ElementTemplatesAppendProvider.$inject = [
  'popupMenu',
  'translate',
  'elementTemplates',
  'autoPlace',
  'create',
  'move',
  'rules'
];

/**
 * Register append menu provider in the popup menu
 */
ElementTemplatesAppendProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bpmn-append', this);
};

/**
 * Adds the element templates to the append menu.
 * @param {djs.model.Base} element
 *
 * @returns {Object}
 */
ElementTemplatesAppendProvider.prototype.getPopupMenuEntries = function(element) {
  return (entries) => {

    if (!this._rules.allowed('shape.append', { element: element })) {
      return [];
    }

    const filteredTemplates = this._filterTemplates(this._elementTemplates.getLatest());

    // add template entries
    assign(entries, this.getTemplateEntries(element, filteredTemplates));

    return entries;
  };
};

/**
 * Get all element templates.
 *
 * @param {djs.model.Base} element
 * @param {Array<ElementTemplate>} templates
 *
 * @return {Object} element templates as menu entries
 */
ElementTemplatesAppendProvider.prototype.getTemplateEntries = function(element, templates) {

  const defaultGroup = {
    id: 'templates',
    name: this._translate('Templates')
  };

  return templates.reduce((entries, template) => {

    entries[`append.template-${ template.id }`] = templateToEntry(
      template,
      this._getAction(element, template),
      { group: defaultGroup }
    );

    return entries;
  }, {});
};

/**
 * Get the action factory for a template's entries.
 *
 * @param {djs.model.Base} element
 * @param {Object} template
 *
 * @returns {(presetId?: string) => Object}
 */
ElementTemplatesAppendProvider.prototype._getAction = function(element, template) {
  const elementTemplates = this._elementTemplates;
  const autoPlace = this._autoPlace;
  const create = this._create;
  const mouse = this._mouse;

  return (presetId) => {

    const autoPlaceElement = () => {
      const newElement = elementTemplates.createElement(template, { presetId });

      autoPlace.append(element, newElement);
    };

    const manualPlaceElement = (event) => {
      const newElement = elementTemplates.createElement(template, { presetId });

      if (event instanceof KeyboardEvent) {
        event = mouse.getLastMoveEvent();
      }

      return create.start(event, newElement, {
        source: element
      });
    };

    return {
      click: canAutoPlaceElement(template) ? autoPlaceElement : manualPlaceElement,
      dragstart: manualPlaceElement
    };
  };
};

/**
 * Filter out templates from the options.
 *
 * @param {Array<Object>} templates
 *
 * @returns {Array<Object>}
 */
ElementTemplatesAppendProvider.prototype._filterTemplates = function(templates) {
  return templates.filter(template => {
    const {
      appliesTo,
      elementType
    } = template;

    const type = (elementType && elementType.value) || appliesTo[0];

    // elements that can not be appended
    if ([
      'bpmn:StartEvent',
      'bpmn:Participant'
    ].includes(type)) {
      return false;
    }

    // sequence flow templates are supported
    // but connections are not appendable
    if ('bpmn:SequenceFlow' === type) {
      return false;
    }

    return true;
  });
};

function canAutoPlaceElement(elementTemplate) {
  const {
    appliesTo = [],
    elementType = {}
  } = elementTemplate;

  const type = elementType.value || appliesTo[0];

  if (type === 'bpmn:BoundaryEvent') {
    return false;
  }

  if (type === 'bpmn:IntermediateCatchEvent' && elementType.eventDefinition === 'bpmn:LinkEventDefinition') {
    return false;
  }

  return true;
}
