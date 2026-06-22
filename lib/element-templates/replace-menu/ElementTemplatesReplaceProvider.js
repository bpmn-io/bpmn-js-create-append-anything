import {
  getBusinessObject,
} from 'bpmn-js/lib/util/ModelUtil';

import { assign } from 'min-dash';

import { templateToEntry } from '../util/entryBuilder';


/**
 * A replace menu provider that allows to replace elements with
 * element templates.
 */
export default function ElementTemplatesReplaceProvider(popupMenu, translate, elementTemplates) {

  this._popupMenu = popupMenu;
  this._translate = translate;
  this._elementTemplates = elementTemplates;

  this.register();
}

ElementTemplatesReplaceProvider.$inject = [
  'popupMenu',
  'translate',
  'elementTemplates'
];

/**
 * Register replace menu provider in the popup menu
 */
ElementTemplatesReplaceProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bpmn-replace', this);
};

/**
 * Adds the element templates to the replace menu.
 * @param {djs.model.Base} element
 *
 * @returns {Object}
 */
ElementTemplatesReplaceProvider.prototype.getPopupMenuEntries = function(element) {

  return (entries) => {

    // add template entries
    assign(entries, this.getTemplateEntries(element));

    return entries;
  };
};

/**
 * Get all element templates that can be used to replace the given element.
 *
 * @param {djs.model.Base} element
 *
 * @return {Object} element templates as menu entries
 */
ElementTemplatesReplaceProvider.prototype.getTemplateEntries = function(element) {

  const elementTemplates = this._elementTemplates;

  const defaultGroup = {
    id: 'templates',
    name: this._translate('Templates')
  };

  return this._getMatchingTemplates(element).reduce((entries, template) => {

    const action = (presetId) => () => {
      elementTemplates.applyTemplate(element, template, { presetId });
    };

    entries[`replace.template-${ template.id }`] = templateToEntry(template, action, {
      group: defaultGroup
    });

    return entries;
  }, {});
};

/**
 * Returns the templates that can the element can be replaced with.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<ElementTemplate>}
 */
ElementTemplatesReplaceProvider.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getLatest(element).filter(template => {

    // If template has steps with presets,
    // allow replacing with itself to change presets.
    if (template.steps?.length) {
      return true;
    }

    return !isTemplateApplied(element, template);
  });
};


// helpers ////////////
export function isTemplateApplied(element, template) {
  const businessObject = getBusinessObject(element);

  if (businessObject) {
    return businessObject.get('zeebe:modelerTemplate') === template.id;
  }

  return false;
}
