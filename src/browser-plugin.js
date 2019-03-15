/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-env browser */
import React from 'react';
import {createPlugin, unescape} from 'fusion-core';
import {ApolloProvider} from 'react-apollo';
import type {Context} from 'fusion-core';
import {FetchToken} from 'fusion-tokens';
import clientRender from './client';
import {
  ApolloCacheContext,
  GraphQLEndpointToken,
  GetApolloClientCacheToken,
  GetApolloClientLinksToken,
  ApolloClientResolversToken,
  ApolloClientDefaultOptionsToken,
  ApolloClientCredentialsToken,
} from './tokens';
import initApolloClientContainer from './apollo-client';

type DepsType = {
  fetch: typeof FetchToken,
  includeCredentials: typeof ApolloClientCredentialsToken.optional,
  endpoint: typeof GraphQLEndpointToken.optional,
  getCache: typeof GetApolloClientCacheToken.optional,
  getApolloLinks: typeof GetApolloClientLinksToken.optional,
  clientResolvers: typeof ApolloClientResolversToken.optional,
  clientDefaults: typeof ApolloClientDefaultOptionsToken.optional,
};

type ProvidesType = (el: any, ctx: Context) => Promise<any>;

export default createPlugin<DepsType, ProvidesType>({
  deps: {
    fetch: FetchToken,
    includeCredentials: ApolloClientCredentialsToken.optional,
    endpoint: GraphQLEndpointToken.optional,
    getCache: GetApolloClientCacheToken.optional,
    getApolloLinks: GetApolloClientLinksToken.optional,
    clientResolvers: ApolloClientResolversToken.optional,
    clientDefaults: ApolloClientDefaultOptionsToken.optional,
  },
  provides(deps) {
    return async (el, ctx) => {
      return clientRender(el);
    };
  },
  middleware({
    fetch,
    includeCredentials,
    endpoint,
    getCache,
    getApolloLinks,
    clientResolvers,
    clientDefaults,
  }) {
    const getApolloClient = initApolloClientContainer({
      getCache,
      endpoint,
      fetch,
      includeCredentials: undefined,
      getApolloContext: undefined,
      getApolloLinks,
      schema: undefined,
      resolvers: clientResolvers,
      defaultOptions: clientDefaults,
    });
    return (ctx, next) => {
      if (!ctx.element) {
        return next();
      }

      // Deserialize initial state for the browser
      let initialState = null;
      const apolloState = document.getElementById('__APOLLO_STATE__');
      if (apolloState) {
        initialState = JSON.parse(unescape(apolloState.textContent));
      }

      // Create the client and apollo provider
      const client = getApolloClient(ctx, initialState);
      ctx.element = (
        <ApolloCacheContext.Provider value={client.cache}>
          <ApolloProvider client={client}>{ctx.element}</ApolloProvider>
        </ApolloCacheContext.Provider>
      );
      return next();
    };
  },
});
