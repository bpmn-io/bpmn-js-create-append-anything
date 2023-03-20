import AppendMenuModule from './append-menu';
import CreateMenuModule from './create-menu';
import EditorActionsModule from './editor-actions';
import KeyboardBindingsModule from './keyboard-bindings';

export default {
  __depends__: [
    AppendMenuModule,
    CreateMenuModule,
    EditorActionsModule,
    KeyboardBindingsModule
  ],
};