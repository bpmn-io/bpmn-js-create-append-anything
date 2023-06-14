import AppendElementTemplatesModule from './append-menu';
import CreateElementTemplatesModule from './create-menu';
import ReplaceElementTemplatesModule from './replace-menu';
import RemoveTemplatesModule from './remove-templates';

export default {
  __depends__: [
    AppendElementTemplatesModule,
    CreateElementTemplatesModule,
    ReplaceElementTemplatesModule,
    RemoveTemplatesModule
  ]
};