/**
 * Build the diagram-js popup menu entry (including nested step entries) for a template.
 *
 * @param {Object} template
 * @param {(presetId?: string) => any} action factory producing the entry action
 * @param {Object} [overrides] base fields merged into the top entry
 *
 * @return {Object} popup menu entry
 */
export function templateToEntry(template, action, overrides = {}) {
  const { icon = {}, category } = template;

  const base = {
    label: template.name,
    description: template.description,
    documentationRef: template.documentationRef,
    imageUrl: icon.contents,
    search: template.keywords,
    ...overrides,
    ...(category && { group: category })
  };

  return buildEntry(base, template, action);
}

/**
 * Enrich a base entry with either an `action` (leaf) or nested step `entries`
 * (category, built recursively).
 *
 * @param {Object} entry the entry's base fields
 * @param {Object} node template or step carrying `steps` and/or `presetId`
 * @param {(presetId?: string) => any} action
 *
 * @return {Object} the complete popup menu entry
 */
function buildEntry(entry, node, action) {
  if (!node.steps?.length) {
    return { ...entry, action: action(node.presetId) };
  }

  const entries = node.steps.reduce((entries, step, index) => {
    const nextEntry = {
      label: step.name,
      description: step.description,
      imageUrl: entry.imageUrl,
      search: step.keywords
    };

    entries[`step-${ index }`] = buildEntry(nextEntry, step, action);

    return entries;
  }, {});

  return { ...entry, entries };
}
