/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-env browser */
import React from 'react';

import CoreApp, {createPlugin, createToken, html, unescape} from 'fusion-core';

import {ApolloProvider} from 'react-apollo';

import {
  ProviderPlugin,
  ProvidedHOC,
  Provider,
  prepare,
  middleware,
} from 'fusion-react';

import type {Element} from 'react';
import type {Context, Token} from 'fusion-core';

import {InMemoryCache} from 'apollo-cache-inmemory';

import serverRender from './server';
import clientRender from './client';

type ApolloClientType = mixed;

type TStateOrCache = mixed

export type ApolloClient<TStateOrCache> = (
  ctx: Context,
  initialStateOrCache: TStateOrCache,
) => ApolloClientType;

export const GetApolloClientToken: Token<ApolloClient<mixed>> = createToken(
  'GetApolloClientToken'
);

export type ApolloContext<T> = (Context => T) | T;

export type ApolloCacheToken : Token<any> = createToken(
  'ApolloCacheToken'
);

export const ApolloContextToken: Token<ApolloContext<mixed>> = createToken(
  'ApolloContextToken'
);

export const GraphQLSchemaToken: Token<string> = createToken(
  'GraphQlSchemaToken'
);

export default class App extends CoreApp {
  constructor(root: Element<*>) {
    const renderer = createPlugin({
      deps: {
        getApolloClient: ApolloClientToken,
        apolloCache: ApolloCacheToken = new InMemoryCache(),
      },
      provides() {
        return el => {
          return prepare(el).then(() => {
            return __NODE__ ? serverRender(el) : clientRender(el);
          });
        };
      },
      middleware({getApolloClient, apolloCache}) {
        // This is required to set apollo client/root on context before creating the client.
        return (ctx, next) => {
          if (!ctx.element) {
            return next();
          }
          

          // Deserialize initial state for the browser
          let initialState = null;
          if (__BROWSER__) {
            const apolloState = document.getElementById('__APOLLO_STATE__');
            if (apolloState) {
              initialState = JSON.parse(unescape(apolloState.textContent));
            }
          }

          if (apolloCache === null) {
            const client = getApolloClient(ctx, initialState);
            ctx.element = (
              <ApolloProvider client={client}>{ctx.element}</ApolloProvider>
            );
          } else {        
            const cache = apolloCache.restore(initialState);            
            const ApolloContext = React.createContext('ApolloContext');
            const client = getApolloClient(ctx, cache);
            ctx.element = (
              <ApolloContext.Provider cache={cache}>
                <ApolloProvider client={client}>{ctx.element}</ApolloProvider>
              </ApolloContext.Provider>
            )
          }

          if (__NODE__) {
            return middleware(ctx, next).then(() => {
              // $FlowFixMe
              const initialState = client.cache.extract();
              const serialized = JSON.stringify(initialState);
              const script = html`<script type="application/json" id="__APOLLO_STATE__">${serialized}</script>`;
              ctx.template.body.push(script);
            });
          } else {
            return middleware(ctx, next);
          }          
        };
      },
    });
    super(root, renderer);
  }
}

export {ProviderPlugin, ProvidedHOC, Provider};
