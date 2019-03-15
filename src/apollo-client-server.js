/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {type Context} from 'fusion-core';
import {FetchToken} from 'fusion-tokens';
import {
  GraphQLSchemaToken,
  GraphQLEndpointToken,
  GetApolloContextToken,
  GetApolloClientCacheToken,
  ApolloClientCredentialsToken,
  GetApolloClientLinksToken,
  ApolloClientResolversToken,
  ApolloClientDefaultOptionsToken,
  type ApolloLinkType,
} from './tokens';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {from as apolloLinkFrom} from 'apollo-link';
import {SchemaLink} from 'apollo-link-schema';
import {InMemoryCache} from 'apollo-cache-inmemory';

type ExtractReturnType = <V>(() => V) => V;

type ApolloClientDepsType = $ObjMap<
  {
    getCache: typeof GetApolloClientCacheToken.optional,
    endpoint: typeof GraphQLEndpointToken.optional,
    fetch: typeof FetchToken.optional,
    includeCredentials: typeof ApolloClientCredentialsToken.optional,
    getApolloContext: typeof GetApolloContextToken.optional,
    getApolloLinks: typeof GetApolloClientLinksToken.optional,
    schema: typeof GraphQLSchemaToken.optional,
    resolvers: typeof ApolloClientResolversToken.optional,
    defaultOptions: typeof ApolloClientDefaultOptionsToken.optional,
  },
  ExtractReturnType
>;

type InitApolloClientType = (
  ctx: Context,
  initialState: mixed
) => ApolloClient<mixed>;

function Container() {}

export default function initApolloClientContainer({
  getCache = ctx => new InMemoryCache(),
  endpoint = '/graphql',
  fetch,
  includeCredentials = 'same-origin',
  getApolloContext = ctx => ctx,
  getApolloLinks,
  schema,
  resolvers,
  defaultOptions,
}: ApolloClientDepsType): InitApolloClientType {
  function getClient(ctx, initialState) {
    const cache = getCache(ctx);
    const connectionLink =
      schema && __NODE__
        ? new SchemaLink({
            schema,
            context: getApolloContext(ctx),
          })
        : new HttpLink({
            uri: endpoint,
            credentials: includeCredentials,
            fetch,
          });

    const links: Array<ApolloLinkType> = getApolloLinks
      ? getApolloLinks([connectionLink], ctx)
      : [connectionLink];

    const client = new ApolloClient({
      ssrMode: __NODE__,
      connectToDevTools: __BROWSER__ && __DEV__,
      link: apolloLinkFrom(links),
      cache: cache.restore(initialState),
      resolvers,
      defaultOptions,
    });
    return client;
  }
  return (ctx: Context, initialState: mixed) => {
    if (ctx.memoized.has(Container)) {
      return ctx.memoized.get(Container);
    }
    const client = getClient(ctx, initialState);
    ctx.memoized.set(Container, client);
    return client;
  };
}
