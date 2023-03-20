import AppendMenuModule from '../append-menu';
import CreateMenuModule from '../create-menu';

import CreateAppendEditorActions from './EditorActions';

export default {
  __depends__: [
    AppendMenuModule,
    CreateMenuModule
  ],
  __init__: [
    'createAppendEditorActions'
  ],
  createAppendEditorActions: [ 'type', CreateAppendEditorActions ]
};