// @flow
import React from 'react';
import {createToken, type Context, type Token} from 'fusion-core';
import type {ApolloClient} from 'apollo-client';

export type InitApolloClientType<TInitialState> = (
  ctx: Context,
  initialState: TInitialState
) => ApolloClient<TInitialState>;

export const ApolloClientToken: Token<
  InitApolloClientType<mixed>
> = createToken('ApolloClientToken');

export type ApolloContext<T> = (Context => T) | T;

export const ApolloContextToken: Token<ApolloContext<mixed>> = createToken(
  'ApolloContextToken'
);

export const GraphQLSchemaToken: Token<string> = createToken(
  'GraphQlSchemaToken'
);

export const ApolloCacheContext = React.createContext<
  $PropertyType<InitApolloClientType<mixed>, 'cache'>
>();

export const ApolloServerEndpointToken: Token<string> = createToken(
  'ApolloServerEndpointToken'
);

export const ApolloServerFormatFunctionToken: Token<Function> = createToken(
  'ApolloServerFormatFunctionToken'
);
