/* eslint-env browser */
import React from 'react';

import CoreApp from 'fusion-core';
import {prepare} from 'fusion-react-async';
import {html} from 'fusion-core';

import {ApolloProvider} from 'react-apollo';

import serverRender from './server';
import clientRender from './client';

import {ProviderPlugin, ProvidedHOC, Provider} from 'fusion-react';

export default class App extends CoreApp {
  constructor(root, getClient) {
    super(root, el => {
      return prepare(el).then(() => {
        return __NODE__ ? serverRender(el) : clientRender(el);
      });
    });

    // This is required to set apollo client/root on context before creating the client.
    const preRenderPlugin = (ctx, next) => {
      if (!ctx.element) {
        return next();
      }
      const client = getClient(ctx);
      ctx.element = (
        <ApolloProvider client={client}>{ctx.element}</ApolloProvider>
      );
      if (__NODE__) {
        return next().then(() => {
          const initialState = client.cache.extract();
          const serialized = JSON.stringify(initialState);
          const script = html`<script type="application/json" id="__APOLLO_STATE__">${serialized}</script>`;
          ctx.body.body.push(script);
        });
      } else {
        return next();
      }
    };

    this.plugin(() => preRenderPlugin);
  }
}

export {ProviderPlugin, ProvidedHOC, Provider};
