/**
 * Return the action or nested entries for a template or step node.
 *
 * Spreads onto an entry base built by the caller:
 *
 *   entries[id] = { ...base, ...getEntryAction(template, action) };
 *
 * A node with `steps` becomes a navigable entry (`{ entries }`); a leaf
 * calls `action(presetId)` to produce the entry action (`{ action }`).
 *
 * @param {Object} template
 * @param {(presetId?: string) => any} action
 *
 * @return {{ action: any } | { entries: Object }}
 */
export default function getEntryAction(template, action) {
  return buildNodeEntryAction(template, template, action);
}


function buildNodeEntryAction(template, node, action) {
  if (!node.steps || !node.steps.length) {
    return { action: action(node.presetId) };
  }

  const imageUrl = template.icon && template.icon.contents;
  const parentKeywords = template.keywords || [];
  const tags = template.category ? [ template.category.id ] : undefined;

  const entries = node.steps.reduce((entries, step, index) => {
    entries[`step-${ index }`] = {
      label: step.name,
      description: step.description,
      imageUrl,
      search: [ ...parentKeywords, ...(step.keywords || []) ],
      tags,
      ...buildNodeEntryAction(template, step, action)
    };

    return entries;
  }, {});

  return { entries };
}
