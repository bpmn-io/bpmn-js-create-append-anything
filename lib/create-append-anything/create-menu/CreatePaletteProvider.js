import { createIcon } from '../../icons/Icons';

import { query as domQuery } from 'min-dom';

const LOWER_PRIORITY = 900;

/**
 * A palette provider for the create elements menu.
 */
export default function CreatePaletteProvider(palette, translate, popupMenu, canvas, mouse) {

  this._palette = palette;
  this._translate = translate;
  this._popupMenu = popupMenu;
  this._canvas = canvas;
  this._mouse = mouse;

  this.register();
}

CreatePaletteProvider.$inject = [
  'palette',
  'translate',
  'popupMenu',
  'canvas',
  'mouse'
];

/**
 * Register create button provider in the palette
 */
CreatePaletteProvider.prototype.register = function() {
  this._palette.registerProvider(LOWER_PRIORITY, this);
};

/**
 * Gets the palette create entry
 *
 * @param {djs.model.Base} element
 * @returns {Object}
 */
CreatePaletteProvider.prototype.getPaletteEntries = function(element) {
  const translate = this._translate,
        popupMenu = this._popupMenu,
        canvas = this._canvas,
        mouse = this._mouse;

  const getPosition = (event) => {
    const X_OFFSET = 35;
    const Y_OFFSET = 10;

    if (event instanceof KeyboardEvent) {
      event = mouse.getLastMoveEvent();
      return { x: event.x, y: event.y };
    }

    const target = event && event.target || domQuery('.djs-palette [data-action="create"]');
    const targetPosition = target.getBoundingClientRect();

    return target && {
      x: targetPosition.left + targetPosition.width / 2 + X_OFFSET,
      y: targetPosition.top + targetPosition.height / 2 + Y_OFFSET
    };
  };

  return {
    'create': {
      group: 'create',
      imageUrl: createIcon,
      title: translate('Create element'),
      action: {
        click: function(event) {
          const position = getPosition(event);

          const element = canvas.getRootElement();

          popupMenu.open(element, 'bpmn-create', position, {
            title: translate('Create element'),
            width: 300,
            search: true
          });
        }
      }
    }
  };
};
