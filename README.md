# fusion-plugin-apollo

[![Build status](https://badge.buildkite.com/2ac76cfb209dae257969b7464a2c90834ed82705cfd5bfcc52.svg?branch=master)](https://buildkite.com/uberopensource/fusion-plugin-apollo)

Fusion.js plugin for universal rendering with React and Apollo

This package provides universal rendering for Fusion.js applications leveraging GraphQL. 

The plugin will perform graphql queries on the server, thereby rendering your applications initial HTML view on the server before sending it to the client. Additionally this plugin will also provide initial state hydration on the client side.

---

# Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [Registration API](#registration-api)
    - [`ApolloContextToken`](#apollocontexttoken)
    - [`GraphQLSchemaToken`](#graphqlschematoken)
  - [Plugin](#plugin)
  - [Provider](#providers)

---

### Installation

```sh
yarn add fusion-plugin-apollo
```

---

### Usage

```js
// ./src/main.js
import React from 'react';
import App from 'fusion-react';
import {RenderToken} from 'fusion-core';

// New import provided by this plugin
import ApolloPlugin from 'fusion-plugin-apollo';

export default function() {
  const app = new App(<Hello />);
  app.register(RenderToken, ApolloPlugin)
  return app;
}
```

### Loading GraphQL Queries/Schemas

fusion-plugin-apollo ships with a compiler plugin that lets you load graphql queries and schemas with the `gql` macro. 
This macro takes a relative path argument and returns the query/schema as a string. 

NOTE: Because this is a build time feature, the path argument must be a string literal. Dynamic paths are not supported.

```js
import {gql} from 'fusion-plugin-apollo';
const query = gql('./some-query.graphql');
const schema = gql('./some-schema.graphql');
```

---

```js
type ApolloClient<TInitialState> = (ctx: Context, initialState: TInitialState) => ApolloClientType;
```

##### GetApolloContextToken

```js
import {GetApolloContextToken} from 'fusion-plugin-apollo';
```

Optional - A function which returns the apollo context. Defaults to the fusion context. See the [Apollo Client context documentation](https://www.apollographql.com/docs/apollo-server/v2/essentials/data.html#context) for more details.

```js
type ApolloContext<T> = (ctx: Context => T) | T;
```

##### GraphQLSchemaToken

```js
import {GraphQLSchemaToken} from 'fusion-plugin-apollo';
```

Define the `GraphQLSchemaToken` when using a locally hosted GraphQL endpoint from within a Fusion.js application. Connect your schema to a Fusion.js server with [fusion-plugin-apollo-server](https://github.com/fusionjs/fusion-plugin-apollo-server). You can find an example schema in the [graphql-tools repo](https://github.com/apollographql/graphql-tools#example).


```js
type GraphQLSchema = string;
```



##### GraphQLEndpointToken

```js
import {GraphQLEndpointToken} from 'fusion-plugin-apollo'; 
```

Optional - the endpoint for serving the graphql API. Defaults to `'/graphql'`.


```js
type GraphQLEndpoint = string;
```

#### Plugin

```js
import ApolloPlugin from 'fusion-plugin-apollo';
```

A plugin which is responsible for rendering (both virtual DOM and server-side rendering).


#### gql

```js
import {gql} from 'fusion-plugin-apollo';
```

A macro for loading graphql queries and schemas. Takes a relative path string and returns the contents of the graphql schema/query as a string.

```js
type gql = (path: string): DocumentNode 
```

- `path: string` - Relative path to the graphql schema/query file. NOTE: This must be a string literal, dynamic paths are not supported.

---
