import CreateMenuProvider from './CreateMenuProvider';
import CreatePaletteProvider from './CreatePaletteProvider';

export default {
  __init__: [
    'createMenuProvider',
    'createPaletteProvider'
  ],
  createMenuProvider: [ 'type', CreateMenuProvider ],
  createPaletteProvider: [ 'type', CreatePaletteProvider ]
};
