import { PopupEntries } from 'bpmn-js/lib/features/popup-menu';

/**
 * Build a create/append option from the shared `PopupEntries` catalog. The
 * `actionName` defaults to the catalog `id`.
 *
 * @param {string} id popup entry id
 * @param {Object} [extra] fields to override or add (e.g. `search`, `rank`, `actionName`)
 *
 * @return {Object}
 */
const createOption = (id, extra = {}) => {
  const entry = PopupEntries[id];

  if (!entry) {
    throw new Error('unknown popup entry <' + id + '>');
  }

  return {
    ...entry,
    actionName: id,
    ...extra
  };
};

export const EVENT_GROUP = { id: 'events', name: 'Events' };
export const TASK_GROUP = { id: 'tasks', name: 'Tasks' };
export const GATEWAY_GROUP = { id: 'gateways', name: 'Gateways' };
export const SUBPROCESS_GROUP = { id: 'subprocess', name: 'Sub-processes' };
export const DATA_GROUP = { id: 'data', name: 'Data' };
export const PARTICIPANT_GROUP = { id: 'participants', name: 'Participants' };

export const NONE_EVENTS = [
  createOption('none-start-event', { group: EVENT_GROUP }),
  createOption('none-intermediate-throwing', { group: EVENT_GROUP }),
  createOption('none-boundary-event', { group: EVENT_GROUP }),
  createOption('none-end-event', { group: EVENT_GROUP })
];

export const TYPED_START_EVENTS = [
  createOption('message-start', { group: EVENT_GROUP }),
  createOption('timer-start', { group: EVENT_GROUP }),
  createOption('conditional-start', { group: EVENT_GROUP }),
  createOption('signal-start', { group: EVENT_GROUP })
];

export const TYPED_NON_INTERRUPTING_START_EVENTS = [
  createOption('non-interrupting-message-start', { group: EVENT_GROUP, actionName: 'replace-with-non-interrupting-message-start', rank: -1 }),
  createOption('non-interrupting-timer-start', { group: EVENT_GROUP, actionName: 'replace-with-non-interrupting-timer-start', rank: -1 }),
  createOption('non-interrupting-conditional-start', { group: EVENT_GROUP, actionName: 'replace-with-non-interrupting-conditional-start', rank: -1 }),
  createOption('non-interrupting-signal-start', { group: EVENT_GROUP, actionName: 'replace-with-non-interrupting-signal-start', rank: -1 }),
  createOption('non-interrupting-escalation-start', { group: EVENT_GROUP, actionName: 'replace-with-non-interrupting-escalation-start', rank: -1 })
];

export const TYPED_INTERMEDIATE_EVENT = [
  createOption('message-intermediate-catch', { group: EVENT_GROUP }),
  createOption('message-intermediate-throw', { group: EVENT_GROUP }),
  createOption('timer-intermediate-catch', { group: EVENT_GROUP }),
  createOption('escalation-intermediate-throw', { group: EVENT_GROUP }),
  createOption('conditional-intermediate-catch', { group: EVENT_GROUP }),
  createOption('link-intermediate-catch', { group: EVENT_GROUP }),
  createOption('link-intermediate-throw', { group: EVENT_GROUP }),
  createOption('compensation-intermediate-throw', { group: EVENT_GROUP }),
  createOption('signal-intermediate-catch', { group: EVENT_GROUP }),
  createOption('signal-intermediate-throw', { group: EVENT_GROUP })
];

