/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-env browser */
import React from 'react';

import {createPlugin, html} from 'fusion-core';

import {ApolloProvider} from 'react-apollo';

import type {Context} from 'fusion-core';

import serverRender from './server';
import {LoggerToken} from 'fusion-tokens';
import {ApolloServer} from 'apollo-server-koa';
import compose from 'koa-compose';
import {
  ApolloCacheContext,
  GetApolloContextToken,
  GraphQLSchemaToken,
  GraphQLEndpointToken,
  ApolloServerFormatFunctionToken,
  GetApolloClientCacheToken,
  GetApolloClientLinksToken,
  ApolloClientResolversToken,
  ApolloClientDefaultOptionsToken,
} from './tokens';
import initApolloClientContainer from './apollo-client';

export type DepsType = {
  logger: typeof LoggerToken.optional,
  getApolloContext: typeof GetApolloContextToken.optional,
  schema: typeof GraphQLSchemaToken,
  endpoint: typeof GraphQLEndpointToken.optional,
  serverFormat: typeof ApolloServerFormatFunctionToken.optional,
  getCache: typeof GetApolloClientCacheToken.optional,
  getApolloLinks: typeof GetApolloClientLinksToken.optional,
  clientResolvers: typeof ApolloClientResolversToken.optional,
  clientDefaults: typeof ApolloClientDefaultOptionsToken.optional,
};

export type ProvidesType = (el: any, ctx: Context) => Promise<any>;

export default createPlugin<DepsType, ProvidesType>({
  deps: {
    logger: LoggerToken.optional,
    getApolloContext: GetApolloContextToken.optional,
    schema: GraphQLSchemaToken,
    endpoint: GraphQLEndpointToken.optional,
    serverFormat: ApolloServerFormatFunctionToken.optional,
    getCache: GetApolloClientCacheToken.optional,
    getApolloLinks: GetApolloClientLinksToken.optional,
    clientResolvers: ApolloClientResolversToken.optional,
    clientDefaults: ApolloClientDefaultOptionsToken.optional,
  },
  provides(deps) {
    return async (el, ctx) => {
      return serverRender(el, deps.logger);
    };
  },
  middleware({
    logger,
    getApolloContext = ctx => ctx,
    schema,
    endpoint = '/graphql',
    serverFormat,
    getCache,
    getApolloLinks,
    clientResolvers,
    clientDefaults,
  }) {
    const getApolloClient = initApolloClientContainer({
      getCache,
      endpoint,
      fetch: undefined,
      includeCredentials: undefined,
      getApolloContext,
      getApolloLinks,
      schema,
      resolvers: clientResolvers,
      defaultOptions: clientDefaults,
    });
    const renderMiddleware = (ctx, next) => {
      if (!ctx.element) {
        return next();
      }

      // Create the client and apollo provider
      const client = getApolloClient(ctx, null);
      ctx.element = (
        <ApolloCacheContext.Provider value={client.cache}>
          <ApolloProvider client={client}>{ctx.element}</ApolloProvider>
        </ApolloCacheContext.Provider>
      );

      const initialState = client.cache && client.cache.extract();
      const serialized = JSON.stringify(initialState);
      const script = html`
        <script type="application/json" id="__APOLLO_STATE__">
          ${serialized}
        </script>
      `;
      ctx.template.body.push(script);
      return next();
    };
    const server = new ApolloServer({
      // TODO: investigate other options
      schema,
    });
    let serverMiddleware = [];
    server.applyMiddleware({
      // TODO: switch to server.getMiddleware once https://github.com/apollographql/apollo-server/pull/2435 lands
      app: {
        use: m => {
          serverMiddleware.push(m);
        },
      },
      // TODO: investigate other options
      path: endpoint,
    });
    return compose([...serverMiddleware, renderMiddleware]);
  },
});
