/* eslint-env browser */
import CoreApp from 'fusion-core';
import {prepare} from 'fusion-react-async';
import {html} from 'fusion-core';
import serverRender from './server';
import clientRender from './client';

import ProviderPlugin from './plugin';
import ProvidedHOC from './hoc';
import Provider from './provider';

export default class App extends CoreApp {
  constructor(root, getClient) {
    super(null, el => {
      return prepare(el).then(() => {
        return __NODE__ ? serverRender(el) : clientRender(el);
      });
    });

    // This is required to set apollo client/root on context before creating the client.
    const preRenderPlugin = (ctx, next) => {
      ctx.apolloRoot = root;
      ctx.apolloClient = getClient(ctx);
      return next();
    };

    this.plugins.unshift(preRenderPlugin);
  }
}

// This is required so we trigger this plugin to render the element with the client
// before any other plugins trigger (like routing).
function ApolloSSR() {
  return function middleware(ctx, next) {
    ctx.element = ctx.apolloRoot({client: ctx.apolloClient});
    if (__NODE__) {
      return next().then(() => {
        const initialState = ctx.apolloClient.cache.extract();
        const serialized = JSON.stringify(initialState);
        const script = html`<script type="application/json" id="__APOLLO_STATE__">${serialized}</script>`;
        ctx.body.body.push(script);
      });
    } else {
      return next();
    }
  };
}

export {ApolloSSR, ProviderPlugin, ProvidedHOC, Provider};
