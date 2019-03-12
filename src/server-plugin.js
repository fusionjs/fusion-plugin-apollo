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
  ApolloClientToken,
  ApolloContextToken,
  GraphQLSchemaToken,
  ApolloServerEndpointToken,
  ApolloServerFormatFunctionToken,
} from './tokens';

export type DepsType = {
  getApolloClient: typeof ApolloClientToken,
  logger: typeof LoggerToken.optional,
  apolloContext: typeof ApolloContextToken.optional,
  schema: typeof GraphQLSchemaToken,
  endpoint: typeof ApolloServerEndpointToken.optional,
  serverFormat: typeof ApolloServerFormatFunctionToken.optional,
};

export type ProvidesType = (el: any, ctx: Context) => Promise<any>;

export default createPlugin<DepsType, ProvidesType>({
  deps: {
    getApolloClient: ApolloClientToken,
    logger: LoggerToken.optional,
    apolloContext: ApolloContextToken.optional,
    schema: GraphQLSchemaToken,
    endpoint: ApolloServerEndpointToken.optional,
    serverFormat: ApolloServerFormatFunctionToken.optional,
  },
  provides(deps) {
    return async (el, ctx) => {
      return serverRender(el, deps.logger);
    };
  },
  middleware({
    getApolloClient,
    logger,
    apolloContext,
    schema,
    endpoint = '/graphql',
    serverFormat,
  }) {
    // This is required to set apollo client/root on context before creating the client.
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
    const serverMiddleware = server.getMiddleware({
      // TODO: investigate other options
      path: endpoint,
    });
    return compose([serverMiddleware, renderMiddleware]);
  },
});
