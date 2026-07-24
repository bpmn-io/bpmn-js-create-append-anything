import { isUndefined } from 'min-dash';
import { CREATE_OPTIONS } from '../../util/CreateOptionsUtil';
import { buildMenuEntries } from '../../util/PopupMenuEntriesUtil';

/**
 * This module is an append menu provider for the popup menu.
 */
export default function AppendMenuProvider(
    elementFactory, popupMenu,
    create, autoPlace, rules,
    mouse, translate, modeling, selection
) {

  this._elementFactory = elementFactory;
  this._popupMenu = popupMenu;
  this._create = create;
  this._autoPlace = autoPlace;
  this._rules = rules;
  this._mouse = mouse;
  this._translate = translate;
  this._modeling = modeling;
  this._selection = selection;

  this.register();
}

AppendMenuProvider.$inject = [
  'elementFactory',
  'popupMenu',
  'create',
  'autoPlace',
  'rules',
  'mouse',
  'translate',
  'modeling',
  'selection'
];

/**
 * Register append menu provider in the popup menu
 */
AppendMenuProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bpmn-append', this);
};

/**
 * Returns the append options for the given element as flat popup menu entries.
 *
 * @param {djs.model.Base} element
 *
 * @return {Object} menu entries keyed by id
 */
AppendMenuProvider.prototype.getPopupMenuEntries = function(element) {
  if (!this._rules.allowed('shape.append', { element: element })) {
    return {};
  }

  return buildMenuEntries(CREATE_OPTIONS, {
    idPrefix: 'append',
    translate: this._translate,
    filter: (option) => this._includeOption(option),
    createAction: (option) => this._createEntryAction(element, option.target)
  });
};

/**
 * Whether an option should appear in the append menu.
 *
 * @param {Object} option
 *
 * @return {boolean}
 */
AppendMenuProvider.prototype._includeOption = function(option) {
  const {
    type,
    eventDefinitionType
  } = option.target;

  if ([
    'bpmn:StartEvent',
    'bpmn:Participant'
  ].includes(type)) {
    return false;
  }

  if (type === 'bpmn:BoundaryEvent' && isUndefined(eventDefinitionType)) {
    return false;
  }

  return true;
};

/**
 * Create an action for a given target.
 *
 * @param {djs.model.Element} element
 * @param {Object} target
 *
 * @return {Object}
 */
AppendMenuProvider.prototype._createEntryAction = function(element, target) {
  const elementFactory = this._elementFactory;
  const autoPlace = this._autoPlace;
  const create = this._create;
  const mouse = this._mouse;
  const modeling = this._modeling;
  const selection = this._selection;

  const autoPlaceElement = (newElement) => {
    autoPlace.append(element, newElement);
  };

  const autoAttach = (newElement) => {
    const attachPosition = getBoundaryElementAttachPosition(element);

    const createdElements = modeling.createElements(newElement, attachPosition, element, { attach: true });
    selection.select(createdElements[0]);
  };

  const manualPlaceElement = (event, newElement) => {
    if (event instanceof KeyboardEvent) {
      event = mouse.getLastMoveEvent();
    }

    return create.start(event, newElement, {
      source: element
    });
  };

  const clickActionHandler = (event) => {
    const newElement = elementFactory.create('shape', target);

    if (this._canAutoAttach(element, newElement, target)) {
      autoAttach(newElement);
    } else if (this._canAutoPlaceElement(target)) {
      autoPlaceElement(newElement);
    } else {
      manualPlaceElement(event, newElement);
    }
  };

  const dragActionHandler = (event) => {
    const newElement = elementFactory.create('shape', target);
    manualPlaceElement(event, newElement);
  };

  return {
    click: clickActionHandler,
    dragstart: dragActionHandler
  };
};

/**
 * Check if a target element can be auto-attached to the given element.
 *
 * @param {djs.model.Element} element
 * @param {djs.model.Element} newElement
 * @param {Object} target
 *
 * @return {boolean}
 */
AppendMenuProvider.prototype._canAutoAttach = function(element, newElement, target) {
  if (target.type === 'bpmn:BoundaryEvent') {
    const attachPosition = getBoundaryElementAttachPosition(element);

    const canAttach = this._rules.allowed('shape.attach', {
      shape: newElement,
      target: element,
      position: attachPosition
    });

    // Only auto-attach if the element has no existing attachers and attachment is allowed
    return canAttach === 'attach' && (!element.attachers || element.attachers.length === 0);
  }

  return false;
};

/**
 * Check if the element should be auto placed.
 *
 * @param {Object} target
 *
 * @return {Boolean}
 */
AppendMenuProvider.prototype._canAutoPlaceElement = (target) => {
  const { type } = target;

  if (type === 'bpmn:BoundaryEvent') {
    return false;
  }

  if (type === 'bpmn:SubProcess' && target.triggeredByEvent) {
    return false;
  }

  if (type === 'bpmn:IntermediateCatchEvent' && target.eventDefinitionType === 'bpmn:LinkEventDefinition') {
    return false;
  }

  return true;
};

const getBoundaryElementAttachPosition = (targetElement) => {
  return {
    x: targetElement.x + targetElement.width / 2,
    y: targetElement.y + targetElement.height
  };
};