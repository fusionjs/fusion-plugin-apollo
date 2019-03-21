/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import test from 'tape-cup';
import React from 'react';
import plugin, {
  GraphQLSchemaToken,
  ApolloClientToken,
  ApolloServerFormatFunctionToken,
} from '../index';
import gql from 'graphql-tag';
import App from 'fusion-react/dist';
import {RenderToken} from 'fusion-core';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import getPort from 'get-port';
import http from 'http';
import fetch from 'node-fetch';

async function testApp(app, {typeDefs, resolvers}) {
  const port = await getPort();
  const endpoint = `http://localhost:${port}/graphql`;
  const schema = {typeDefs, resolvers};
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache().restore({}),
    link: new HttpLink({
      endpoint,
      fetch: async (url, options) => {
        // required since the url here is only the path
        const result = await fetch(endpoint, options);
        return result;
      },
    }),
  });
  app.register(RenderToken, plugin);
  app.register(GraphQLSchemaToken, schema);
  app.register(ApolloClientToken, ctx => {
    // $FlowFixMe
    return {}; // should hit server
  });
  // $FlowFixMe
  const server = http.createServer(app.callback());
  await new Promise((resolve, reject) =>
    server.listen(port, err => {
      if (err) return reject(err);
      return resolve();
    })
  );
  return {app, server, client};
}
test('handling request', async t => {
  const query = gql`
    query Test {
      test
    }
  `;
  const el = <div />;
  const typeDefs = gql`
    type Query {
      test: String
    }
  `;
  const resolvers = {
    Query: {
      test(parent, args, ctx) {
        t.equal(ctx.path, '/graphql', 'context defaults correctly');
        return 'test';
      },
    },
  };
  const {server, client} = await testApp(new App(el), {typeDefs, resolvers});
  const result = await client.query({query});
  t.deepEqual(result, {
    data: {test: 'test'},
    loading: false,
    networkStatus: 7,
    stale: false,
  });
  server.close();
  t.end();
});

test('handling request with error', async t => {
  const query = gql`
    query Test {
      test
    }
  `;
  const el = <div />;
  const typeDefs = gql`
    type Query {
      test: String
    }
  `;
  const resolvers = {
    Query: {
      test(parent, args, ctx) {
        t.equal(ctx.path, '/graphql', 'context defaults correctly');
        throw new Error('FAIL');
      },
    },
  };
  const {server, client} = await testApp(new App(el), {typeDefs, resolvers});
  try {
    await client.query({query});
  } catch (e) {
    t.ok(e.graphQLErrors);
    t.equal(e.message, 'GraphQL error: FAIL');
  }
  server.close();
  t.end();
});

test('handling request with error and custom error format function', async t => {
  const query = gql`
    query Test {
      test
    }
  `;
  const el = <div />;
  const typeDefs = gql`
    type Query {
      test: String
    }
  `;
  const resolvers = {
    Query: {
      test(parent, args, ctx) {
        t.equal(ctx.path, '/graphql', 'context defaults correctly');
        throw new Error('FAIL');
      },
    },
  };
  const app = new App(el);
  app.register(ApolloServerFormatFunctionToken, e => {
    t.equal(e.message, 'FAIL');
    return new Error('test');
  });
  const {server, client} = await testApp(app, {typeDefs, resolvers});
  try {
    await client.query({query});
  } catch (e) {
    t.ok(e.message, 'test');
  }
  server.close();
  t.end();
});
