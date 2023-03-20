import { assign } from 'min-dash';

/**
 * Registers and executes BPMN specific editor actions.
 *
 * @param {Injector} injector
 */
export default function CreateAppendEditorActions(injector) {
  this._injector = injector;

  this.registerActions();
}

CreateAppendEditorActions.$inject = [
  'injector'
];

/**
 * Register actions.
 *
 * @param {Injector} injector
 */
CreateAppendEditorActions.prototype.registerActions = function() {
  const editorActions = this._injector.get('editorActions', false);
  const selection = this._injector.get('selection', false);
  const contextPad = this._injector.get('contextPad', false);
  const palette = this._injector.get('palette', false);
  const popupMenu = this._injector.get('popupMenu', false);

  const actions = {};

  // append
  if (selection && contextPad && palette && popupMenu && palette) {
    assign(actions, {
      'appendElement': function(event) {
        const selected = selection && selection.get();

        if (selected.length == 1 && !popupMenu.isEmpty(selected[0], 'bpmn-append')) {
          contextPad.triggerEntry('append', 'click', event);
        } else {
          palette.triggerEntry('create', 'click', event);
        }
      }
    });
  }

  // create
  if (palette) {
    assign(actions, {
      'createElement': function(event) {
        palette.triggerEntry('create', 'click', event);
      } }
    );
  }

  editorActions && editorActions.register(actions);

};
