// @flow
import React from 'react';
import {createToken, type Context, type Token} from 'fusion-core';
import type {ApolloClient} from 'apollo-client';

export type InitApolloClientType<TInitialState> = (
  ctx: Context,
  initialState: TInitialState
) => ApolloClient<TInitialState>;

export const GraphQLSchemaToken: Token<string> = createToken(
  'GraphQlSchemaToken'
);

export type ApolloContext<T> = T | (Context => T);

export const ApolloContextToken: Token<ApolloContext<mixed>> = createToken(
  'ApolloContextToken'
);

export const ApolloCacheContext = React.createContext<
  $PropertyType<InitApolloClientType<mixed>, 'cache'>
>();

export const GraphQLEndpointToken: Token<string> = createToken(
  'GraphQLEndpointToken'
);

export const ApolloClientToken: Token<
  InitApolloClientType<mixed>
> = createToken('ApolloClientToken');