export const TYPED_BOUNDARY_EVENT = [
  createOption('message-boundary', { group: EVENT_GROUP }),
  createOption('timer-boundary', { group: EVENT_GROUP }),
  createOption('escalation-boundary', { group: EVENT_GROUP }),
  createOption('conditional-boundary', { group: EVENT_GROUP }),
  createOption('error-boundary', { group: EVENT_GROUP }),
  createOption('cancel-boundary', { group: EVENT_GROUP }),
  createOption('signal-boundary', { group: EVENT_GROUP }),
  createOption('compensation-boundary', { group: EVENT_GROUP }),
  createOption('non-interrupting-message-boundary', { group: EVENT_GROUP }),
  createOption('non-interrupting-timer-boundary', { group: EVENT_GROUP }),
  createOption('non-interrupting-escalation-boundary', { group: EVENT_GROUP }),
  createOption('non-interrupting-conditional-boundary', { group: EVENT_GROUP }),
  createOption('non-interrupting-signal-boundary', { group: EVENT_GROUP })
];

export const TYPED_END_EVENT = [
  createOption('message-end', { group: EVENT_GROUP }),
  createOption('escalation-end', { group: EVENT_GROUP }),
  createOption('error-end', { group: EVENT_GROUP }),
  createOption('cancel-end', { group: EVENT_GROUP }),
  createOption('compensation-end', { group: EVENT_GROUP }),
  createOption('signal-end', { group: EVENT_GROUP }),
  createOption('terminate-end', { group: EVENT_GROUP })
];

export const GATEWAY = [
  createOption('exclusive-gateway', { group: GATEWAY_GROUP }),
  createOption('parallel-gateway', { group: GATEWAY_GROUP }),
  createOption('inclusive-gateway', { group: GATEWAY_GROUP, search: 'or', rank: -1 }),
  createOption('complex-gateway', { group: GATEWAY_GROUP, rank: -1 }),
  createOption('event-based-gateway', { group: GATEWAY_GROUP })
];

export const SUBPROCESS = [
  createOption('call-activity', { group: SUBPROCESS_GROUP }),
  createOption('transaction', { group: SUBPROCESS_GROUP }),
  createOption('event-subprocess', { group: SUBPROCESS_GROUP, search: 'subprocess' }),
  createOption('collapsed-subprocess', { group: SUBPROCESS_GROUP, search: 'subprocess' }),
  createOption('expanded-subprocess', { group: SUBPROCESS_GROUP, search: 'subprocess' }),
  createOption('collapsed-ad-hoc-subprocess', { group: SUBPROCESS_GROUP, search: 'adhoc subprocess' }),
  createOption('expanded-ad-hoc-subprocess', { group: SUBPROCESS_GROUP, search: 'adhoc subprocess' })
];

export const TASK = [
  createOption('task', { group: TASK_GROUP }),
  createOption('user-task', { group: TASK_GROUP }),
  createOption('service-task', { group: TASK_GROUP }),
  createOption('send-task', { group: TASK_GROUP, rank: -1 }),
  createOption('receive-task', { group: TASK_GROUP, rank: -1 }),
  createOption('manual-task', { group: TASK_GROUP, rank: -1 }),
  createOption('rule-task', { group: TASK_GROUP }),
  createOption('script-task', { group: TASK_GROUP })
];

export const DATA_OBJECTS = [
  createOption('data-store-reference', { group: DATA_GROUP }),
  createOption('data-object-reference', { group: DATA_GROUP })
];

export const PARTICIPANT = [
  createOption('expanded-pool', { group: PARTICIPANT_GROUP, search: 'Non-empty pool/participant' }),
  createOption('collapsed-pool', { group: PARTICIPANT_GROUP, search: 'Collapsed pool/participant' })
];

export const ALL_EVENTS = [
  ...NONE_EVENTS,
  ...TYPED_START_EVENTS,
  ...TYPED_NON_INTERRUPTING_START_EVENTS,
  ...TYPED_INTERMEDIATE_EVENT,
  ...TYPED_BOUNDARY_EVENT,
  ...TYPED_END_EVENT
];

export const CREATE_OPTIONS = [
  ...TASK,
  ...GATEWAY,
  ...SUBPROCESS,
  ...ALL_EVENTS,
  ...DATA_OBJECTS,
  ...PARTICIPANT
];
