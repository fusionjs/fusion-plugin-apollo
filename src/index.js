/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-env browser */
import React from 'react';

import CoreApp, {
  createPlugin,
  createToken,
  html,
  unescape,
  CriticalChunkIdsToken,
} from 'fusion-core';

import {ApolloProvider} from 'react-apollo';

import {
  PrepareProvider,
  ProviderPlugin,
  ProvidedHOC,
  Provider,
  prepare,
} from 'fusion-react';

import type {Element} from 'react';
import type {Context, Token} from 'fusion-core';

import serverRender from './server';
import clientRender from './client';

type ApolloClientType = {
  cache: mixed,
};

export type ApolloClient<TInitialState> = (
  ctx: Context,
  initialState: TInitialState
) => ApolloClientType;

export const ApolloClientToken: Token<ApolloClient<mixed>> = createToken(
  'ApolloClientToken'
);

export type ApolloContext<T> = (Context => T) | T;

export const ApolloContextToken: Token<ApolloContext<mixed>> = createToken(
  'ApolloContextToken'
);

export const GraphQLSchemaToken: Token<string> = createToken(
  'GraphQlSchemaToken'
);

export const ApolloCacheContext = React.createContext();

export default class App extends CoreApp {
  constructor(root: Element<*>) {
    const renderer = createPlugin({
      deps: {
        getApolloClient: ApolloClientToken,
        criticalChunkIds: CriticalChunkIdsToken.optional,
      },
      provides() {
        return el => {
          return prepare(el).then(() => {
            return __NODE__ ? serverRender(el) : clientRender(el);
          });
        };
      },
      middleware({criticalChunkIds, getApolloClient}) {
        // This is required to set apollo client/root on context before creating the client.
        return (ctx, next) => {
          if (!ctx.element) {
            return next();
          }

          const markAsCritical = __NODE__
            ? chunkId => {
                // Push to legacy context for backwards compat w/ legacy SSR template
                ctx.preloadChunks.push(chunkId);
                // Also use new service if registered
                if (criticalChunkIds) {
                  let chunkIds = criticalChunkIds.from(ctx);
                  chunkIds.add(chunkId);
                }
              }
            : noop;

          // Deserialize initial state for the browser
          let initialState = null;
          if (__BROWSER__) {
            const apolloState = document.getElementById('__APOLLO_STATE__');
            if (apolloState) {
              initialState = JSON.parse(unescape(apolloState.textContent));
            }
          }

          // Create the client and apollo provider
          const client = getApolloClient(ctx, initialState);
          ctx.element = (
            <PrepareProvider markAsCritical={markAsCritical}>
              <ApolloCacheContext.Provider value={client.cache}>
                <ApolloProvider client={client}>{ctx.element}</ApolloProvider>
              </ApolloCacheContext.Provider>
            </PrepareProvider>
          );

          if (__NODE__) {
            return next().then(() => {
              // $FlowFixMe
              const initialState = client.cache.extract();
              const serialized = JSON.stringify(initialState);
              const script = html`<script type="application/json" id="__APOLLO_STATE__">${serialized}</script>`;

              ctx.template.body.push(script);
            });
          }
          return next();
        };
      },
    });
    super(root, renderer);
  }
}

function noop() {}

export {ProviderPlugin, ProvidedHOC, Provider};
