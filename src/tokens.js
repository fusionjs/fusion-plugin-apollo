// @flow
import React from 'react';
import {createToken, type Context, type Token} from 'fusion-core';
import type {
  ApolloClient,
  ApolloCache,
  ApolloClientOptions,
} from 'apollo-client';

export type InitApolloClientType<TInitialState> = (
  ctx: Context,
  initialState: TInitialState
) => ApolloClient<TInitialState>;

export type ApolloContext<T> = Context => T;

export const GetApolloContextToken: Token<ApolloContext<mixed>> = createToken(
  'GetApolloContextToken'
);

export const GraphQLSchemaToken: Token<string> = createToken(
  'GraphQlSchemaToken'
);

export const ApolloCacheContext = React.createContext<
  $PropertyType<InitApolloClientType<mixed>, 'cache'>
>();

export const GraphQLEndpointToken: Token<string> = createToken(
  'GraphQLEndpointToken'
);

export const ApolloServerFormatFunctionToken: Token<Function> = createToken(
  'ApolloServerFormatFunctionToken'
);

export const GetApolloClientCacheToken: Token<
  (ctx: Context) => ApolloCache<mixed>
> = createToken('GetApolloClientCacheToken');

export const ApolloClientCredentialsToken: Token<string> = createToken(
  'ApolloClientCredentialsToken'
);

export const ApolloClientDefaultOptionsToken: Token<
  $PropertyType<ApolloClientOptions<any>, 'defaultOptions'>
> = createToken('ApolloClientDefaultOptionsToken');

export type ApolloLinkType = {request: (operation: any, forward: any) => any};

export const GetApolloClientLinksToken: Token<
  (Array<ApolloLinkType>, ctx: Context) => Array<ApolloLinkType>
> = createToken('GetApolloClientLinksToken');

export const ApolloClientAuthKeyToken: Token<string> = createToken(
  'ApolloClientAuthKeyToken'
);

export const ApolloClientResolversToken: Token<
  ResolverMapType | $ReadOnlyArray<ResolverMapType>
> = createToken('ApolloClientResolversToken');

type ResolverMapType = {
  +[key: string]: {
    +[field: string]: (
      rootValue?: any,
      args?: any,
      context?: any,
      info?: any
    ) => any,
  },
};
