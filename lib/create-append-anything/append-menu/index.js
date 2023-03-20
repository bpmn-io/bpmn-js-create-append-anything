import AppendMenuProvider from './AppendMenuProvider';
import AppendContextPadProvider from './AppendContextPadProvider';
import AppendRules from './AppendRules';

export default {
  __init__: [
    'appendMenuProvider',
    'appendContextPadProvider',
    'appendRules'
  ],
  appendMenuProvider: [ 'type', AppendMenuProvider ],
  appendContextPadProvider: [ 'type', AppendContextPadProvider ],
  appendRules: [ 'type', AppendRules ]
};
