import AppendMenuModule from '../append-menu';
import CreateMenuModule from '../create-menu';

import CreateAppendKeyboardBindings from './KeyboardBindings';

export default {
  __depends__: [
    AppendMenuModule,
    CreateMenuModule
  ],
  __init__: [
    'createAppendKeyboardBindings'
  ],
  createAppendKeyboardBindings: [ 'type', CreateAppendKeyboardBindings ]
};