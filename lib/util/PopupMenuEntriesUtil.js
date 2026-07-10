/**
 * Build flat popup menu entries from a list of create/append options, shared by
 * the create and append menus.
 *
 * The library stays neutral about grouping; consumers may impose their own
 * structure on top of these entries.
 *
 * @param {Array<Object>} options
 * @param {Object} config
 * @param {string} config.idPrefix entry id prefix, e.g. `'create'` or `'append'`
 * @param {Function} config.translate
 * @param {Function} config.createAction maps an option to its entry `action`
 * @param {Function} [config.filter] keep predicate for options
 *
 * @return {Object} popup menu entries
 */
export function buildMenuEntries(options, config) {
  const entries = {};

  options.forEach(option => {
    if (!config.filter || config.filter(option)) {
      entries[`${config.idPrefix}-${option.actionName}`] = toActionEntry(option, config);
    }
  });

  return entries;
}

function toActionEntry(option, { translate, createAction }) {
  return {
    label: option.label && translate(option.label),
    className: option.className,
    description: option.description && translate(option.description),
    group: option.group && { ...option.group, name: translate(option.group.name) },
    search: option.search,
    rank: option.rank,
    action: createAction(option)
  };
}
