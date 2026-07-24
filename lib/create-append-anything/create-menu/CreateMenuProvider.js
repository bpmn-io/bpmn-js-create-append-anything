import { CREATE_OPTIONS } from '../../util/CreateOptionsUtil';
import { buildMenuEntries } from '../../util/PopupMenuEntriesUtil';

/**
 * This module is a create menu provider for the popup menu.
 */
export default function CreateMenuProvider(
    elementFactory, popupMenu, create,
    autoPlace, mouse, translate
) {
  this._elementFactory = elementFactory;
  this._popupMenu = popupMenu;
  this._create = create;
  this._autoPlace = autoPlace;
  this._mouse = mouse;
  this._translate = translate;

  this.register();
}

CreateMenuProvider.$inject = [
  'elementFactory',
  'popupMenu',
  'create',
  'autoPlace',
  'mouse',
  'translate'
];

/**
 * Register create menu provider in the popup menu
 */
CreateMenuProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bpmn-create', this);
};

/**
 * Returns the create options as flat popup menu entries.
 *
 * @return {Object} menu entries keyed by id
 */
CreateMenuProvider.prototype.getPopupMenuEntries = function() {
  return buildMenuEntries(CREATE_OPTIONS, {
    idPrefix: 'create',
    translate: this._translate,
    createAction: (option) => {
      const targetAction = this._createEntryAction(option.target);

      return {
        click: targetAction,
        dragstart: targetAction
      };
    }
  });
};

/**
 * Create an action for a given target
 *
 * @param {Object} target
 * @returns {Object}
 */
CreateMenuProvider.prototype._createEntryAction = function(target) {

  const create = this._create;
  const mouse = this._mouse;
  const popupMenu = this._popupMenu;
  const elementFactory = this._elementFactory;

  let newElement;

  return (event) => {
    popupMenu.close();

    // create the new element
    if (target.type === 'bpmn:Participant') {
      newElement = elementFactory.createParticipantShape(target);
    } else {
      newElement = elementFactory.create('shape', target);
    }

    // use last mouse event if triggered via keyboard
    if (event instanceof KeyboardEvent) {
      event = mouse.getLastMoveEvent();
    }

    return create.start(event, newElement);
  };
};