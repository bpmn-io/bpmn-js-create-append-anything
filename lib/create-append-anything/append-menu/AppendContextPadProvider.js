import {
  assign
} from 'min-dash';

import {
  appendIcon
} from '../../icons/Icons';


/**
 * A provider for append context pad button
 */
export default function AppendContextPadProvider(contextPad, popupMenu, translate, canvas, rules) {

  this._contextPad = contextPad;
  this._popupMenu = popupMenu;
  this._translate = translate;
  this._canvas = canvas;
  this._rules = rules;

  this.register();
}

AppendContextPadProvider.$inject = [
  'contextPad',
  'popupMenu',
  'translate',
  'canvas',
  'rules'
];

/**
 * Register append button provider in the context pad
 */
AppendContextPadProvider.prototype.register = function() {
  this._contextPad.registerProvider(this);
};

/**
 * Gets the append context pad entry
 *
 * @param {djs.model.Base} element
 * @returns {Object} entries
 */
AppendContextPadProvider.prototype.getContextPadEntries = function(element) {
  const popupMenu = this._popupMenu;
  const translate = this._translate;
  const rules = this._rules;
  const getAppendMenuPosition = this._getAppendMenuPosition.bind(this);

  if (rules.allowed('shape.append', { element })) {

    // append menu entry
    return {
      'append': {
        group: 'model',
        html: `<div class="entry">${appendIcon}</div>`,
        title: translate('Append element'),
        action: {
          click: function(event, element) {

            const position = assign(getAppendMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            popupMenu.open(element, 'bpmn-append', position, {
              title: translate('Append element'),
              width: 300,
              search: true
            });
          }
        }
      }
    };
  }
};

/**
 * Calculates the position for the append menu relatively to the element
 *
 * @param {djs.model.Base} element
 * @returns {Object}
 */
AppendContextPadProvider.prototype._getAppendMenuPosition = function(element) {
  const X_OFFSET = 5;

  const pad = this._canvas.getContainer().querySelector('.djs-context-pad');

  const padRect = pad.getBoundingClientRect();

  const pos = {
    x: padRect.right + X_OFFSET,
    y: padRect.top
  };

  return pos;
};