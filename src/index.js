// @flow
import type {DocumentNode} from 'graphql';
import ServerPlugin, {type DepsType, type ProvidesType} from './server-plugin';
import type {FusionPlugin} from 'fusion-core';
import BrowserPlugin from './browser-plugin';

export * from './tokens.js';
const plugin = __NODE__ ? ServerPlugin : BrowserPlugin;
export default ((plugin: any): FusionPlugin<DepsType, ProvidesType>);

export function gql(path: string): DocumentNode {
  throw new Error('fusion-plugin-apollo/gql should be replaced at build time');
}
