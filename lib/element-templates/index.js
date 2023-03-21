import AppendElementTemplatesModule from './append-menu';
import CreateElementTemplatesModule from './create-menu';
import ReplaceElementTemplatesModule from './replace-menu';
import UnlinkTemplatesModule from './unlink-templates';

export default {
  __depends__: [
    AppendElementTemplatesModule,
    CreateElementTemplatesModule,
    ReplaceElementTemplatesModule,
    UnlinkTemplatesModule
  ]
};