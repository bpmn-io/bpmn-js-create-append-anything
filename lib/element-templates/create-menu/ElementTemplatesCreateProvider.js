import { assign } from 'min-dash';

import getEntryAction from '../util/getEntryAction';

/**
 * A popup menu provider that allows to create elements with
 * element templates.
 */
export default function ElementTemplatesCreateProvider(
    popupMenu, translate,
    elementTemplates, mouse, create) {

  this._popupMenu = popupMenu;
  this._translate = translate;
  this._elementTemplates = elementTemplates;
  this._mouse = mouse;
  this._create = create;

  this.register();
}

ElementTemplatesCreateProvider.$inject = [
  'popupMenu',
  'translate',
  'elementTemplates',
  'mouse',
  'create'
];

/**
 * Register create menu provider in the popup menu
 */
ElementTemplatesCreateProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bpmn-create', this);
};

/**
 * Adds the element templates to the create menu.
 * @param {djs.model.Base} element
 *
 * @returns {Object}
 */
ElementTemplatesCreateProvider.prototype.getPopupMenuEntries = function(element) {
  return (entries) => {

    // add template entries
    assign(entries, this.getTemplateEntries());

    return entries;
  };
};

/**
 * Get all element templates.
 *
 * @return {Object} element templates as menu entries
 */
ElementTemplatesCreateProvider.prototype.getTemplateEntries = function() {

  const elementTemplates = this._elementTemplates;
  const create = this._create;
  const popupMenu = this._popupMenu;
  const mouse = this._mouse;

  const defaultGroup = {
    id: 'templates',
    name: this._translate('Templates')
  };

  return this._elementTemplates.getLatest().reduce((entries, template) => {
    const {
      icon = {},
      category,
      keywords = []
    } = template;

    const entryId = `create.template-${ template.id }`;

    const action = (presetId) => {

      const startCreate = (event) => {
        popupMenu.close();

        const newElement = elementTemplates.createElement(template, { presetId });

        if (event instanceof KeyboardEvent) {
          event = mouse.getLastMoveEvent();
        }

        return create.start(event, newElement);
      };

      return { click: startCreate, dragstart: startCreate };
    };

    entries[entryId] = {
      label: template.name,
      description: template.description,
      documentationRef: template.documentationRef,
      imageUrl: icon.contents,
      search: keywords,
      group: category || defaultGroup,
      ...getEntryAction(template, action)
    };

    return entries;
  }, {});
};
