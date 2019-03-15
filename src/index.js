// @flow
import type {DocumentNode} from 'graphql';
import Plugin from './plugin';

export * from './tokens.js';
export default Plugin;

export function gql(path: string): DocumentNode {
  throw new Error('fusion-plugin-apollo/gql should be replaced at build time');
}
