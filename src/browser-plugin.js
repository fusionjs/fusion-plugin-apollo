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

import clientRender from './client';
import {ApolloCacheContext, ApolloClientToken} from './tokens';

type DepsType = {
  getApolloClient: typeof ApolloClientToken,
};

type ProvidesType = (el: any, ctx: Context) => Promise<any>;

export default createPlugin<DepsType, ProvidesType>({
  deps: {
    getApolloClient: ApolloClientToken,
  },
  provides(deps) {
    return async (el, ctx) => {
      return clientRender(el);
    };
  },
  middleware({getApolloClient, logger}) {
    // This is required to set apollo client/root on context before creating the client.
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
